import { ALGORITHMS } from '../algorithms';
import { BenchmarkConfig, BenchmarkProgress, MetricStats, SizeBenchmarkData } from '../types';
import { generateArray } from './generators';

export interface RunBenchmarkCallbacks {
  onProgress: (progress: BenchmarkProgress) => void;
  onPartialResult: (partialData: SizeBenchmarkData[]) => void;
  onComplete: (finalData: SizeBenchmarkData[]) => void;
  onError: (err: Error) => void;
}

// Check if user cancelled
let cancelRequested = false;

export function cancelBenchmark() {
  cancelRequested = true;
}

/**
 * Calculates standard deviation
 */
function calculateStdDev(times: number[], mean: number): number {
  if (times.length <= 1) return 0;
  const variance = times.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / (times.length - 1);
  return Math.sqrt(variance);
}

/**
 * Runs the full benchmark suite across sizes and algorithms asynchronously with UI yields
 */
export async function runBenchmark(
  config: BenchmarkConfig,
  callbacks: RunBenchmarkCallbacks
): Promise<void> {
  cancelRequested = false;
  const {
    sizes,
    selectedAlgorithms,
    distribution,
    iterations = 3,
    measureDetailedOps = false,
    timeoutMs = 3000,
    warmupRuns = 1,
  } = config;

  const totalSteps = sizes.length * selectedAlgorithms.length * iterations;
  let completedSteps = 0;

  // Initialize result data matrix
  const benchmarkResults: SizeBenchmarkData[] = sizes.map((size) => ({
    size,
  }));

  // Track algorithms that timed out to avoid exponential lockups on large sizes
  const timedOutAlgorithms = new Set<string>();

  // Optional JIT Warmup
  if (warmupRuns > 0) {
    callbacks.onProgress({
      isRunning: true,
      currentAlgorithm: 'JIT Warmup',
      currentSize: 500,
      currentIteration: 1,
      totalSteps,
      completedSteps: 0,
      percentage: 0,
      statusMessage: 'Warming up JIT compiler...',
    });

    const warmupArr = generateArray(500, 'random');
    for (const algoId of selectedAlgorithms) {
      const algo = ALGORITHMS[algoId];
      if (algo) {
        try {
          algo.fn(warmupArr.slice(), false);
        } catch {
          // Ignore warmup errors
        }
      }
    }
  }

  // Loop over each size
  for (let sizeIdx = 0; sizeIdx < sizes.length; sizeIdx++) {
    const size = sizes[sizeIdx];

    // Loop over each algorithm
    for (let algoIdx = 0; algoIdx < selectedAlgorithms.length; algoIdx++) {
      if (cancelRequested) {
        callbacks.onProgress({
          isRunning: false,
          currentAlgorithm: '',
          currentSize: 0,
          currentIteration: 0,
          totalSteps,
          completedSteps,
          percentage: 100,
          statusMessage: 'Benchmark cancelled by user.',
        });
        return;
      }

      const algoId = selectedAlgorithms[algoIdx];
      const algo = ALGORITHMS[algoId];
      if (!algo) continue;

      // Check if already timed out on previous smaller size
      if (timedOutAlgorithms.has(algoId)) {
        const skippedStats: MetricStats = {
          meanTimeMs: -1,
          medianTimeMs: -1,
          minTimeMs: -1,
          maxTimeMs: -1,
          stdDevMs: 0,
          comparisons: -1,
          swaps: -1,
          writes: -1,
          timedOut: true,
          error: 'Skipped (Exceeded timeout on smaller input size)',
          rawTimes: [],
        };
        benchmarkResults[sizeIdx][algoId] = skippedStats;
        completedSteps += iterations;
        callbacks.onPartialResult([...benchmarkResults]);
        continue;
      }

      const runTimes: number[] = [];
      let totalComparisons = 0;
      let totalSwaps = 0;
      let totalWrites = 0;
      let didTimeout = false;
      let errorMessage: string | undefined;

      // Yield UI frame before heavy iteration batch
      await new Promise((resolve) => setTimeout(resolve, 0));

      for (let iter = 0; iter < iterations; iter++) {
        if (cancelRequested) return;

        callbacks.onProgress({
          isRunning: true,
          currentAlgorithm: algo.info.name,
          currentSize: size,
          currentIteration: iter + 1,
          totalSteps,
          completedSteps,
          percentage: Math.min(99, Math.round((completedSteps / totalSteps) * 100)),
          statusMessage: `Benchmarking ${algo.info.name} on N = ${size.toLocaleString()} (Run ${iter + 1}/${iterations})...`,
        });

        // Generate pristine test array for this run
        const testArray = generateArray(size, distribution);

        const startTime = performance.now();
        try {
          const res = algo.fn(testArray, measureDetailedOps && iter === 0);
          const endTime = performance.now();
          const duration = endTime - startTime;
          runTimes.push(duration);

          if (iter === 0 && measureDetailedOps) {
            totalComparisons = res.comparisons;
            totalSwaps = res.swaps;
            totalWrites = res.writes;
          }

          // Check for timeout
          if (duration > timeoutMs) {
            didTimeout = true;
            timedOutAlgorithms.add(algoId);
            errorMessage = `Exceeded timeout limit of ${timeoutMs}ms (${duration.toFixed(1)}ms)`;
            break;
          }
        } catch (e: any) {
          errorMessage = e.message || 'Execution error';
          break;
        }

        completedSteps++;
      }

      // Calculate stats
      if (runTimes.length > 0) {
        runTimes.sort((a, b) => a - b);
        const minTimeMs = runTimes[0];
        const maxTimeMs = runTimes[runTimes.length - 1];
        const sum = runTimes.reduce((a, b) => a + b, 0);
        const meanTimeMs = sum / runTimes.length;
        const mid = Math.floor(runTimes.length / 2);
        const medianTimeMs =
          runTimes.length % 2 !== 0
            ? runTimes[mid]
            : (runTimes[mid - 1] + runTimes[mid]) / 2;
        const stdDevMs = calculateStdDev(runTimes, meanTimeMs);

        const stats: MetricStats = {
          meanTimeMs: Number(meanTimeMs.toFixed(4)),
          medianTimeMs: Number(medianTimeMs.toFixed(4)),
          minTimeMs: Number(minTimeMs.toFixed(4)),
          maxTimeMs: Number(maxTimeMs.toFixed(4)),
          stdDevMs: Number(stdDevMs.toFixed(4)),
          comparisons: totalComparisons,
          swaps: totalSwaps,
          writes: totalWrites,
          timedOut: didTimeout,
          error: errorMessage,
          rawTimes: runTimes,
        };

        benchmarkResults[sizeIdx][algoId] = stats;
      } else {
        benchmarkResults[sizeIdx][algoId] = {
          meanTimeMs: -1,
          medianTimeMs: -1,
          minTimeMs: -1,
          maxTimeMs: -1,
          stdDevMs: 0,
          comparisons: -1,
          swaps: -1,
          writes: -1,
          timedOut: true,
          error: errorMessage || 'Failed to complete',
          rawTimes: [],
        };
      }

      // Broadcast intermediate result to chart for real-time visualization!
      callbacks.onPartialResult([...benchmarkResults]);
    }
  }

  callbacks.onProgress({
    isRunning: false,
    currentAlgorithm: '',
    currentSize: 0,
    currentIteration: 0,
    totalSteps,
    completedSteps: totalSteps,
    percentage: 100,
    statusMessage: 'Benchmark completed successfully!',
  });

  callbacks.onComplete(benchmarkResults);
}
