"use client";

import { MediaProvider } from "@/providers/MediaProvider";
import Editor from "./Editor"; // Assuming this exists
import PlayerControls from "./PlayerControls";
import Toolbar from "./Toolbar";

export default function AppLayout() {
  return (
    <MediaProvider>
      <div className="flex flex-col h-screen">
        <Toolbar />
        <div className="flex-1 overflow-auto">
          <Editor />
        </div>
        <PlayerControls />
      </div>
    </MediaProvider>
  );
}
