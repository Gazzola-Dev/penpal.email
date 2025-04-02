import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  TextFormatType,
} from "lexical";
import { useCallback, useEffect, useState } from "react";

// Animation options
export const animationTypes = ["entrance", "emphasis", "exit"];
export const animationOptions = {
  entrance: ["fadeIn", "slideIn", "zoomIn", "bounceIn", "flipIn"],
  emphasis: ["pulse", "shake", "wiggle", "flash", "bounce"],
  exit: ["fadeOut", "slideOut", "zoomOut", "bounceOut", "flipOut"],
};

export interface AnimationSettings {
  type: string;
  animation: string;
  delay: number;
  duration: number;
}

export default function useEditor() {
  const [editor] = useLexicalComposerContext();
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationSettings>({
    type: "entrance",
    animation: "fadeIn",
    delay: 0,
    duration: 1,
  });

  const updateFormatState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Update selection state
        const text = selection.getTextContent();
        setHasSelection(text.length > 0);
        setSelectedText(text);

        // Update format states
        setIsBold(selection.hasFormat("bold"));
        setIsItalic(selection.hasFormat("italic"));
        setIsUnderline(selection.hasFormat("underline"));
      } else {
        setHasSelection(false);
        setSelectedText("");
      }
    });
  }, [editor]);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateFormatState();
      });
    });
  }, [editor, updateFormatState]);

  const applyFormat = useCallback(
    (format: string) => {
      editor.dispatchCommand(FORMAT_TEXT_COMMAND, format as TextFormatType);
    },
    [editor]
  );

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      type: e.target.value,
      animation:
        animationOptions[e.target.value as keyof typeof animationOptions][0],
    });
  };

  const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      animation: e.target.value,
    });
  };

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      delay: parseFloat(e.target.value),
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      duration: parseFloat(e.target.value),
    });
  };

  // Apply animation to selected text
  const applyAnimation = useCallback(() => {
    if (hasSelection) {
      // Here you would implement the logic to apply animations
      // This would require custom nodes or HTML serialization
      console.log("Applying animation:", currentAnimation);
    }
  }, [hasSelection, currentAnimation]);

  return {
    editor,
    hasSelection,
    selectedText,
    isBold,
    isItalic,
    isUnderline,
    currentAnimation,
    applyFormat,
    applyAnimation,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
  };
}
