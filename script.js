// Embed Height 관련 스크립트
let height = 0;
function sendEmbedHeight() {
  window.parent.postMessage({ embedHeight: height }, "*");
}
const observer = new ResizeObserver((entries) => {
  if (entries.length !== 1) return;
  const entry = entries[0];
  if (entry.target !== document.body) return;
  height = entry.contentRect.height;
  sendEmbedHeight();
});
observer.observe(document.body);
window.addEventListener("message", (event) => {
  if (event.source !== window.parent) return;
  if (event.data !== "getEmbedHeight") return;
  sendEmbedHeight();
});

// (필요에 따라 Framer의 appear 애니메이션 스크립트 등 추가)
