"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (position) {
      case "top":
        top = rect.top - 40;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + 10;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - 10;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + 10;
        break;
    }

    setTooltipPosition({ top, left });

    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionClass = {
    top: "translate-x(-50%) translate-y(-100%)",
    bottom: "translate-x(-50%)",
    left: "translate-x(-100%) translate-y(-50%)",
    right: "translate-y(-50%)",
  };

  return (
    <div
      className="inline-block relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: `${positionClass[position]}`,
              transition: "opacity 0.2s ease-in-out",
            }}
          >
            <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm shadow-md whitespace-nowrap">
              {content}
            </div>
            <div
              className={`
              absolute w-0 h-0 border-4
              ${
                position === "top"
                  ? "border-t-gray-800 border-l-transparent border-r-transparent border-b-transparent bottom-full left-1/2 -translate-x-1/2"
                  : ""
              }
              ${
                position === "bottom"
                  ? "border-b-gray-800 border-l-transparent border-r-transparent border-t-transparent top-full left-1/2 -translate-x-1/2"
                  : ""
              }
              ${
                position === "left"
                  ? "border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent right-full top-1/2 -translate-y-1/2"
                  : ""
              }
              ${
                position === "right"
                  ? "border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent left-full top-1/2 -translate-y-1/2"
                  : ""
              }
            `}
            />
          </div>,
          document.body
        )}
    </div>
  );
};
