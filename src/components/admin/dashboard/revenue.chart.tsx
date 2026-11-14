import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
    points: IRevenuePoint[];
}

const VIEW_WIDTH = 720;
const VIEW_HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 56 };

const formatCompact = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}tr`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(Math.round(value));
};

const formatDayLabel = (isoDay: string) => {
    const [, month, day] = isoDay.split("-");
    return `${day}/${month}`;
};

/**
 * Biểu đồ doanh thu theo ngày, vẽ bằng SVG thuần.
 *
 * Cố ý KHÔNG thêm thư viện biểu đồ: cả dự án mới cần đúng một biểu đồ, mà mỗi thư viện
 * chart đều kéo theo vài trăm KB vào bundle vốn đã cảnh báo vượt 900KB.
 */
const RevenueChart = ({ points }: IProps) => {
    const { t } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const chart = useMemo(() => {
        if (points.length === 0) {
            return null;
        }

        const maxRevenue = Math.max(...points.map((point) => point.revenue), 1);
        const innerWidth = VIEW_WIDTH - PADDING.left - PADDING.right;
        const innerHeight = VIEW_HEIGHT - PADDING.top - PADDING.bottom;

        // Một điểm duy nhất thì đặt giữa thay vì dồn về mép trái
        const stepX = points.length > 1 ? innerWidth / (points.length - 1) : 0;

        const coordinates = points.map((point, index) => ({
            x: points.length > 1 ? PADDING.left + index * stepX : PADDING.left + innerWidth / 2,
            y: PADDING.top + innerHeight - (point.revenue / maxRevenue) * innerHeight,
            point,
        }));

        const linePath = coordinates
            .map((item, index) => `${index === 0 ? "M" : "L"} ${item.x} ${item.y}`)
            .join(" ");

        const areaPath =
            `${linePath} L ${coordinates[coordinates.length - 1].x} ${PADDING.top + innerHeight}` +
            ` L ${coordinates[0].x} ${PADDING.top + innerHeight} Z`;

        return { coordinates, linePath, areaPath, maxRevenue, innerHeight };
    }, [points]);

    if (!chart) {
        return <p className="dashboard-chart__empty">{t("admin.dashboard.noData")}</p>;
    }

    const { coordinates, linePath, areaPath, maxRevenue, innerHeight } = chart;
    const gridValues = [0, 0.5, 1];
    const hovered = hoveredIndex !== null ? coordinates[hoveredIndex] : null;

    return (
        <div className="dashboard-chart">
            <svg
                viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
                role="img"
                aria-label={t("admin.dashboard.revenueChartAria")}
                preserveAspectRatio="xMidYMid meet"
            >
                {gridValues.map((ratio) => {
                    const y = PADDING.top + innerHeight - ratio * innerHeight;
                    return (
                        <g key={ratio}>
                            <line
                                className="dashboard-chart__grid"
                                x1={PADDING.left}
                                y1={y}
                                x2={VIEW_WIDTH - PADDING.right}
                                y2={y}
                            />
                            <text className="dashboard-chart__axis" x={PADDING.left - 8} y={y + 4} textAnchor="end">
                                {formatCompact(maxRevenue * ratio)}
                            </text>
                        </g>
                    );
                })}

                <path className="dashboard-chart__area" d={areaPath} />
                <path className="dashboard-chart__line" d={linePath} />

                {coordinates.map((item, index) => (
                    <circle
                        key={item.point.day}
                        className={
                            hoveredIndex === index
                                ? "dashboard-chart__dot dashboard-chart__dot--active"
                                : "dashboard-chart__dot"
                        }
                        cx={item.x}
                        cy={item.y}
                        r={hoveredIndex === index ? 5 : 3}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    />
                ))}

                {coordinates
                    // Nhiều ngày thì chỉ ghi nhãn thưa ra cho khỏi chồng chữ
                    .filter((_, index) => index % Math.ceil(coordinates.length / 8) === 0)
                    .map((item) => (
                        <text
                            key={`label-${item.point.day}`}
                            className="dashboard-chart__axis"
                            x={item.x}
                            y={VIEW_HEIGHT - 8}
                            textAnchor="middle"
                        >
                            {formatDayLabel(item.point.day)}
                        </text>
                    ))}
            </svg>

            {hovered && (
                <div className="dashboard-chart__tooltip">
                    <strong>{formatDayLabel(hovered.point.day)}</strong>
                    <span>{hovered.point.revenue.toLocaleString("vi-VN")} đ</span>
                    <span>
                        {hovered.point.orderCount} {t("admin.dashboard.orders").toLowerCase()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default RevenueChart;
