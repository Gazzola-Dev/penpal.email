"use client";

import { Music, Pause, Play } from "lucide-react";
import { useState } from "react";

export default function PlayerControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);

    // Simulate progress when playing
    if (!isPlaying) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          return newProgress;
        });
      }, 100);
    }
  };

  return (
    <div className="w-full h-36 border-t p-4 flex items-center">
      <div className="rounded h-full aspect-square bg-gray-100 flex items-center justify-center">
        <Music
          size={32}
          className="text-gray-600"
        />
      </div>

      <div className="flex-1 mx-4 flex items-center">
        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <button
        onClick={togglePlay}
        className="rounded-full bg-blue-500 text-white p-3 hover:bg-blue-600 transition-colors"
      >
        {isPlaying ? (
          <Pause
            size={24}
            fill="currentColor"
          />
        ) : (
          <Play
            size={24}
            fill="currentColor"
          />
        )}
      </button>
    </div>
  );
}
