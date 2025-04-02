"use client";

import { AnimationSettings, EditorHookState } from "@/types";
import { EditorState } from "lexical";
import { debounce } from "lodash";
import { useCallback, useEffect, useState } from "react";

export default function useEditor(): EditorHookState {
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [hasSelection, setHasSelection] = useState<boolean>(false);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(
    {
      type: "fade",
      animation: "fadeIn",
      delay: 0,
      duration: 1000,
    }
  );

  // Load editor state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("editorState");
    if (savedState) {
      try {
        setEditorState(savedState as unknown as EditorState);
      } catch (error) {
        console.error("Failed to load editor state:", error);
      }
    }
  }, []);

  // Save editor state to localStorage with debounce
  const debouncedSave = debounce((state: EditorState) => {
    if (state) {
      localStorage.setItem("editorState", state as unknown as string);
    }
  }, 500);

  // Call debouncedSave whenever editorState changes
  useEffect(() => {
    if (editorState) {
      debouncedSave(editorState);
    }
  }, [editorState, debouncedSave]);

  // Function to apply animation settings to selected text
  const applyAnimationToSelection = useCallback(() => {
    if (!hasSelection) return;

    // We don't directly modify the Lexical state here
    // Instead we set animationSettings which triggers the AnimationPlugin
    setAnimationSettings({
      ...animationSettings,
      timestamp: Date.now(), // Add timestamp to ensure state change is detected
    });
  }, [hasSelection, animationSettings]);

  return {
    editorState,
    setEditorState,
    hasSelection,
    setHasSelection,
    animationSettings,
    setAnimationSettings,
    applyAnimationToSelection,
  };
}
