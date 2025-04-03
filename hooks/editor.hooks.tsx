"use client";

import { AnimationSettings } from "@/types";
import {
  $isRangeSelection,
  createCommand,
  SerializedTextNode,
  TextNode,
} from "lexical";
import { useCallback, useState } from "react";

// Animation options
export const animationTypes = ["entrance", "emphasis", "exit"];
export const animationOptions = {
  entrance: ["fadeIn", "slideIn", "zoomIn", "bounceIn", "flipIn"],
  emphasis: ["pulse", "shake", "wiggle", "flash", "bounce"],
  exit: ["fadeOut", "slideOut", "zoomOut", "bounceOut", "flipOut"],
};

// Define a custom command to apply animation
export const APPLY_ANIMATION_COMMAND = createCommand<AnimationSettings>(
  "APPLY_ANIMATION_COMMAND"
);

// Define the serialized version of animated text node
export interface SerializedAnimatedTextNode extends SerializedTextNode {
  type: "animated-text";
  animation: AnimationSettings | null;
}

// Create an AnimatedTextNode class by extending TextNode

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

// Custom hook for managing simple editor state
export function useSimpleEditor() {
  const [currentSelection, setCurrentSelection] = useState<{
    hasSelection: boolean;
    text: string;
  }>({
    hasSelection: false,
    text: "",
  });

  const updateSelection = useCallback(($getSelection: () => any) => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const text = selection.getTextContent();
      setCurrentSelection({
        hasSelection: text.length > 0,
        text,
      });
    } else {
      setCurrentSelection({
        hasSelection: false,
        text: "",
      });
    }
  }, []);

  return {
    currentSelection,
    updateSelection,
  };
}
