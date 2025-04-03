import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  TextNode,
} from "lexical";
import React, { useEffect } from "react";

import { AnimatedTextNode } from "@/components/AnimatedTextNode";
import AnimationPopover from "@/components/AnimationPopover";
import {
  APPLY_ANIMATION_COMMAND,
  copyFormatsToNode,
} from "@/hooks/editor.hooks";
import { AnimationSettings } from "@/types";

const AnimationPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Make sure AnimatedTextNode is registered
    if (!editor.hasNodes([AnimatedTextNode])) {
      throw new Error(
        "AnimationPlugin: AnimatedTextNode not registered on editor"
      );
    }

    return mergeRegister(
      // Register mutation listener for animated text nodes
      editor.registerMutationListener(AnimatedTextNode, (mutations) => {
        for (const [nodeKey, type] of mutations.entries()) {
          if (type === "created" || type === "updated") {
            // Log created or updated nodes for debugging
            editor.getEditorState().read(() => {
              const node = editor.getElementByKey(nodeKey);
              if (node instanceof AnimatedTextNode) {
                console.log("[AnimationPlugin] Node mutation:", {
                  key: nodeKey,
                  type,
                  text: node.getTextContent(),
                  animation: node.getAnimation(),
                });
              }
            });
          }
        }
      }),

      // Register command handler for applying animations
      editor.registerCommand(
        APPLY_ANIMATION_COMMAND,
        (payload: AnimationSettings) => {
          console.log("[AnimationPlugin] Applying animation:", payload);

          editor.update(() => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
              console.log("[AnimationPlugin] Not a range selection, aborting");
              return false;
            }

            // Handle the selection properly
            const anchorNode = selection.anchor.getNode();
            const focusNode = selection.focus.getNode();
            const anchorOffset = selection.anchor.offset;
            const focusOffset = selection.focus.offset;

            // If selection is within a single text node
            if (anchorNode === focusNode && anchorNode.getType() === "text") {
              const textNode = anchorNode as TextNode;
              const textContent = textNode.getTextContent();

              // Skip if selection is empty
              if (anchorOffset === focusOffset) {
                return false;
              }

              // Determine the order of offsets
              const startOffset = Math.min(anchorOffset, focusOffset);
              const endOffset = Math.max(anchorOffset, focusOffset);

              // Split the text into three parts: before, selected, after
              const textBefore = textContent.substring(0, startOffset);
              const selectedText = textContent.substring(
                startOffset,
                endOffset
              );
              const textAfter = textContent.substring(endOffset);

              // Create nodes for before, selected (animated), and after
              if (textBefore) {
                const beforeNode = $createTextNode(textBefore);
                copyFormatsToNode(textNode, beforeNode);
                textNode.insertBefore(beforeNode);
              }

              // Create animated node for the selected text
              const animatedNode = new AnimatedTextNode(selectedText, payload);

              // Copy styling
              copyFormatsToNode(textNode, animatedNode);
              const nodeStyle = textNode.getStyle();
              if (nodeStyle) {
                animatedNode.setStyle(nodeStyle);
              }

              if (textBefore) {
                textNode.insertAfter(animatedNode);
              } else {
                textNode.insertBefore(animatedNode);
              }

              // Create node for text after selection
              if (textAfter) {
                const afterNode = $createTextNode(textAfter);
                copyFormatsToNode(textNode, afterNode);
                animatedNode.insertAfter(afterNode);
              }

              // Remove the original node
              textNode.remove();

              // Set selection to the animated node
              animatedNode.select();
            }
            // If selection spans multiple nodes
            else {
              // Extract all TextNodes within the selection
              const nodes = selection.getNodes();

              // Process each node that contains selected text
              for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];

                // Only process TextNodes, not other node types
                if (node.getType() !== "text") {
                  continue;
                }

                const textNode = node as TextNode;
                const textContent = textNode.getTextContent();

                // Determine if this node is the first, last, or middle in the selection
                const isFirstNode = i === 0;
                const isLastNode = i === nodes.length - 1;

                // For first node, we may need to split at the selection start
                if (isFirstNode && anchorNode === textNode) {
                  const startOffset = selection.anchor.offset;

                  // Text before the selection start
                  const textBefore = textContent.substring(0, startOffset);
                  const selectedText = textContent.substring(startOffset);

                  if (textBefore) {
                    const beforeNode = $createTextNode(textBefore);
                    copyFormatsToNode(textNode, beforeNode);
                    textNode.insertBefore(beforeNode);
                  }

                  // Create animated node for the selected portion
                  const animatedNode = new AnimatedTextNode(
                    selectedText,
                    payload
                  );
                  copyFormatsToNode(textNode, animatedNode);
                  const nodeStyle = textNode.getStyle();
                  if (nodeStyle) {
                    animatedNode.setStyle(nodeStyle);
                  }

                  textNode.insertAfter(animatedNode);
                  textNode.remove();
                }
                // For last node, we may need to split at the selection end
                else if (isLastNode && focusNode === textNode) {
                  const endOffset = selection.focus.offset;

                  // Text inside and after selection
                  const selectedText = textContent.substring(0, endOffset);
                  const textAfter = textContent.substring(endOffset);

                  // Create animated node for selected text
                  const animatedNode = new AnimatedTextNode(
                    selectedText,
                    payload
                  );
                  copyFormatsToNode(textNode, animatedNode);
                  const nodeStyle = textNode.getStyle();
                  if (nodeStyle) {
                    animatedNode.setStyle(nodeStyle);
                  }

                  textNode.insertBefore(animatedNode);

                  if (textAfter) {
                    const afterNode = $createTextNode(textAfter);
                    copyFormatsToNode(textNode, afterNode);
                    animatedNode.insertAfter(afterNode);
                  }

                  textNode.remove();
                }
                // For middle nodes, replace entire node with animated version
                else {
                  const animatedNode = new AnimatedTextNode(
                    textContent,
                    payload
                  );
                  copyFormatsToNode(textNode, animatedNode);
                  const nodeStyle = textNode.getStyle();
                  if (nodeStyle) {
                    animatedNode.setStyle(nodeStyle);
                  }

                  textNode.replace(animatedNode);
                }
              }
            }
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return <AnimationPopover />;
};

export default AnimationPlugin;
