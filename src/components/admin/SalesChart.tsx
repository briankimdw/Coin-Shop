"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/spot-prices";

interface SalesChartProps {
  data: { date: string; revenue: number }[];
}

export default function SalesChart({ data }: SalesChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
        No sales data for this period
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const chartHeight = 200;
  const shouldScroll = data.length > 14;

  return (
    <div
      className={`${shouldScroll ? "overflow-x-auto" : ""}`}
    >
      <div
        className="flex items-end gap-[2px]"
        style={{
          minWidth: shouldScroll ? `${data.length * 28}px` : undefined,
          height: `${chartHeight + 40}px`,
        }}
      >
        {data.map((d, i) => {
          const barHeight = (d.revenue / maxRevenue) * chartHeight;
          const showLabel = data.length <= 14 || i % 5 === 0;
          const dateLabel = new Date(d.date + "T12:00:00").toLocaleDateString(
            "en-US",
            { month: "short", day: "numeric" }
          );

          return (
            <div
              key={d.date}
              className="flex flex-col items-center flex-1 min-w-[20px] relative"
              style={{ height: `${chartHeight + 40}px` }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Tooltip */}
              {hoveredIndex === i && (
                <div className="absolute bottom-full mb-1 z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
                  <div className="font-medium">{dateLabel}</div>
                  <div>{formatPrice(d.revenue)}</div>
                </div>
              )}

              {/* Bar container - grows from bottom */}
              <div className="flex-1 w-full flex items-end">
                <div
                  className="w-full bg-[#C9A84C] rounded-t-sm transition-all duration-150 hover:bg-[#b8963e] min-h-[2px]"
                  style={{
                    height: d.revenue > 0 ? `${Math.max(barHeight, 4)}px` : "2px",
                    opacity: d.revenue > 0 ? 1 : 0.3,
                  }}
                />
              </div>

              {/* Date label */}
              <div className="h-[36px] flex items-start pt-1">
                {showLabel && (
                  <span className="text-[10px] text-gray-400 transform -rotate-45 origin-top-left whitespace-nowrap">
                    {dateLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
