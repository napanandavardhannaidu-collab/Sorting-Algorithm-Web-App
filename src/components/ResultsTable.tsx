import React, { useState } from 'react';
import { 
  Download, 
  FileSpreadsheet, 
  FileCode, 
  Copy, 
  Check, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight,
  Award
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';
import { BenchmarkConfig, MetricStats, SizeBenchmarkData } from '../types';
import { downloadFile, exportToCSV } from '../utils/complexity';

interface ResultsTableProps {
  data: SizeBenchmarkData[];
  config: BenchmarkConfig;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ data, config }) => {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState(false);

  const toggleRow = (size: number) => {
    setExpandedRows((prev) => ({ ...prev, [size]: !prev[size] }));
  };

  const handleExportCSV = () => {
    const csvContent = exportToCSV(data, config.selectedAlgorithms);
    downloadFile(csvContent, `sort-benchmark-${config.distribution}-${Date.now()}.csv`, 'text/csv');
  };

  const handleExportJSON = () => {
    const jsonContent = JSON.stringify(
      {
        benchmarkConfig: config,
        timestamp: new Date().toISOString(),
        results: data,
      },
      null,
      2
    );
    downloadFile(
      jsonContent,
      `sort-benchmark-${config.distribution}-${Date.now()}.json`,
      'application/json'
    );
  };

  const handleCopyMarkdown = () => {
    let md = `### Sorting Algorithm Benchmark Results (${config.distribution})\n\n`;
    const headers = ['Size (N)', ...config.selectedAlgorithms.map((id) => ALGORITHMS[id]?.info.name || id)];
    md += `| ${headers.join(' | ')} |\n`;
    md += `| ${headers.map(() => '---').join(' | ')} |\n`;

    data.forEach((row) => {
      const rowCells = [
        row.size.toLocaleString(),
        ...config.selectedAlgorithms.map((id) => {
          const stats = row[id] as MetricStats;
          if (!stats || stats.meanTimeMs < 0) return 'N/A';
          return `${stats.meanTimeMs.toFixed(3)} ms`;
        }),
      ];
      md += `| ${rowCells.join(' | ')} |\n`;
    });

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Find fastest algorithm per row
  const getFastestInRow = (row: SizeBenchmarkData) => {
    let minTime = Infinity;
    let fastestId = '';
    config.selectedAlgorithms.forEach((id) => {
      const stats = row[id] as MetricStats;
      if (stats && stats.meanTimeMs > 0 && stats.meanTimeMs < minTime) {
        minTime = stats.meanTimeMs;
        fastestId = id;
      }
    });
    return { fastestId, minTime };
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400 space-y-3 shadow-sm">
        <TrendingUp className="w-8 h-8 mx-auto opacity-30 text-slate-600" />
        <p className="text-sm font-semibold text-slate-700">No benchmark dataset recorded yet.</p>
        <p className="text-xs text-slate-400">Run a benchmark above to generate empirical execution time matrices.</p>
      </div>
    );
  }

  return (
    <div id="results-table-container" className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Table Header Controls & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <span>Empirical Measurements Matrix</span>
            <span className="text-xs font-normal text-slate-400">
              ({data.length} sample points · {config.selectedAlgorithms.length} algorithms)
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Click any row to expand detailed statistics (Min, Max, Standard Deviation, Comparisons, and Swaps).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 font-medium transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            id="btn-export-json"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 font-medium transition-all cursor-pointer"
          >
            <FileCode className="w-3.5 h-3.5 text-slate-600" />
            <span>JSON</span>
          </button>
          <button
            id="btn-copy-markdown"
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 font-medium transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Markdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 border-b border-slate-100 font-semibold">
              <th className="py-3.5 px-4 w-32">Array Size (N)</th>
              {config.selectedAlgorithms.map((id) => {
                const algo = ALGORITHMS[id];
                return (
                  <th key={id} className="py-3.5 px-4 min-w-[140px]">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: algo?.info.color || '#3B82F6' }}
                      />
                      <span className="truncate text-slate-800">{algo?.info.name || id}</span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {data.map((row) => {
              const { fastestId, minTime } = getFastestInRow(row);
              const isExpanded = !!expandedRows[row.size];

              return (
                <React.Fragment key={row.size}>
                  <tr
                    onClick={() => toggleRow(row.size)}
                    className="hover:bg-slate-50/60 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{row.size.toLocaleString()}</span>
                    </td>

                    {config.selectedAlgorithms.map((algoId) => {
                      const stats = row[algoId] as MetricStats;
                      const isFastest = algoId === fastestId && minTime !== Infinity;

                      if (!stats || stats.meanTimeMs < 0 || stats.timedOut) {
                        return (
                          <td key={algoId} className="py-3.5 px-4 text-slate-400 italic font-sans text-[11px]">
                            {stats?.error ? (
                              <span className="text-amber-600" title={stats.error}>
                                Timed out
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                        );
                      }

                      const relativeRatio =
                        minTime > 0 ? (stats.meanTimeMs / minTime).toFixed(1) : '1.0';

                      return (
                        <td key={algoId} className="py-3.5 px-4">
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`font-semibold ${
                                isFastest
                                  ? 'text-emerald-700 font-bold'
                                  : 'text-slate-800'
                              }`}
                            >
                              {stats.meanTimeMs.toFixed(3)} ms
                            </span>

                            {isFastest ? (
                              <span className="flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-sans border border-emerald-200/60 font-medium">
                                <Award className="w-2.5 h-2.5" />
                                1.0x
                              </span>
                            ) : (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-sans font-normal">
                                {relativeRatio}x
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Expanded Row Breakdown */}
                  {isExpanded && (
                    <tr className="bg-slate-50/40 text-slate-700">
                      <td colSpan={config.selectedAlgorithms.length + 1} className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {config.selectedAlgorithms.map((algoId) => {
                            const stats = row[algoId] as MetricStats;
                            const algo = ALGORITHMS[algoId];
                            if (!stats || stats.meanTimeMs < 0) return null;

                            return (
                              <div
                                key={algoId}
                                className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2"
                              >
                                <div className="flex items-center justify-between font-sans">
                                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: algo?.info.color }}
                                    />
                                    {algo?.info.name}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    ±{stats.stdDevMs.toFixed(3)} ms
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 font-mono">
                                  <div>
                                    <span className="text-slate-400">Min:</span> {stats.minTimeMs.toFixed(3)}ms
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Max:</span> {stats.maxTimeMs.toFixed(3)}ms
                                  </div>
                                  <div>
                                    <span className="text-slate-400">Median:</span> {stats.medianTimeMs.toFixed(3)}ms
                                  </div>
                                  {stats.comparisons >= 0 && (
                                    <div>
                                      <span className="text-slate-400">Comps:</span> {stats.comparisons.toLocaleString()}
                                    </div>
                                  )}
                                  {stats.swaps >= 0 && (
                                    <div>
                                      <span className="text-slate-400">Swaps:</span> {stats.swaps.toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
