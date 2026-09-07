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

const WORD_CLASS = "tts-word";
const ALT_WORDS_CLASS = "tts-alt-words";

// An element is a "block container" if it's block-level itself, or wraps a
// block-level descendant anywhere below it (e.g. a <ul> wrapping <li>s).
function isBlockContainer(el: Element): boolean {
  if (BLOCK_TAGS.has(el.tagName)) return true;
  return Array.from(el.children).some(isBlockContainer);
}

function wrapWordsInTextNode(node: Text, out: HTMLElement[]): void {
  if (!node.data.trim()) return;
  const parts = node.data.split(/(\s+)/);
  const frag = document.createDocumentFragment();
  for (const part of parts) {
    if (part === "") continue;
    if (/^\s+$/.test(part)) {
      frag.appendChild(document.createTextNode(part));
      continue;
    }
    const span = document.createElement("span");
    span.className = WORD_CLASS;
    span.textContent = part;
    frag.appendChild(span);
    out.push(span);
  }
  node.replaceWith(frag);
}

// Images have no rendered text of their own, but their alt text is still
// spoken — inserted right after the image as visually-hidden words so word
// indices/highlighting stay consistent without changing how the page looks.
function wrapAltTextWords(img: Element, out: HTMLElement[]): void {
  const alt = img.getAttribute("alt")?.trim();
  if (!alt) return;
  const words = alt.split(/\s+/).filter(Boolean);
  if (words.length === 0) return;

  const container = document.createElement("span");
  container.className = ALT_WORDS_CLASS;
  container.setAttribute("aria-hidden", "true");
  container.style.cssText =
    "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;";
  words.forEach((word, i) => {
    if (i > 0) container.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = WORD_CLASS;
    span.textContent = word;
    container.appendChild(span);
    out.push(span);
  });
  img.insertAdjacentElement("afterend", container);
}

// Walks child *nodes* (not just elements) at every depth so direct text
// sitting alongside a nested block container isn't lost — e.g.
// `<li>Item one<ul>...</ul></li>` has both text of its own AND a block
// descendant. Inline elements (e.g. <strong>, <a>, <code>) recurse within the
// same chunk; block containers flush the current chunk and start a new one.
function walk(el: Element, chunks: HTMLElement[][]): void {
  let current: HTMLElement[] = [];
  const flush = () => {
    if (current.length > 0) chunks.push(current);
    current = [];
  };

  function visit(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      wrapWordsInTextNode(node as Text, current);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as Element;
    if (element.matches(STRIP_SELECTOR)) return;
    if (element.tagName === "IMG") {
      wrapAltTextWords(element, current);
      return;
    }
    if (isBlockContainer(element)) {
      flush();
      walk(element, chunks);
      return;
    }
    Array.from(element.childNodes).forEach(visit);
  }

  Array.from(el.childNodes).forEach(visit);
  flush();
}

/**
 * Wraps every readable word of `article` in a `.tts-word` span tagged with
 * its chunk/word indices (`data-tts-chunk`/`data-tts-word`), so playback can
 * highlight the current word and seek to a clicked one. Returns one array of
 * word spans per readable chunk, in the order chunks are spoken. Idempotent —
 * safe to call again without unwrapping first.
 */
export function wrapArticleWords(article: Element): HTMLElement[][] {
  unwrapArticleWords(article);
  const chunks: HTMLElement[][] = [];
  walk(article, chunks);
  chunks.forEach((words, chunkIndex) => {
    words.forEach((span, wordIndex) => {
      span.dataset.ttsChunk = String(chunkIndex);
      span.dataset.ttsWord = String(wordIndex);
    });
  });
  return chunks;
}

/** Restores `article`'s original text nodes, undoing `wrapArticleWords`. */
export function unwrapArticleWords(article: Element): void {
  article.querySelectorAll(`.${ALT_WORDS_CLASS}`).forEach((el) => el.remove());
  article.querySelectorAll(`.${WORD_CLASS}`).forEach((span) => {
    span.replaceWith(document.createTextNode(span.textContent ?? ""));
  });
  article.normalize();
}

/** The text spoken for each chunk, derived from its wrapped words. */
export function chunkTextsFrom(chunkWords: HTMLElement[][]): string[] {
  return chunkWords.map((words) => words.map((w) => w.textContent ?? "").join(" "));
}
