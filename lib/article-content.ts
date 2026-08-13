export type ExtractedArticleContent = {
  content: string;
  styles: string;
};

export type ArticleTableOfContentsItem = {
  id: string;
  label: string;
  level: 2 | 3;
};

export type NavigableArticleContent = {
  content: string;
  tableOfContents: ArticleTableOfContentsItem[];
};

const ROOT_BODY_SELECTOR_PATTERN = /(^|[,{])(\s*)body(?=\s*(?:[,{>+~.#:\[]|$))/gm;
const ARTICLE_DETAIL_TITLE_PATTERN =
  /<p\b([^>]*\bclass="[^"]*\b(?:card-title|prov-title|era-title)\b[^"]*"[^>]*)>([\s\S]*?)<\/p>/gi;
const ARTICLE_HEADING_PATTERN = /<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi;

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  hellip: "…",
  laquo: "«",
  ldquo: "“",
  lt: "<",
  mdash: "—",
  middot: "·",
  ndash: "–",
  nbsp: " ",
  quot: '"',
  raquo: "»",
  rdquo: "”",
};

function articleHeadingText(markup: string): string {
  return markup
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (_entity, value: string) => {
      if (value.startsWith("#x") || value.startsWith("#X")) {
        return String.fromCodePoint(Number.parseInt(value.slice(2), 16));
      }

      if (value.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(value.slice(1), 10));
      }

      return HTML_ENTITIES[value.toLowerCase()] ?? `&${value};`;
    })
    .replace(/\s+/g, " ")
    .trim();
}

function articleHeadingSlug(label: string): string {
  return label
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/Ä/g, "Ae")
    .replace(/Ö/g, "Oe")
    .replace(/Ü/g, "Ue")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " und ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "abschnitt";
}

function uniqueArticleHeadingId(label: string, usedIds: Set<string>): string {
  const baseId = `artikel-${articleHeadingSlug(label)}`;
  let id = baseId;
  let suffix = 2;

  while (usedIds.has(id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

/**
 * Promotes the existing detail-card titles to real headings, assigns deterministic
 * anchor IDs, and derives the table of contents from the resulting heading order.
 * The editorial source stays the single source of truth for all visible labels.
 */
export function prepareArticleContentForNavigation(html: string): NavigableArticleContent {
  const usedIds = new Set(
    Array.from(html.matchAll(/\bid="([^"]+)"/gi), (match) => match[1]),
  );
  const levelBadges = Array.from(
    html.matchAll(/<[^>]+\bclass="[^"]*\blevel-badge\b[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/gi),
    (match) => articleHeadingText(match[1]),
  );
  const labelsById = new Map<string, string>();
  let levelBadgeIndex = 0;

  let content = html.replace(
    ARTICLE_DETAIL_TITLE_PATTERN,
    (_match, attributes: string, headingMarkup: string) => {
      const visibleLabel = articleHeadingText(headingMarkup);
      const isLevelTitle = /\bcard-title\b/.test(attributes);
      const levelLabel = isLevelTitle ? levelBadges[levelBadgeIndex] : undefined;
      const tocLabel = levelLabel ? `${levelLabel} – ${visibleLabel}` : visibleLabel;
      const id = uniqueArticleHeadingId(tocLabel, usedIds);

      if (isLevelTitle) {
        levelBadgeIndex += 1;
      }

      labelsById.set(id, tocLabel);

      return `<h3${attributes} id="${id}" data-article-toc-heading="true">${headingMarkup}</h3>`;
    },
  );

  content = content.replace(
    ARTICLE_HEADING_PATTERN,
    (heading, rawLevel: string, attributes: string, headingMarkup: string) => {
      if (/\bdata-article-toc-heading=/i.test(attributes)) {
        return heading;
      }

      const label = articleHeadingText(headingMarkup);
      const existingId = attributes.match(/\bid="([^"]+)"/i)?.[1];
      const id = existingId ?? uniqueArticleHeadingId(label, usedIds);
      const attributesWithoutId = existingId
        ? attributes.replace(/\s+id="[^"]+"/i, "")
        : attributes;

      labelsById.set(id, label);

      return `<h${rawLevel}${attributesWithoutId} id="${id}" data-article-toc-heading="true">${headingMarkup}</h${rawLevel}>`;
    },
  );

  const tableOfContents = Array.from(content.matchAll(ARTICLE_HEADING_PATTERN)).flatMap(
    (match) => {
      const level = Number(match[1]);
      const attributes = match[2];

      if (!/\bdata-article-toc-heading="true"/i.test(attributes) || (level !== 2 && level !== 3)) {
        return [];
      }

      const id = attributes.match(/\bid="([^"]+)"/i)?.[1];
      if (!id) {
        return [];
      }

      return [
        {
          id,
          label: labelsById.get(id) ?? articleHeadingText(match[3]),
          level: level as 2 | 3,
        },
      ];
    },
  );

  return {
    content,
    tableOfContents,
  };
}

function scopeRootSelectors(styles: string, articleDocumentClass: string): string {
  const scopedDocumentSelector = `.${articleDocumentClass}`;

  return styles
    .replace(/:root/g, scopedDocumentSelector)
    .replace(
      ROOT_BODY_SELECTOR_PATTERN,
      (_match, boundary: string, whitespace: string) =>
        `${boundary}${whitespace}${scopedDocumentSelector}`,
    );
}

export function extractArticleBodyAndStyles(
  html: string,
  articleDocumentClass: string,
): ExtractedArticleContent {
  const normalizedHtml = html.replace(/\r\n?/g, "\n");
  const styleTags = normalizedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? [];
  const extractedStyles = styleTags
    .map((styleTag) => {
      const styles = styleTag
        .replace(/^<style[^>]*>/i, "")
        .replace(/<\/style>$/i, "");

      return scopeRootSelectors(styles, articleDocumentClass);
    })
    .join("\n\n");

  let content = normalizedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }

  return {
    content,
    styles: extractedStyles,
  };
}
