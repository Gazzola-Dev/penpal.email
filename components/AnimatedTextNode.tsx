// AnimatedTextNode.ts
import { AnimationSettings, SerializedAnimatedTextNode } from "@/types";
import {
  $applyNodeReplacement,
  EditorConfig,
  NodeKey,
  SerializedTextNode,
  TextNode,
} from "lexical";

// Create an AnimatedTextNode class by extending TextNode
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
    const dom = super.createDOM(config);
    if (this.__animation) {
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

  // Fixed updateDOM method to match the parent class signature
  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const hasUpdate = super.updateDOM(prevNode, dom, config);

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
    const baseJSON = super.exportJSON() as SerializedTextNode;
    return {
      ...baseJSON,
      type: "animated-text",
      animation: this.__animation,
    };
  }

  static importJSON(
    serializedNode: SerializedAnimatedTextNode
  ): AnimatedTextNode {
    const node = $createAnimatedTextNode(
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

// Helper function to create AnimatedTextNode
export function $createAnimatedTextNode(
  text: string,
  animation: AnimationSettings | null = null
): AnimatedTextNode {
  return $applyNodeReplacement(new AnimatedTextNode(text, animation));
}

// Helper function to check if node is AnimatedTextNode
export function $isAnimatedTextNode(
  node: TextNode | null | undefined
): node is AnimatedTextNode {
  return node instanceof AnimatedTextNode;
}
