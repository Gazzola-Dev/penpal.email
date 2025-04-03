import { EditorState, SerializedTextNode, createCommand } from "lexical";

// Animation types and options
export type AnimationType = "entrance" | "emphasis" | "exit";
export const animationTypes = ["entrance", "emphasis", "exit"];
export const animationOptions = {
  entrance: ["fadeIn", "slideIn", "zoomIn", "bounceIn", "flipIn"],
  emphasis: ["pulse", "shake", "wiggle", "flash", "bounce"],
  exit: ["fadeOut", "slideOut", "zoomOut", "bounceOut", "flipOut"],
};

export type AnimationOption = string;

// Animation settings interface
export interface AnimationSettings {
  type: string;
  animation: string;
  delay: number;
  duration: number;
}

// Animation type options mapping
export interface AnimationTypeOption {
  value: AnimationType;
  label: string;
}

export interface AnimationSelectOption {
  value: AnimationOption;
  label: string;
}

export type AnimationOptionsMap = {
  [key in AnimationType]: AnimationSelectOption[];
};

// Editor hook state returned from useEditor
export interface EditorHookState {
  editorState: EditorState | null;
  setEditorState: (state: EditorState) => void;
  hasSelection: boolean;
  setHasSelection: (hasSelection: boolean) => void;
  selectedText: string;
  currentAnimation: AnimationSettings;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  applyAnimationToSelection: () => void;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAnimationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDelayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Toolbar props
export interface ToolbarProps {
  disabled?: boolean;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  applyAnimation: () => void;
}

// Preview content types
export interface ContentNode {
  type: "text" | "paragraph";
  text?: string;
  format?: string;
  animations?: AnimationSettings;
}

export interface PreviewHookState {
  content: ContentNode[];
  parseEditorState: () => void;
}

// Define a custom command to apply animation
export const APPLY_ANIMATION_COMMAND = createCommand<AnimationSettings>(
  "APPLY_ANIMATION_COMMAND"
);

// Define the serialized version of animated text node
export interface SerializedAnimatedTextNode extends SerializedTextNode {
  type: "animated-text";
  animation: AnimationSettings | null;
}
