import { AnimationSettings } from "@/types";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";

function Divider() {
  return <div className="divider" />;
}

// Predefined animation options
const animationTypes = ["fade", "slide", "zoom", "bounce"];
const animationOptions: Record<string, string[]> = {
  fade: ["fadeIn", "fadeOut", "fadeInUp", "fadeInDown"],
  slide: ["slideInLeft", "slideInRight", "slideInUp", "slideInDown"],
  zoom: ["zoomIn", "zoomOut", "zoomInUp", "zoomInDown"],
  bounce: ["bounceIn", "bounceOut", "bounceInUp", "bounceInDown"],
};

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [animationSettings, setAnimationSettings] = useState<AnimationSettings>(
    {
      type: "fade",
      animation: "fadeIn",
      delay: 0,
      duration: 1,
    }
  );

  // Returns animation settings from the current text selection
  const getAnimationFromSelection = useCallback(() => {
    return editor.getEditorState().read(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return null;
      }

      // Check if selection has animation data
      //   let hasAnimation = false;
      //   let settings: AnimationSettings = {
      //     type: "fade",
      //     animation: "fadeIn",
      //     delay: 0,
      //     duration: 1,
      //   };

      // Find animation settings from the first selected text node
      //   selection.getNodes().forEach((node) => {
      //     if ($isTextNode(node)) {
      //       const nodeAnimationData = (node as TextNode).getFormatFlags()
      //         .animationData;
      //       if (nodeAnimationData) {
      //         hasAnimation = true;
      //         try {
      //           settings = JSON.parse(nodeAnimationData);
      //         } catch (e) {
      //           console.error("Error parsing animation data", e);
      //         }
      //         return; // Just get from the first node with animation data
      //       }
      //     }
      //   });

      //   return hasAnimation ? settings : null;
    });
  }, [editor]);

  const updateToolbar = useCallback(() => {
    editor.getEditorState().read(() => {
      const selection = $getSelection();
      const hasValidSelection =
        $isRangeSelection(selection) && !selection.isCollapsed();
      setHasSelection(hasValidSelection);

      if (hasValidSelection) {
        const currentSettings = getAnimationFromSelection();
        if (currentSettings) {
          setAnimationSettings(currentSettings);
        }
      }
    });
  }, [editor, getAnimationFromSelection]);

  // Apply animation settings to selected text
  const applyAnimationSettings = useCallback(() => {
    if (!hasSelection) return;

    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;

      //   selection.getNodes().forEach((node) => {
      //     if ($isTextNode(node)) {
      //       // Store animation data in the node's format flags
      //       // This would require extending TextNode to support this custom data
      //       // In a real implementation, you may need a custom node type
      //       (node as any).setAnimationData(JSON.stringify(animationSettings));
      //     }
      //   });
    });
  }, [editor, hasSelection]);

  // Handle animation type change
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setAnimationSettings({
      ...animationSettings,
      type: newType,
      animation: animationOptions[newType][0], // Set to first animation of the new type
    });
  };

  // Handle specific animation change
  const handleAnimationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAnimationSettings({
      ...animationSettings,
      animation: e.target.value,
    });
  };

  // Handle delay change
  const handleDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnimationSettings({
      ...animationSettings,
      delay: parseFloat(e.target.value),
    });
  };

  // Handle duration change
  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnimationSettings({
      ...animationSettings,
      duration: parseFloat(e.target.value),
    });
  };

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      })
      //   editor.registerCommand(
      //     SELECTION_CHANGE_COMMAND,
      //     (_payload, _newEditor) => {
      //       updateToolbar();
      //       return false;
      //     },
      //     LowPriority
      //   )
    );
  }, [editor, updateToolbar]);

  // Apply animation settings when they change and there's a selection
  useEffect(() => {
    if (hasSelection) {
      applyAnimationSettings();
    }
  }, [applyAnimationSettings, hasSelection, animationSettings]);

  return (
    <div
      className="animation-toolbar"
      ref={toolbarRef}
    >
      <div className="toolbar-section">
        <label htmlFor="animation-type">Type:</label>
        <select
          id="animation-type"
          value={animationSettings.type}
          onChange={handleTypeChange}
          disabled={!hasSelection}
          className="toolbar-select"
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

      <div className="toolbar-section">
        <label htmlFor="animation-name">Animation:</label>
        <select
          id="animation-name"
          value={animationSettings.animation}
          onChange={handleAnimationChange}
          disabled={!hasSelection}
          className="toolbar-select"
        >
          {animationOptions[animationSettings.type].map((animation) => (
            <option
              key={animation}
              value={animation}
            >
              {animation}
            </option>
          ))}
        </select>
      </div>

      <Divider />

      <div className="toolbar-section">
        <label htmlFor="animation-delay">Delay (s):</label>
        <input
          id="animation-delay"
          type="number"
          min="0"
          step="0.1"
          value={animationSettings.delay}
          onChange={handleDelayChange}
          disabled={!hasSelection}
          className="toolbar-number"
        />
      </div>

      <div className="toolbar-section">
        <label htmlFor="animation-duration">Duration (s):</label>
        <input
          id="animation-duration"
          type="number"
          min="0.1"
          step="0.1"
          value={animationSettings.duration}
          onChange={handleDurationChange}
          disabled={!hasSelection}
          className="toolbar-number"
        />
      </div>
    </div>
  );
}
