import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, TreemapChart } from "echarts/charts";
import { DataZoomComponent, GridComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";
echarts.use([BarChart, LineChart, TreemapChart, DataZoomComponent, GridComponent, TooltipComponent, CanvasRenderer]);
export function EChart({ option, ariaLabel, onSelect }: { option: EChartsCoreOption; ariaLabel: string; onSelect?: (name: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!ref.current) return; const chart = echarts.init(ref.current); chart.setOption(option); if (onSelect) chart.on("click", (params) => onSelect(String(params.name))); const resize = () => chart.resize(); window.addEventListener("resize", resize); return () => { window.removeEventListener("resize", resize); chart.dispose(); }; }, [option, onSelect]);
  return <div className="echart" ref={ref} role="img" aria-label={ariaLabel} />;
}
