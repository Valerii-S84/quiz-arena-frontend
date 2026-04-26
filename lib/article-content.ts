export type ExtractedArticleContent = {
  content: string;
  styles: string;
};

export function extractArticleBodyAndStyles(
  html: string,
  articleDocumentClass: string,
): ExtractedArticleContent {
  const styleTags = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) ?? [];
  const extractedStyles = styleTags
    .map((styleTag) =>
      styleTag
        .replace(/^<style[^>]*>/i, "")
        .replace(/<\/style>$/i, "")
        .replace(/:root/g, `.${articleDocumentClass}`)
        .replace(/\bbody\b/g, `.${articleDocumentClass}`),
    )
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
