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
    let parts = /^([1-9]\d{3})(?:-(\d{1,2})(?:-(\d{1,2}))?)?$/.exec(text);
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
    return normalizePubDate(edition?.pub_date)
      || (normalizeYear(edition?.pub_year) ? `${normalizeYear(edition.pub_year)}-01-01` : "");
  }

  function getEditionYear(edition) {
    const date = getEditionDate(edition);
    return date ? Number(date.slice(0, 4)) : null;
  }

  function descending(left, right) {
    return left === right ? 0 : left > right ? -1 : 1;
  }

  function compareEditions(left, right) {
    return descending(getEditionDate(left), getEditionDate(right));
  }

  function sortEditions(editions) {
    return [...(Array.isArray(editions) ? editions : [])].sort(compareEditions);
  }

  function normalizeEdition(edition) {
    const result = { ...edition };
    if (Object.prototype.hasOwnProperty.call(result, "pub_date")) {
      const date = normalizePubDate(result.pub_date);
      if (result.pub_date != null && String(result.pub_date).trim() && !date) {
        const error = new Error(`Ngày phát hành không hợp lệ: ${result.pub_date}. Dùng YYYY-MM-DD, YYYY-MM, YYYY, DD/MM/YYYY hoặc MM/YYYY.`);
        error.statusCode = 400;
        throw error;
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

  function normalizeBookDetail(book) {
    return Array.isArray(book?.editions)
      ? { ...book, editions: sortEditions(book.editions.map(normalizeEdition)) }
      : { ...book };
  }

  function getPublicationSummary(book) {
    const editions = sortEditions(book?.editions);
    const latest = editions[0];
    const date = getEditionDate(latest);
    // Prefer an explicitly recorded date on ties, without changing edition order.
    const datedLatest = editions.find((edition) => getEditionDate(edition) === date && normalizePubDate(edition?.pub_date));
    return {
      last_pub_year: date ? Number(date.slice(0, 4)) : "",
      ...(datedLatest ? { last_pub_date: normalizePubDate(datedLatest.pub_date) } : {})
    };
  }

  function withPublicationSummary(entry, book) {
    const { last_pub_date, last_pub_year, ...rest } = entry;
    return { ...rest, ...getPublicationSummary(book) };
  }

  function getIndexDate(entry) {
    return normalizePubDate(entry?.last_pub_date)
      || (normalizeYear(entry?.last_pub_year) ? `${normalizeYear(entry.last_pub_year)}-01-01` : "");
  }

  function compareBookEntries(left, right) {
    // Stable ties preserve existing editorial order; updated_at is metadata only.
    return descending(getIndexDate(left), getIndexDate(right));
  }

  function sortBookEntries(entries) {
    return [...(Array.isArray(entries) ? entries : [])].sort(compareBookEntries);
  }

  function formatPublicationDate(edition) {
    const date = normalizePubDate(edition?.pub_date);
    return date ? date.split("-").reverse().join("/") : String(normalizeYear(edition?.pub_year) ?? "");
  }

  function publicationDateForSchema(edition) {
    return normalizePubDate(edition?.pub_date) || String(normalizeYear(edition?.pub_year) ?? "");
  }

  return {
    normalizeYear, normalizePubDate, isIsoDate, getEditionDate, getEditionYear,
    compareEditions, sortEditions, normalizeEdition, normalizeBookDetail,
    getPublicationSummary, withPublicationSummary, compareBookEntries, sortBookEntries,
    formatPublicationDate, publicationDateForSchema
  };
});
