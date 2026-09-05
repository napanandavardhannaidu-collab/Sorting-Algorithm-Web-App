import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shuffle,
  CheckCircle2,
  Sliders,
  Code,
  Info,
  HelpCircle,
  Hash,
  Activity,
  Maximize2
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';
import { SupportedAlgorithmId, SimulationStep } from '../types';
import { generateSimulationSteps } from '../algorithms';

const PRESET_ARRAYS = [
  { label: 'Standard Mixed (8 items)', value: '64, 25, 12, 22, 11, 90, 45, 38' },
  { label: 'Worst-case Reverse (7 items)', value: '70, 60, 50, 40, 30, 20, 10' },
  { label: 'Best-case Sorted (7 items)', value: '10, 20, 30, 40, 50, 60, 70' },
  { label: 'Duplicates & Ties (8 items)', value: '42, 17, 42, 9, 88, 17, 3, 42' },
  { label: 'Nearly Sorted (8 items)', value: '12, 15, 18, 25, 22, 30, 40, 50' },
  { label: 'V-Shape / Sawtooth (8 items)', value: '50, 30, 10, 5, 15, 35, 45, 60' },
];

export const UserSimulationView: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<SupportedAlgorithmId>('bubbleSort');
  const [userInputText, setUserInputText] = useState<string>('64, 25, 12, 22, 11, 90, 45, 38');
  const [currentArray, setCurrentArray] = useState<number[]>([64, 25, 12, 22, 11, 90, 45, 38]);
  const [inputError, setInputError] = useState<string | null>(null);

  // Simulation steps and playback state
  const [steps, setSteps] = useState<SimulationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(600); // ms per step

  // Generate steps whenever array or algorithm changes
  useEffect(() => {
    if (currentArray.length > 0) {
      const generated = generateSimulationSteps(selectedAlgo, currentArray);
      setSteps(generated);
      setCurrentStepIndex(0);
      setIsPlaying(false);
    }
  }, [selectedAlgo, currentArray]);

  // Timer playback loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, steps.length, speedMs]);

  const handleApplyCustomInput = () => {
    setInputError(null);
    const parsed = userInputText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s) => Number(s));

    if (parsed.length === 0 || parsed.some((n) => isNaN(n))) {
      setInputError('Please enter valid integers separated by commas (e.g. 34, 12, 89, 5, 23)');
      return;
    }

    if (parsed.length > 24) {
      setInputError('For interactive step simulation, please enter at most 24 elements.');
      return;
    }

    setCurrentArray(parsed);
  };

  const handleGenerateRandom = (size = 8) => {
    setInputError(null);
    const randArr = Array.from({ length: size }, () => Math.floor(Math.random() * 95) + 5);
    const str = randArr.join(', ');
    setUserInputText(str);
    setCurrentArray(randArr);
  };

  const handlePresetSelect = (presetStr: string) => {
    setInputError(null);
    setUserInputText(presetStr);
    const parsed = presetStr.split(',').map((s) => parseInt(s.trim(), 10));
    setCurrentArray(parsed);
  };

  const currentStep = steps[currentStepIndex] || {
    array: currentArray,
    description: 'Ready to start simulation.',
    comparisons: 0,
    swaps: 0,
    pseudocodeLine: 1,
  };

  const maxVal = useMemo(() => {
    return Math.max(...(currentStep.array.length ? currentStep.array : [100]), 10);
  }, [currentStep.array]);

  const algoInfo = ALGORITHMS[selectedAlgo].info;

  // Jump controls
  const handleFirstStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => Math.min(steps.length - 1, prev + 1));
  };

  const handleLastStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex(steps.length - 1);
  };

  const isComplete = steps.length > 0 && currentStepIndex === steps.length - 1;

  return (
    <div id="user-simulation-view" className="space-y-8">
      {/* Top Banner: Algorithm Selection & User Entry Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Algorithm Lab
              </span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Simulation Module
              </span>
            </div>
            <h2 className="text-2xl font-light text-slate-900 mt-1">
              Interactive User Input & Step-by-Step Simulation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Enter custom array numbers, select one of the 5 sorting algorithms, and observe exact memory movements, comparisons, and recurrence progress.
            </p>
          </div>

          {/* Algorithm Switcher Pills */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/50">
            {(Object.keys(ALGORITHMS) as SupportedAlgorithmId[]).map((algoId) => {
              const info = ALGORITHMS[algoId].info;
              const isSelected = selectedAlgo === algoId;
              return (
                <button
                  key={algoId}
                  id={`btn-select-algo-${algoId}`}
                  onClick={() => setSelectedAlgo(algoId)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: isSelected ? '#ffffff' : info.color }}
                  />
                  <span>{info.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* User Entry Input Form & Presets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-8 space-y-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
              <span>Enter Array Elements (Comma-separated Integers):</span>
              <span className="text-slate-400 font-normal text-[11px]">
                Current length: {currentArray.length} items (Max 24 for step animation)
              </span>
            </label>
            <div className="flex gap-2">
              <input
                id="user-array-input-field"
                type="text"
                value={userInputText}
                onChange={(e) => setUserInputText(e.target.value)}
                placeholder="e.g. 45, 12, 89, 3, 27, 64, 18, 55"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-900 focus:bg-white focus:border-slate-400 focus:outline-none transition-all shadow-2xs"
              />
              <button
                id="btn-apply-user-input"
                onClick={handleApplyCustomInput}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Load Array
              </button>
            </div>
            {inputError && (
              <p className="text-xs text-rose-600 font-medium">{inputError}</p>
            )}
          </div>

          {/* Quick Presets & Random Generator */}
          <div className="lg:col-span-4 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              Sample Test Presets
            </label>
            <div className="flex items-center gap-2">
              <select
                id="select-preset-array"
                onChange={(e) => handlePresetSelect(e.target.value)}
                value={userInputText}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-xs text-slate-700 font-medium focus:outline-none focus:border-slate-400 focus:bg-white cursor-pointer"
              >
                <option value="" disabled>
                  Select test array...
                </option>
                {PRESET_ARRAYS.map((p, i) => (
                  <option key={i} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                id="btn-random-array-generator"
                onClick={() => handleGenerateRandom(8)}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Generate Random Array"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Simulation Stage & Trace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive Bar Visualizer & Controls */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6 flex flex-col justify-between">
          {/* Header Info: Algorithm Badge & Step Tally */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span
                className="w-3.5 h-3.5 rounded-full"
                style={{ backgroundColor: algoInfo.color }}
              />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {algoInfo.name} Simulation
                </h3>
                <span className="text-xs text-slate-400">
                  {algoInfo.tagline}
                </span>
              </div>
            </div>

            {/* Complexity Badges */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
                Avg: <strong className="text-slate-900">{algoInfo.avgTime}</strong>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700">
                Space: <strong className="text-slate-900">{algoInfo.space}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Bar Chart Canvas */}
          <div className="h-64 sm:h-72 w-full bg-slate-50/50 rounded-2xl border border-slate-100 p-4 sm:p-6 flex items-end justify-center gap-2 sm:gap-3 relative overflow-hidden">
            {currentStep.array.map((val, idx) => {
              const isComparing = currentStep.comparing?.includes(idx);
              const isSwapping = currentStep.swapping?.includes(idx);
              const isPivot = currentStep.pivotIndex === idx;
              const isSorted = currentStep.sortedIndices?.includes(idx);
              const heightPercent = Math.max(12, (val / maxVal) * 88);

              let barBg = 'bg-slate-300';
              let textColor = 'text-slate-700';

              if (isSorted) {
                barBg = 'bg-emerald-500';
                textColor = 'text-white';
              } else if (isSwapping) {
                barBg = 'bg-rose-500 animate-pulse';
                textColor = 'text-white';
              } else if (isComparing) {
                barBg = 'bg-amber-400';
                textColor = 'text-slate-900';
              } else if (isPivot) {
                barBg = 'bg-blue-600 ring-2 ring-blue-300';
                textColor = 'text-white';
              }

              return (
                <div
                  key={idx}
                  className="flex-1 max-w-[56px] flex flex-col items-center justify-end h-full transition-all duration-200"
                >
                  {/* Numerical Value Label */}
                  <span
                    className={`text-[10px] sm:text-xs font-bold mb-1 font-mono transition-colors ${
                      isComparing || isSwapping || isPivot || isSorted
                        ? 'text-slate-900 font-extrabold scale-110'
                        : 'text-slate-500'
                    }`}
                  >
                    {val}
                  </span>

                  {/* Vertical Bar */}
                  <div
                    className={`w-full rounded-t-xl transition-all duration-300 shadow-2xs ${barBg}`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* Index Indicator */}
                  <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 mt-1.5">
                    A[{idx}]
                  </span>
                </div>
              );
            })}
          </div>

          {/* Visual Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-600 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-slate-300" />
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-400" />
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-500" />
              <span>Swapping / Writing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-600" />
              <span>Pivot / Key Element</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-emerald-500" />
              <span>Sorted Position</span>
            </div>
          </div>

          {/* Playback Control Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Step Navigation Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-step-first"
                  onClick={handleFirstStep}
                  disabled={currentStepIndex === 0}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 disabled:opacity-40 transition-colors cursor-pointer"
                  title="First Step"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  id="btn-step-prev"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Previous Step"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  id="btn-step-play"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all shadow-xs cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-500 text-white hover:bg-amber-600'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>
                <button
                  id="btn-step-next"
                  onClick={handleNextStep}
                  disabled={isComplete}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Next Step"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="btn-step-last"
                  onClick={handleLastStep}
                  disabled={isComplete}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Last Step"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  id="btn-step-reset"
                  onClick={handleFirstStep}
                  className="p-2 rounded-full bg-white hover:bg-slate-100 text-slate-500 border border-slate-200/80 transition-colors cursor-pointer"
                  title="Reset to Beginning"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 shrink-0">Delay:</span>
                <input
                  id="simulation-speed-slider"
                  type="range"
                  min="100"
                  max="1200"
                  step="50"
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                  className="w-28 sm:w-36 accent-slate-900"
                />
                <span className="text-xs font-mono text-slate-700 w-12 text-right">
                  {speedMs}ms
                </span>
              </div>
            </div>

            {/* Step Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-medium text-slate-500">
                <span>
                  Step <strong>{currentStepIndex + 1}</strong> of <strong>{steps.length}</strong>
                </span>
                <span>
                  {steps.length > 0
                    ? `${Math.round(((currentStepIndex + 1) / steps.length) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-slate-900 h-full rounded-full transition-all duration-200"
                  style={{
                    width: `${steps.length > 0 ? ((currentStepIndex + 1) / steps.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Step Trace, Live Mathematical Counter & Pseudocode */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Operation Counters Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
              Operational Metrics
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Comparisons
                </div>
                <div className="text-2xl font-light font-mono text-slate-900">
                  {currentStep.comparisons}
                </div>
                <div className="text-[10px] text-slate-500">
                  C(n) elemental checks
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 space-y-0.5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Swaps / Writes
                </div>
                <div className="text-2xl font-light font-mono text-slate-900">
                  {currentStep.swaps}
                </div>
                <div className="text-[10px] text-slate-500">
                  S(n) position shifts
                </div>
              </div>
            </div>

            {/* Recurrence Equation Pill */}
            {algoInfo.recurrenceRelation && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Recurrence Equation
                </div>
                <div className="font-mono text-slate-800 text-[11px]">
                  {algoInfo.recurrenceRelation}
                </div>
              </div>
            )}
          </div>

          {/* Current Step Explanation Box */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-slate-600" />
              <span>Step Log & Explanation</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans min-h-[72px]">
              {currentStep.description}
            </div>
          </div>

          {/* Pseudocode Execution Window */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-600" />
                <span>Algorithmic Pseudocode</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Line {currentStep.pseudocodeLine || 1}
              </span>
            </div>

            <div className="rounded-2xl bg-slate-950 p-3.5 text-[11px] font-mono text-slate-300 space-y-1 overflow-x-auto">
              {algoInfo.pseudocode.map((line, idx) => {
                const lineNum = idx + 1;
                const isCurrentLine = currentStep.pseudocodeLine === lineNum;
                return (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded transition-colors flex items-center gap-2 ${
                      isCurrentLine
                        ? 'bg-blue-600/30 text-blue-200 font-bold border-l-2 border-blue-400'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="text-[9px] text-slate-600 w-3 text-right shrink-0 select-none">
                      {lineNum}
                    </span>
                    <span className="truncate">{line}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
