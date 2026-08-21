import sanitizeHtml from "sanitize-html";

export function sanitizeProjectRichContent(value: unknown) {
  return sanitizeHtml(String(value ?? ""), {
    allowedTags: ["h2", "h3", "h4", "p", "strong", "em", "u", "s", "ul", "ol", "li", "blockquote", "a", "img", "figure", "figcaption", "br", "hr", "code", "pre"],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "loading"],
    },
    allowedSchemes: ["http", "https"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noreferrer" }),
      img: sanitizeHtml.simpleTransform("img", { loading: "lazy" }),
    },
  });
}
