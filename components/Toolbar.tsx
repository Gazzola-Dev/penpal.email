"use client";

import { useMediaContext } from "@/providers/MediaProvider";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Clock,
  Italic,
  List,
  ListOrdered,
  Underline,
} from "lucide-react";
import { useRef, useState } from "react";

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
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationSettings>({
    type: "entrance",
    animation: "fadeIn",
    delay: 0,
    duration: 1,
  });

  // Get media playback time from context
  const { currentTime, duration } = useMediaContext();

  // Animation state for toolbar

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds)) return "00:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handlers
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

  return (
    <div
      className={`p-2 border-b flex items-center transition-colors duration-300`}
      ref={toolbarRef}
    >
      {/* Text formatting options */}
      <div className="flex items-center mr-4">
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <Bold size={18} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <Italic size={18} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <Underline size={18} />
        </button>
      </div>

      <Divider />

      {/* Alignment options */}
      <div className="flex items-center mr-4">
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <AlignLeft size={18} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <AlignCenter size={18} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <AlignRight size={18} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <AlignJustify size={18} />
        </button>
      </div>

      <Divider />

      {/* List options */}
      <div className="flex items-center mr-4">
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <List size={18} />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded-sm">
          <ListOrdered size={18} />
        </button>
      </div>

      <Divider />

      {/* Font options */}
      <select className="p-1 border rounded text-sm mr-2">
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Verdana">Verdana</option>
      </select>

      <select className="p-1 border rounded text-sm">
        <option value="10">10</option>
        <option value="12">12</option>
        <option value="14">14</option>
        <option
          value="16"
          defaultValue="16"
        >
          16
        </option>
        <option value="18">18</option>
        <option value="24">24</option>
        <option value="36">36</option>
      </select>

      <Divider />

      {/* Media timestamp display */}

      <>
        <div className="flex items-center mr-4 text-sm">
          <Clock
            size={16}
            className="mr-1"
          />
          <span className="text-gray-700">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        <Divider />
      </>

      {/* Animation section */}
      <div
        className={`flex items-center space-x-2 transition-transform duration-300`}
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
      </div>
    </div>
  );
}
