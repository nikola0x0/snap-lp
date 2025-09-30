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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold">Strategy Templates</h3>
        <div className="text-sm text-muted-foreground">
          {templates.length} templates available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  );
}
