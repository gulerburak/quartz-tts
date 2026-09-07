const BLOCK_TAGS = new Set([
  "P",
  "LI",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "BLOCKQUOTE",
  "TD",
  "TH",
  "FIGCAPTION",
  "DT",
  "DD",
]);

// Documented, extensible strip-list. Elements matching these selectors have no
// meaningful spoken content (code, math markup, UI chrome, decorative icons).
export const STRIP_SELECTOR = [
  "pre",
  ".clipboard-button",
  ".katex",
  ".footnote-ref",
  "a[role='anchor']",
  ".mermaid",
  "svg",
].join(",");

export function normalize(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

// An element is a "block container" if it's block-level itself, or wraps a
// block-level descendant anywhere below it (e.g. a <ul> wrapping <li>s).
function isBlockContainer(el: Element): boolean {
  if (BLOCK_TAGS.has(el.tagName)) return true;
  return Array.from(el.children).some(isBlockContainer);
}

// Walks child *nodes* (not just elements) so direct text sitting alongside a
// nested block container isn't lost — e.g. `<li>Item one<ul>...</ul></li>`
// has both text of its own AND a block descendant. Direct/inline text is
// buffered and flushed as its own chunk right before descending into any
// block-container child; recursing purely over `.children` would silently
// drop that direct text once a block descendant is present.
function collectChunks(el: Element, out: string[]): void {
  let buffer = "";
  const flush = () => {
    const text = normalize(buffer);
    if (text) out.push(text);
    buffer = "";
  };

  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      buffer += node.textContent ?? "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const child = node as Element;
      if (isBlockContainer(child)) {
        flush();
        collectChunks(child, out);
      } else {
        // Inline element (e.g. <strong>, <a>, <code>) — part of the
        // surrounding text flow, not its own chunk.
        buffer += child.textContent ?? "";
      }
    }
  }
  flush();
}

export function getReadableChunks(article: Element): string[] {
  const clone = article.cloneNode(true) as HTMLElement;
  clone.querySelectorAll(STRIP_SELECTOR).forEach((el) => el.remove());
  // Preserve meaningful alt text before it's lost (images have no textContent)
  clone.querySelectorAll("img").forEach((img) => {
    const alt = img.getAttribute("alt")?.trim();
    img.replaceWith(alt ? document.createTextNode(alt) : "");
  });
  const chunks: string[] = [];
  collectChunks(clone, chunks);
  return chunks;
}
