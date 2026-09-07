// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { chunkTextsFrom, unwrapArticleWords, wrapArticleWords } from "../src/lib/articleWords";

function articleFrom(html: string): HTMLElement {
  const article = document.createElement("article");
  article.innerHTML = html;
  return article;
}

function readChunks(article: HTMLElement): string[] {
  return chunkTextsFrom(wrapArticleWords(article));
}

describe("wrapArticleWords", () => {
  it("reads one chunk per paragraph", () => {
    const article = articleFrom("<p>First paragraph.</p><p>Second paragraph.</p>");
    expect(readChunks(article)).toEqual(["First paragraph.", "Second paragraph."]);
  });

  it("does not double-read nested lists", () => {
    const article = articleFrom("<ul><li>Item one<ul><li>Nested item</li></ul></li></ul>");
    expect(readChunks(article)).toEqual(["Item one", "Nested item"]);
  });

  it("strips code blocks, math, and decorative icons", () => {
    const article = articleFrom(
      '<p>Before.</p><pre>const x = 1;</pre><span class="katex">x^2</span>' +
        '<a role="anchor">#</a><p>After.</p>',
    );
    expect(readChunks(article)).toEqual(["Before.", "After."]);
  });

  it("replaces images with their (visually hidden) alt text", () => {
    const article = articleFrom('<p>See <img src="a.png" alt="a diagram of the system" /></p>');
    expect(readChunks(article)).toEqual(["See a diagram of the system"]);
  });

  it("drops images with no alt text", () => {
    const article = articleFrom('<p>See <img src="a.png" /> above.</p>');
    expect(readChunks(article)).toEqual(["See above."]);
  });

  it("returns an empty list for content with nothing readable", () => {
    const article = articleFrom('<pre>only code</pre><svg><path d="M0 0" /></svg>');
    expect(readChunks(article)).toEqual([]);
  });

  it("tags each word span with its chunk/word index for click-to-seek", () => {
    const article = articleFrom("<p>One two three.</p>");
    const [chunk] = wrapArticleWords(article);
    expect(chunk!.map((s) => s.dataset.ttsChunk)).toEqual(["0", "0", "0"]);
    expect(chunk!.map((s) => s.dataset.ttsWord)).toEqual(["0", "1", "2"]);
    expect(chunk!.map((s) => s.textContent)).toEqual(["One", "two", "three."]);
  });

  it("is idempotent — calling it again re-wraps cleanly instead of double-wrapping", () => {
    const article = articleFrom("<p>One two.</p>");
    wrapArticleWords(article);
    const second = wrapArticleWords(article);
    expect(chunkTextsFrom(second)).toEqual(["One two."]);
    expect(article.querySelectorAll(".tts-word")).toHaveLength(2);
  });
});

describe("unwrapArticleWords", () => {
  it("restores the article's original text", () => {
    const article = articleFrom("<p>One <strong>two</strong> three.</p>");
    wrapArticleWords(article);
    expect(article.querySelectorAll(".tts-word").length).toBeGreaterThan(0);

    unwrapArticleWords(article);
    expect(article.querySelectorAll(".tts-word")).toHaveLength(0);
    expect(article.textContent).toBe("One two three.");
    expect(article.querySelector("strong")?.textContent).toBe("two");
  });

  it("removes the visually-hidden alt-text containers image alt words were wrapped in", () => {
    const article = articleFrom('<p>See <img src="a.png" alt="a diagram" /></p>');
    wrapArticleWords(article);
    expect(article.querySelectorAll(".tts-alt-words")).toHaveLength(1);

    unwrapArticleWords(article);
    expect(article.querySelectorAll(".tts-alt-words")).toHaveLength(0);
    expect(article.querySelector("img")).not.toBeNull();
  });
});
