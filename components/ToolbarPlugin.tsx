import {
  CHANGE_FONT_FAMILY_COMMAND,
  CHANGE_FONT_SIZE_COMMAND,
} from "@/lib/editorCommands";
import {
  animationOptions,
  animationTypes,
  useAnimation,
} from "@/providers/AnimationProvider";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelectionStyleValueForProperty } from "@lexical/selection";
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
  Italic,
  Redo,
  Underline,
  Undo,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

function Divider() {
  return <div className="h-6 w-px bg-gray-300 mx-2" />;
}

const Toolbar: React.FC = () => {
  const [editor] = useLexicalComposerContext();
  const {
    hasSelection,
    selectedText,
    animationSettings,
    applyAnimationToSelection,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
  } = useAnimation();

  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState("16");

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

  // Font handling
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
    <div className="p-2 border-b flex flex-wrap gap-0 items-center bg-gray-50">
      {/* Undo/Redo buttons */}
      <div className="flex items-center mr-2">
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
      <div className="flex items-center mr-1">
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
      <div className="flex items-center mr-2">
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

      {/* Font options - Added from the pasted file */}
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

      {/* Animation controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="font-medium">Animation:</span>
        {/* Animation type select */}
        <select
          className="px-2 py-1 border rounded"
          value={animationSettings.type}
          onChange={handleTypeChange}
          disabled={!hasSelection}
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
        {/* Animation name select */}
        <select
          className="px-2 py-1 border rounded"
          value={animationSettings.animation}
          onChange={handleAnimationChange}
          disabled={!hasSelection}
        >
          {animationOptions[
            animationSettings.type as keyof typeof animationOptions
          ].map((animation) => (
            <option
              key={animation}
              value={animation}
            >
              {animation}
            </option>
          ))}
        </select>
        {/* Animation delay input */}
        <div className="flex items-center gap-1">
          <label htmlFor="delay">Delay:</label>
          <input
            id="delay"
            type="number"
            className="w-16 px-2 py-1 border rounded"
            min="0"
            step="0.1"
            value={animationSettings.delay}
            onChange={handleDelayChange}
            disabled={!hasSelection}
          />
          <span>s</span>
        </div>
        {/* Animation duration input */}
        <div className="flex items-center gap-1">
          <label htmlFor="duration">Duration:</label>
          <input
            id="duration"
            type="number"
            className="w-16 px-2 py-1 border rounded"
            min="0.1"
            step="0.1"
            value={animationSettings.duration}
            onChange={handleDurationChange}
            disabled={!hasSelection}
          />
          <span>s</span>
        </div>
        {/* Apply button */}
        <button
          className="px-3 py-1 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={applyAnimationToSelection}
          disabled={!hasSelection}
        >
          Apply Animation
        </button>
      </div>

      {/* Selection info */}
      {hasSelection && (
        <div className="ml-auto text-sm text-gray-600">
          Selected:{" "}
          {selectedText.length > 20
            ? `${selectedText.substring(0, 20)}...`
            : selectedText}
        </div>
      )}
    </div>
  );
};

export default Toolbar;
