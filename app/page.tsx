"use client";

import Editor from "@/components/Editor";
import PlayerControls from "@/components/PlayerControls";

export default function Home() {
  return (
    <main className="flex flex-col h-screen">
      <Editor />
      <PlayerControls />
    </main>
  );
}
