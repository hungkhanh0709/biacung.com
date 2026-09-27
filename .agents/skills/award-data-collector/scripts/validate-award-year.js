#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const DATASETS = {
  nobel: { file: "nobel_literature.json", kind: "person", officialHost: "nobelprize.org" },
  pulitzer: { file: "pulitzer_fiction.json", kind: "book", officialHost: "pulitzer.org" },
  booker: { file: "booker_prize.json", kind: "book", officialHost: "thebookerprizes.com" },
  goncourt: { file: "goncourt.json", kind: "book", officialHost: "academiegoncourt.com", citationOptional: true },
  goodreads: {
    file: "goodreads_choice.json",
    kind: "reader-choice",
    officialHost: "goodreads.com",
    citationOptional: true,
    allowsEligibilityWindow: true,
    categories: ["fiction", "historical-fiction", "mystery-thriller", "romance", "fantasy", "nonfiction"]
  }
};

const aliases = new Map([
  ["nobel", "nobel"],
  ["nobel-literature", "nobel"],
  ["pulitzer", "pulitzer"],
  ["pulitzer-fiction", "pulitzer"],
  ["booker", "booker"],
  ["booker-prize", "booker"],
  ["goncourt", "goncourt"],
  ["prix-goncourt", "goncourt"],
  ["goodreads", "goodreads"],
  ["goodreads-choice", "goodreads"],
  ["goodreads-choice-awards", "goodreads"]
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
    console.error("Usage: validate-award-year.js <nobel|pulitzer|booker|goncourt|goodreads> <YYYY>");
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
    const hasAnnouncementDate = isIsoDate(entry.announcement_date);
    const hasEligibilityWindow = config.allowsEligibilityWindow
      && isIsoDate(entry.eligibility_start)
      && isIsoDate(entry.eligibility_end);
    required(errors, hasAnnouncementDate || hasEligibilityWindow, `${year}: thiếu ngày công bố hoặc cửa sổ eligibility chính thức`);
    if (hasEligibilityWindow) {
      required(errors, entry.eligibility_start <= entry.eligibility_end, `${year}: cửa sổ eligibility không hợp lệ`);
    }
    required(errors, isOfficialUrl(entry.schedule_source_url, config.officialHost), `${year}: schedule_source_url không phải nguồn chính thức`);
    if (entry.selection_source_url) {
      required(errors, isOfficialUrl(entry.selection_source_url, config.officialHost), `${year}: selection_source_url không phải nguồn chính thức`);
    }
    required(errors, entry.laureates?.length === 0, `${year}: pending phải có laureates rỗng`);
    return report(errors, award, year);
  }

  required(errors, isIsoDate(entry.announced_on), `${year}: announced_on không hợp lệ`);
  required(errors, isOfficialUrl(entry.source_url, config.officialHost), `${year}: source_url không phải nguồn chính thức`);
  required(errors, entry.laureates?.length > 0, `${year}: thiếu người hoặc tác phẩm đoạt giải`);

  if (config.kind === "reader-choice") {
    required(errors, Number.isInteger(entry.total_votes_cast) && entry.total_votes_cast > 0, `${year}: total_votes_cast không hợp lệ`);
    required(errors, entry.laureates?.length === config.categories.length, `${year}: phải có đúng sáu hạng mục Goodreads`);
    required(
      errors,
      config.categories.every((category, index) => entry.laureates?.[index]?.category === category),
      `${year}: thiếu sáu hạng mục Goodreads hoặc sai thứ tự`
    );
  }

  (entry.laureates || []).forEach((laureate, index) => {
    const label = `${year} laureate ${index + 1}`;
    required(errors, Boolean(laureate.name), `${label}: thiếu name`);

    if (config.kind === "reader-choice") {
      required(errors, Boolean(laureate.category_name), `${label}: thiếu category_name`);
      required(errors, Boolean(laureate.category_name_vi), `${label}: thiếu category_name_vi`);
      required(errors, isOfficialUrl(laureate.category_source_url, config.officialHost), `${label}: category_source_url không phải nguồn chính thức`);
      required(errors, Number.isInteger(laureate.vote_count) && laureate.vote_count > 0, `${label}: vote_count không hợp lệ`);
    }

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
    if (!config.citationOptional || laureate.citation || laureate.citation_vi) {
      required(errors, Boolean(laureate.citation), `${label}: thiếu citation`);
      required(errors, Boolean(laureate.citation_vi), `${label}: thiếu citation_vi`);
    }
    validateLocalImage(errors, root, work.cover, `${label} cover`);
  });

  report(errors, award, year);
}

main();
