"use client";

import usePreview from "@/hooks/preview.hooks";
import { ContentNode } from "@/types";
import { useEffect } from "react";

export default function Preview() {
  const { content, parseEditorState } = usePreview();

  useEffect(() => {
    parseEditorState();
  }, [parseEditorState]);

  if (!content || content.length === 0) {
    return (
      <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center">
        <p className="text-gray-400">No content to preview</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md p-4 min-h-[300px]">
      <div className="preview-content">
        {content.map((item: ContentNode, index: number) => {
          // Handle different types of nodes
          if (item.type === "text") {
            // Apply animations if present
            const animationClass = item.animations
              ? `${item.animations.type}-${item.animations.animation}`
              : "";

            const animationStyle = item.animations
              ? {
                  animationDelay: `${item.animations.delay}ms`,
                  animationDuration: `${item.animations.duration}ms`,
                }
              : {};

            return (
              <span
                key={index}
                className={`${animationClass} ${item.format}`}
                style={animationStyle}
              >
                {item.text}
              </span>
            );
          }

          // Handle paragraph breaks
          if (item.type === "paragraph") {
            return <p key={index}></p>;
          }

          return null;
        })}
      </div>
    </div>
  );
}
