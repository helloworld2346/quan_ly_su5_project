import { useState } from "react";
import styles from "./LineChart.module.css";

export interface LineDataset {
  label: string;
  color: string;
  data: number[];
}

type LineChartProps = {
  labels: string[];
  datasets: LineDataset[];
  height?: number;
  showLegend?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  unit?: string;
  maxValue?: number;
  minValue?: number;
};

function formatNum(value: number) {
  return value.toLocaleString("vi-VN");
}

export default function LineChart({
  labels,
  datasets,
  height = 220,
  showLegend = true,
  showDots = true,
  showArea = true,
  unit = "",
  maxValue,
  minValue = 0,
}: LineChartProps) {
  const [hovered, setHovered] = useState<{ datasetIdx: number; pointIdx: number } | null>(null);

  const allValues = datasets.flatMap((d) => d.data);
  const computedMax = maxValue ?? Math.max(...allValues, 1);

  const paddingTop = 34;
  const paddingBottom = 38;
  const paddingLeft = 46;
  const paddingRight = 34;
  const svgWidth = 600;
  const svgHeight = height;
  const chartW = svgWidth - paddingLeft - paddingRight;
  const chartH = svgHeight - paddingTop - paddingBottom;

  const gridLines = 4;

  function getX(idx: number) {
    return paddingLeft + (idx / (labels.length - 1)) * chartW;
  }

  function getY(value: number) {
    const range = computedMax - minValue || 1;
    return paddingTop + chartH - ((value - minValue) / range) * chartH;
  }

  function buildPath(data: number[]) {
    return data
      .map((v, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(v)}`)
      .join(" ");
  }

  function buildArea(data: number[]) {
    const linePath = buildPath(data);
    const lastX = getX(data.length - 1);
    const baseY = paddingTop + chartH;
    return `${linePath} L ${lastX} ${baseY} L ${paddingLeft} ${baseY} Z`;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.chartArea} style={{ height }}>
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="none"
          className={styles.svg}
        >
          {Array.from({ length: gridLines + 1 }).map((_, i) => {
            const y = paddingTop + (chartH / gridLines) * i;
            const val = computedMax - (i / gridLines) * (computedMax - minValue);
            return (
              <g key={i}>
                <line
                  x1={paddingLeft} y1={y}
                  x2={svgWidth - paddingRight} y2={y}
                  stroke="var(--login-border)" strokeWidth={0.8} strokeDasharray="4 3"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize={11}
                  fontWeight={700}
                  fill="var(--chart-axis-color, #071b6f)"
                >
                  {Math.round(val)}{unit}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {labels.map((label, i) => (
            <text
              key={label}
              x={getX(i)}
              y={svgHeight - paddingBottom + 22}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="var(--chart-axis-color, #071b6f)"
            >
              {label}
            </text>
          ))}

          {/* X axis line */}
          <line
            x1={paddingLeft} y1={paddingTop + chartH}
            x2={svgWidth - paddingRight} y2={paddingTop + chartH}
            stroke="var(--login-border)" strokeWidth={1}
          />

          {/* Areas */}
          {showArea && datasets.map((ds, dsIdx) => (
            <path
              key={`area-${dsIdx}`}
              d={buildArea(ds.data)}
              fill={ds.color}
              opacity={0.08}
            />
          ))}

          {/* Lines */}
          {datasets.map((ds, dsIdx) => (
            <path
              key={`line-${dsIdx}`}
              d={buildPath(ds.data)}
              fill="none"
              stroke={ds.color}
              strokeWidth={2.2}
              opacity={1}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}

          {/* Dots */}
          {showDots && datasets.map((ds, dsIdx) =>
            ds.data.map((value, pointIdx) => {
              const isHov = hovered?.datasetIdx === dsIdx && hovered?.pointIdx === pointIdx;
              return (
                <circle
                  key={`dot-${dsIdx}-${pointIdx}`}
                  cx={getX(pointIdx)}
                  cy={getY(value)}
                  r={isHov ? 6 : 5}
                  fill={ds.color}
                  stroke="#ffffff"
                  strokeWidth={2.5}
                  className={styles.dot}
                 opacity={1}
                  onMouseEnter={() => setHovered({ datasetIdx: dsIdx, pointIdx })}
                  onMouseLeave={() => setHovered(null)}
                />
              );
            })
          )}

          {/* Tooltip */}
          {hovered && (() => {
            const ds = datasets[hovered.datasetIdx];
            const value = ds.data[hovered.pointIdx];
            const cx = getX(hovered.pointIdx);
            const cy = getY(value);
            const tipW = 160;
            const tipH = 52;
            const tipX = Math.min(cx - tipW / 2, svgWidth - paddingRight - tipW);
            const tipY = cy - tipH - 10;

            return (
              <g style={{ pointerEvents: "none" }}>
                <rect
                  x={tipX} y={tipY}
                  width={tipW} height={tipH}
                  rx={6}
                  fill="var(--tooltip-bg, #1a2e24)"
                  stroke="rgba(107,184,146,0.35)"
                  strokeWidth={1}
                />
                <text x={tipX + tipW / 2} y={tipY + 18} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--tooltip-fg, #f5faf7)">
                  {labels[hovered.pointIdx]}
                </text>
                <text x={tipX + tipW / 2} y={tipY + 36} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--tooltip-fg, #f5faf7)">
                  {ds.label}: {formatNum(value)}{unit}
                </text>
              </g>
            );
          })()}
        </svg>
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