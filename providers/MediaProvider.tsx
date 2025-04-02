"use client";
import { createContext, ReactNode, useContext, useState } from "react";

// Define the shape of the context
interface MediaContextType {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  currentTime: number;
  setCurrentTime: (currentTime: number) => void;
  duration: number;
  setDuration: (duration: number) => void;
  mediaFile: File | null;
  setMediaFile: (file: File | null) => void;
}

// Create context with default values
const MediaContext = createContext<MediaContextType>({
  isPlaying: false,
  setIsPlaying: () => {},
  currentTime: 0,
  setCurrentTime: () => {},
  duration: 0,
  setDuration: () => {},
  mediaFile: null,
  setMediaFile: () => {},
});

// Provider props type
interface MediaProviderProps {
  children: ReactNode;
}

// Create the provider component
export function MediaProvider({ children }: MediaProviderProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mediaFile, setMediaFile] = useState<File | null>(null);

  return (
    <MediaContext.Provider
      value={{
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        mediaFile,
        setMediaFile,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
}

// Custom hook to use the media context
export function useMediaContext() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMediaContext must be used within a MediaProvider");
  }
  return context;
}
