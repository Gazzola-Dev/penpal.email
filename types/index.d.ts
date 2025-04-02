import { EditorState } from "lexical";

// Animation related types
export interface AnimationSettings {
  type: string;
  animation: string;
  delay: number;
  duration: number;
}

// Editor hook state returned from useEditor
export interface EditorHookState {
  hasSelection: boolean;
  selectedText: string;
  currentAnimation: AnimationSettings;
  handleTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleAnimationChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleDelayChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Editor state and management
export interface EditorHookState {
  editorState: EditorState | null;
  setEditorState: (state: EditorState) => void;
  hasSelection: boolean;
  setHasSelection: (hasSelection: boolean) => void;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  applyAnimationToSelection: () => void;
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
