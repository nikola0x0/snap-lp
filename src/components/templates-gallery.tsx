"use client";

import { StrategyTemplate } from "@/types/strategy";
import { STRATEGY_TEMPLATES } from "@/data/strategy-templates";
import { TemplateCard } from "./template-card";

interface TemplatesGalleryProps {
  templates?: StrategyTemplate[];
}

export function TemplatesGallery({
  templates = STRATEGY_TEMPLATES,
}: TemplatesGalleryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
