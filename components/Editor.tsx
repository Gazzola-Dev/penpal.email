"use client";
import { AnimatedTextNode } from "@/components/AnimatedTextNode";
import ToolbarPlugin from "@/components/ToolbarPlugin";
import FontFormattingPlugin from "@/lib/editorCommands";
import AnimationProvider from "@/providers/AnimationProvider";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ParagraphNode, TextNode } from "lexical";
import React from "react";
import AnimationPlugin from "./AnimationPlugin";
import ExampleTheme from "./ui/ExampleTheme";

const placeholder = "Enter some rich text...";

// Define the editorConfig with explicit node registration
const editorConfig = {
  namespace: "Rich Text Editor",
  // Register our custom AnimatedTextNode here explicitly along with standard nodes
  nodes: [ParagraphNode, TextNode, AnimatedTextNode],
  onError(error: Error) {
    console.error(error);
  },
  theme: ExampleTheme,
};

const Editor: React.FC = () => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <AnimationProvider>
        <div className="flex flex-col h-full border rounded-md overflow-hidden">
          <ToolbarPlugin />
          <div className="flex-1 overflow-auto relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="px-2 h-[calc(100%-0.2rem)] overflow-auto focus:outline-none"
                  aria-placeholder={placeholder}
                  placeholder={
                    <div className="absolute top-2 left-2 -z-10">
                      {placeholder}
                    </div>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <FontFormattingPlugin />
            <HistoryPlugin />
            <AutoFocusPlugin />
            <AnimationPlugin />
          </div>
        </div>
      </AnimationProvider>
    </LexicalComposer>
  );
};

export default Editor;
