// Shared by static pages and Node tools. Calendar dates never pass through a timezone.
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.BiaCungPublication = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function normalizeYear(value) {
    const text = String(value ?? "").trim();
    return /^[1-9]\d{3}$/.test(text) ? Number(text) : null;
  }

  // Accept unambiguous ISO or Vietnamese input; persist only a complete ISO date.
  function normalizePubDate(value) {
    const text = String(value ?? "").trim();
    let parts = /^([1-9]\d{3})-(\d{1,2})(?:-(\d{1,2}))?$/.exec(text);
    let year, month, day;
    if (parts) {
      year = Number(parts[1]); month = Number(parts[2] ?? 1); day = Number(parts[3] ?? 1);
    } else {
      parts = /^(?:(\d{1,2})\/)?(\d{1,2})\/([1-9]\d{3})$/.exec(text);
      if (!parts) return null;
      year = Number(parts[3]); month = Number(parts[2]); day = Number(parts[1] ?? 1);
    }
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month < 1 || month > 12 || day < 1 || day > days[month - 1]) return null;
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function isIsoDate(value) {
    return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      && normalizePubDate(value) === value;
  }

  function getEditionDate(edition) {
    return normalizePubDate(edition?.pub_date) || "";
  }

  function getEditionYear(edition) {
    const date = getEditionDate(edition);
    return date ? Number(date.slice(0, 4)) : normalizeYear(edition?.pub_year);
  }

  function descending(left, right) {
    return left === right ? 0 : left > right ? -1 : 1;
  }

  function isUpcoming(value) {
    return value?.is_upcoming === true;
  }

  function compareEditions(left, right) {
    if (isUpcoming(left) || isUpcoming(right)) {
      return descending(Number(isUpcoming(left)), Number(isUpcoming(right)));
    }
    return descending(getEditionYear(left) || 0, getEditionYear(right) || 0)
      || descending(normalizePubDate(left?.pub_date) || "", normalizePubDate(right?.pub_date) || "");
  }

  function sortEditions(editions) {
    // A total order avoids inconsistent comparisons when dates are missing.
    // Within one year, known dates precede unknown dates; equal keys stay stable.
    return Array.isArray(editions) ? [...editions].sort(compareEditions) : [];
  }

  function normalizeEditionFields(edition) {
    const result = { ...edition };
    if (result.is_upcoming === false) delete result.is_upcoming;
    if (Object.prototype.hasOwnProperty.call(result, "pub_date")) {
      const yearOnly = normalizeYear(result.pub_date);
      if (yearOnly) {
        result.pub_year = yearOnly;
        delete result.pub_date;
        return result;
      }
      const date = normalizePubDate(result.pub_date);
      if (result.pub_date != null && String(result.pub_date).trim() && !date) {
        const error = new Error(`Ngày phát hành không hợp lệ: ${result.pub_date}. Dùng YYYY-MM-DD, YYYY-MM, YYYY, DD/MM/YYYY hoặc MM/YYYY.`);
        error.statusCode = 400;
        throw error;
      }
      if (!date && normalizeYear(result.pub_year)) {
        delete result.pub_date;
        return result;
      }
      result.pub_date = date;
      if (date) result.pub_year = Number(date.slice(0, 4));
      if (Object.prototype.hasOwnProperty.call(result, "pub_year")) {
        return Object.fromEntries(Object.entries(result).flatMap(([key, value]) => {
          if (key === "pub_date") return [];
          return key === "pub_year" ? [[key, value], ["pub_date", result.pub_date]] : [[key, value]];
        }));
      }
    }
    return result;
  }

  function normalizeEdition(edition) {
    const result = normalizeEditionFields(edition);
    // Merging retains old key order; place the status before the final year,
    // including when normalization derives that year from pub_date.
    if (!isUpcoming(result) || !Object.prototype.hasOwnProperty.call(result, "pub_year")) return result;
    return Object.fromEntries(Object.entries(result)
      .filter(([key]) => key !== "is_upcoming")
      .flatMap(([key, value]) => key === "pub_year"
        ? [["is_upcoming", true], [key, value]] : [[key, value]]));
  }

  function normalizeBookDetail(book) {
    return Array.isArray(book?.editions)
      ? { ...book, editions: sortEditions(book.editions.map(normalizeEdition)) }
      : { ...book };
  }

  function getPublicationSummary(book) {
    let latest = null;
    for (const edition of Array.isArray(book?.editions) ? book.editions : []) {
      if (!latest || compareEditions(edition, latest) < 0) latest = edition;
    }
    const recordedDate = getEditionDate(latest);
    return {
      ...(isUpcoming(latest) ? { is_upcoming: true } : {}),
      last_pub_year: getEditionYear(latest) || "",
      ...(recordedDate ? { last_pub_date: recordedDate } : {})
    };
  }

  function withPublicationSummary(entry, book) {
    const summary = getPublicationSummary(book);
    const result = { ...entry, ...summary };
    if (!summary.last_pub_date) delete result.last_pub_date;
    if (!summary.is_upcoming) delete result.is_upcoming;
    return result;
  }

  function compareBookEntries(left, right) {
    if (isUpcoming(left) || isUpcoming(right)) {
      return descending(Number(isUpcoming(left)), Number(isUpcoming(right)))
        || descending(getUpdatedTime(left) ?? 0, getUpdatedTime(right) ?? 0);
    }
    return compareEditions(
      { pub_year: left?.last_pub_year, pub_date: left?.last_pub_date },
      { pub_year: right?.last_pub_year, pub_date: right?.last_pub_date }
    );
  }

  function getUpdatedTime(entry) {
    let value = String(entry?.updated_at ?? "").trim();
    const minute = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})$/.exec(value);
    if (minute) {
      if (Number(minute[2]) > 23 || Number(minute[3]) > 59) return null;
      value = `${minute[1]}T${minute[2]}:${minute[3]}:00Z`;
    }
    if (!/^\d{4}-\d{2}-\d{2}(?:T.*(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)
        || !isIsoDate(value.slice(0, 10))) return null;
    const time = Date.parse(value);
    return Number.isFinite(time) ? time : null;
  }

  function formatUpdatedAt(value = new Date()) {
    if (isIsoDate(value)) return value;
    const time = value instanceof Date ? value.getTime() : getUpdatedTime({ updated_at: value });
    return time != null && Number.isFinite(time)
      ? new Date(time).toISOString().slice(0, 16).replace("T", " ")
      : String(value ?? "").trim();
  }

  function updatedAtForSchema(value) {
    const formatted = formatUpdatedAt(value);
    return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(formatted)
      ? `${formatted.replace(" ", "T")}:00Z` : formatted;
  }

  function sortBookEntries(entries) {
    return Array.isArray(entries) ? [...entries].sort(compareBookEntries) : [];
  }

  function formatPublicationDate(edition) {
    if (isUpcoming(edition)) return "Sắp phát hành";
    if (edition?.pub_date) {
      const date = new Date(edition.pub_date);
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      return `${month}/${year}`;
    } else if (edition?.pub_year) {
      return normalizeYear(edition.pub_year);
    }
    return "";
  }

  function publicationDateForSchema(edition) {
    if (isUpcoming(edition)) return "";
    return normalizePubDate(edition?.pub_date) || String(normalizeYear(edition?.pub_year) ?? "");
  }

  return {
    normalizeYear, normalizePubDate, isIsoDate, getEditionDate, getEditionYear, isUpcoming,
    compareEditions, sortEditions, normalizeEdition, normalizeBookDetail,
    getPublicationSummary, withPublicationSummary, compareBookEntries, sortBookEntries,
    formatPublicationDate, publicationDateForSchema, formatUpdatedAt, updatedAtForSchema
  };
});
