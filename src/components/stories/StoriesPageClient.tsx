"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import StoryCard from "./StoryCard";
import StoryViewer from "./StoryViewer";
import type { GroupedStories, Story } from "@/types/story";

interface StoriesPageClientProps {
  groupedStories: GroupedStories[];
}

export default function StoriesPageClient({
  groupedStories,
}: StoriesPageClientProps) {
  const t = useTranslations("stories");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Flatten all stories for the grid and viewer navigation
  const allStories: Story[] = groupedStories.flatMap((g) => g.stories);

  const handleOpenStory = (storyIndex: number) => {
    setViewerIndex(storyIndex);
    setViewerOpen(true);
  };

  if (allStories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-gray-text">{t("empty")}</p>
        <p className="mt-1 text-sm text-gray-text">{t("emptyDescription")}</p>
      </div>
    );
  }

  return (
    <>
      {/* Stories Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {allStories.map((story, index) => (
          <StoryCard
            key={story.id}
            story={story}
            onClick={() => handleOpenStory(index)}
          />
        ))}
      </div>

      {/* Story Viewer Modal */}
      {viewerOpen && (
        <StoryViewer
          stories={allStories}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </>
  );
}
