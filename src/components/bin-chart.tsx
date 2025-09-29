"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

interface Bin {
  id: number;
  price: number;
  liquidity: number;
  active: boolean;
}

interface BinChartProps {
  bins: Bin[];
  currentPrice: number;
}

export function BinChart({ bins, currentPrice }: BinChartProps) {
  const chartData = bins.map((bin, index) => ({
    id: index,
    price: bin.price.toFixed(1),
    liquidity: bin.liquidity,
    active: bin.active,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
        >
          <XAxis
            dataKey="price"
            tick={{ fontSize: 10 }}
            interval={Math.floor(bins.length / 6)}
          />
          <YAxis
            tick={{ fontSize: 10 }}
            label={{ value: "Liquidity", angle: -90, position: "insideLeft" }}
          />
          <ReferenceLine
            x={currentPrice.toFixed(1)}
            stroke="#ef4444"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <Bar dataKey="liquidity" radius={[2, 2, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.active ? "#22c55e" : "#94a3b8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Active Bins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-400 rounded"></div>
          <span>Inactive Bins</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-1 bg-red-500"></div>
          <span>Current Price</span>
        </div>
      </div>
    </div>
  );
}
