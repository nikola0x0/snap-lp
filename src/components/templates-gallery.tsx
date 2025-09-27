'use client'

import { StrategyTemplate } from '@/types/strategy'
import { STRATEGY_TEMPLATES } from '@/data/strategy-templates'
import { TemplateCard } from './template-card'

interface TemplatesGalleryProps {
  templates?: StrategyTemplate[]
}

export function TemplatesGallery({ templates = STRATEGY_TEMPLATES }: TemplatesGalleryProps) {
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

      {/* Strategy Explanation */}
      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h4 className="text-lg font-semibold mb-4">How DLMM Strategy Templates Work</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium">Conservative</span>
            </div>
            <p className="text-muted-foreground">
              Tight price ranges (±5%) with concentrated liquidity. Lower risk but steady returns from fees.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium">Balanced</span>
            </div>
            <p className="text-muted-foreground">
              Medium price ranges (±12.5%) balancing yield potential with manageable risk.
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium">Aggressive</span>
            </div>
            <p className="text-muted-foreground">
              Wide price ranges (±25%) targeting maximum yield but with higher volatility risk.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}