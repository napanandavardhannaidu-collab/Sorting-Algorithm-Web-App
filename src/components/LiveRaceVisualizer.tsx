import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Gauge, 
  Award, 
  CheckCircle2 
} from 'lucide-react';
import { ALGORITHMS } from '../algorithms';
import { DistributionType, SupportedAlgorithmId } from '../types';
import { generateArray } from '../utils/generators';

interface RaceParticipant {
  id: SupportedAlgorithmId;
  name: string;
  color: string;
  array: number[];
  comparisons: number;
  swaps: number;
  isFinished: boolean;
  finishRank?: number;
  highlightIndices: [number, number] | null;
  timeMs: number;
}

const FIVE_ALGOS: SupportedAlgorithmId[] = [
  'quickSort',
  'mergeSort',
  'insertionSort',
  'selectionSort',
  'bubbleSort',
];

export const LiveRaceVisualizer: React.FC = () => {
  const [size, setSize] = useState<number>(48);
  const [distribution, setDistribution] = useState<DistributionType>('random');
  const [selectedAlgos, setSelectedAlgos] = useState<SupportedAlgorithmId[]>(FIVE_ALGOS);
  const [speed, setSpeed] = useState<number>(25); // delay ms
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [participants, setParticipants] = useState<RaceParticipant[]>([]);
  const [finishOrder, setFinishOrder] = useState<string[]>([]);

  const initialArrayRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const isRacingRef = useRef<boolean>(false);

  // Initialize race arrays
  const resetRace = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    isRacingRef.current = false;
    setIsRacing(false);
    setFinishOrder([]);

    const initial = generateArray(size, distribution, 100);
    initialArrayRef.current = initial;

    const newParticipants: RaceParticipant[] = selectedAlgos.map((id) => {
      const algo = ALGORITHMS[id];
      return {
        id,
        name: algo?.info.name || id,
        color: algo?.info.color || '#3b82f6',
        array: [...initial],
        comparisons: 0,
        swaps: 0,
        isFinished: false,
        highlightIndices: null,
        timeMs: 0,
      };
    });

    setParticipants(newParticipants);
  };

  useEffect(() => {
    resetRace();
  }, [size, distribution, selectedAlgos]);

  // Step-by-step generators for animation
  function* bubbleSortGen(arr: number[]) {
    const a = arr;
    const n = a.length;
    let comparisons = 0;
    let swaps = 0;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        yield { array: [...a], comparisons, swaps, highlight: [j, j + 1] as [number, number] };
        if (a[j] > a[j + 1]) {
          const t = a[j];
          a[j] = a[j + 1];
          a[j + 1] = t;
          swaps++;
          swapped = true;
          yield { array: [...a], comparisons, swaps, highlight: [j, j + 1] as [number, number] };
        }
      }
      if (!swapped) break;
    }
    yield { array: [...a], comparisons, swaps, highlight: null, done: true };
  }

  function* insertionSortGen(arr: number[]) {
    const a = arr;
    const n = a.length;
    let comparisons = 0;
    let swaps = 0;
    for (let i = 1; i < n; i++) {
      const key = a[i];
      let j = i - 1;
      while (j >= 0) {
        comparisons++;
        yield { array: [...a], comparisons, swaps, highlight: [j, j + 1] as [number, number] };
        if (a[j] > key) {
          a[j + 1] = a[j];
          swaps++;
          j--;
          yield { array: [...a], comparisons, swaps, highlight: [j + 1, i] as [number, number] };
        } else {
          break;
        }
      }
      a[j + 1] = key;
    }
    yield { array: [...a], comparisons, swaps, highlight: null, done: true };
  }

  function* selectionSortGen(arr: number[]) {
    const a = arr;
    const n = a.length;
    let comparisons = 0;
    let swaps = 0;
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      for (let j = i + 1; j < n; j++) {
        comparisons++;
        yield { array: [...a], comparisons, swaps, highlight: [minIdx, j] as [number, number] };
        if (a[j] < a[minIdx]) {
          minIdx = j;
        }
      }
      if (minIdx !== i) {
        const t = a[i];
        a[i] = a[minIdx];
        a[minIdx] = t;
        swaps++;
        yield { array: [...a], comparisons, swaps, highlight: [i, minIdx] as [number, number] };
      }
    }
    yield { array: [...a], comparisons, swaps, highlight: null, done: true };
  }

  function* quickSortGen(arr: number[]) {
    const a = arr;
    let comparisons = 0;
    let swaps = 0;

    function* partition(low: number, high: number): Generator<any, number, any> {
      const pivot = a[high];
      let i = low;
      for (let j = low; j < high; j++) {
        comparisons++;
        yield { array: [...a], comparisons, swaps, highlight: [j, high] as [number, number] };
        if (a[j] < pivot) {
          const t = a[i];
          a[i] = a[j];
          a[j] = t;
          swaps++;
          yield { array: [...a], comparisons, swaps, highlight: [i, j] as [number, number] };
          i++;
        }
      }
      const t = a[i];
      a[i] = a[high];
      a[high] = t;
      swaps++;
      yield { array: [...a], comparisons, swaps, highlight: [i, high] as [number, number] };
      return i;
    }

    function* qsort(low: number, high: number): Generator<any, void, any> {
      if (low < high) {
        const p: number = yield* partition(low, high);
        yield* qsort(low, p - 1);
        yield* qsort(p + 1, high);
      }
    }

    yield* qsort(0, a.length - 1);
    yield { array: [...a], comparisons, swaps, highlight: null, done: true };
  }

  function* mergeSortGen(arr: number[]) {
    const a = arr;
    let comparisons = 0;
    let swaps = 0;

    function* merge(low: number, mid: number, high: number): Generator<any, void, any> {
      const left = a.slice(low, mid + 1);
      const right = a.slice(mid + 1, high + 1);
      let i = 0, j = 0, k = low;

      while (i < left.length && j < right.length) {
        comparisons++;
        yield { array: [...a], comparisons, swaps, highlight: [k, mid + 1 + j] as [number, number] };
        if (left[i] <= right[j]) {
          a[k] = left[i++];
        } else {
          a[k] = right[j++];
        }
        swaps++;
        k++;
        yield { array: [...a], comparisons, swaps, highlight: [k - 1, k] as [number, number] };
      }

      while (i < left.length) {
        a[k++] = left[i++];
        swaps++;
        yield { array: [...a], comparisons, swaps, highlight: [k - 1, k] as [number, number] };
      }
      while (j < right.length) {
        a[k++] = right[j++];
        swaps++;
        yield { array: [...a], comparisons, swaps, highlight: [k - 1, k] as [number, number] };
      }
    }

    function* msort(low: number, high: number): Generator<any, void, any> {
      if (low < high) {
        const mid = Math.floor((low + high) / 2);
        yield* msort(low, mid);
        yield* msort(mid + 1, high);
        yield* merge(low, mid, high);
      }
    }

    yield* msort(0, a.length - 1);
    yield { array: [...a], comparisons, swaps, highlight: null, done: true };
  }

  const getGenerator = (id: SupportedAlgorithmId, arr: number[]) => {
    switch (id) {
      case 'bubbleSort':
        return bubbleSortGen([...arr]);
      case 'insertionSort':
        return insertionSortGen([...arr]);
      case 'selectionSort':
        return selectionSortGen([...arr]);
      case 'quickSort':
        return quickSortGen([...arr]);
      case 'mergeSort':
        return mergeSortGen([...arr]);
      default:
        return bubbleSortGen([...arr]);
    }
  };

  const startRace = () => {
    if (isRacing) {
      isRacingRef.current = false;
      setIsRacing(false);
      return;
    }

    isRacingRef.current = true;
    setIsRacing(true);

    const startTime = performance.now();
    const generators = participants.map((p) => ({
      id: p.id,
      gen: getGenerator(p.id, initialArrayRef.current),
      finished: false,
    }));

    let localFinishOrder: string[] = [];

    const step = () => {
      if (!isRacingRef.current) return;

      let allDone = true;
      const updated = participants.map((p, idx) => {
        if (p.isFinished) return p;

        const g = generators[idx];
        if (g.finished) return p;

        // Advance steps per frame based on speed setting
        const stepsPerFrame = Math.max(1, Math.floor(speed / 4));
        let nextVal: any;

        for (let s = 0; s < stepsPerFrame; s++) {
          nextVal = g.gen.next();
          if (nextVal.done) break;
        }

        if (nextVal.done || nextVal.value?.done) {
          g.finished = true;
          if (!localFinishOrder.includes(p.id)) {
            localFinishOrder.push(p.id);
            setFinishOrder([...localFinishOrder]);
          }
          return {
            ...p,
            array: nextVal.value?.array || p.array,
            comparisons: nextVal.value?.comparisons || p.comparisons,
            swaps: nextVal.value?.swaps || p.swaps,
            isFinished: true,
            finishRank: localFinishOrder.length,
            highlightIndices: null,
            timeMs: Math.round(performance.now() - startTime),
          };
        }

        allDone = false;
        return {
          ...p,
          array: nextVal.value.array,
          comparisons: nextVal.value.comparisons,
          swaps: nextVal.value.swaps,
          highlightIndices: nextVal.value.highlight,
          timeMs: Math.round(performance.now() - startTime),
        };
      });

      setParticipants(updated);

      if (!allDone && isRacingRef.current) {
        animationFrameRef.current = requestAnimationFrame(step);
      } else {
        isRacingRef.current = false;
        setIsRacing(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(step);
  };

  const toggleAlgoSelection = (id: SupportedAlgorithmId) => {
    if (selectedAlgos.includes(id)) {
      if (selectedAlgos.length > 2) {
        setSelectedAlgos(selectedAlgos.filter((a) => a !== id));
      }
    } else {
      setSelectedAlgos([...selectedAlgos, id]);
    }
  };

  const maxVal = Math.max(...(initialArrayRef.current.length ? initialArrayRef.current : [100]));

  return (
    <div id="live-race-container" className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Race Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Algorithm Arena
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              Concurrent Execution
            </span>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2 mt-1">
            <Sparkles className="w-5 h-5 text-slate-700" />
            <span>Side-by-Side Algorithm Race</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Watch concurrent algorithm execution step-by-step with live comparison and swap tallies across the 5 sorting algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetRace}
            disabled={isRacing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-700 text-xs font-medium border border-slate-200/60 transition-all cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Array</span>
          </button>

          <button
            onClick={startRace}
            className={`flex items-center gap-2 px-5 py-2 rounded-full font-medium text-xs transition-all shadow-xs cursor-pointer ${
              isRacing
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isRacing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            <span>{isRacing ? 'Pause Race' : 'Start Race'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Size, Speed, Participants */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-100 text-xs">
        {/* Race Size */}
        <div className="space-y-1.5">
          <label className="text-slate-600 font-medium flex justify-between">
            <span>Race Array Size</span>
            <span className="font-mono text-slate-900 font-semibold">N = {size}</span>
          </label>
          <div className="flex items-center gap-1.5">
            {[24, 48, 80, 120].map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                disabled={isRacing}
                className={`flex-1 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
                  size === s
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Animation Speed */}
        <div className="space-y-1.5">
          <label className="text-slate-600 font-medium flex justify-between">
            <span>Playback Speed</span>
            <span className="font-mono text-slate-900 font-semibold">{speed}%</span>
          </label>
          <input
            type="range"
            min="4"
            max="40"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value, 10))}
            className="w-full accent-slate-900 mt-2"
          />
        </div>

        {/* Distribution Pattern */}
        <div className="space-y-1.5">
          <label className="text-slate-600 font-medium block">Distribution Pattern</label>
          <select
            value={distribution}
            onChange={(e) => setDistribution(e.target.value as DistributionType)}
            disabled={isRacing}
            className="w-full bg-white border border-slate-200/80 rounded-full px-3.5 py-1.5 text-slate-800 focus:outline-none focus:border-slate-400 font-medium transition-all cursor-pointer"
          >
            <option value="random">Uniform Random</option>
            <option value="nearly_sorted">Nearly Sorted</option>
            <option value="reversed">Reversed (Worst Case)</option>
            <option value="few_unique">Few Unique Values</option>
            <option value="sawtooth">Sawtooth Waves</option>
          </select>
        </div>
      </div>

      {/* Participant Algorithm Toggles */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Select Competitors (5 Core Algorithms):
        </span>
        <div className="flex flex-wrap gap-2">
          {FIVE_ALGOS.map((id) => {
            const algo = ALGORITHMS[id];
            const isSelected = selectedAlgos.includes(id);

            return (
              <button
                key={id}
                onClick={() => toggleAlgoSelection(id)}
                disabled={isRacing}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200/70 hover:bg-slate-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: isSelected ? algo.info.color : '#94a3b8' }}
                />
                <span>{algo.info.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Lanes Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {participants.map((p) => {
          return (
            <div
              key={p.id}
              className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 space-y-3 relative overflow-hidden"
            >
              {/* Header with name and rank */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shadow-2xs"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="text-sm font-semibold text-slate-900">{p.name}</span>
                </div>

                {p.isFinished ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Finished (#{p.finishRank})</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-mono">
                    Sorting...
                  </span>
                )}
              </div>

              {/* Live Bar Canvas */}
              <div className="h-28 flex items-end gap-[1px] bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                {p.array.map((val, idx) => {
                  const heightPercent = Math.max(5, (val / maxVal) * 100);
                  const isHighlighted =
                    p.highlightIndices &&
                    (p.highlightIndices[0] === idx || p.highlightIndices[1] === idx);

                  return (
                    <div
                      key={idx}
                      className="flex-1 rounded-t-xs transition-all duration-75"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: isHighlighted
                          ? '#f59e0b'
                          : p.isFinished
                          ? '#10b981'
                          : p.color,
                      }}
                    />
                  );
                })}
              </div>

              {/* Stats Footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                <div>
                  <span className="text-slate-400">Comparisons:</span>{' '}
                  <span className="text-slate-800 font-semibold">{p.comparisons.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400">Swaps:</span>{' '}
                  <span className="text-slate-800 font-semibold">{p.swaps.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
