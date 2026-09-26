#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DATASETS = {
  nobel: { file: "nobel_literature.json", kind: "person", officialHost: "nobelprize.org" },
  pulitzer: { file: "pulitzer_fiction.json", kind: "book", officialHost: "pulitzer.org" },
  booker: { file: "booker_prize.json", kind: "book", officialHost: "thebookerprizes.com" }
};

const aliases = new Map([
  ["nobel", "nobel"],
  ["nobel-literature", "nobel"],
  ["pulitzer", "pulitzer"],
  ["pulitzer-fiction", "pulitzer"],
  ["booker", "booker"],
  ["booker-prize", "booker"]
]);

function required(errors, condition, message) {
  if (!condition) errors.push(message);
}

function isIsoDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function isHttpUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isOfficialUrl(value, officialHost) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && (url.hostname === officialHost || url.hostname.endsWith(`.${officialHost}`));
  } catch {
    return false;
  }
}

function validateLocalImage(errors, root, image, label) {
  required(errors, image && typeof image === "object", `${label}: thiếu metadata ảnh`);
  if (!image || typeof image !== "object") return;
  required(errors, /^assets\/img\/awards\/[a-z0-9.-]+$/i.test(image.src || ""), `${label}: src không hợp lệ`);
  required(errors, Boolean(image.alt), `${label}: thiếu alt`);
  required(errors, isHttpUrl(image.source_url), `${label}: thiếu source_url HTTPS`);
  if (image.src) required(errors, fs.existsSync(path.join(root, image.src)), `${label}: file ảnh không tồn tại (${image.src})`);
}

function report(errors, award, year) {
  if (errors.length) {
    console.error(`Award validation failed: ${award} ${year}`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }
  console.log(`Award validation passed: ${award} ${year}`);
}

function main() {
  const award = aliases.get(String(process.argv[2] || "").toLowerCase());
  const year = String(process.argv[3] || "");
  const root = path.resolve(__dirname, "../../../..");

  if (!award || !/^\d{4}$/.test(year)) {
    console.error("Usage: validate-award-year.js <nobel|pulitzer|booker> <YYYY>");
    process.exit(2);
  }

  const config = DATASETS[award];
  const filePath = path.join(root, "data", "awards", config.file);
  const payload = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const entry = payload.laureates_by_year?.[year];
  const errors = [];

  required(errors, isIsoDate(payload.updated_at), "updated_at không hợp lệ");
  required(errors, entry && typeof entry === "object", `${year}: chưa có trong laureates_by_year`);
  if (!entry) return report(errors, award, year);

  required(errors, Array.isArray(entry.laureates), `${year}: laureates phải là mảng`);
  required(errors, !JSON.stringify(entry).includes('"book_id"'), `${year}: không được dùng book_id`);

  if (entry.status === "pending") {
    required(errors, isIsoDate(entry.announcement_date), `${year}: announcement_date không hợp lệ`);
    required(errors, isOfficialUrl(entry.schedule_source_url, config.officialHost), `${year}: schedule_source_url không phải nguồn chính thức`);
    required(errors, entry.laureates?.length === 0, `${year}: pending phải có laureates rỗng`);
    return report(errors, award, year);
  }

  required(errors, isIsoDate(entry.announced_on), `${year}: announced_on không hợp lệ`);
  required(errors, isOfficialUrl(entry.source_url, config.officialHost), `${year}: source_url không phải nguồn chính thức`);
  required(errors, entry.laureates?.length > 0, `${year}: thiếu người hoặc tác phẩm đoạt giải`);

  (entry.laureates || []).forEach((laureate, index) => {
    const label = `${year} laureate ${index + 1}`;
    required(errors, Boolean(laureate.name), `${label}: thiếu name`);

    if (config.kind === "person") {
      required(errors, /^[a-z0-9-]+$/.test(laureate.id || ""), `${label}: id không hợp lệ`);
      required(errors, Boolean(laureate.country_vi || laureate.country), `${label}: thiếu quốc tịch`);
      required(errors, Number.isInteger(laureate.born_year), `${label}: born_year không hợp lệ`);
      required(errors, Boolean(laureate.born_place), `${label}: thiếu born_place`);
      required(errors, Boolean(laureate.motivation), `${label}: thiếu motivation`);
      required(errors, Boolean(laureate.motivation_vi), `${label}: thiếu motivation_vi`);
      required(errors, isHttpUrl(laureate.profile_url), `${label}: profile_url không hợp lệ`);
      validateLocalImage(errors, root, laureate.photo, `${label} photo`);
      required(errors, Boolean(laureate.photo?.creator), `${label}: thiếu creator ảnh`);
      required(errors, Boolean(laureate.photo?.license), `${label}: thiếu license/credit ảnh`);
      return;
    }

    const work = laureate.work || {};
    required(errors, /^[a-z0-9-]+$/.test(work.id || ""), `${label}: work.id không hợp lệ`);
    required(errors, Boolean(work.title), `${label}: thiếu work.title`);
    required(errors, Boolean(work.publisher), `${label}: thiếu publisher`);
    required(errors, Number.isInteger(work.published_year), `${label}: published_year không hợp lệ`);
    required(errors, Boolean(laureate.citation), `${label}: thiếu citation`);
    required(errors, Boolean(laureate.citation_vi), `${label}: thiếu citation_vi`);
    validateLocalImage(errors, root, work.cover, `${label} cover`);
  });

  report(errors, award, year);
}

main();
