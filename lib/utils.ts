import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { TextNode } from "lexical";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to copy formats from one node to another
export const copyFormatsToNode = (source: TextNode, target: TextNode): void => {
  const formats = [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "code",
    "subscript",
    "superscript",
  ] as const;

  formats.forEach((format) => {
    if (source.hasFormat(format)) {
      target.toggleFormat(format);
    }
  });
};
