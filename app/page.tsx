"use client";

import Editor from "@/components/Editor";
import Preview from "@/components/Preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Text Animation Editor</h1>

      <Tabs defaultValue="editor">
        <TabsList className="mb-4">
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent
          value="editor"
          className="min-h-[60vh]"
        >
          <Editor />
        </TabsContent>

        <TabsContent
          value="preview"
          className="min-h-[60vh]"
        >
          <Preview />
        </TabsContent>
      </Tabs>
    </div>
  );
}
