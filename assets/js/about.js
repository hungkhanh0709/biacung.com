async function main() {
  const authorCountEl = document.getElementById("author-count");
  const bookCountEl = document.getElementById("book-count");
  const editionCountEl = document.getElementById("edition-count");
  const statValueNodes = document.querySelectorAll("[data-about-stat-value]");

  if (!authorCountEl || !bookCountEl || !editionCountEl) {
    window.BiaCungPageLoader?.hide();
    return;
  }

  window.BiaCungPageLoader?.handoff("Đang tải trang giới thiệu...");

  const applyStatValue = (node, value) => {
    if (!node) {
      return;
    }

    node.textContent = value;
    node.classList.remove("skeleton-block", "skeleton-inline");
  };

  try {
    const [authorsResponse, bookIndexResponse] = await Promise.all([
      fetch("data/author.json", { cache: "no-store" }),
      fetch("data/book.json", { cache: "no-store" })
    ]);

    if (!authorsResponse.ok || !bookIndexResponse.ok) {
      throw new Error("Failed to fetch about stats");
    }

    const [authors, bookIndex] = await Promise.all([
      authorsResponse.json(),
      bookIndexResponse.json()
    ]);

    const bookFiles = Array.isArray(bookIndex) ? bookIndex.map((item) => item.detail).filter(Boolean) : [];
    const bookDetails = await Promise.all(
      bookFiles.map(async (detailPath) => {
        try {
          const response = await fetch(detailPath, { cache: "no-store" });
          return response.ok ? response.json() : null;
        } catch (error) {
          return null;
        }
      })
    );

    const books = bookDetails.filter(Boolean);
    const editionCount = books.reduce(
      (total, book) => total + (Array.isArray(book.editions) ? book.editions.length : 0),
      0
    );

    applyStatValue(authorCountEl, Array.isArray(authors) ? String(authors.length) : "0");
    applyStatValue(bookCountEl, String(books.length));
    applyStatValue(editionCountEl, String(editionCount));
  } catch (error) {
    statValueNodes.forEach((node) => {
      applyStatValue(node, "—");
    });
  } finally {
    window.BiaCungPageLoader?.hide();
  }
}

main();
