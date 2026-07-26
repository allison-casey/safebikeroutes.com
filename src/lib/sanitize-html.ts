import type { Config } from "dompurify";
import DOMPurify from "isomorphic-dompurify";

const DESCRIPTION_PURIFY_CONFIG: Config = {
  USE_PROFILES: { html: true },
  FORBID_TAGS: [
    "style",
    "iframe",
    "object",
    "embed",
    "form",
    "input",
    "script",
  ],
  FORBID_ATTR: ["style"],
  ADD_ATTR: ["target"],
  RETURN_TRUSTED_TYPE: false,
};

export const sanitizeRegionDescriptionHtml = (html: string): string =>
  DOMPurify.sanitize(html, DESCRIPTION_PURIFY_CONFIG);
