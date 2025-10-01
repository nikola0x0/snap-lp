export interface ConsoleLoadingProps {
  message?: string;
  bars?: number;
  inline?: boolean;
  barColor?: string;
}

export function ConsoleLoading({
  message = "LOADING...",
  bars = 20,
  inline = false,
  barColor = "bg-cyan-500/50",
}: ConsoleLoadingProps) {
  if (inline) {
    return (
      <div className="w-full flex flex-col gap-1 px-2 py-1.5 bg-[#0a0a0a] border-2 border-zinc-800">
        <span className="text-[9px] text-cyan-400 font-mono tracking-wider">
          {message}
        </span>
        <div className="flex gap-[2px]">
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={`loading-bar-${i}`}
              className={`w-[6px] h-[8px] ${barColor} animate-pulse`}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 text-center">
      <div className="w-full max-w-md mx-auto flex flex-col gap-2 px-3 py-3 bg-[#0a0a0a] border-2 border-cyan-500/50">
        <span className="text-[10px] text-cyan-400 font-mono tracking-wider uppercase">
          {message}
        </span>
        <div className="flex gap-[2px] justify-center">
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={`loading-bar-${i}`}
              className={`w-[8px] h-[12px] ${barColor} animate-pulse`}
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
