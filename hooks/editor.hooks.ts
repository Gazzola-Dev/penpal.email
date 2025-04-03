import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  EditorConfig,
  EditorState,
  NodeKey,
  SELECTION_CHANGE_COMMAND,
  SerializedTextNode,
  TextNode,
} from "lexical";
import { useCallback, useEffect, useState } from "react";

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

// Define a custom command to apply animation settings
export const APPLY_ANIMATION_COMMAND = createCommand<AnimationSettings>(
  "APPLY_ANIMATION_COMMAND"
);

// Define the serialized version of the animated text node
export interface SerializedAnimatedTextNode extends SerializedTextNode {
  type: "animated-text";
  animation: AnimationSettings | null;
}

// Extend the TextNode class to include animation data
export class AnimatedTextNode extends TextNode {
  __animation: AnimationSettings | null;

  constructor(
    text: string,
    animation: AnimationSettings | null = null,
    key?: NodeKey
  ) {
    super(text, key);
    this.__animation = animation;
  }

  getAnimation(): AnimationSettings | null {
    return this.__animation;
  }

  setAnimation(animation: AnimationSettings | null): void {
    const self = this.getWritable();
    self.__animation = animation;
  }

  hasAnimation(): boolean {
    return this.__animation !== null;
  }

  static getType(): string {
    return "animated-text";
  }

  static clone(node: AnimatedTextNode): AnimatedTextNode {
    return new AnimatedTextNode(node.__text, node.__animation, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = TextNode.prototype.createDOM.call(this, config);
    if (this.__animation) {
      dom.style.backgroundColor = "rgba(0, 120, 255, 0.1)";
      dom.setAttribute("data-animation-type", this.__animation.type);
      dom.setAttribute("data-animation-name", this.__animation.animation);
      dom.setAttribute("data-animation-delay", String(this.__animation.delay));
      dom.setAttribute(
        "data-animation-duration",
        String(this.__animation.duration)
      );
      dom.setAttribute(
        "title",
        `${this.__animation.type}: ${this.__animation.animation} (delay: ${this.__animation.delay}s, duration: ${this.__animation.duration}s)`
      );
    }
    return dom;
  }

  updateDOM(
    prevNode: AnimatedTextNode,
    dom: HTMLElement,
    config: EditorConfig
  ): boolean {
    const hasUpdate = TextNode.prototype.updateDOM.call(
      this,
      prevNode,
      dom,
      config
    );
    const hasAnimationChanged =
      (this.__animation !== null && prevNode.__animation === null) ||
      (this.__animation === null && prevNode.__animation !== null) ||
      (this.__animation !== null &&
        prevNode.__animation !== null &&
        (this.__animation.type !== prevNode.__animation.type ||
          this.__animation.animation !== prevNode.__animation.animation ||
          this.__animation.delay !== prevNode.__animation.delay ||
          this.__animation.duration !== prevNode.__animation.duration));

    if (hasAnimationChanged) {
      if (this.__animation) {
        dom.style.backgroundColor = "rgba(0, 120, 255, 0.1)";
        dom.setAttribute("data-animation-type", this.__animation.type);
        dom.setAttribute("data-animation-name", this.__animation.animation);
        dom.setAttribute(
          "data-animation-delay",
          String(this.__animation.delay)
        );
        dom.setAttribute(
          "data-animation-duration",
          String(this.__animation.duration)
        );
        dom.setAttribute(
          "title",
          `${this.__animation.type}: ${this.__animation.animation} (delay: ${this.__animation.delay}s, duration: ${this.__animation.duration}s)`
        );
      } else {
        dom.style.backgroundColor = "";
        dom.removeAttribute("data-animation-type");
        dom.removeAttribute("data-animation-name");
        dom.removeAttribute("data-animation-delay");
        dom.removeAttribute("data-animation-duration");
        dom.removeAttribute("title");
      }
      return true;
    }

    return hasUpdate;
  }

  exportJSON(): SerializedAnimatedTextNode {
    const baseJSON = TextNode.prototype.exportJSON.call(this);
    return {
      ...baseJSON,
      type: "animated-text",
      animation: this.__animation,
    };
  }

  static importJSON(
    serializedNode: SerializedAnimatedTextNode
  ): AnimatedTextNode {
    const node = new AnimatedTextNode(
      serializedNode.text,
      serializedNode.animation
    );
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }
}

// Editor types
export interface EditorHookState {
  editorState: EditorState | null;
  setEditorState: (state: EditorState) => void;
  hasSelection: boolean;
  setHasSelection: (hasSelection: boolean) => void;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  applyAnimationToSelection: () => void;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAnimationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDelayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Copy formats from one node to another
function copyFormatsToNode(source: TextNode, target: TextNode): void {
  const formats = [
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "code",
    "subscript",
    "superscript",
  ] as const;

  formats.forEach((format) => {
    if (source.hasFormat(format)) {
      target.toggleFormat(format);
    }
  });
}

// Hook to manage editor state and animation data
export function useEditorWithAnimations() {
  const [editor] = useLexicalComposerContext();
  const [hasSelection, setHasSelection] = useState(false);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(
    {
      type: "entrance",
      animation: "fadeIn",
      delay: 0,
      duration: 1,
    }
  );

  const updateSelectionState = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const text = selection.getTextContent();
        setHasSelection(text.length > 0);
      } else {
        setHasSelection(false);
      }
    });
  }, [editor]);

  // Register selection change listener to update UI state
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

  // Register the APPLY_ANIMATION_COMMAND handler
  useEffect(() => {
    return editor.registerCommand(
      APPLY_ANIMATION_COMMAND,
      (payload: AnimationSettings) => {
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return false;
          }

          // Get the text nodes in the selection
          const nodes = selection.getNodes();

          // Apply animation to each text node
          nodes.forEach((node) => {
            if ($isTextNode(node)) {
              // Create a new AnimatedTextNode with the animation settings
              const animatedNode = new AnimatedTextNode(
                node.getTextContent(),
                payload,
                undefined // Let Lexical generate a new key
              );

              // Copy formatting from the original node
              copyFormatsToNode(node, animatedNode);

              // Copy style if present
              const nodeStyle = node.getStyle();
              if (nodeStyle) {
                animatedNode.setStyle(nodeStyle);
              }

              // Replace the original node with the animated node
              node.replace(animatedNode);
            }
          });
        });
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  // Apply animation to currently selected text
  const applyAnimationToSelection = useCallback(() => {
    if (hasSelection) {
      editor.dispatchCommand(APPLY_ANIMATION_COMMAND, animationSettings);
    }
  }, [editor, hasSelection, animationSettings]);

  // Handle animation settings changes
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

  const handleAnimationChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setAnimationSettings((prev) => ({
        ...prev,
        animation: e.target.value,
      }));
    },
    []
  );

  const handleDelayChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDelay = parseFloat(e.target.value);
      setAnimationSettings((prev) => ({
        ...prev,
        delay: isNaN(newDelay) ? 0 : newDelay,
      }));

      // Automatically apply animation to selection when changing delay
      editor.dispatchCommand(APPLY_ANIMATION_COMMAND, {
        ...animationSettings,
        delay: isNaN(newDelay) ? 0 : newDelay,
      });
    },
    [editor, animationSettings]
  );

  const handleDurationChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = parseFloat(e.target.value);
      setAnimationSettings((prev) => ({
        ...prev,
        duration: isNaN(newDuration) ? 1 : newDuration,
      }));

      // Automatically apply animation to selection when changing duration
      editor.dispatchCommand(APPLY_ANIMATION_COMMAND, {
        ...animationSettings,
        duration: isNaN(newDuration) ? 1 : newDuration,
      });
    },
    [editor, animationSettings]
  );

  return {
    hasSelection,
    animationSettings,
    setAnimationSettings,
    applyAnimationToSelection,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
  };
}

// Export animation plugin
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
      // Add mutation listener to handle animated text nodes
      editor.registerMutationListener(AnimatedTextNode, (mutations) => {
        // When animated text nodes are added or updated, we can add hover effects
        for (const [, type] of mutations) {
          if (type === "created" || type === "updated") {
            // The node would already have tooltip attributes from the AnimatedTextNode class
            // This is where we could add additional DOM event handlers if needed
          }
        }
      }),

      // Custom command for applying animations
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
