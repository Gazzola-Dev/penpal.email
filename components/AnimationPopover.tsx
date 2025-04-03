import {
  animationOptions,
  animationTypes,
  useAnimation,
} from "@/providers/AnimationProvider";
import React, { useEffect, useRef } from "react";

interface AnimationPopoverProps {
  // Optional props for customization
  className?: string;
}

const AnimationPopover: React.FC<AnimationPopoverProps> = ({
  className = "",
}) => {
  const {
    hasSelection,
    selectionRect,
    animationSettings,
    applyAnimationToSelection,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
  } = useAnimation();

  const popoverRef = useRef<HTMLDivElement>(null);

  // Position the popover next to the selected text
  useEffect(() => {
    if (hasSelection && selectionRect && popoverRef.current) {
      const popover = popoverRef.current;
      const rect = selectionRect;

      // Position to the right of the selection
      const top = rect.top + window.scrollY;
      const left = rect.right + window.scrollX + 10; // Add a small offset

      // Make sure the popover doesn't go off screen
      const rightEdge = left + popover.offsetWidth;
      const windowWidth = window.innerWidth;

      if (rightEdge > windowWidth) {
        // Position to the left of the selection instead
        popover.style.left = `${
          rect.left + window.scrollX - popover.offsetWidth - 10
        }px`;
      } else {
        popover.style.left = `${left}px`;
      }

      popover.style.top = `${top}px`;
    }
  }, [hasSelection, selectionRect]);

  if (!hasSelection || !selectionRect) {
    return null;
  }

  return (
    <div
      ref={popoverRef}
      className={`fixed z-50 p-3 bg-white shadow-lg border rounded-md w-64 ${className}`}
      style={{ position: "absolute" }}
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-medium text-sm">Animation Settings</h3>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="animation-type"
            className="text-xs text-gray-600"
          >
            Type
          </label>
          <select
            id="animation-type"
            className="px-2 py-1 border rounded text-sm"
            value={animationSettings.type}
            onChange={handleTypeChange}
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

        <div className="flex flex-col gap-1">
          <label
            htmlFor="animation-name"
            className="text-xs text-gray-600"
          >
            Animation
          </label>
          <select
            id="animation-name"
            className="px-2 py-1 border rounded text-sm"
            value={animationSettings.animation}
            onChange={handleAnimationChange}
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
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor="delay"
              className="text-xs text-gray-600"
            >
              Delay (s)
            </label>
            <input
              id="delay"
              type="number"
              className="px-2 py-1 border rounded text-sm"
              min="0"
              step="0.1"
              value={animationSettings.delay}
              onChange={handleDelayChange}
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label
              htmlFor="duration"
              className="text-xs text-gray-600"
            >
              Duration (s)
            </label>
            <input
              id="duration"
              type="number"
              className="px-2 py-1 border rounded text-sm"
              min="0.1"
              step="0.1"
              value={animationSettings.duration}
              onChange={handleDurationChange}
            />
          </div>
        </div>

        <button
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 mt-1"
          onClick={applyAnimationToSelection}
        >
          Apply Animation
        </button>
      </div>
    </div>
  );
};

export default AnimationPopover;
