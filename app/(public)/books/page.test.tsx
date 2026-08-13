import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BooksPage, { metadata } from "./page";

describe("books page", () => {
  it("presents one book with separate print and e-book destinations", () => {
    const html = renderToStaticMarkup(<BooksPage />);

    expect(html).toContain("Deutsch für Elektriker");
    expect(html).toContain("Ein Buch, zwei Formate");
    expect(html).toContain("Printausgabe");
    expect(html).toContain("Kindle-eBook");
    const printLink = html.match(
      /<a[^>]+href="https:\/\/www\.amazon\.de\/dp\/B0HBLTQ9SZ"[^>]*>[\s\S]*?<\/a>/,
    )?.[0];
    const ebookLink = html.match(
      /<a[^>]+href="https:\/\/www\.amazon\.de\/dp\/B0HBLRJB2S"[^>]*>[\s\S]*?<\/a>/,
    )?.[0];

    expect(printLink).toContain("Printausgabe bei Amazon ansehen");
    expect(ebookLink).toContain("Kindle-eBook bei Amazon ansehen");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('href="/"');
  });

  it("publishes canonical metadata and book structured data", () => {
    const html = renderToStaticMarkup(<BooksPage />);

    expect(metadata.alternates?.canonical).toBe("/books");
    expect(html).toContain('"@type":"Book"');
    expect(html).toContain('"numberOfPages":120');
    expect(html).toContain('"isbn":"979-8188659202"');
    expect(html).toContain("https://schema.org/Paperback");
    expect(html).toContain("https://schema.org/EBook");
  });
});
