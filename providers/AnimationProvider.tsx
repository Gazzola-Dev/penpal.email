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
  RangeSelection,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

// Interface for storing selection data
interface SelectionData {
  key: string;
  animationSettings: AnimationSettings;
}

// Context interface
interface AnimationContextType {
  hasSelection: boolean;
  selectedText: string;
  selectionRect: DOMRect | null;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  applyAnimationToSelection: () => void;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAnimationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDelayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectionMap: Map<string, SelectionData>;
}

// Create context with default values
const AnimationContext = createContext<AnimationContextType>({
  hasSelection: false,
  selectedText: "",
  selectionRect: null,
  animationSettings: defaultAnimationSettings,
  setAnimationSettings: () => {},
  applyAnimationToSelection: () => {},
  handleTypeChange: () => {},
  handleAnimationChange: () => {},
  handleDelayChange: () => {},
  handleDurationChange: () => {},
  selectionMap: new Map(),
});

// Create a unique key for a selection
function createSelectionKey(selection: RangeSelection): string {
  const anchorKey = selection.anchor.key;
  const focusKey = selection.focus.key;
  const anchorOffset = selection.anchor.offset;
  const focusOffset = selection.focus.offset;

  return `${anchorKey}:${anchorOffset}-${focusKey}:${focusOffset}`;
}

// Provider component
export const AnimationProvider = ({ children }: { children: ReactNode }) => {
  const [editor] = useLexicalComposerContext();
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(
    defaultAnimationSettings
  );
  const [selectionMap, setSelectionMap] = useState<Map<string, SelectionData>>(
    new Map()
  );
  const selectionKeyRef = useRef<string | null>(null);

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

  // Get DOMRect for the current selection
  const getSelectionRect = useCallback((): DOMRect | null => {
    const domSelection = window.getSelection();
    if (!domSelection || domSelection.rangeCount === 0) return null;

    const range = domSelection.getRangeAt(0);
    return range.getBoundingClientRect();
  }, []);

  // Update selection state when the selection changes
  const updateSelectionState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent();
        const newHasSelection = text.length > 0;

        setHasSelection(newHasSelection);
        setSelectedText(text);

        if (newHasSelection) {
          // Get bounding rectangle of the selection
          const rect = getSelectionRect();
          setSelectionRect(rect);

          // Create a unique key for this selection
          const selectionKey = createSelectionKey(selection);
          selectionKeyRef.current = selectionKey;

          // Get animation settings from the selectionMap or from the current selection
          if (selectionMap.has(selectionKey)) {
            // If we have previously stored settings for this selection, use them
            setAnimationSettings(
              selectionMap.get(selectionKey)!.animationSettings
            );
          } else {
            // Otherwise, check if the selection contains animated nodes
            const selectionSettings = getSelectionAnimationSettings();

            if (selectionSettings) {
              setAnimationSettings(selectionSettings);
              // Store these settings in the map
              setSelectionMap((prevMap) => {
                const newMap = new Map(prevMap);
                newMap.set(selectionKey, {
                  key: selectionKey,
                  animationSettings: selectionSettings,
                });
                return newMap;
              });
            } else {
              // If no existing animation, use default
              setAnimationSettings(defaultAnimationSettings);
            }
          }
        } else {
          setSelectionRect(null);
          selectionKeyRef.current = null;
        }
      } else {
        setHasSelection(false);
        setSelectedText("");
        setSelectionRect(null);
        selectionKeyRef.current = null;
      }
    });
  }, [editor, getSelectionAnimationSettings, getSelectionRect, selectionMap]);

  // Register selection change listener
  useEffect(() => {
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

      // After applying animation, update our selectionMap
      if (selectionKeyRef.current) {
        setSelectionMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(selectionKeyRef.current!, {
            key: selectionKeyRef.current!,
            animationSettings: { ...animationSettings },
          });
          return newMap;
        });
      }
    }
  }, [editor, hasSelection, animationSettings]);

  // Update animation settings and store in selectionMap
  const updateAnimationSettings = useCallback(
    (newSettings: AnimationSettings) => {
      setAnimationSettings(newSettings);

      // Update selectionMap if we have an active selection
      if (selectionKeyRef.current) {
        setSelectionMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set(selectionKeyRef.current!, {
            key: selectionKeyRef.current!,
            animationSettings: newSettings,
          });
          return newMap;
        });
      }
    },
    []
  );

  // Handle animation type change
  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newType = e.target.value;
      const newSettings = {
        ...animationSettings,
        type: newType,
        animation:
          animationOptions[newType as keyof typeof animationOptions][0],
      };

      updateAnimationSettings(newSettings);
    },
    [animationSettings, updateAnimationSettings]
  );

  // Handle animation name change
  const handleAnimationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newAnimation = e.target.value;
      const newSettings = {
        ...animationSettings,
        animation: newAnimation,
      };

      updateAnimationSettings(newSettings);
    },
    [animationSettings, updateAnimationSettings]
  );

  // Handle animation delay change
  const handleDelayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDelay = parseFloat(e.target.value);
      const newSettings = {
        ...animationSettings,
        delay: isNaN(newDelay) ? 0 : newDelay,
      };

      updateAnimationSettings(newSettings);
    },
    [animationSettings, updateAnimationSettings]
  );

  // Handle animation duration change
  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = parseFloat(e.target.value);
      const newSettings = {
        ...animationSettings,
        duration: isNaN(newDuration) ? 1 : newDuration,
      };

      updateAnimationSettings(newSettings);
    },
    [animationSettings, updateAnimationSettings]
  );

  // Context value
  const contextValue: AnimationContextType = {
    hasSelection,
    selectedText,
    selectionRect,
    animationSettings,
    setAnimationSettings: updateAnimationSettings,
    applyAnimationToSelection,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
    selectionMap,
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
