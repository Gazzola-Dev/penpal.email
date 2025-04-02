import useEditor, { animationOptions, animationTypes } from "@/hooks/useEditor";
import { useRef } from "react";

function Divider() {
  return <div className="divider" />;
}

export default function Toolbar() {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const {
    hasSelection,
    currentAnimation,
    handleTypeChange,
    handleAnimationChange,
    handleDelayChange,
    handleDurationChange,
  } = useEditor();

  return (
    <div
      className="animation-toolbar"
      ref={toolbarRef}
    >
      <div className="toolbar-section">
        <label htmlFor="animation-type">Type:</label>
        <select
          id="animation-type"
          value={currentAnimation.type}
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
          value={currentAnimation.animation}
          onChange={handleAnimationChange}
          disabled={!hasSelection}
          className="toolbar-select"
        >
          {animationOptions[currentAnimation.type].map((animation) => (
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
          min={0}
          step={0.1}
          value={isNaN(currentAnimation.delay) ? 0 : currentAnimation.delay}
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
          value={
            isNaN(currentAnimation.duration) ? 0 : currentAnimation.duration
          }
          onChange={handleDurationChange}
          disabled={!hasSelection}
          className="toolbar-number"
        />
      </div>
    </div>
  );
}
