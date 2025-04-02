import { EditorState } from "lexical";

export interface AnimationSettings {
  type: string;
  animation: string;
  delay: number;
  duration: number;
  timestamp?: number;
}

export interface EditorHookState {
  editorState: EditorState | null;
  setEditorState: (state: EditorState) => void;
  hasSelection: boolean;
  setHasSelection: (hasSelection: boolean) => void;
  animationSettings: AnimationSettings;
  setAnimationSettings: (settings: AnimationSettings) => void;
  applyAnimationToSelection: () => void;
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
