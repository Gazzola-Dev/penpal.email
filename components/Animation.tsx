import {
  AnimatedTextNode,
  APPLY_ANIMATION_COMMAND,
} from "@/hooks/editor.hooks";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR } from "lexical";
import { useEffect } from "react";

export const AnimationPlugin = () => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Make sure AnimatedTextNode is registered
    if (!editor.hasNodes([AnimatedTextNode])) {
      throw new Error(
        "AnimationPlugin: AnimatedTextNode not registered on editor"
      );
    }

    return mergeRegister(
      // Add custom element transformers or other functionality here
      // This is where you would add DOM event listeners for animation-related features
      // Add a way to detect animated text nodes via hover
      editor.registerMutationListener(AnimatedTextNode, (mutations) => {
        // When animated text nodes are added or updated, we can add hover effects
        for (const [, type] of mutations) {
          if (type === "created" || type === "updated") {
            // The node would already have tooltip attributes from the AnimatedTextNode class
            // This is where we could add additional DOM event handlers if needed
          }
        }
      }),

      // Custom command for exporting animation data
      editor.registerCommand(
        APPLY_ANIMATION_COMMAND,
        () => {
          // This is handled in the useEditorWithAnimations hook
          // We return false to allow the hook's handler to run
          return false;
        },
        COMMAND_PRIORITY_EDITOR
      )
    );
  }, [editor]);

  return null;
};

export default AnimationPlugin;
