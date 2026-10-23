"use client";

import type { ArticlePreviewData } from "./shared";
import { EditorialLayout } from "./EditorialLayout";
import { GuideLayout } from "./GuideLayout";
import { ResearchLayout } from "./ResearchLayout";
import { StoryLayout } from "./StoryLayout";
import { StepsLayout } from "./StepsLayout";

/**
 * Selects the preview file from the draft's saved layout identifier.
 * Legacy identifiers keep rendering (mapped to the closest new file)
 * so old drafts never break.
 */
export function ArticleLayoutRenderer({ data }: { data: ArticlePreviewData }) {
  switch (data.layout) {
    case "editorial":
      return <EditorialLayout data={data} />;
    case "medical-guide":
      return <GuideLayout data={data} />;
    case "research":
      return <ResearchLayout data={data} />;
    case "storytelling":
      return <StoryLayout data={data} />;
    case "step-by-step":
      return <StepsLayout data={data} />;
    case "step-guide":
      return <StepsLayout data={data} />;
    case "health-guide":
      return <StepsLayout data={data} />;
    case "report-analysis":
      return <GuideLayout data={data} />;
    case "symptoms":
      return <GuideLayout data={data} />;
    case "clinical-deep-dive":
      return <ResearchLayout data={data} />;
    case "faq":
      return <GuideLayout data={data} />;
    case "before-after":
      return <StoryLayout data={data} />;
    case "hero-feature":
    case "standard":
    default:
      return <EditorialLayout data={data} />;
  }
}

export type { ArticlePreviewData } from "./shared";
