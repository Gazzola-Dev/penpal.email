"use client";

import { ContentNode, PreviewHookState } from "@/types";
import { useCallback, useEffect, useState } from "react";

export default function usePreview(): PreviewHookState {
  const [content, setContent] = useState<ContentNode[]>([]);

  // Parse stored editor state from localStorage
  const parseEditorState = useCallback(() => {
    const savedState = localStorage.getItem("editorState");

    if (!savedState) {
      setContent([]);
      return;
    }

    try {
      // Create a simplified representation for the preview
      const parsedState = JSON.parse(savedState);
      const root = parsedState.root;

      if (!root || !root.children) {
        setContent([]);
        return;
      }

      const processedContent: ContentNode[] = [];

      //   // Process each node in the editor state
      //   root.children.forEach((node) => {
      //     if (node.type === "paragraph") {
      //       // Handle paragraphs and their children
      //       node.children.forEach((child: any) => {
      //         if (child.type === "text") {
      //           const format: string[] = [];

      //           // Parse format flags
      //           if (child.format & 1) format.push("font-bold");
      //           if (child.format & 2) format.push("italic");
      //           if (child.format & 4) format.push("underline");

      //           // Add text node with its format and animations
      //           processedContent.push({
      //             type: "text",
      //             text: child.text,
      //             format: format.join(" "),
      //             animations: child.__animations,
      //           });
      //         }
      //       });

      //       // Add paragraph break
      //       processedContent.push({ type: "paragraph" });
      //     }
      //   });

      setContent(processedContent);
    } catch (error) {
      console.error("Failed to parse editor state:", error);
      setContent([]);
    }
  }, []);

  // Listen for storage changes to update preview in real-time
  useEffect(() => {
    const handleStorageChange = () => {
      parseEditorState();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [parseEditorState]);

  return { content, parseEditorState };
}
