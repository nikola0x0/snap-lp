"use client";

interface TerminalHeaderProps {
  title: string;
  subtitle?: string;
}

export function TerminalHeader({ title, subtitle }: TerminalHeaderProps) {
  return (
    <div className="bg-zinc-950 border-2 border-cyan-500/30 mb-4">
      <div className="bg-gradient-to-r from-cyan-950/50 to-transparent px-4 py-3 border-b-2 border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-cyan-400 font-mono text-sm tracking-[0.2em] uppercase">
              /// {title}
            </h2>
            {subtitle && (
              <p className="text-zinc-500 text-xs mt-1 font-mono">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
