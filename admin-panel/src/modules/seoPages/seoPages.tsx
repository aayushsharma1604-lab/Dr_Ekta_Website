"use client";

import { useState } from "react";
import { PageTable, CategoryPage } from "./components/PageTable";
import { PageSectionsSidebar, PageSection, SectionType } from "./components/PageSectionsSidebar";
import { AddSectionModal } from "./components/AddSectionModal";
import { PageSettings } from "./components/PageSettings";
import { HeroBannerSettings } from "./components/HeroBannerSettings";
import { SubCategoryPagesSettings } from "./components/SubCategoryPagesSettings";
import { StepperSettings } from "./components/StepperSettings";
import { FAQSettings } from "./components/FAQSettings";
import { ImageSettings } from "./components/ImageSettings";
import { TextSettings } from "./components/TextSettings";
import { FeatureCardsSettings, SupportingPagesSettings } from "./components/CardsSettings";
import { ArrowLeft } from "lucide-react";

const mockPages: CategoryPage[] = Array.from({ length: 11 }, (_, i) => ({
  id: `page-${i + 1}`,
  pageTitle: "Template Name",
  shortDescription: "Text",
  url: "Text.com",
  publishDate: "DD/MM/YYYY",
  postedBy: "Name",
  createdBy: "Name",
  updatedBy: "Name",
  updatedAt: "DD/MM/YYYY",
  status: (["Draft", "Published", "Rejected", "Published", "Published", "Draft", "Rejected", "Published", "Draft", "Rejected", "Published"] as const)[i],
}));

const sectionLabelMap: Record<SectionType, string> = {
  pageSettings: "Page Settings",
  heroBanner: "Hero Banner",
  subCategory: "Sub Category Pages",
  stepper: "Stepper",
  featureCards: "Feature Cards",
  supportingPages: "Supporting page Pages",
  faq: "FAQ",
  image: "Image",
  text: "Text",
};

export function SeoPages() {
  const [pages, setPages] = useState<CategoryPage[]>(mockPages);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>("section-1");
  const [showAddModal, setShowAddModal] = useState(false);
  const [pageStatus, setPageStatus] = useState("Published");
  const [sections, setSections] = useState<PageSection[]>([
    { id: "section-1", type: "pageSettings", label: "Page Settings", subLabel: "Top Fold Placement" },
    { id: "section-2", type: "heroBanner", label: "Hero Banner" },
    { id: "section-3", type: "subCategory", label: "Sub Category Pages" },
    { id: "section-4", type: "stepper", label: "Stepper" },
    { id: "section-5", type: "featureCards", label: "Feature Cards" },
    { id: "section-6", type: "supportingPages", label: "Supporting page Pages" },
    { id: "section-7", type: "faq", label: "FAQ" },
    { id: "section-8", type: "image", label: "Image" },
    { id: "section-9", type: "text", label: "Text" },
  ]);

  // Section data states
  const [pageSettingsData, setPageSettingsData] = useState({ pageTitle: "Expert Healthcare for Modern Lives", pageUrl: "Expert Healthcare for Modern Lives", metaTitle: "Empowering patients through cutting-edge", metaDescription: "Empowering patients through cutting-edge technology and compassionate clinical guidance across our global network of facilities.", shortDescription: "Book Consultation" });
  const [heroData, setHeroData] = useState({ heading: "Expert Healthcare for Modern Lives", description: "Empowering patients through cutting-edge technology and compassionate clinical guidance across our global network of facilities.", ctaText: "Book Consultation", ctaUrl: "/appointment", image: "" });
  const [subCategoryData, setSubCategoryData] = useState({ sectionHeading: "Supported Medical Reports", shortHeading: "Report types we analyse", description: "Our AI system can analyse multiple types of health reports and provide easy-to-understand explanations.", pages: [{ id: "r1", title: "Blood Test Report Analysis", category: "Lab Reports" }, { id: "r2", title: "Blood Test Report Analysis", category: "Lab Reports" }] });
  const [stepperData, setStepperData] = useState({ basicSettings: { sectionHeading: "Supported Medical Reports", shortHeading: "Report types we analyse", description: "Our AI system simplifies complex medical reports into easy and trusted health guidance you can use anytime, anywhere." }, steps: [{ id: "s1", title: "Upload Your Report", description: "Upload your blood test, scan report, or medical document securely." }], layoutSettings: { connectingLine: true, centerAlign: false } });
  const [featureCardsData, setFeatureCardsData] = useState({ heading: "Why Choose Us", description: "Discover our key features.", cards: [{ id: "c1", title: "AI Powered", description: "Advanced AI analysis.", icon: "brain" }] });
  const [supportingData, setSupportingData] = useState({ heading: "Related Articles", pages: [{ id: "sp1", title: "Understanding Lab Reports", url: "/lab-reports" }] });
  const [faqData, setFaqData] = useState({ sectionHeading: "Frequently Asked Questions", faqs: [{ id: "f1", question: "What report types can I upload?", answer: "Upload any medical report and our AI will analyse it for you." }] });
  const [imageData, setImageData] = useState({ image: "", alt: "" });
  const [textData, setTextData] = useState({ content: "Write your content here. This is a rich text editor section for detailed information." });

  const handleStatusChange = (id: string, status: CategoryPage["status"]) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const handleAddSection = (type: string) => {
    const newSection: PageSection = { id: `section-${Date.now()}`, type: type as SectionType, label: sectionLabelMap[type as SectionType] || type };
    setSections((prev) => [...prev, newSection]);
    setActiveSectionId(newSection.id);
    setShowAddModal(false);
  };

  const handleDeleteSection = (id: string) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
    if (activeSectionId === id) setActiveSectionId(sections[0]?.id || "");
  };

  const activeSection = sections.find((s) => s.id === activeSectionId);

  const renderSettings = () => {
    if (!activeSection) return null;
    switch (activeSection.type) {
      case "pageSettings": return <PageSettings data={pageSettingsData} onChange={setPageSettingsData} />;
      case "heroBanner": return <HeroBannerSettings data={heroData} onChange={setHeroData} />;
      case "subCategory": return <SubCategoryPagesSettings data={subCategoryData} onChange={setSubCategoryData} />;
      case "stepper": return <StepperSettings data={stepperData} onChange={setStepperData} />;
      case "featureCards": return <FeatureCardsSettings data={featureCardsData} onChange={setFeatureCardsData} />;
      case "supportingPages": return <SupportingPagesSettings data={supportingData} onChange={setSupportingData} />;
      case "faq": return <FAQSettings data={faqData} onChange={setFaqData} />;
      case "image": return <ImageSettings data={imageData} onChange={setImageData} />;
      case "text": return <TextSettings data={textData} onChange={setTextData} />;
      default: return <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">Settings for {activeSection.label}</div>;
    }
  };

  if (!selectedPageId) {
    return (
      <PageTable
        pages={pages}
        onSelect={(id) => { setSelectedPageId(id); setActiveSectionId(sections[0]?.id || ""); }}
        onStatusChange={handleStatusChange}
        onCreate={() => {
          const newPage: CategoryPage = { id: `page-${Date.now()}`, pageTitle: "New Page", shortDescription: "Text", url: "Text.com", publishDate: new Date().toLocaleDateString(), postedBy: "Admin", createdBy: "Admin", updatedBy: "Admin", updatedAt: new Date().toLocaleDateString(), status: "Draft" };
          setPages((prev) => [newPage, ...prev]);
          setSelectedPageId(newPage.id);
        }}
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button onClick={() => setSelectedPageId(null)} className="flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400">
          <ArrowLeft size={14} /> Back to Pages
        </button>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Category Page</h2>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <PageSectionsSidebar
          sections={sections}
          activeId={activeSectionId}
          onSelect={setActiveSectionId}
          onDelete={handleDeleteSection}
          onAddSection={() => setShowAddModal(true)}
          status={pageStatus}
          onStatusChange={setPageStatus}
        />
        <div className="flex-1">
          {renderSettings()}
        </div>
      </div>

      {showAddModal && <AddSectionModal onClose={() => setShowAddModal(false)} onSelect={handleAddSection} />}
    </div>
  );
}
