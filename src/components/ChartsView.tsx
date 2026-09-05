import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Zap,
  Clock,
  Sparkles,
  Award,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';
import {
  BenchmarkConfig,
  PlotMetric,
  ScaleType,
  SizeBenchmarkData,
} from '../types';
import { computeTheoreticalCurves } from '../utils/complexity';

interface ChartsViewProps {
  data: SizeBenchmarkData[];
  config: BenchmarkConfig;
  isRunning: boolean;
}

export const ChartsView: React.FC<ChartsViewProps> = ({
  data,
  config,
  isRunning,
}) => {
  const [plotType, setPlotType] = useState<'line' | 'bar'>('line');
  const [metric, setMetric] = useState<PlotMetric>('time');
  const [scaleType, setScaleType] = useState<ScaleType>('linear');
  const [showTheoretical, setShowTheoretical] = useState(false);
  const [baselineAlgo, setBaselineAlgo] = useState<string>('quickSort');
  const [hiddenAlgorithms, setHiddenAlgorithms] = useState<Record<string, boolean>>({});
  const [highlightedAlgo, setHighlightedAlgo] = useState<string | null>(null);

  // Toggle individual algorithm line
  const toggleVisibility = (algoId: string) => {
    setHiddenAlgorithms((prev) => ({
      ...prev,
      [algoId]: !prev[algoId],
    }));
  };

  // Show only one
  const isolateAlgorithm = (algoId: string) => {
    const newHidden: Record<string, boolean> = {};
    config.selectedAlgorithms.forEach((id) => {
      if (id !== algoId) newHidden[id] = true;
    });
    setHiddenAlgorithms(newHidden);
  };

  const showAllAlgorithms = () => {
    setHiddenAlgorithms({});
  };

  // Calculate formatted chart data
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const sizes = data.map((d) => d.size);
    const theoreticalCurves = showTheoretical
      ? computeTheoreticalCurves(sizes, baselineAlgo, data)
      : [];

    return data.map((row, idx) => {
      const point: Record<string, any> = {
        size: row.size,
        sizeFormatted: row.size >= 1000 ? `${(row.size / 1000).toFixed(0)}k` : `${row.size}`,
      };

      // Add algorithm metric values
      config.selectedAlgorithms.forEach((algoId) => {
        const stats = row[algoId] as any;
        if (!stats || stats.timedOut || stats.meanTimeMs < 0) {
          point[algoId] = null;
          return;
        }

        switch (metric) {
          case 'time':
            point[algoId] = stats.meanTimeMs;
            break;
          case 'throughput':
            // Elements per second = Size / (time in seconds)
            const timeSec = stats.meanTimeMs / 1000;
            point[algoId] = timeSec > 0 ? Math.round(row.size / timeSec) : 0;
            break;
          case 'comparisons':
            point[algoId] = stats.comparisons >= 0 ? stats.comparisons : null;
            break;
          case 'swaps':
            point[algoId] = stats.swaps >= 0 ? stats.swaps : null;
            break;
          case 'ops':
            point[algoId] =
              stats.comparisons >= 0 && stats.writes >= 0
                ? stats.comparisons + stats.writes
                : null;
            break;
          default:
            point[algoId] = stats.meanTimeMs;
        }
      });

      // Add theoretical points if enabled
      if (showTheoretical && theoreticalCurves[idx]) {
        point['Theoretical O(n)'] = theoreticalCurves[idx]['Theoretical O(n)'];
        point['Theoretical O(n log n)'] = theoreticalCurves[idx]['Theoretical O(n log n)'];
        point['Theoretical O(n^2)'] = theoreticalCurves[idx]['Theoretical O(n^2)'];
      }

      return point;
    });
  }, [data, config.selectedAlgorithms, metric, showTheoretical, baselineAlgo]);

  // Overall winner / fastest algorithm
  const summaryInsights = useMemo(() => {
    if (!data || data.length === 0) return null;
    const lastRow = data[data.length - 1];
    if (!lastRow) return null;

    let fastestAlgo = '';
    let fastestTime = Infinity;
    let slowestAlgo = '';
    let slowestTime = -1;

    config.selectedAlgorithms.forEach((id) => {
      const stats = lastRow[id] as any;
      if (stats && stats.meanTimeMs > 0) {
        if (stats.meanTimeMs < fastestTime) {
          fastestTime = stats.meanTimeMs;
          fastestAlgo = id;
        }
        if (stats.meanTimeMs > slowestTime) {
          slowestTime = stats.meanTimeMs;
          slowestAlgo = id;
        }
      }
    });

    const speedup =
      slowestTime > 0 && fastestTime > 0 ? (slowestTime / fastestTime).toFixed(1) : '1';

    return {
      maxSize: lastRow.size,
      fastestName: ALGORITHMS[fastestAlgo]?.info.name || fastestAlgo,
      fastestColor: ALGORITHMS[fastestAlgo]?.info.color || '#3B82F6',
      fastestTime: fastestTime === Infinity ? 'N/A' : `${fastestTime.toFixed(2)} ms`,
      slowestName: ALGORITHMS[slowestAlgo]?.info.name || slowestAlgo,
      slowestTime: slowestTime === -1 ? 'N/A' : `${slowestTime.toFixed(2)} ms`,
      speedupRatio: speedup,
    };
  }, [data, config.selectedAlgorithms]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    // Sort entries by value for clear rank presentation
    const sortedPayload = [...payload]
      .filter((p) => p.value !== null && p.value !== undefined)
      .sort((a, b) => {
        if (metric === 'throughput') return b.value - a.value;
        return a.value - b.value;
      });

    return (
      <div className="bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl text-xs space-y-2.5 max-w-xs z-50">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 font-semibold text-slate-900">
          <span>Array Size (N = {Number(label).toLocaleString()})</span>
          <span className="text-[10px] text-slate-400 font-normal capitalize">
            {config.distribution}
          </span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {sortedPayload.map((entry: any, index: number) => {
            const isTheoretical = entry.name.startsWith('Theoretical');
            const algoInfo = ALGORITHMS[entry.dataKey]?.info;

            return (
              <div
                key={entry.dataKey || entry.name}
                className="flex items-center justify-between gap-3 text-slate-700"
              >
                <div className="flex items-center gap-2 truncate">
                  {!isTheoretical && (
                    <span className="text-[10px] text-slate-400 font-mono w-3.5">
                      #{index + 1}
                    </span>
                  )}
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate font-medium">
                    {algoInfo ? algoInfo.name : entry.name}
                  </span>
                </div>
                <span className="font-mono font-semibold text-slate-900 shrink-0">
                  {metric === 'time' && `${Number(entry.value).toFixed(3)} ms`}
                  {metric === 'throughput' &&
                    `${Number(entry.value).toLocaleString()} ops/s`}
                  {(metric === 'comparisons' || metric === 'swaps' || metric === 'ops') &&
                    Number(entry.value).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'time':
        return 'Execution Time (Milliseconds)';
      case 'throughput':
        return 'Throughput (Elements / sec)';
      case 'comparisons':
        return 'Element Comparisons Count';
      case 'swaps':
        return 'Swaps / Writes Count';
      case 'ops':
        return 'Total Operations (Comparisons + Writes)';
      default:
        return 'Execution Time (ms)';
    }
  };

  return (
    <div id="charts-view-container" className="space-y-6">
      {/* Top Insights Card Bar (Clean Minimalism Bento Grid) */}
      {summaryInsights && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                Fastest Execution
              </div>
              <div className="text-3xl font-light text-slate-900 flex items-baseline gap-2">
                <span>{summaryInsights.fastestTime.split(' ')[0]}</span>
                <span className="text-base text-slate-500 font-normal">ms</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: summaryInsights.fastestColor }}
              />
              <span className="text-xs font-medium text-slate-700 truncate">
                {summaryInsights.fastestName} (N={summaryInsights.maxSize.toLocaleString()})
              </span>
            </div>
            <div className="text-[10px] text-emerald-600 mt-2 font-medium tracking-wide uppercase">
              Optimal Detected
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                Performance Spread
              </div>
              <div className="text-3xl font-light text-slate-900 flex items-baseline gap-2">
                <span>{summaryInsights.speedupRatio}</span>
                <span className="text-base text-slate-500 font-normal">x Multiplier</span>
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-4 truncate">
              {summaryInsights.fastestName} vs {summaryInsights.slowestName}
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-medium uppercase">
              Peak Spread at N = {summaryInsights.maxSize.toLocaleString()}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
                Array Distribution
              </div>
              <div className="text-3xl font-light text-slate-900 capitalize truncate">
                {config.distribution.replace('_', ' ')}
              </div>
            </div>
            <div className="text-xs text-slate-600 mt-4">
              {config.iterations} benchmark iterations averaged
            </div>
            <div className="text-[10px] text-slate-400 mt-2 font-medium uppercase">
              JIT Warmup Active
            </div>
          </div>
        </div>
      )}

      {/* Main Chart Canvas Box */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        {/* Controls Toolbar above Chart */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Execution Performance Analysis
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              {getMetricLabel()} vs Input Elements (N)
            </p>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Selector Tabs */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/50 text-xs">
              <button
                id="metric-tab-time"
                onClick={() => setMetric('time')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  metric === 'time'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Time (ms)
              </button>
              <button
                id="metric-tab-throughput"
                onClick={() => setMetric('throughput')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  metric === 'throughput'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Throughput
              </button>
              <button
                id="metric-tab-comparisons"
                onClick={() => setMetric('comparisons')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  metric === 'comparisons'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Comparisons
              </button>
              <button
                id="metric-tab-swaps"
                onClick={() => setMetric('swaps')}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
                  metric === 'swaps'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Swaps/Writes
              </button>
            </div>

            {/* Plot Controls (Scale, Chart type, Curves) */}
            <div className="flex items-center gap-2 text-xs">
              {/* Scale toggle */}
              <div className="flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/50">
                <button
                  id="scale-linear"
                  onClick={() => setScaleType('linear')}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    scaleType === 'linear'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Linear
                </button>
                <button
                  id="scale-log"
                  onClick={() => setScaleType('logarithmic')}
                  className={`px-3 py-1 rounded-full font-medium transition-all ${
                    scaleType === 'logarithmic'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Log-Log
                </button>
              </div>

              {/* Chart Type toggle */}
              <div className="flex items-center bg-slate-100/80 p-1 rounded-full border border-slate-200/50">
                <button
                  id="chart-type-line"
                  onClick={() => setPlotType('line')}
                  className={`p-1.5 rounded-full transition-all ${
                    plotType === 'line'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Line Chart"
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  id="chart-type-bar"
                  onClick={() => setPlotType('bar')}
                  className={`p-1.5 rounded-full transition-all ${
                    plotType === 'bar'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Grouped Bar Chart"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Theoretical Curves Toggle */}
              {metric === 'time' && plotType === 'line' && (
                <button
                  id="toggle-theoretical-curves"
                  onClick={() => setShowTheoretical(!showTheoretical)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    showTheoretical
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-100/80 text-slate-600 border-slate-200/60 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Theoretical Asymptotes</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Responsive Recharts Display */}
        <div className="h-[440px] w-full pt-2">
          {chartData.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <TrendingUp className="w-8 h-8 opacity-30 text-slate-500" />
              <p className="text-sm font-medium text-slate-600">No benchmark data plotted yet.</p>
              <p className="text-xs text-slate-400">
                Click "Run Benchmark" above to begin measuring execution times.
              </p>
            </div>
          ) : plotType === 'line' ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 15, right: 30, left: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="size"
                  scale={scaleType === 'logarithmic' ? 'log' : 'auto'}
                  domain={['auto', 'auto']}
                  tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                  stroke="#cbd5e1"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{
                    value: 'Input Array Size (N elements)',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  scale={scaleType === 'logarithmic' ? 'log' : 'auto'}
                  domain={['auto', 'auto']}
                  stroke="#cbd5e1"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{
                    value: getMetricLabel(),
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 0,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Algorithm Lines */}
                {config.selectedAlgorithms.map((algoId) => {
                  const algo = ALGORITHMS[algoId];
                  if (!algo || hiddenAlgorithms[algoId]) return null;

                  const isHighlighted = highlightedAlgo === algoId;
                  const isDimmed = highlightedAlgo !== null && !isHighlighted;

                  return (
                    <Line
                      key={algoId}
                      type="monotone"
                      dataKey={algoId}
                      name={algo.info.name}
                      stroke={algo.info.color}
                      strokeWidth={isHighlighted ? 3.5 : 2}
                      strokeOpacity={isDimmed ? 0.2 : 1}
                      dot={{ r: isHighlighted ? 5 : 3.5, fill: algo.info.color }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  );
                })}

                {/* Theoretical overlay curves */}
                {showTheoretical && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="Theoretical O(n)"
                      stroke="#10B981"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Theoretical O(n log n)"
                      stroke="#64748B"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="Theoretical O(n^2)"
                      stroke="#EF4444"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 30, left: 15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="size"
                  tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                  stroke="#cbd5e1"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{
                    value: 'Input Array Size (N)',
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#64748b',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  scale={scaleType === 'logarithmic' ? 'log' : 'auto'}
                  stroke="#cbd5e1"
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  label={{
                    value: getMetricLabel(),
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 0,
                  }}
                />
                <Tooltip content={<CustomTooltip />} />

                {config.selectedAlgorithms.map((algoId) => {
                  const algo = ALGORITHMS[algoId];
                  if (!algo || hiddenAlgorithms[algoId]) return null;

                  return (
                    <Bar
                      key={algoId}
                      dataKey={algoId}
                      name={algo.info.name}
                      fill={algo.info.color}
                      radius={[4, 4, 0, 0]}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Interactive Legend & Filter Pills */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Active Series:
            </span>
            {config.selectedAlgorithms.map((algoId) => {
              const algo = ALGORITHMS[algoId];
              if (!algo) return null;
              const isHidden = hiddenAlgorithms[algoId];

              return (
                <button
                  key={algoId}
                  id={`legend-pill-${algoId}`}
                  onClick={() => toggleVisibility(algoId)}
                  onMouseEnter={() => setHighlightedAlgo(algoId)}
                  onMouseLeave={() => setHighlightedAlgo(null)}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                    isHidden
                      ? 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-50'
                      : 'bg-white text-slate-700 border-slate-200 shadow-xs hover:border-slate-400'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isHidden ? '#cbd5e1' : algo.info.color }}
                  />
                  <span>{algo.info.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={showAllAlgorithms}
              className="text-slate-500 hover:text-slate-900 font-medium transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
