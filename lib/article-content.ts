export type ExtractedArticleContent = {
  content: string;
  styles: string;
};

const ROOT_BODY_SELECTOR_PATTERN = /(^|[,{])(\s*)body(?=\s*(?:[,{>+~.#:\[]|$))/gm;

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
  const styleTags = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? [];
  const extractedStyles = styleTags
    .map((styleTag) => {
      const styles = styleTag
        .replace(/^<style[^>]*>/i, "")
        .replace(/<\/style>$/i, "");

      return scopeRootSelectors(styles, articleDocumentClass);
    })
    .join("\n\n");

  let content = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

  const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    content = bodyMatch[1];
  }

  return {
    content,
    styles: extractedStyles,
  };
}
