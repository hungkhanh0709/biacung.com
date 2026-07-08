const params = new URLSearchParams(window.location.search);
const keyword = (params.get("q") || "").trim();
const page = document.querySelector(".search-page");
const input = document.querySelector("#site-search");
const keywordNode = document.querySelector("#search-keyword");

if (input) {
  input.value = keyword;
}

if (keywordNode) {
  keywordNode.textContent = keyword || "tất cả";
}

if (keyword) {
  document.title = `Kết quả tìm kiếm “${keyword}” | Bìa Cứng`;
} else {
  page?.classList.add("is-empty");
}
