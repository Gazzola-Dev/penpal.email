import { AnimationSettings } from "@/types";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useState } from "react";

const LowPriority = 1;

// Predefined animation options
export const animationTypes = ["fade", "slide", "zoom", "bounce"];
export const animationOptions: Record<string, string[]> = {
  fade: ["fadeIn", "fadeOut", "fadeInUp", "fadeInDown"],
  slide: ["slideInLeft", "slideInRight", "slideInUp", "slideInDown"],
  zoom: ["zoomIn", "zoomOut", "zoomInUp", "zoomInDown"],
  bounce: ["bounceIn", "bounceOut", "bounceInUp", "bounceInDown"],
};

// Interface for animation data storage
interface AnimationData {
  [textContent: string]: AnimationSettings;
}

// Function to get text content from selection
function getSelectedText(selection: RangeSelection): string {
  if ($isRangeSelection(selection)) {
    return selection.getTextContent();
  }
  return "";
}

export interface EditorHookState {
  hasSelection: boolean;
  selectedText: string;
  currentAnimation: AnimationSettings;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAnimationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDelayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function useEditor(): EditorHookState {
  const [editor] = useLexicalComposerContext();
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>("");
  const [animationData, setAnimationData] = useState<AnimationData>({});
  const [currentAnimation, setCurrentAnimation] = useState<AnimationSettings>({
    type: "fade",
    animation: "fadeIn",
    delay: 0,
    duration: 1,
  });

  // Load animation data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem("animationData");
    if (savedData) {
      try {
        setAnimationData(JSON.parse(savedData));
      } catch (e) {
        console.error("Error parsing animation data from localStorage", e);
      }
    }
  }, []);

  // Save animation data to localStorage on change (debounced)
  const saveToLocalStorage = debounce((data: AnimationData) => {
    localStorage.setItem("animationData", JSON.stringify(data));
  }, 500);

  // Update animation data in state and localStorage
  const updateAnimationData = useCallback(
    (text: string, settings: AnimationSettings) => {
      const newData = { ...animationData, [text]: settings };
      setAnimationData(newData);
      saveToLocalStorage(newData);
    },
    [animationData, saveToLocalStorage]
  );

  // Function to get editor text content
  const getEditorTextContent = useCallback(() => {
    let textContent = "";
    editor.update(() => {
      textContent = $getRoot().getTextContent();
    });
    return textContent;
  }, [editor]);

  // Update the toolbar based on selection
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    if ($isRangeSelection(selection)) {
      const text = getSelectedText(selection);
      setSelectedText(text);
      setHasSelection(text.length > 0);

      // Check if we have animation data for this text
      if (text && animationData[text]) {
        setCurrentAnimation(animationData[text]);
      } else {
        // Reset to default if no data exists for this selection
        setCurrentAnimation({
          type: "fade",
          animation: "fadeIn",
          delay: 0,
          duration: 1,
        });
      }
    } else {
      setHasSelection(false);
    }
  }, [animationData]);

  // Handle animation type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value;
    const newSettings = {
      ...currentAnimation,
      type,
      animation: animationOptions[type][0], // Set first animation of the selected type
    };

    setCurrentAnimation(newSettings);

    if (selectedText) {
      updateAnimationData(selectedText, newSettings);
    }
  };

  // Handle specific animation change
  const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const animation = e.target.value;
    const newSettings = { ...currentAnimation, animation };

    setCurrentAnimation(newSettings);

    if (selectedText) {
      updateAnimationData(selectedText, newSettings);
    }
  };

  // Handle delay change
  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const delay = parseFloat(e.target.value);
    const newSettings = { ...currentAnimation, delay };

    setCurrentAnimation(newSettings);

    if (selectedText) {
      updateAnimationData(selectedText, newSettings);
    }
  };

  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const duration = parseFloat(e.target.value);
    const newSettings = { ...currentAnimation, duration };

    setCurrentAnimation(newSettings);

    if (selectedText) {
      updateAnimationData(selectedText, newSettings);
    }
  };

  // Save full editor content to animation data
  useEffect(() => {
    const saveFullEditorContent = debounce(() => {
      const fullText = getEditorTextContent();
      if (fullText) {
        // Only store if we don't already have this text stored
        if (!animationData[fullText]) {
          const newData = { ...animationData };
          // Don't override existing animations
          setAnimationData(newData);
          saveToLocalStorage(newData);
        }
      }
    }, 1000);

    // Register for editor updates to save content
    const unregister = editor.registerUpdateListener(() => {
      saveFullEditorContent();
    });

    return () => {
      unregister();
      saveFullEditorContent.cancel();
    };
  }, [editor, animationData, getEditorTextContent, saveToLocalStorage]);

  // Register for selection changes and editor updates
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

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
