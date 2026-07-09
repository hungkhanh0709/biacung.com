async function main() {
  const authorCountEl = document.getElementById("author-count");
  const bookCountEl = document.getElementById("book-count");
  const editionCountEl = document.getElementById("edition-count");

  if (!authorCountEl || !bookCountEl || !editionCountEl) {
    return;
  }

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

    authorCountEl.textContent = Array.isArray(authors) ? String(authors.length) : "0";
    bookCountEl.textContent = String(books.length);
    editionCountEl.textContent = String(editionCount);
  } catch (error) {
    authorCountEl.textContent = "—";
    bookCountEl.textContent = "—";
    editionCountEl.textContent = "—";
  }
}

main();
