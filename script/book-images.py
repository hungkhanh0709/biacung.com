#!/usr/bin/env python3
"""Import one website asset per source image; preserve composition, resize only when useful."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
NAME = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\.(jpg|jpeg|png|webp|avif)")
FORMATS = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG", ".webp": "WEBP", ".avif": "AVIF"}


def digest(file):
    return hashlib.sha256(Path(file).read_bytes()).hexdigest()


def load(file):
    return json.loads(Path(file).read_text())


def write(file, data):
    file = Path(file)
    temp = file.with_name(file.name + ".tmp")
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
    os.replace(temp, file)


def child(parent, relative):
    result = (parent / relative).resolve()
    if not result.is_relative_to(parent.resolve()) or result == parent.resolve():
        raise ValueError(f"Path ngoài phạm vi: {relative}")
    return result


def context(root, draft, plan_name):
    folder = (root / draft).resolve()
    if folder != root / "data/_raw" or not folder.is_dir() or (root / draft).is_symlink():
        raise ValueError("Chỉ dùng thư mục data/_raw/.")
    plan_file = child(folder, plan_name)
    plan = load(plan_file)
    if not SLUG.fullmatch(plan.get("book_id", "")):
        raise ValueError("book_id không hợp lệ.")
    book_file = root / f"data/book/{plan['book_id']}.json"
    # New books need their assets ready before the first form/API save.
    # Work only on the draft until that save creates the official detail.
    if not book_file.exists():
        book_file = child(folder, "book.json")
    book = load(book_file)
    if book.get("id") != plan["book_id"]:
        raise ValueError("ID file sách không khớp.")
    editions = {e["id"]: e for e in book["editions"]}
    targets, thumbnails, source_hashes = set(), set(), set()
    if not plan.get("images"):
        raise ValueError("Plan không có images.")
    for entry in plan["images"]:
        if entry.get("edition_id") not in editions:
            raise ValueError("Mỗi ảnh cần edition_id tồn tại.")
        name = entry.get("name", "")
        if not NAME.fullmatch(name) or name in targets:
            raise ValueError(f"Tên file không hợp lệ hoặc trùng: {name}")
        targets.add(name)
        if entry.get("role") not in {"thumbnail", "gallery"} or not entry.get("reason"):
            raise ValueError("Mỗi ảnh cần role thumbnail/gallery và reason.")
        if entry.get("crop") is not None:
            raise ValueError("Workflow chuẩn giữ bố cục, chỉ resize; không tự crop ảnh.")
        if entry["role"] == "thumbnail":
            if entry["edition_id"] in thumbnails:
                raise ValueError("Chỉ một thumbnail cho mỗi edition.")
            thumbnails.add(entry["edition_id"])
        source = child(folder, entry["source"])
        if source.is_relative_to((folder / "previews").resolve()) or not source.is_file():
            raise ValueError("Ảnh nguồn phải nằm trong data/_raw/, không dùng previews/ làm nguồn.")
        source_hash = digest(source)
        if source_hash in source_hashes:
            raise ValueError("Một ảnh nguồn chỉ được tạo một file website; không tạo biến thể thumbnail/gallery.")
        source_hashes.add(source_hash)
        with Image.open(source) as image:
            if image.format != FORMATS[Path(name).suffix]:
                raise ValueError(f"Đuôi file phải đúng codec gốc: {name}")
    return folder, plan_file, plan, book_file, book, editions


def preview(root, draft="data/_raw", plan_name="image-plan.json"):
    root = root.resolve()
    folder, plan_file, plan, book_file, book, _ = context(root, draft, plan_name)
    output = child(folder, "previews")
    output.mkdir(exist_ok=True)
    report = {"book_id": book["id"], "plan_sha256": digest(plan_file), "book_sha256": digest(book_file), "images": []}
    for entry in plan["images"]:
        source, target = child(folder, entry["source"]), output / entry["name"]
        with Image.open(source) as raw:
            image = ImageOps.exif_transpose(raw)
            original_size = image.size
            image.thumbnail((1680, 2240), Image.Resampling.LANCZOS)
            unchanged = image.size == original_size and raw.getexif().get(274, 1) == 1
            codec = FORMATS[Path(entry["name"]).suffix]
            quality = None
            action = "kept"
            if unchanged:
                shutil.copyfile(source, target)
            else:
                options = {"icc_profile": raw.info["icc_profile"]} if raw.info.get("icc_profile") else {}
                if codec in {"JPEG", "WEBP", "AVIF"}:
                    options["quality"] = quality = 85
                if codec == "JPEG":
                    options.update(optimize=True, progressive=True)
                elif codec == "PNG":
                    options["optimize"] = True
                image.save(target, format=codec, **options)
                action = "resized" if image.size != original_size else "oriented"
                if target.stat().st_size >= source.stat().st_size and raw.getexif().get(274, 1) == 1:
                    shutil.copyfile(source, target)
                    quality, action = None, "kept-smaller-source"
            with Image.open(target) as result:
                final_size = ImageOps.exif_transpose(result).size
            report["images"].append({**entry, "source_sha256": digest(source), "preview_sha256": digest(target),
                                     "size_before": list(original_size), "size_after": list(final_size),
                                     "bytes_before": source.stat().st_size, "bytes_after": target.stat().st_size,
                                     "quality": quality, "action": action, "preview": str(target.relative_to(folder))})
    write(folder / "image-report.json", report)
    return report


def apply(root, draft="data/_raw", plan_name="image-plan.json"):
    root = root.resolve()
    folder, plan_file, plan, book_file, book, editions = context(root, draft, plan_name)
    report = load(folder / "image-report.json")
    if report["plan_sha256"] != digest(plan_file) or report["book_sha256"] != digest(book_file):
        raise ValueError("Plan hoặc sách đã đổi; tạo preview và xem lại trước khi apply.")
    if len(report["images"]) != len(plan["images"]) or any(
        any(entry.get(field) != planned.get(field) for field in planned)
        or entry.get("preview") != f"previews/{planned['name']}"
        for entry, planned in zip(report["images"], plan["images"])
    ):
        raise ValueError("Report không khớp plan; tạo preview lại.")
    asset_dir = root / f"assets/img/books/{book['id']}"
    asset_dir.mkdir(parents=True, exist_ok=True)
    if not asset_dir.resolve().is_relative_to((root / "assets/img/books").resolve()):
        raise ValueError("Thư mục asset ra ngoài phạm vi.")
    evidence_file = folder / "evidence.json"
    evidence = load(evidence_file)
    prepared = []
    for entry in report["images"]:
        source, candidate = child(folder, entry["source"]), child(folder, entry["preview"])
        if digest(source) != entry["source_sha256"] or digest(candidate) != entry["preview_sha256"]:
            raise ValueError("Nguồn/preview đã đổi; preview lại trước khi apply.")
        target = asset_dir / entry["name"]
        if target.is_symlink():
            raise ValueError("Không ghi đè symlink asset.")
        if target.exists() and digest(target) not in {entry["source_sha256"], entry["preview_sha256"]}:
            known = any(m.get("asset") == str(target.relative_to(root))
                        and m.get("source_sha256") == entry["source_sha256"]
                        and m.get("asset_sha256") == digest(target) for m in evidence.get("images", []))
            if not known:
                raise ValueError(f"Asset đã tồn tại từ nguồn khác, cần tên khác: {target.name}")
        prepared.append((entry, candidate, target))
    mappings = []
    for entry, candidate, target in prepared:
        temp = target.with_name(target.name + ".tmp")
        shutil.copyfile(candidate, temp)
        os.replace(temp, target)
        url = "/" + str(target.relative_to(root))
        edition = editions[entry["edition_id"]]
        if entry["role"] == "thumbnail":
            edition["thumbnail"] = url
        else:
            edition["gellery_imgs"] = list(dict.fromkeys([*edition.get("gellery_imgs", []), url]))
        mappings.append({"source": entry["source"], "asset": str(target.relative_to(root)),
                         "edition_id": entry["edition_id"], "role": entry["role"],
                         "source_sha256": entry["source_sha256"], "asset_sha256": digest(target),
                         **{k: entry[k] for k in ["size_before", "size_after", "bytes_before", "bytes_after", "quality", "action"]}})
    for edition_id in {entry["edition_id"] for entry in report["images"]}:
        edition = editions[edition_id]
        edition["gellery_imgs"] = [url for url in edition.get("gellery_imgs", []) if url != edition.get("thumbnail")]
    write(book_file, book)
    if book_file != folder / "book.json":
        write(folder / "book.json", book)
    evidence["images"] = [m for m in evidence.get("images", []) if m["source"] not in {e["source"] for e in mappings}] + mappings
    write(evidence_file, evidence)
    return {"book_id": book["id"], "imported": mappings}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", choices=["preview", "apply"])
    parser.add_argument("--draft", default="data/_raw")
    parser.add_argument("--plan", default="image-plan.json")
    args = parser.parse_args()
    try:
        print(json.dumps((preview if args.command == "preview" else apply)(ROOT, args.draft, args.plan), ensure_ascii=False, indent=2))
    except (ValueError, KeyError, OSError) as error:
        parser.exit(1, f"{error}\n")


if __name__ == "__main__":
    main()
