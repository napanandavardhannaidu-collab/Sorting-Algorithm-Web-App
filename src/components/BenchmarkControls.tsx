import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Layers, 
  CheckSquare, 
  Square as SquareIcon, 
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';
import { BenchmarkConfig, DistributionType, SupportedAlgorithmId } from '../types';
import { DISTRIBUTION_DESCRIPTIONS } from '../utils/generators';

interface BenchmarkControlsProps {
  config: BenchmarkConfig;
  onChangeConfig: (newConfig: BenchmarkConfig) => void;
  onRun: () => void;
  isRunning: boolean;
  progressPercentage: number;
  statusMessage: string;
}

const SIZE_PRESETS = [
  {
    name: 'Standard Benchmark Range',
    sizes: [200, 500, 1000, 2000, 3500, 5000],
    desc: 'Optimal range for comparing O(n log n) vs O(n²)',
  },
  {
    name: 'Small Step Range',
    sizes: [100, 250, 500, 750, 1000, 1500],
    desc: 'Dense sampling for quadratic curve verification',
  },
  {
    name: 'Divide & Conquer Scale',
    sizes: [1000, 2500, 5000, 10000, 20000],
    desc: 'Higher N to observe Merge & Quick Sort efficiency',
  },
  {
    name: 'Quick Lab Test',
    sizes: [100, 300, 600, 1000, 2000],
    desc: 'Rapid test (< 1 sec)',
  },
];

export const BenchmarkControls: React.FC<BenchmarkControlsProps> = ({
  config,
  onChangeConfig,
  onRun,
  isRunning,
  progressPercentage,
  statusMessage,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customSizeText, setCustomSizeText] = useState(
    config.customSizeInput || config.sizes.join(', ')
  );

  const toggleAlgorithm = (id: string) => {
    const exists = config.selectedAlgorithms.includes(id);
    let updated: string[];
    if (exists) {
      updated = config.selectedAlgorithms.filter((a) => a !== id);
    } else {
      updated = [...config.selectedAlgorithms, id];
    }
    onChangeConfig({ ...config, selectedAlgorithms: updated });
  };

  const selectAllAlgorithms = () => {
    onChangeConfig({
      ...config,
      selectedAlgorithms: Object.keys(ALGORITHMS),
    });
  };

  const selectDivideAndConquerOnly = () => {
    onChangeConfig({ ...config, selectedAlgorithms: ['mergeSort', 'quickSort'] });
  };

  const selectQuadraticOnly = () => {
    onChangeConfig({ ...config, selectedAlgorithms: ['bubbleSort', 'selectionSort', 'insertionSort'] });
  };

  const clearAllAlgorithms = () => {
    onChangeConfig({ ...config, selectedAlgorithms: [] });
  };

  const handleCustomSizesChange = (text: string) => {
    setCustomSizeText(text);
    const parsed = text
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n > 0 && n <= 100000);

    if (parsed.length > 0) {
      const uniqueSorted = Array.from(new Set(parsed)).sort((a, b) => a - b);
      onChangeConfig({
        ...config,
        sizes: uniqueSorted,
        customSizeInput: text,
      });
    }
  };

  const applySizePreset = (presetSizes: number[]) => {
    setCustomSizeText(presetSizes.join(', '));
    onChangeConfig({
      ...config,
      sizes: presetSizes,
      customSizeInput: presetSizes.join(', '),
    });
  };

  // Group the 5 algorithms
  const categories = {
    divide_and_conquer: {
      label: 'Divide and Conquer — O(n log n)',
      ids: ['quickSort', 'mergeSort'] as SupportedAlgorithmId[],
    },
    comparison_based: {
      label: 'Elementary Comparison-Based — O(n²)',
      ids: ['bubbleSort', 'selectionSort', 'insertionSort'] as SupportedAlgorithmId[],
    },
  };

  const hasHighScaleWithQuadratic =
    config.sizes.some((s) => s > 15000) &&
    config.selectedAlgorithms.some(
      (id) => ['bubbleSort', 'selectionSort', 'insertionSort'].includes(id)
    );

  return (
    <div id="benchmark-controls-panel" className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-8">
      {/* Top Banner with Run CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Complexity Benchmark
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              Empirical Performance Testing
            </span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900 mt-1">
            Empirical Time Complexity & Growth Curve Analysis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Measure execution time T(n), comparisons C(n), and swaps S(n) across Bubble, Selection, Insertion, Merge, and Quick Sort.
          </p>
        </div>

        <button
          id="btn-main-run"
          onClick={onRun}
          disabled={isRunning || config.selectedAlgorithms.length === 0}
          className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-sm ${
            isRunning
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : config.selectedAlgorithms.length === 0
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer active:scale-95'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{isRunning ? 'Measuring complexity...' : 'Run Complexity Experiment'}</span>
        </button>
      </div>

      {/* Progress Bar Display if running */}
      {isRunning && (
        <div id="progress-container" className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-700">
            <span className="truncate pr-2">{statusMessage}</span>
            <span className="font-mono text-slate-900">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-slate-900 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Safety Warning for quadratic on large sizes */}
      {hasHighScaleWithQuadratic && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-900 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Notice:</span> You have selected elementary $O(n^2)$ sorts on array sizes &gt; 15,000. 
            The safety timeout ({config.timeoutMs}ms) will protect your browser by skipping excessive workloads.
          </div>
        </div>
      )}

      {/* SECTION 1: Algorithm Selector (5 Core Algorithms) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Select Algorithms ({config.selectedAlgorithms.length}/5)
          </h3>

          {/* Quick Filter Presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={selectDivideAndConquerOnly}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              O(n log n) Only
            </button>
            <button
              onClick={selectQuadraticOnly}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              O(n²) Only
            </button>
            <button
              onClick={selectAllAlgorithms}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
            >
              Select All 5
            </button>
            <button
              onClick={clearAllAlgorithms}
              className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Algorithm Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(categories).map(([catKey, cat]) => (
            <div
              key={catKey}
              className="p-5 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-3"
            >
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {cat.label}
              </div>
              <div className="space-y-2">
                {cat.ids.map((id) => {
                  const algo = ALGORITHMS[id];
                  if (!algo) return null;
                  const isSelected = config.selectedAlgorithms.includes(id);

                  return (
                    <button
                      key={id}
                      id={`algo-toggle-${id}`}
                      onClick={() => toggleAlgorithm(id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left border cursor-pointer ${
                        isSelected
                          ? 'bg-white text-slate-900 border-slate-200 shadow-sm'
                          : 'bg-transparent text-slate-400 border-transparent hover:bg-white/60 hover:text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-1">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? 'border-slate-900 bg-slate-900'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 bg-white rounded-xs" />
                          )}
                        </div>
                        <span className="font-semibold text-slate-900">{algo.info.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {algo.info.avgTime}
                        </span>
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: algo.info.color }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Input Sizes Configuration */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            Array Sizes (N Elements to Benchmark)
          </h3>
          <span className="text-xs text-slate-500 font-normal">
            {config.sizes.length} points: {config.sizes.map((s) => s >= 1000 ? `${s / 1000}k` : s).join(', ')}
          </span>
        </div>

        {/* Size Presets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SIZE_PRESETS.map((preset) => {
            const isCurrent =
              preset.sizes.length === config.sizes.length &&
              preset.sizes.every((v, i) => v === config.sizes[i]);

            return (
              <button
                key={preset.name}
                id={`preset-${preset.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => applySizePreset(preset.sizes)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50/60 border-slate-100 text-slate-700 hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="text-xs font-semibold">{preset.name}</div>
                <div className={`text-[10px] mt-0.5 truncate font-mono ${isCurrent ? 'text-slate-300' : 'text-slate-400'}`}>
                  {preset.sizes.map((s) => (s >= 1000 ? `${s / 1000}k` : s)).join(', ')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 shrink-0">Custom N Range:</span>
          <input
            type="text"
            value={customSizeText}
            onChange={(e) => handleCustomSizesChange(e.target.value)}
            placeholder="e.g. 100, 500, 1000, 2000, 5000"
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:bg-white focus:border-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* SECTION 3: Input Data Distribution */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
          Input Distribution Case (Best / Average / Worst)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {(Object.keys(DISTRIBUTION_DESCRIPTIONS) as DistributionType[]).map((distKey) => {
            const dist = DISTRIBUTION_DESCRIPTIONS[distKey];
            const isSelected = config.distribution === distKey;

            return (
              <button
                key={distKey}
                id={`dist-${distKey}`}
                onClick={() => onChangeConfig({ ...config, distribution: distKey })}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50/60 border-slate-100 text-slate-700 hover:bg-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <span>{dist.icon}</span>
                  <span className="truncate">{dist.name.split(' ')[0]}</span>
                </div>
                <div className={`text-[10px] mt-1 line-clamp-2 leading-tight ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {dist.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Options Accordion */}
      <div className="pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-xs font-medium text-slate-500 hover:text-slate-900 py-2 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5" />
            <span>Statistical Precision & Safety Settings</span>
          </span>
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 mt-2 bg-slate-50/70 p-5 rounded-2xl border border-slate-100">
            {/* Repetitions */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 flex justify-between">
                <span>Iterations per size</span>
                <span className="font-mono text-slate-900 font-semibold">{config.iterations}x</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={config.iterations}
                onChange={(e) =>
                  onChangeConfig({ ...config, iterations: parseInt(e.target.value, 10) })
                }
                className="w-full accent-slate-900"
              />
              <p className="text-[10px] text-slate-500">
                Averages multiple runs to eliminate CPU jitter and GC spikes.
              </p>
            </div>

            {/* Timeout Limit */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 flex justify-between">
                <span>Safety Timeout</span>
                <span className="font-mono text-slate-900 font-semibold">{config.timeoutMs} ms</span>
              </label>
              <input
                type="range"
                min="500"
                max="8000"
                step="500"
                value={config.timeoutMs}
                onChange={(e) =>
                  onChangeConfig({ ...config, timeoutMs: parseInt(e.target.value, 10) })
                }
                className="w-full accent-slate-900"
              />
              <p className="text-[10px] text-slate-500">
                Aborts an algorithm if a single execution exceeds this threshold.
              </p>
            </div>

            {/* Track Comparisons & Swaps */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 block">
                Operation Metrics
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.measureDetailedOps}
                  onChange={(e) =>
                    onChangeConfig({ ...config, measureDetailedOps: e.target.checked })
                  }
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 accent-slate-900"
                />
                <span className="text-xs text-slate-700">Measure element comparisons & swaps</span>
              </label>
              <p className="text-[10px] text-slate-500">
                Gathers empirical operation counts along with execution time.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
