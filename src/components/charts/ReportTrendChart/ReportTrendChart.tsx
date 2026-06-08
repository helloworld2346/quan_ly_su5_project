import { useState } from "react";
import styles from "./ReportTrendChart.module.css";

type ReportTrendChartProps = {
    labels: string[];
    values: number[];
    title?: string;
    description?: string;
    lineColor?: string;
    height?: number;
};

function formatNum(value: number) {
    return value.toLocaleString("vi-VN");
}

export default function ReportTrendChart({
    labels,
    values,
    title = "Biến động quân số hiện diện",
    description = "Theo dõi xu hướng quân số trong khoảng thời gian được chọn.",
    lineColor = "#3da0df",
    height = 420,
}: ReportTrendChartProps) {
    const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

    const maxValue = Math.max(...values, 1);
    const minRaw = Math.min(...values, maxValue);
    const minValue = Math.max(minRaw - 2, 0);
    const topValue = maxValue + 2;

    const paddingTop = 40;
    const paddingBottom = 80;
    const paddingLeft = 74;
    const paddingRight = 40;

    const svgWidth = 600;
    const svgHeight = height;
    const chartW = svgWidth - paddingLeft - paddingRight;
    const chartH = svgHeight - paddingTop - paddingBottom;
    const gridLines = 4;

    function getX(idx: number) {
        if (labels.length <= 1) return paddingLeft + chartW / 2;
        return paddingLeft + (idx / (labels.length - 1)) * chartW;
    }

    function getY(value: number) {
        const range = topValue - minValue || 1;
        return paddingTop + chartH - ((value - minValue) / range) * chartH;
    }

    function buildSmoothPath() {
        if (values.length < 2) return "";

        let d = `M ${getX(0)} ${getY(values[0])}`;

        for (let i = 0; i < values.length - 1; i++) {
            const x1 = getX(i);
            const y1 = getY(values[i]);

            const x2 = getX(i + 1);
            const y2 = getY(values[i + 1]);

            const cpX = (x1 + x2) / 2;

            d += `
            C
            ${cpX} ${y1},
            ${cpX} ${y2},
            ${x2} ${y2}
        `;
        }

        return d;
    }

    if (labels.length === 0 || values.length === 0) {
        return null;
    }

    return (
        <div className={styles.card}>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.desc}>{description}</p>

            <div className={styles.chartArea} style={{ height }}>
                <svg
                    width="100%"
                    height={svgHeight}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    preserveAspectRatio="none"
                    className={styles.svg}
                    onMouseLeave={() => setHoveredIdx(null)}
                >
                    {Array.from({ length: gridLines + 1 }).map((_, i) => {
                        const y = paddingTop + (chartH / gridLines) * i;
                        const val = topValue - (i / gridLines) * (topValue - minValue);

                        return (
                            <g key={i}>
                                <line
                                    x1={paddingLeft}
                                    y1={y}
                                    x2={svgWidth - paddingRight}
                                    y2={y}
                                    stroke="#d3dad6"
                                    strokeWidth={1.4}
                                    strokeDasharray="6 6"
                                />
                                <text
                                    x={paddingLeft - 20}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize={16}
                                    fontWeight={600}
                                    fill="#5f6763"
                                >
                                    {Math.round(val)}
                                </text>
                            </g>
                        );
                    })}

                    {labels.map((label, i) => (
                        <text
                            key={`${label}-${i}`}
                            x={getX(i)}
                            y={svgHeight - paddingBottom + 34}
                            textAnchor="middle"
                            fontSize={15}
                            fontWeight={600}
                            fill="#5f6763"
                        >
                            {label}
                        </text>
                    ))}

                    <line
                        x1={paddingLeft}
                        y1={paddingTop + chartH}
                        x2={svgWidth - paddingRight}
                        y2={paddingTop + chartH}
                        stroke="#d2d9d5"
                        strokeWidth={1}
                    />

                    <path
                        d={buildSmoothPath()}
                        fill="none"
                        stroke={lineColor}
                        strokeWidth={3}
                        strokeLinecap="round"
                    />

                    {values.map((_, idx) => {
                        const x = getX(idx);
                        const nextX =
                            idx === labels.length - 1
                                ? svgWidth - paddingRight
                                : getX(idx + 1);

                        const prevX =
                            idx === 0
                                ? paddingLeft
                                : getX(idx - 1);

                        const targetW = Math.max((nextX - prevX) / 2, 24);

                        return (
                            <rect
                                key={`target-${idx}`}
                                x={x - targetW / 2}
                                y={paddingTop}
                                width={targetW}
                                height={chartH}
                                fill="transparent"
                                className={styles.hoverTarget}
                                onMouseEnter={() => setHoveredIdx(idx)}

                            />
                        );
                    })}

                    {hoveredIdx !== null && (() => {
                        const value = values[hoveredIdx];
                        const cx = getX(hoveredIdx);
                        const cy = getY(value);

                        const tipW = 220;
                        const tipH = 100;
                        const tipX = Math.max(
                            paddingLeft + 6,
                            Math.min(cx + 8, svgWidth - paddingRight - tipW),
                        );
                        const tipY = Math.max(
                            paddingTop + 6,
                            Math.min(cy + 10, paddingTop + chartH - tipH - 6),
                        );

                        return (
                            <g style={{ pointerEvents: "none" }}>
                                <line
                                    x1={cx}
                                    y1={paddingTop}
                                    x2={cx}
                                    y2={paddingTop + chartH}
                                    stroke="#e5e7eb"
                                    strokeWidth={1}
                                />

                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={4.5}
                                    fill={lineColor}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                />

                                <rect
                                    x={tipX}
                                    y={tipY}
                                    width={tipW}
                                    height={tipH}
                                    rx={20}
                                    fill="#ffffff"
                                    stroke="#e5e7eb"
                                    strokeWidth={1}
                                    className={styles.tooltipBox}
                                />

                                <text
                                    x={tipX + 20}
                                    y={tipY + 38}
                                    fontSize={15}
                                    fontWeight={700}
                                >
                                    {labels[hoveredIdx]}
                                </text>

                                <circle
                                    cx={tipX + 22}
                                    cy={tipY + 72}
                                    r={5}
                                    fill={lineColor}
                                />

                                <text
                                    x={tipX + 42}
                                    y={tipY + 77}
                                    fontSize={15}
                                    fontWeight={600}
                                >
                                    Hiện diện
                                </text>

                                <text
                                    x={tipX + tipW - 24}
                                    y={tipY + 77}
                                    textAnchor="end"
                                    fontSize={16}
                                    fontWeight={800}
                                >
                                    {formatNum(value)}
                                </text>
                            </g>
                        );
                    })()}
                </svg>
            </div>
        </div>
    );
}