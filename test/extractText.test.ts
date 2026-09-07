// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { getReadableChunks, normalize } from "../src/lib/extractText";

function articleFrom(html: string): HTMLElement {
  const article = document.createElement("article");
  article.innerHTML = html;
  return article;
}

describe("normalize", () => {
  it("collapses whitespace and trims", () => {
    expect(normalize("  hello\n\tworld  ")).toBe("hello world");
  });
});

describe("getReadableChunks", () => {
  it("reads one chunk per paragraph", () => {
    const article = articleFrom("<p>First paragraph.</p><p>Second paragraph.</p>");
    expect(getReadableChunks(article)).toEqual(["First paragraph.", "Second paragraph."]);
  });

  it("does not double-read nested lists", () => {
    const article = articleFrom("<ul><li>Item one<ul><li>Nested item</li></ul></li></ul>");
    expect(getReadableChunks(article)).toEqual(["Item one", "Nested item"]);
  });

  it("strips code blocks, math, and decorative icons", () => {
    const article = articleFrom(
      '<p>Before.</p><pre>const x = 1;</pre><span class="katex">x^2</span>' +
        '<a role="anchor">#</a><p>After.</p>',
    );
    expect(getReadableChunks(article)).toEqual(["Before.", "After."]);
  });

  it("replaces images with their alt text", () => {
    const article = articleFrom('<p>See <img src="a.png" alt="a diagram of the system" /></p>');
    expect(getReadableChunks(article)).toEqual(["See a diagram of the system"]);
  });

  it("drops images with no alt text", () => {
    const article = articleFrom('<p>See <img src="a.png" /> above.</p>');
    expect(getReadableChunks(article)).toEqual(["See above."]);
  });

  it("returns an empty list for content with nothing readable", () => {
    const article = articleFrom('<pre>only code</pre><svg><path d="M0 0" /></svg>');
    expect(getReadableChunks(article)).toEqual([]);
  });
});
