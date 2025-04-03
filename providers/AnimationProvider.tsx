"use client";
import { AnimatedTextNode } from "@/components/AnimatedTextNode";
import { APPLY_ANIMATION_COMMAND } from "@/hooks/editor.hooks";
import { AnimationSettings } from "@/types";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

// Default animation settings
const defaultAnimationSettings: AnimationSettings = {
  type: "entrance",
  animation: "fadeIn",
  delay: 0,
  duration: 1,
};

// Animation options
export const animationTypes = ["entrance", "emphasis", "exit"];
export const animationOptions = {
  entrance: ["fadeIn", "slideIn", "zoomIn", "bounceIn", "flipIn"],
  emphasis: ["pulse", "shake", "wiggle", "flash", "bounce"],
  exit: ["fadeOut", "slideOut", "zoomOut", "bounceOut", "flipOut"],
};

// Context interface
interface AnimationContextType {
  hasSelection: boolean;
  selectedText: string;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  applyAnimationToSelection: () => void;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAnimationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDelayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Create context with default values
const AnimationContext = createContext<AnimationContextType>({
  hasSelection: false,
  selectedText: "",
  animationSettings: defaultAnimationSettings,
  setAnimationSettings: () => {},
  applyAnimationToSelection: () => {},
  handleTypeChange: () => {},
  handleAnimationChange: () => {},
  handleDelayChange: () => {},
  handleDurationChange: () => {},
});

// Provider component
export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const [editor] = useLexicalComposerContext();
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(
    defaultAnimationSettings
  );

  // Function to get animation settings from the current selection
  const getSelectionAnimationSettings =
    useCallback((): AnimationSettings | null => {
      let settings: AnimationSettings | null = null;

      editor.getEditorState().read(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection)) {
          return null;
        }

        // Check if selection consists of a single AnimatedTextNode
        const nodes = selection.getNodes();

        // If there's only one node and it's an AnimatedTextNode
        if (nodes.length === 1 && nodes[0] instanceof AnimatedTextNode) {
          const animatedNode = nodes[0] as AnimatedTextNode;
          settings = animatedNode.getAnimation();
        }
        // Check nodes in selection for AnimatedTextNode
        else {
          for (const node of nodes) {
            if (node instanceof AnimatedTextNode) {
              settings = node.getAnimation();
              break;
            }
          }
        }
      });

      return settings;
    }, [editor]);

  // Update selection state when the selection changes
  const updateSelectionState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent();
        const newHasSelection = text.length > 0;

        setHasSelection(newHasSelection);
        setSelectedText(text);

        // Get animation settings from the current selection
        if (newHasSelection) {
          const selectionSettings = getSelectionAnimationSettings();

          if (selectionSettings) {
            setAnimationSettings(selectionSettings);
          }
        }
      } else {
        setHasSelection(false);
        setSelectedText("");
      }
    });
  }, [editor, getSelectionAnimationSettings]);

  // Register selection change listener
  React.useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateSelectionState();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateSelectionState();
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, updateSelectionState]);

  // Apply animation to selected text
  const applyAnimationToSelection = useCallback(() => {
    if (hasSelection) {
      editor.dispatchCommand(APPLY_ANIMATION_COMMAND, animationSettings);
    }
  }, [editor, hasSelection, animationSettings]);

  // Handle animation type change
  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value;
      setAnimationSettings((prev) => ({
        ...prev,
        type: newType,
        animation:
          animationOptions[newType as keyof typeof animationOptions][0],
      }));
    },
    []
  );

  // Handle animation name change
  const handleAnimationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newAnimation = e.target.value;
      setAnimationSettings((prev) => ({
        ...prev,
        animation: newAnimation,
      }));
    },
    []
  );

  // Handle animation delay change
  const handleDelayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDelay = parseFloat(e.target.value);
      const updatedSettings = {
        ...animationSettings,
        delay: isNaN(newDelay) ? 0 : newDelay,
      };

      setAnimationSettings(updatedSettings);

      // Auto-apply animation if there's a selection
      if (hasSelection && e.target.value !== "") {
        editor.dispatchCommand(APPLY_ANIMATION_COMMAND, updatedSettings);
      }
    },
    [editor, animationSettings, hasSelection]
  );

  // Handle animation duration change
  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = parseFloat(e.target.value);
      const updatedSettings = {
        ...animationSettings,
        duration: isNaN(newDuration) ? 1 : newDuration,
      };

      setAnimationSettings(updatedSettings);

      // Auto-apply animation if there's a selection
      if (hasSelection && e.target.value !== "") {
        editor.dispatchCommand(APPLY_ANIMATION_COMMAND, updatedSettings);
      }
    },
    [editor, animationSettings, hasSelection]
  );

  // Context value
  const contextValue: AnimationContextType = {
    hasSelection,
    selectedText,
    animationSettings,
    setAnimationSettings,
    applyAnimationToSelection,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
  };

  return (
    <AnimationContext.Provider value={contextValue}>
      {children}
    </AnimationContext.Provider>
  );
};

// Custom hook to use the animation context
export const useAnimation = () => useContext(AnimationContext);

export default AnimationProvider;
