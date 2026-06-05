import { useState } from "react";
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

    const allValues = datasets.flatMap((d) => d.data);
    const computedMax = maxValue ?? Math.max(...allValues, 1);

    const isVertical = orientation === "vertical";


    const paddingTop = height <= 220 ? 42 : 34;
    const paddingBottom = isVertical ? (height <= 220 ? 52 : 44) : 20;
    const paddingLeft = isVertical ? (height <= 220 ? 46 : 42) : 120;
    const paddingRight = height <= 220 ? 30 : 24;
    const svgWidth = "100%";
    const svgHeight = height;
    const barGroupGap = height <= 220 ? 0.5 : 0.42;
    const barGap = 0.1;

    return (
        <div className={styles.wrapper}>
            <div className={styles.chartArea} style={{ height }}>
                <svg
                    width={svgWidth}
                    height={svgHeight}
                    className={styles.svg}
                    viewBox={`0 0 600 ${height}`}
                    preserveAspectRatio="xMidYMid meet"
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
                            svgHeight={height}
                            svgWidth={600}
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
                            svgHeight={height}
                            svgWidth={600}
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

            {Array.from({ length: gridLines + 1 }).map((_, i) => {
                const y = paddingTop + (chartH / gridLines) * i;
                const val = computedMax * (1 - i / gridLines);
                return (
                    <g key={i}>
                        <line
                            x1={paddingLeft} y1={y}
                            x2={svgWidth - paddingRight} y2={y}
                            stroke="var(--chart-grid-color, #d6deea)" strokeWidth={0.8} strokeDasharray="5 4"
                        />
                        <text
                            x={paddingLeft - 8} y={y + 4}
                            textAnchor="end" fontSize={12} fontWeight={700}
                            fill="var(--chart-axis-muted, #52627c)"
                        >
                            {Math.round(val)}
                        </text>
                    </g>
                );
            })}

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
                                            const rect = (e.target as SVGRectElement).closest("svg")!.getBoundingClientRect();
                                            const svgRect = (e.target as SVGRectElement).getBoundingClientRect();
                                            setTooltipPos({
                                                x: svgRect.left - rect.left + barW / 2,
                                                y: svgRect.top - rect.top - 8,
                                            });
                                        }}
                                        onMouseLeave={() => setHovered(null)}
                                    />
                             {showValues && (
    <text
        x={barX + barW / 2}
        y={Math.max(14, barY - 8)}
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
        fill="var(--chart-value-color, #071b6f)"
    >
        {ds.data[barIdx]}{unit}
    </text>
)}
                                </g>
                            );
                        })}

                    <text
    x={groupX + barGroupW / 2}
    y={svgHeight - paddingBottom + 20}
    textAnchor="middle"
    fontSize={12}
    fontWeight={800}
    fill="var(--chart-axis-color, #071b6f)"
>
                            {label}
                        </text>
                    </g>
                );
            })}

            <line
                x1={paddingLeft} y1={paddingTop + chartH}
                x2={svgWidth - paddingRight} y2={paddingTop + chartH}
                stroke="var(--chart-grid-color, #cbd5e4)" strokeWidth={1}
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

            {Array.from({ length: gridLines + 1 }).map((_, i) => {
                const x = paddingLeft + (chartW / gridLines) * i;
                const val = (computedMax / gridLines) * i;
                return (
                    <g key={i}>
                        <line
                            x1={x} y1={paddingTop}
                            x2={x} y2={svgHeight - paddingBottom}
                            stroke="var(--login-border)" strokeWidth={0.8} strokeDasharray="4 3"
                        />
                        <text
                            x={x} y={svgHeight - paddingBottom + 14}
                            textAnchor="middle" fontSize={10}
                            fill="var(--login-text-muted)"
                        >
                            {Math.round(val)}
                        </text>
                    </g>
                );
            })}


            {labels.map((label, barIdx) => {
                const groupY = paddingTop + barIdx * groupH + (groupH - barGroupH) / 2;
                return (
                    <g key={label}>

                        <text
                            x={paddingLeft - 8} y={groupY + barGroupH / 2 + 4}
                            textAnchor="end" fontSize={11}
                            fill="var(--login-text-muted)"
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
                                            const svgEl = (e.target as SVGRectElement).closest("svg")!.getBoundingClientRect();
                                            const el = (e.target as SVGRectElement).getBoundingClientRect();
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
                                            textAnchor="end" fontSize={10} fontWeight={700}
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


            <line
                x1={paddingLeft} y1={paddingTop}
                x2={paddingLeft} y2={svgHeight - paddingBottom}
                stroke="var(--login-border)" strokeWidth={1}
            />
        </>
    );
}
