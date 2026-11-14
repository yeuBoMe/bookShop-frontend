import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

interface IProps {
    shares: ICategoryRevenueShare[];
}

const VIEW_SIZE = 220;
const RADIUS = 80;
const STROKE_WIDTH = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Đủ màu cho topLimit mặc định (10) cộng lát "Khác". */
const SLICE_COLORS = [
    "#1677ff", "#52c41a", "#faad14", "#f5222d", "#722ed1",
    "#13c2c2", "#eb2f96", "#fa8c16", "#2f54eb", "#a0d911",
    "#8c8c8c",
];

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} đ`;

/**
 * Biểu đồ tròn tỷ trọng doanh thu theo thể loại.
 *
 * Vẽ bằng stroke-dasharray trên đường tròn thay vì path cung: cung 360 độ có điểm đầu
 * trùng điểm cuối nên khi chỉ còn một thể loại thì hình biến mất, còn dasharray thì không.
 *
 * Phần trăm lấy nguyên từ backend, không tự chia lại — để biểu đồ, bảng số liệu và
 * file xuất ra luôn nói cùng một con số.
 */
const CategoryRevenuePie = ({ shares }: IProps) => {
    const { t } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const slices = useMemo(() => {
        let consumed = 0;
        return shares.map((share, index) => {
            const length = (share.percentage / 100) * CIRCUMFERENCE;
            const slice = {
                share,
                color: SLICE_COLORS[index % SLICE_COLORS.length],
                dashArray: `${length} ${CIRCUMFERENCE - length}`,
                dashOffset: -consumed,
            };
            consumed += length;
            return slice;
        });
    }, [shares]);

    if (shares.length === 0) {
        return <p className="dashboard-chart__empty">{t("admin.dashboard.noData")}</p>;
    }

    const totalRevenue = shares.reduce((sum, share) => sum + share.revenue, 0);
    const hovered = hoveredIndex !== null ? shares[hoveredIndex] : null;

    return (
        <div className="dashboard-pie">
            <div className="dashboard-pie__figure">
                <svg
                    viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
                    role="img"
                    aria-label={t("admin.dashboard.categoryShareAria")}
                >
                    {/* Xoay -90 độ để lát đầu tiên bắt đầu từ đỉnh vòng tròn */}
                    <g transform={`rotate(-90 ${VIEW_SIZE / 2} ${VIEW_SIZE / 2})`}>
                        {slices.map((slice, index) => (
                            <circle
                                key={`${slice.share.categoryId ?? "others"}-${slice.share.name}`}
                                cx={VIEW_SIZE / 2}
                                cy={VIEW_SIZE / 2}
                                r={RADIUS}
                                fill="none"
                                stroke={slice.color}
                                strokeWidth={hoveredIndex === index ? STROKE_WIDTH + 6 : STROKE_WIDTH}
                                strokeDasharray={slice.dashArray}
                                strokeDashoffset={slice.dashOffset}
                                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.35}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            />
                        ))}
                    </g>

                    <text className="dashboard-pie__center-label" x="50%" y="46%" textAnchor="middle">
                        {hovered ? `${hovered.percentage}%` : t("admin.dashboard.totalRevenue")}
                    </text>
                    <text className="dashboard-pie__center-value" x="50%" y="60%" textAnchor="middle">
                        {hovered ? hovered.name : formatMoney(totalRevenue)}
                    </text>
                </svg>
            </div>

            <ul className="dashboard-pie__legend">
                {slices.map((slice, index) => (
                    <li
                        key={`legend-${slice.share.categoryId ?? "others"}-${slice.share.name}`}
                        className={hoveredIndex === index ? "is-active" : undefined}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <span className="dashboard-pie__dot" style={{ background: slice.color }} />
                        <span className="dashboard-pie__name" title={slice.share.name}>
                            {slice.share.name}
                        </span>
                        <span className="dashboard-pie__percent">{slice.share.percentage}%</span>
                        <span className="dashboard-pie__money">{formatMoney(slice.share.revenue)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryRevenuePie;
