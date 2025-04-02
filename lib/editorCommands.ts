// First, let's define custom commands for font family and size
// Create this file at src/lib/editorCommands.js or similar location

import { createCommand } from "lexical";

export const CHANGE_FONT_FAMILY_COMMAND = createCommand("CHANGE_FONT_FAMILY");
export const CHANGE_FONT_SIZE_COMMAND = createCommand("CHANGE_FONT_SIZE");

// Then, create a custom plugin to handle these commands
// Create this file at src/components/FontFormattingPlugin.jsx or similar location

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $patchStyleText } from "@lexical/selection";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
} from "lexical";
import { useEffect } from "react";

export default function FontFormattingPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register font family command
    const fontFamilyListener = editor.registerCommand(
      CHANGE_FONT_FAMILY_COMMAND,
      (fontFamily: string) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            "font-family": fontFamily,
          });
        }
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    // Register font size command
    const fontSizeListener = editor.registerCommand(
      CHANGE_FONT_SIZE_COMMAND,
      (fontSize) => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $patchStyleText(selection, {
            "font-size": fontSize + "px",
          });
        }
        return true;
      },
      COMMAND_PRIORITY_CRITICAL
    );

    return () => {
      fontFamilyListener();
      fontSizeListener();
    };
  }, [editor]);

  return null;
}
