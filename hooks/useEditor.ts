import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState } from "react";

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
  const [currentAnimation, setCurrentAnimation] = useState<AnimationSettings>({
    type: "entrance",
    animation: "fadeIn",
    delay: 0,
    duration: 1,
  });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        const isRangeSelection = $isRangeSelection(selection);
        const text = isRangeSelection ? selection.getTextContent() : "";

        setHasSelection(isRangeSelection && text.length > 0);
        setSelectedText(text);
      });
    });
  }, [editor]);

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

  return {
    hasSelection,
    selectedText,
    currentAnimation,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
  };
}
