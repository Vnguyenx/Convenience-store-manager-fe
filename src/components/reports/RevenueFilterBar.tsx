// src/components/reports/RevenueFilterBar.tsx
import React from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setQuery, RevenueQuery } from '../../store/reportSlice';
import Button from '../common/Button';

interface Props {
    onApply: () => void;
}

// Preset khoảng ngày nhanh
const PRESETS: { label: string; getDates: () => { from: string; to: string } }[] = [
    {
        label: 'Hôm nay',
        getDates: () => {
            const t = new Date().toISOString().split('T')[0];
            return { from: t, to: t };
        },
    },
    {
        label: '7 ngày',
        getDates: () => {
            const to = new Date();
            const from = new Date();
            from.setDate(from.getDate() - 6);
            return {
                from: from.toISOString().split('T')[0],
                to: to.toISOString().split('T')[0],
            };
        },
    },
    {
        label: '30 ngày',
        getDates: () => {
            const to = new Date();
            const from = new Date();
            from.setDate(from.getDate() - 29);
            return {
                from: from.toISOString().split('T')[0],
                to: to.toISOString().split('T')[0],
            };
        },
    },
    {
        label: 'Tháng này',
        getDates: () => {
            const now = new Date();
            const from = new Date(now.getFullYear(), now.getMonth(), 1);
            return {
                from: from.toISOString().split('T')[0],
                to: now.toISOString().split('T')[0],
            };
        },
    },
    {
        label: 'Năm nay',
        getDates: () => {
            const now = new Date();
            const from = new Date(now.getFullYear(), 0, 1);
            return {
                from: from.toISOString().split('T')[0],
                to: now.toISOString().split('T')[0],
            };
        },
    },
];

// Validate "YYYY-MM-DD"
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isValidDate(d: string) {
    return DATE_RE.test(d) && !isNaN(Date.parse(d));
}

const RevenueFilterBar: React.FC<Props> = ({ onApply }) => {
    const dispatch = useAppDispatch();
    const query = useAppSelector((s) => s.report.query);

    const [localFrom, setLocalFrom] = React.useState(query.from ?? '');
    const [localTo,   setLocalTo]   = React.useState(query.to   ?? '');
    const [error, setError] = React.useState<string | null>(null);

    // Đồng bộ khi query thay đổi từ bên ngoài (preset)
    React.useEffect(() => {
        setLocalFrom(query.from ?? '');
        setLocalTo(query.to   ?? '');
        setError(null);
    }, [query.from, query.to]);

    const applyPreset = (preset: typeof PRESETS[number]) => {
        const { from, to } = preset.getDates();
        dispatch(setQuery({ from, to }));
        // Không cần set local vì useEffect sẽ sync
        setError(null);
    };

    const handleApply = () => {
        // Validate
        if (localFrom && !isValidDate(localFrom)) {
            setError('Ngày bắt đầu không hợp lệ');
            return;
        }
        if (localTo && !isValidDate(localTo)) {
            setError('Ngày kết thúc không hợp lệ');
            return;
        }
        if (localFrom && localTo && localFrom > localTo) {
            setError('Ngày bắt đầu phải trước hoặc bằng ngày kết thúc');
            return;
        }
        setError(null);
        dispatch(setQuery({ from: localFrom || null, to: localTo || null }));
        onApply();
    };

    const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setQuery({ groupBy: e.target.value as RevenueQuery['groupBy'] }));
    };

    const handleCompareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setQuery({ compare: e.target.checked }));
    };

    const handleTopLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch(setQuery({ topLimit: Number(e.target.value) }));
    };

    return (
        <div className="revenue-filter-bar">
            {/* Preset buttons */}
            <div className="revenue-filter-bar__presets">
                {PRESETS.map((p) => (
                    <Button
                        key={p.label}
                        variant="secondary"
                        size="sm"
                        onClick={() => applyPreset(p)}
                    >
                        {p.label}
                    </Button>
                ))}
            </div>

            {/* Date pickers */}
            <div className="revenue-filter-bar__dates">
                <div className="revenue-filter-bar__field">
                    <label>Từ ngày</label>
                    <input
                        type="date"
                        value={localFrom}
                        max={localTo || undefined}
                        onChange={(e) => setLocalFrom(e.target.value)}
                    />
                </div>
                <span className="revenue-filter-bar__sep">—</span>
                <div className="revenue-filter-bar__field">
                    <label>Đến ngày</label>
                    <input
                        type="date"
                        value={localTo}
                        min={localFrom || undefined}
                        max={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setLocalTo(e.target.value)}
                    />
                </div>
                <Button variant="primary" size="sm" onClick={handleApply}>
                    Áp dụng
                </Button>
            </div>

            {error && <p className="revenue-filter-bar__error">{error}</p>}

            {/* Additional controls */}
            <div className="revenue-filter-bar__controls">
                <div className="revenue-filter-bar__field">
                    <label>Nhóm theo</label>
                    <select value={query.groupBy} onChange={handleGroupByChange}>
                        <option value="day">Ngày</option>
                        <option value="month">Tháng</option>
                    </select>
                </div>

                <div className="revenue-filter-bar__field">
                    <label>Top sản phẩm</label>
                    <select value={query.topLimit} onChange={handleTopLimitChange}>
                        {[5, 10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                Top {n}
                            </option>
                        ))}
                    </select>
                </div>

                <label className="revenue-filter-bar__compare-toggle">
                    <input
                        type="checkbox"
                        checked={query.compare}
                        onChange={handleCompareChange}
                    />
                    So sánh kỳ trước
                </label>
            </div>
        </div>
    );
};

export default RevenueFilterBar;