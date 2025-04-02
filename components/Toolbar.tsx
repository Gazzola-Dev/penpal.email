"use client";

import { cn } from "@/lib/utils";
import { useMediaContext } from "@/providers/MediaProvider";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Clock,
  Italic,
  Redo,
  Underline,
  Undo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
// Import the custom commands
import {
  CHANGE_FONT_FAMILY_COMMAND,
  CHANGE_FONT_SIZE_COMMAND,
} from "@/lib/editorCommands";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";

// Animation options
export const animationTypes = ["entrance", "emphasis", "exit"];
export const animationOptions = {
  entrance: ["fadeIn", "slideIn", "zoomIn", "bounceIn", "flipIn"],
  emphasis: ["pulse", "shake", "wiggle", "flash", "bounce"],
  exit: ["fadeOut", "slideOut", "zoomOut", "bounceOut", "flipOut"],
};

function Divider() {
  return <div className="h-6 w-px bg-gray-300 mx-2" />;
}

interface AnimationSettings {
  type: string;
  animation: string;
  delay: number;
  duration: number;
}

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationSettings>({
    type: "entrance",
    animation: "fadeIn",
    delay: 0,
    duration: 1,
  });

  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("16");

  // Get media playback time from context
  const { currentTime, duration, isPlaying } = useMediaContext();

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return "00:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Update toolbar based on text selection format
  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));

      // Get font family and size from selection
      const fontFamily = $getSelectionStyleValueForProperty(
        selection,
        "font-family",
        "Arial"
      );

      // Get font size and extract just the number
      const fontSizeWithUnit = $getSelectionStyleValueForProperty(
        selection,
        "font-size",
        "16px"
      );

      // Extract the numeric part from the font size (removing 'px' or other units)
      const fontSizeNumber = fontSizeWithUnit.replace(/[^0-9.]/g, "");

      setFontFamily(fontFamily);
      setFontSize(fontSizeNumber);
    }
  }, []);

  // Register listeners for editor updates
  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1 // LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  // Handlers for animation settings
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      type: e.target.value,
      animation:
        animationOptions[e.target.value as keyof typeof animationOptions][0],
    });
  };

  const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      animation: e.target.value,
    });
  };

  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      delay: parseFloat(e.target.value),
    });
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentAnimation({
      ...currentAnimation,
      duration: parseFloat(e.target.value),
    });
  };

  // New handlers for font family and size
  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFontFamily = e.target.value;
    setFontFamily(newFontFamily);
    editor.dispatchCommand(CHANGE_FONT_FAMILY_COMMAND, newFontFamily);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFontSize = e.target.value;
    setFontSize(newFontSize);
    editor.dispatchCommand(CHANGE_FONT_SIZE_COMMAND, parseInt(newFontSize, 10));
  };

  return (
    <div
      className={`p-2 border-b flex items-center transition-colors duration-300`}
      ref={toolbarRef}
    >
      {/* Undo/Redo buttons */}
      <div className="flex items-center mr-4">
        <button
          className={`p-1 hover:bg-gray-100 rounded-sm ${
            !canUndo ? "opacity-50" : ""
          }`}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          disabled={!canUndo}
          aria-label="Undo"
        >
          <Undo size={18} />
        </button>
        <button
          className={`p-1 hover:bg-gray-100 rounded-sm ${
            !canRedo ? "opacity-50" : ""
          }`}
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          disabled={!canRedo}
          aria-label="Redo"
        >
          <Redo size={18} />
        </button>
      </div>

      <Divider />

      {/* Text formatting options */}
      <div className="flex items-center mr-4">
        <button
          className={`p-1 hover:bg-gray-100 rounded-sm ${
            isBold ? "bg-gray-200" : ""
          }`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
          }}
          aria-label="Format Bold"
        >
          <Bold size={18} />
        </button>
        <button
          className={`p-1 hover:bg-gray-100 rounded-sm ${
            isItalic ? "bg-gray-200" : ""
          }`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
          }}
          aria-label="Format Italic"
        >
          <Italic size={18} />
        </button>
        <button
          className={`p-1 hover:bg-gray-100 rounded-sm ${
            isUnderline ? "bg-gray-200" : ""
          }`}
          onClick={() => {
            editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
          }}
          aria-label="Format Underline"
        >
          <Underline size={18} />
        </button>
      </div>

      <Divider />

      {/* Alignment options */}
      <div className="flex items-center mr-4">
        <button
          className="p-1 hover:bg-gray-100 rounded-sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
          aria-label="Align Left"
        >
          <AlignLeft size={18} />
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded-sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
          aria-label="Align Center"
        >
          <AlignCenter size={18} />
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded-sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
          aria-label="Align Right"
        >
          <AlignRight size={18} />
        </button>
        <button
          className="p-1 hover:bg-gray-100 rounded-sm"
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
          }}
          aria-label="Justify"
        >
          <AlignJustify size={18} />
        </button>
      </div>

      <Divider />

      <Divider />

      {/* Font options */}
      <select
        className="p-1 border rounded text-sm mr-2"
        value={fontFamily}
        onChange={handleFontFamilyChange}
        aria-label="Font Family"
      >
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </select>

      <select
        className="p-1 border rounded text-sm"
        value={fontSize}
        onChange={handleFontSizeChange}
        aria-label="Font Size"
      >
        <option value="10">10</option>
        <option value="12">12</option>
        <option value="14">14</option>
        <option value="16">16</option>
        <option value="18">18</option>
        <option value="24">24</option>
        <option value="36">36</option>
      </select>

      <Divider />

      {/* Animation section */}
      <div
        className={`flex items-center space-x-2 transition-transform duration-300 w-full`}
      >
        <div className="flex items-center">
          <label
            htmlFor="animation-type"
            className="text-sm mr-1"
          >
            Type:
          </label>
          <select
            id="animation-type"
            value={currentAnimation.type}
            onChange={handleTypeChange}
            className="p-1 border rounded text-sm"
          >
            {animationTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label
            htmlFor="animation-name"
            className="text-sm mr-1"
          >
            Animation:
          </label>
          <select
            id="animation-name"
            value={currentAnimation.animation}
            onChange={handleAnimationChange}
            className="p-1 border rounded text-sm"
          >
            {animationOptions[
              currentAnimation.type as keyof typeof animationOptions
            ].map((animation) => (
              <option
                key={animation}
                value={animation}
              >
                {animation}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center">
          <label
            htmlFor="animation-delay"
            className="text-sm mr-1"
          >
            Delay:
          </label>
          <input
            id="animation-delay"
            type="number"
            min={0}
            step={0.1}
            value={isNaN(currentAnimation.delay) ? 0 : currentAnimation.delay}
            onChange={handleDelayChange}
            className="p-1 border rounded text-sm w-16"
          />
        </div>

        <div className="flex items-center">
          <label
            htmlFor="animation-duration"
            className="text-sm mr-1"
          >
            Duration:
          </label>
          <input
            id="animation-duration"
            type="number"
            min={0.1}
            step={0.1}
            value={
              isNaN(currentAnimation.duration) ? 0 : currentAnimation.duration
            }
            onChange={handleDurationChange}
            className="p-1 border rounded text-sm w-16"
          />
        </div>
        <>
          <Divider />

          <div className="flex items-center mr-4 text-sm w-full justify-end">
            <Clock
              size={16}
              className={cn("mr-1", isPlaying && "text-blue-500")}
            />
            <span className={cn("text-gray-700", isPlaying && "")}>
              <span
                className={cn("text-gray-700", isPlaying && "text-blue-500")}
              >
                {formatTime(currentTime)}{" "}
              </span>{" "}
              / {formatTime(duration)}
            </span>
          </div>
        </>
      </div>
    </div>
  );
}
