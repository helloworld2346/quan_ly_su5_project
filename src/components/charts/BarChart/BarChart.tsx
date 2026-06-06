import { useState, useRef, useLayoutEffect } from "react";
import styles from "./BarChart.module.css";

export interface BarDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface BarDataset {
  label: string;
  color: string;
  data: number[];
}

type BarChartProps = {
  labels: string[];
  datasets: BarDataset[];
  orientation?: "vertical" | "horizontal";
  height?: number;
  showLegend?: boolean;
  showValues?: boolean;
  unit?: string;
  maxValue?: number;
};

function formatNum(value: number) {
  return value.toLocaleString("vi-VN");
}

export default function BarChart({
  labels,
  datasets,
  orientation = "vertical",
  height = 220,
  showLegend = true,
  showValues = true,
  unit = "",
  maxValue,
}: BarChartProps) {
  const [hovered, setHovered] = useState<{ datasetIdx: number; barIdx: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [svgW, setSvgW] = useState(600);
  const wrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const update = () => {
      if (wrapRef.current) setSvgW(wrapRef.current.clientWidth);
    };
    update();
    const ro = new ResizeObserver(update);
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const allValues = datasets.flatMap((d) => d.data);
  const computedMax = maxValue ?? Math.max(...allValues, 1);
  const isVertical = orientation === "vertical";

  const paddingTop = 36;
  const paddingBottom = isVertical ? 74 : 20;
  const paddingLeft = isVertical ? 36 : 120;
  const paddingRight = 12;
  const svgHeight = height;
  const barGroupGap = 0.25;
  const barGap = 0.08;

  return (
    <div className={styles.wrapper}>
      <div className={styles.chartArea} style={{ height }} ref={wrapRef}>
        <svg
          width={svgW}
          height={svgHeight}
          className={styles.svg}
        >
          {isVertical ? (
            <VerticalBars
              labels={labels}
              datasets={datasets}
              computedMax={computedMax}
              paddingTop={paddingTop}
              paddingBottom={paddingBottom}
              paddingLeft={paddingLeft}
              paddingRight={paddingRight}
              svgHeight={svgHeight}
              svgWidth={svgW}
              showValues={showValues}
              unit={unit}
              barGroupGap={barGroupGap}
              barGap={barGap}
              hovered={hovered}
              setHovered={setHovered}
              setTooltipPos={setTooltipPos}
            />
          ) : (
            <HorizontalBars
              labels={labels}
              datasets={datasets}
              computedMax={computedMax}
              paddingTop={paddingTop}
              paddingBottom={paddingBottom}
              paddingLeft={paddingLeft}
              paddingRight={paddingRight}
              svgHeight={svgHeight}
              svgWidth={svgW}
              showValues={showValues}
              unit={unit}
              barGroupGap={barGroupGap}
              barGap={barGap}
              hovered={hovered}
              setHovered={setHovered}
              setTooltipPos={setTooltipPos}
            />
          )}
        </svg>

        {hovered && (
          <div
            className={styles.tooltip}
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <strong>{labels[hovered.barIdx]}</strong>
            <span>
              {datasets[hovered.datasetIdx].label}:{" "}
              <b>{formatNum(datasets[hovered.datasetIdx].data[hovered.barIdx])}{unit}</b>
            </span>
          </div>
        )}
      </div>

      {showLegend && datasets.length > 1 && (
        <ul className={styles.legend}>
          {datasets.map((ds) => (
            <li key={ds.label}>
              <span className={styles.legendDot} style={{ background: ds.color }} />
              {ds.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type BarsProps = {
  labels: string[];
  datasets: BarDataset[];
  computedMax: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  svgHeight: number;
  svgWidth: number;
  showValues: boolean;
  unit: string;
  barGroupGap: number;
  barGap: number;
  hovered: { datasetIdx: number; barIdx: number } | null;
  setHovered: (v: { datasetIdx: number; barIdx: number } | null) => void;
  setTooltipPos: (v: { x: number; y: number }) => void;
};

function VerticalBars({
  labels, datasets, computedMax,
  paddingTop, paddingBottom, paddingLeft, paddingRight,
  svgHeight, svgWidth, showValues, unit,
  barGroupGap, barGap, hovered, setHovered, setTooltipPos,
}: BarsProps) {
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const n = labels.length;
  const m = datasets.length;
  const groupW = chartW / n;
  const barGroupW = groupW * (1 - barGroupGap);
  const barW = (barGroupW - barGap * (m - 1) * barGroupW) / m;
  const gridLines = 4;

  return (
    <>
      {/* Grid lines */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = paddingTop + (chartH / gridLines) * i;
        const val = computedMax * (1 - i / gridLines);
        return (
          <g key={i}>
            <line
              x1={paddingLeft} y1={y}
              x2={svgWidth - paddingRight} y2={y}
              stroke="var(--chart-grid-color, #d6deea)"
              strokeWidth={0.8}
              strokeDasharray="5 4"
            />
            <text
              x={paddingLeft - 8} y={y + 4}
              textAnchor="end"
              fontSize={11}
              fontWeight={600}
              fill="var(--chart-axis-muted, #52627c)"
            >
              {Math.round(val)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {labels.map((label, barIdx) => {
        const groupX = paddingLeft + barIdx * groupW + (groupW - barGroupW) / 2;
        return (
          <g key={label}>
            {datasets.map((ds, dsIdx) => {
              const barX = groupX + dsIdx * (barW + barGap * barGroupW);
              const barH = (ds.data[barIdx] / computedMax) * chartH;
              const barY = paddingTop + chartH - barH;
              const isHov = hovered?.barIdx === barIdx && hovered?.datasetIdx === dsIdx;

              return (
                <g key={ds.label}>
                  <rect
                    x={barX} y={barY}
                    width={barW} height={barH}
                    fill={ds.color}
                    opacity={hovered && !isHov ? 0.35 : 1}
                    rx={4}
                    className={styles.bar}
                    onMouseEnter={(e) => {
                      setHovered({ datasetIdx: dsIdx, barIdx });
                      const svgRect = (e.currentTarget as SVGRectElement)
                        .closest("svg")!
                        .getBoundingClientRect();
                      const elRect = (e.currentTarget as SVGRectElement).getBoundingClientRect();
                      setTooltipPos({
                        x: elRect.left - svgRect.left + barW / 2,
                        y: elRect.top - svgRect.top - 8,
                      });
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {showValues && (
                    <text
                      x={barX + barW / 2}
                      y={Math.max(paddingTop - 6, barY - 6)}
                      textAnchor="middle"
                      fontSize={13}
                      fontWeight={800}
                      fill={ds.color}
                    >
                      {ds.data[barIdx]}{unit}
                    </text>
                  )}
                </g>
              );
            })}

      {label.includes("Năm") ? (
  (() => {
    const idx = label.indexOf("Năm");
    const line1 = label.slice(0, idx).trim();
    const line2 = label.slice(idx).trim();
    return (
      <>
        <text
          x={groupX + barGroupW / 2}
          y={svgHeight - paddingBottom + 18}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="var(--chart-axis-color, #1a2e24)"
        >
          {line1}
        </text>
        <text
          x={groupX + barGroupW / 2}
          y={svgHeight - paddingBottom + 33}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="var(--chart-axis-color, #1a2e24)"
        >
          {line2}
        </text>
      </>
    );
  })()
) : label.includes(" ") ? (
  (() => {
    const spaceIdx = label.lastIndexOf(" ");
    const line1 = label.slice(0, spaceIdx);
    const line2 = label.slice(spaceIdx + 1);
    return (
      <>
        <text x={groupX + barGroupW / 2} y={svgHeight - paddingBottom + 18} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--chart-axis-color, #1a2e24)">{line1}</text>
        <text x={groupX + barGroupW / 2} y={svgHeight - paddingBottom + 33} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--chart-axis-color, #1a2e24)">{line2}</text>
      </>
    );
  })()
) : (
  <text x={groupX + barGroupW / 2} y={svgHeight - paddingBottom + 18} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--chart-axis-color, #1a2e24)">{label}</text>
)}
          </g>
        );
      })}

      {/* X axis line */}
      <line
        x1={paddingLeft} y1={paddingTop + chartH}
        x2={svgWidth - paddingRight} y2={paddingTop + chartH}
        stroke="var(--chart-grid-color, #cbd5e4)"
        strokeWidth={1}
      />
    </>
  );
}

function HorizontalBars({
  labels, datasets, computedMax,
  paddingTop, paddingBottom, paddingLeft, paddingRight,
  svgHeight, svgWidth, showValues, unit,
  barGroupGap, barGap, hovered, setHovered, setTooltipPos,
}: BarsProps) {
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;
  const n = labels.length;
  const m = datasets.length;
  const groupH = chartH / n;
  const barGroupH = groupH * (1 - barGroupGap);
  const barH = (barGroupH - barGap * (m - 1) * barGroupH) / m;
  const gridLines = 4;

  return (
    <>
      {/* Grid lines */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const x = paddingLeft + (chartW / gridLines) * i;
        const val = (computedMax / gridLines) * i;
        return (
          <g key={i}>
            <line
              x1={x} y1={paddingTop}
              x2={x} y2={svgHeight - paddingBottom}
              stroke="var(--login-border)"
              strokeWidth={0.8}
              strokeDasharray="4 3"
            />
            <text
              x={x} y={svgHeight - paddingBottom + 14}
              textAnchor="middle"
              fontSize={11}
              fill="var(--login-text-muted)"
            >
              {Math.round(val)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {labels.map((label, barIdx) => {
        const groupY = paddingTop + barIdx * groupH + (groupH - barGroupH) / 2;
        return (
          <g key={label}>
            <text
              x={paddingLeft - 8} y={groupY + barGroupH / 2 + 4}
              textAnchor="end"
              fontSize={12}
              fontWeight={600}
              fill="var(--chart-axis-color, #1a2e24)"
            >
              {label}
            </text>

            {datasets.map((ds, dsIdx) => {
              const barY = groupY + dsIdx * (barH + barGap * barGroupH);
              const barW = (ds.data[barIdx] / computedMax) * chartW;
              const isHov = hovered?.barIdx === barIdx && hovered?.datasetIdx === dsIdx;

              return (
                <g key={ds.label}>
                  <rect
                    x={paddingLeft} y={barY}
                    width={barW} height={barH}
                    fill={ds.color}
                    opacity={hovered && !isHov ? 0.35 : 1}
                    rx={3}
                    className={styles.bar}
                    onMouseEnter={(e) => {
                      setHovered({ datasetIdx: dsIdx, barIdx });
                      const svgEl = (e.currentTarget as SVGRectElement)
                        .closest("svg")!
                        .getBoundingClientRect();
                      const el = (e.currentTarget as SVGRectElement).getBoundingClientRect();
                      setTooltipPos({
                        x: el.right - svgEl.left + 8,
                        y: el.top - svgEl.top,
                      });
                    }}
                    onMouseLeave={() => setHovered(null)}
                  />
                  {showValues && barW > 30 && (
                    <text
                      x={paddingLeft + barW - 6} y={barY + barH / 2 + 4}
                      textAnchor="end"
                      fontSize={12}
                      fontWeight={700}
                      fill="#fff"
                    >
                      {ds.data[barIdx]}{unit}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}

      {/* Y axis line */}
      <line
        x1={paddingLeft} y1={paddingTop}
        x2={paddingLeft} y2={svgHeight - paddingBottom}
        stroke="var(--login-border)"
        strokeWidth={1}
      />
    </>
  );
}