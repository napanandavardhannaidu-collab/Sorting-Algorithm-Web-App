export type DistributionType = 
  | 'random' 
  | 'nearly_sorted' 
  | 'reversed' 
  | 'few_unique' 
  | 'sorted' 
  | 'sawtooth';

export type ComplexityClass = string;

export type SupportedAlgorithmId = 
  | 'bubbleSort'
  | 'selectionSort'
  | 'insertionSort'
  | 'mergeSort'
  | 'quickSort'
  | 'heapSort'
  | 'shellSort'
  | 'countingSort'
  | 'radixSort'
  | 'cocktailSort'
  | 'combSort'
  | 'gnomeSort'
  | 'bucketSort'
  | 'timSort'
  | 'bogoSort';

export interface AlgorithmInfo {
  id: SupportedAlgorithmId;
  name: string;
  category: 'divide_and_conquer' | 'comparison_based' | 'non_comparison' | 'hybrid' | 'distribution';
  bestTime: ComplexityClass;
  avgTime: ComplexityClass;
  worstTime: ComplexityClass;
  space: string;
  stable: boolean;
  inPlace: boolean;
  color: string;
  tagline: string;
  description: string;
  recurrenceRelation?: string;
  derivation: string;
  pseudocode: string[];
  codeSnippet: string;
  codeSnippets?: {
    cpp: string;
    python: string;
    java: string;
    javascript: string;
  };
  logicExplanation?: string[];
  loopInvariant?: string;
}

export interface SimulationStep {
  array: number[];
  comparing?: [number, number];
  swapping?: [number, number];
  pivotIndex?: number;
  sortedIndices?: number[];
  activeRange?: [number, number];
  description: string;
  pseudocodeLine?: number;
  comparisons: number;
  swaps: number;
  auxMemory?: number;
}

export interface MetricStats {
  meanTimeMs: number;
  medianTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  stdDevMs: number;
  comparisons: number;
  swaps: number;
  writes: number;
  timedOut: boolean;
  error?: string;
  rawTimes: number[];
}

export interface SizeBenchmarkData {
  size: number;
  [algorithmId: string]: MetricStats | number | undefined;
}

export interface BenchmarkConfig {
  sizes: number[];
  selectedAlgorithms: string[];
  distribution: DistributionType;
  iterations: number;
  measureDetailedOps: boolean;
  timeoutMs: number;
  warmupRuns: number;
  customSizeInput?: string;
}

export interface BenchmarkProgress {
  isRunning: boolean;
  currentAlgorithm: string;
  currentSize: number;
  currentIteration: number;
  totalSteps: number;
  completedSteps: number;
  percentage: number;
  statusMessage: string;
}

export type PlotMetric = 'time' | 'comparisons' | 'swaps' | 'ops' | 'throughput';
export type ScaleType = 'linear' | 'logarithmic';

