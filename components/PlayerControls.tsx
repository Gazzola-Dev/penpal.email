"use client";
import { useMediaContext } from "@/providers/MediaProvider";
import { FileAudio, Music, Pause, Play, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Define a union type for media elements
type MediaElementType = HTMLAudioElement | HTMLVideoElement;

export default function PlayerControls() {
  // Get context setters to update the global state
  const { setIsPlaying, setCurrentTime, setDuration, setMediaFile } =
    useMediaContext();

  // Local state - keep everything from the original component
  const [isPlaying, setLocalIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localDuration, setLocalDuration] = useState(0);
  const [localCurrentTime, setLocalCurrentTime] = useState(0);
  const [mediaFile, setLocalMediaFile] = useState<File | null>(null);
  const [fileDisplayName, setFileDisplayName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Single media reference for simplicity - use the union type
  const mediaRef = useRef<MediaElementType | null>(null);

  // Set up media event listeners
  const setupMediaListeners = useCallback(
    (mediaElement: MediaElementType) => {
      console.log("[setupMediaListeners] Setting up event listeners");

      // Metadata loaded event
      mediaElement.addEventListener("loadedmetadata", () => {
        console.log(
          "[Event:loadedmetadata] Media metadata loaded, duration:",
          mediaElement.duration
        );
        setLocalDuration(mediaElement.duration);
        setDuration(mediaElement.duration); // Update context
        setProgress(0);
        setLocalCurrentTime(0);
        console.log("[Event:timeupdate] cleared");
        setCurrentTime(0); // Update context
      });

      // Time update event
      mediaElement.addEventListener("timeupdate", () => {
        setLocalCurrentTime(mediaElement.currentTime);
        console.log(
          "[Event:timeupdate] Current time updated:",
          mediaElement.currentTime
        );
        setCurrentTime(mediaElement.currentTime); // Update context
        if (mediaElement.duration > 0) {
          const newProgress =
            (mediaElement.currentTime / mediaElement.duration) * 100;
          setProgress(newProgress);
        }
      });

      // Play event
      mediaElement.addEventListener("play", () => {
        console.log("[Event:play] Media playback started");
        setLocalIsPlaying(true);
        setIsPlaying(true); // Update context
      });

      // Pause event
      mediaElement.addEventListener("pause", () => {
        console.log("[Event:pause] Media playback paused");
        setLocalIsPlaying(false);
        setIsPlaying(false); // Update context
      });

      // Ended event
      mediaElement.addEventListener("ended", () => {
        console.log("[Event:ended] Media playback ended");
        setLocalIsPlaying(false);
        setIsPlaying(false); // Update context
        setProgress(0);
        setLocalCurrentTime(0);
        console.log("[Event:timeupdate] cleared");
        setCurrentTime(0); // Update context
      });

      // Error handling
      mediaElement.addEventListener("error", (e) => {
        console.error("[Event:error] Media error:", e);
        alert("Error playing the media file. Please try another file.");
      });
    },
    [setCurrentTime, setDuration, setIsPlaying]
  );

  // Handle file drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      console.log(
        "[handleDrop] Files dropped:",
        files.length > 0 ? files[0].name : "none"
      );

      if (files.length > 0) {
        const file = files[0];

        // Check if file is audio or video
        if (file.type.startsWith("audio/") || file.type.startsWith("video/")) {
          console.log("[handleDrop] Valid media file detected:", file.type);

          // Store the file reference
          setLocalMediaFile(file);
          setMediaFile(file); // Update context
          setFileDisplayName(file.name);

          // Cleanup previous media
          if (mediaRef.current) {
            console.log("[handleDrop] Cleaning up previous media element");
            mediaRef.current.pause();
            if (mediaRef.current.src) {
              URL.revokeObjectURL(mediaRef.current.src);
            }
          }

          // Create appropriate media element
          const isAudio = file.type.startsWith("audio/");
          const mediaElement = isAudio
            ? document.createElement("audio")
            : document.createElement("video");

          // Create URL for the file
          const fileURL = URL.createObjectURL(file);
          mediaElement.src = fileURL;
          console.log(
            "[handleDrop] Created media element:",
            isAudio ? "audio" : "video"
          );

          // Set media reference
          mediaRef.current = mediaElement;

          // Set up event listeners
          setupMediaListeners(mediaElement);

          console.log("[handleDrop] Media setup complete for:", file.name);
        } else {
          console.log("[handleDrop] Unsupported file type:", file.type);
          alert("Unsupported file type. Please drop an audio or video file.");
        }
      }
    },
    [setMediaFile, setupMediaListeners]
  );

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Handle play/pause
  const togglePlay = useCallback(() => {
    console.log("[togglePlay] Toggle play called, current state:", isPlaying);

    if (mediaRef.current) {
      if (isPlaying) {
        console.log("[togglePlay] Attempting to pause media");
        mediaRef.current.pause();
      } else {
        console.log("[togglePlay] Attempting to play media");
        console.log(
          "[togglePlay] Media element ready state:",
          mediaRef.current.readyState
        );

        mediaRef.current
          .play()
          .then(() => {
            console.log("[togglePlay] Playback started successfully");
          })
          .catch((err) => {
            console.error("[togglePlay] Playback failed:", err);
          });
      }
    } else {
      console.log("[togglePlay] No media element available for playback");
    }
  }, [isPlaying]);

  // Handle seeking on progress bar click
  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      console.log("[handleProgressClick] Progress bar clicked");

      if (mediaRef.current && localDuration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickPositionRatio = (e.clientX - rect.left) / rect.width;
        const newTime = clickPositionRatio * localDuration;

        console.log(
          "[handleProgressClick] Seeking to position:",
          newTime,
          "seconds"
        );
        mediaRef.current.currentTime = newTime;
      }
    },
    [localDuration]
  );

  // Add global drag handlers
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleGlobalDragLeave = (e: DragEvent) => {
      if (
        e.clientX <= 0 ||
        e.clientY <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        setIsDragging(false);
      }
    };

    const handleGlobalDrop = () => {
      setIsDragging(false);
    };

    window.addEventListener("dragover", handleGlobalDragOver);
    window.addEventListener("dragleave", handleGlobalDragLeave);
    window.addEventListener("drop", handleGlobalDrop);

    return () => {
      window.removeEventListener("dragover", handleGlobalDragOver);
      window.removeEventListener("dragleave", handleGlobalDragLeave);
      window.removeEventListener("drop", handleGlobalDrop);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRef.current) {
        mediaRef.current.pause();
        if (mediaRef.current.src) {
          URL.revokeObjectURL(mediaRef.current.src);
          console.log("[cleanup] Object URL revoked");
        }
      }
    };
  }, []);

  // Format time as MM:SS
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";

    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  if (isDragging) {
    return (
      <div
        className="w-full h-36 border-t p-4 flex flex-col items-center justify-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload
          size={40}
          className="text-blue-500 mb-2"
        />
        <p className="text-blue-700 font-medium">
          Drop your audio or video file here
        </p>
        <p className="text-blue-500 text-sm">
          Supports common audio and video formats
        </p>
      </div>
    );
  }

  return (
    <div
      className="w-full h-36 border-t p-4 flex items-center"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="rounded h-full aspect-square bg-gray-100 flex flex-col items-center justify-center">
        {mediaFile ? (
          <>
            <FileAudio
              size={32}
              className="text-blue-600"
            />
            {fileDisplayName && (
              <span className="text-xs text-center mt-1 px-1 truncate max-w-full">
                {fileDisplayName.length > 15
                  ? fileDisplayName.substring(0, 12) + "..."
                  : fileDisplayName}
              </span>
            )}
          </>
        ) : (
          <Music
            size={32}
            className="text-gray-600"
          />
        )}
      </div>
      <div className="flex-1 mx-4 flex flex-col">
        <div
          className="w-full bg-gray-200 h-2 rounded-full overflow-hidden cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="bg-blue-500 h-full rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        {mediaFile && (
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>{formatTime(localCurrentTime)}</span>
            <span>{formatTime(localDuration)}</span>
          </div>
        )}
      </div>
      <button
        onClick={togglePlay}
        className={`rounded-full ${
          mediaFile
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-300 cursor-not-allowed"
        } text-white p-3 transition-colors`}
        disabled={!mediaFile}
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
