"use client";

import type { Article, ArticleListItem } from "@/lib/api/types";
import { EditorialMedicalArticle } from "./EditorialMedicalArticle";
import { MedicalKnowledgeGuide } from "./MedicalKnowledgeGuide";
import { MedicalResearchArticle } from "./MedicalResearchArticle";
import { MedicalStoryArticle } from "./MedicalStoryArticle";
import { MedicalStepByStepArticle } from "./MedicalStepByStepArticle";
import { StandardArticleLayout } from "./StandardArticleLayout";
import { HealthGuideLayout } from "./HealthGuideLayout";
import { ReportAnalysisLayout } from "./ReportAnalysisLayout";
import { SymptomsLayout } from "./SymptomsLayout";

export const NEW_LAYOUTS = ["editorial", "medical-guide", "research", "storytelling", "step-by-step", "standard", "health-guide", "report-analysis", "symptoms", "clinical-deep-dive"] as const;

export type NewLayout = (typeof NEW_LAYOUTS)[number];

/** True for CMS layouts — legacy values keep existing rendering. */
export function isNewLayout(layout: unknown): layout is NewLayout {
  return typeof layout === "string" && (NEW_LAYOUTS as readonly string[]).includes(layout);
}

/**
 * Selects the correct medical template from the article's saved layout
 * identifier. Never guesses from title, slug, or category.
 */
export function ArticleTemplateRenderer({ article, related }: { article: Article; related: ArticleListItem[] }) {
  const layout = (article as { layout?: string }).layout;

  switch (layout) {
    case "editorial":
      return <EditorialMedicalArticle article={article} related={related} />;
    case "medical-guide":
      return <MedicalKnowledgeGuide article={article} related={related} />;
    case "research":
      return <MedicalResearchArticle article={article} related={related} />;
    case "storytelling":
      return <MedicalStoryArticle article={article} related={related} />;
    case "step-by-step":
      return <MedicalStepByStepArticle article={article} related={related} />;
    case "standard":
      return <StandardArticleLayout article={article} related={related} />;
    case "health-guide":
      return <HealthGuideLayout article={article} related={related} />;
    case "report-analysis":
      return <ReportAnalysisLayout article={article} related={related} />;
    case "symptoms":
      return <SymptomsLayout article={article} related={related} />;
    case "clinical-deep-dive":
      return <MedicalResearchArticle article={article} related={related} />;
    default:
      // Missing/legacy/unsupported identifier — safe fallback, never crash.
      return <EditorialMedicalArticle article={article} related={related} />;
  }
}

export { EditorialMedicalArticle } from "./EditorialMedicalArticle";
export { MedicalKnowledgeGuide } from "./MedicalKnowledgeGuide";
export { MedicalResearchArticle } from "./MedicalResearchArticle";
export { MedicalStoryArticle } from "./MedicalStoryArticle";
export { MedicalStepByStepArticle } from "./MedicalStepByStepArticle";
export { StandardArticleLayout } from "./StandardArticleLayout";
export { HealthGuideLayout } from "./HealthGuideLayout";
export { ReportAnalysisLayout } from "./ReportAnalysisLayout";
export { SymptomsLayout } from "./SymptomsLayout";
