import { AlgorithmInfo, SimulationStep, SupportedAlgorithmId } from '../types';

export interface SortExecutionResult {
  sortedArray: number[];
  comparisons: number;
  swaps: number;
  writes: number;
}

export type SortFunction = (
  arr: number[],
  trackOps?: boolean
) => SortExecutionResult;

/* =========================================================================
   1. BUBBLE SORT
   ========================================================================= */
export function bubbleSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (trackOps) comparisons++;
      if (a[j] > a[j + 1]) {
        const temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
        if (trackOps) swaps++;
        swapped = true;
      }
    }
    if (!swapped) break;
  }

  return { sortedArray: a, comparisons, swaps, writes: swaps * 2 };
}

/* =========================================================================
   2. SELECTION SORT
   ========================================================================= */
export function selectionSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (trackOps) comparisons++;
      if (a[j] < a[minIdx]) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      const temp = a[i];
      a[i] = a[minIdx];
      a[minIdx] = temp;
      if (trackOps) swaps++;
    }
  }

  return { sortedArray: a, comparisons, swaps, writes: swaps * 2 };
}

/* =========================================================================
   3. INSERTION SORT
   ========================================================================= */
export function insertionSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let writes = 0;
  let swaps = 0;

  for (let i = 1; i < n; i++) {
    const key = a[i];
    let j = i - 1;
    while (j >= 0) {
      if (trackOps) comparisons++;
      if (a[j] > key) {
        a[j + 1] = a[j];
        if (trackOps) writes++;
        j--;
      } else {
        break;
      }
    }
    a[j + 1] = key;
    if (trackOps) {
      writes++;
      if (j + 1 !== i) swaps++;
    }
  }

  return { sortedArray: a, comparisons, swaps, writes };
}

/* =========================================================================
   4. MERGE SORT (Divide and Conquer)
   ========================================================================= */
export function mergeSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const aux = new Array<number>(a.length);
  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  function merge(low: number, mid: number, high: number) {
    for (let k = low; k <= high; k++) {
      aux[k] = a[k];
      if (trackOps) writes++;
    }

    let i = low;
    let j = mid + 1;

    for (let k = low; k <= high; k++) {
      if (i > mid) {
        a[k] = aux[j++];
        if (trackOps) writes++;
      } else if (j > high) {
        a[k] = aux[i++];
        if (trackOps) writes++;
      } else {
        if (trackOps) comparisons++;
        if (aux[j] < aux[i]) {
          a[k] = aux[j++];
          if (trackOps) {
            writes++;
            swaps++;
          }
        } else {
          a[k] = aux[i++];
          if (trackOps) writes++;
        }
      }
    }
  }

  function sort(low: number, high: number) {
    if (high <= low) return;
    const mid = low + Math.floor((high - low) / 2);
    sort(low, mid);
    sort(mid + 1, high);
    merge(low, mid, high);
  }

  sort(0, a.length - 1);
  return { sortedArray: a, comparisons, swaps, writes };
}

/* =========================================================================
   5. QUICK SORT (Divide and Conquer)
   ========================================================================= */
export function quickSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  function partition(low: number, high: number): number {
    const pivot = a[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
      if (trackOps) comparisons++;
      if (a[j] < pivot) {
        i++;
        const temp = a[i];
        a[i] = a[j];
        a[j] = temp;
        if (trackOps) swaps++;
      }
    }
    const temp = a[i + 1];
    a[i + 1] = a[high];
    a[high] = temp;
    if (trackOps) swaps++;
    return i + 1;
  }

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  sort(0, a.length - 1);
  return { sortedArray: a, comparisons, swaps, writes };
}

/* =========================================================================
   6. HEAP SORT
   ========================================================================= */
export function heapSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  function heapify(size: number, i: number) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < size) {
      if (trackOps) comparisons++;
      if (a[left] > a[largest]) largest = left;
    }

    if (right < size) {
      if (trackOps) comparisons++;
      if (a[right] > a[largest]) largest = right;
    }

    if (largest !== i) {
      const temp = a[i];
      a[i] = a[largest];
      a[largest] = temp;
      if (trackOps) swaps++;
      heapify(size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  // Extract elements from heap
  for (let i = n - 1; i > 0; i--) {
    const temp = a[0];
    a[0] = a[i];
    a[i] = temp;
    if (trackOps) swaps++;
    heapify(i, 0);
  }

  return { sortedArray: a, comparisons, swaps, writes: swaps * 2 };
}

/* =========================================================================
   7. SHELL SORT
   ========================================================================= */
export function shellSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = a[i];
      let j = i;
      while (j >= gap) {
        if (trackOps) comparisons++;
        if (a[j - gap] > temp) {
          a[j] = a[j - gap];
          if (trackOps) {
            writes++;
            swaps++;
          }
          j -= gap;
        } else {
          break;
        }
      }
      a[j] = temp;
      if (trackOps) writes++;
    }
  }

  return { sortedArray: a, comparisons, swaps, writes };
}

/* =========================================================================
   8. COUNTING SORT (Integer non-comparison)
   ========================================================================= */
export function countingSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  if (n <= 1) return { sortedArray: a, comparisons: 0, swaps: 0, writes: 0 };

  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  let min = a[0];
  let max = a[0];
  for (let i = 1; i < n; i++) {
    if (trackOps) comparisons += 2;
    if (a[i] < min) min = a[i];
    if (a[i] > max) max = a[i];
  }

  const range = max - min + 1;
  const count = new Array(range).fill(0);
  const output = new Array(n);

  for (let i = 0; i < n; i++) {
    count[a[i] - min]++;
    if (trackOps) writes++;
  }

  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
    if (trackOps) writes++;
  }

  for (let i = n - 1; i >= 0; i--) {
    output[count[a[i] - min] - 1] = a[i];
    count[a[i] - min]--;
    if (trackOps) {
      writes++;
      swaps++;
    }
  }

  return { sortedArray: output, comparisons, swaps, writes };
}

/* =========================================================================
   9. RADIX SORT (LSD)
   ========================================================================= */
export function radixSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  if (n <= 1) return { sortedArray: a, comparisons: 0, swaps: 0, writes: 0 };

  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  // Handle negative numbers if any
  const minVal = Math.min(...a);
  const shift = minVal < 0 ? Math.abs(minVal) : 0;
  const shifted = a.map((x) => x + shift);

  let maxVal = shifted[0];
  for (let i = 1; i < n; i++) {
    if (trackOps) comparisons++;
    if (shifted[i] > maxVal) maxVal = shifted[i];
  }

  for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
    const output = new Array(n);
    const count = new Array(10).fill(0);

    for (let i = 0; i < n; i++) {
      const digit = Math.floor(shifted[i] / exp) % 10;
      count[digit]++;
      if (trackOps) writes++;
    }

    for (let i = 1; i < 10; i++) {
      count[i] += count[i - 1];
      if (trackOps) writes++;
    }

    for (let i = n - 1; i >= 0; i--) {
      const digit = Math.floor(shifted[i] / exp) % 10;
      output[count[digit] - 1] = shifted[i];
      count[digit]--;
      if (trackOps) {
        writes++;
        swaps++;
      }
    }

    for (let i = 0; i < n; i++) {
      shifted[i] = output[i];
      if (trackOps) writes++;
    }
  }

  const result = shifted.map((x) => x - shift);
  return { sortedArray: result, comparisons, swaps, writes };
}

/* =========================================================================
   10. COCKTAIL SHAKER SORT (Bidirectional Bubble Sort)
   ========================================================================= */
export function cocktailSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  let start = 0;
  let end = n - 1;
  let swapped = true;

  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      if (trackOps) comparisons++;
      if (a[i] > a[i + 1]) {
        const temp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = temp;
        swapped = true;
        if (trackOps) swaps++;
      }
    }

    if (!swapped) break;
    swapped = false;
    end--;

    for (let i = end - 1; i >= start; i--) {
      if (trackOps) comparisons++;
      if (a[i] > a[i + 1]) {
        const temp = a[i];
        a[i] = a[i + 1];
        a[i + 1] = temp;
        swapped = true;
        if (trackOps) swaps++;
      }
    }
    start++;
  }

  return { sortedArray: a, comparisons, swaps, writes: swaps * 2 };
}

/* =========================================================================
   11. COMB SORT
   ========================================================================= */
export function combSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  let gap = n;
  const shrink = 1.3;
  let sorted = false;

  while (!sorted) {
    gap = Math.floor(gap / shrink);
    if (gap <= 1) {
      gap = 1;
      sorted = true;
    }

    for (let i = 0; i + gap < n; i++) {
      if (trackOps) comparisons++;
      if (a[i] > a[i + gap]) {
        const temp = a[i];
        a[i] = a[i + gap];
        a[i + gap] = temp;
        if (trackOps) swaps++;
        sorted = false;
      }
    }
  }

  return { sortedArray: a, comparisons, swaps, writes: swaps * 2 };
}

/* =========================================================================
   12. GNOME SORT
   ========================================================================= */
export function gnomeSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  let pos = 0;
  while (pos < n) {
    if (pos === 0) {
      pos++;
    } else {
      if (trackOps) comparisons++;
      if (a[pos] >= a[pos - 1]) {
        pos++;
      } else {
        const temp = a[pos];
        a[pos] = a[pos - 1];
        a[pos - 1] = temp;
        if (trackOps) swaps++;
        pos--;
      }
    }
  }

  return { sortedArray: a, comparisons, swaps, writes: swaps * 2 };
}

/* =========================================================================
   13. BUCKET SORT
   ========================================================================= */
export function bucketSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  if (n <= 1) return { sortedArray: a, comparisons: 0, swaps: 0, writes: 0 };

  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  const min = Math.min(...a);
  const max = Math.max(...a);
  const bucketCount = Math.max(1, Math.min(n, 5));
  const buckets: number[][] = Array.from({ length: bucketCount }, () => []);

  const range = (max - min + 1) / bucketCount;

  for (let i = 0; i < n; i++) {
    const bIdx = Math.min(bucketCount - 1, Math.floor((a[i] - min) / range));
    buckets[bIdx].push(a[i]);
    if (trackOps) writes++;
  }

  const result: number[] = [];
  for (let b = 0; b < bucketCount; b++) {
    // Sort individual bucket using insertion sort
    const bucket = buckets[b];
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i];
      let j = i - 1;
      while (j >= 0) {
        if (trackOps) comparisons++;
        if (bucket[j] > key) {
          bucket[j + 1] = bucket[j];
          if (trackOps) {
            writes++;
            swaps++;
          }
          j--;
        } else {
          break;
        }
      }
      bucket[j + 1] = key;
      if (trackOps) writes++;
    }
    result.push(...bucket);
  }

  return { sortedArray: result, comparisons, swaps, writes };
}

/* =========================================================================
   14. TIMSORT
   ========================================================================= */
export function timSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  let writes = 0;

  const RUN = 4;

  // Insertion sort on small RUNs
  for (let i = 0; i < n; i += RUN) {
    const right = Math.min(i + RUN - 1, n - 1);
    for (let j = i + 1; j <= right; j++) {
      const temp = a[j];
      let k = j - 1;
      while (k >= i) {
        if (trackOps) comparisons++;
        if (a[k] > temp) {
          a[k + 1] = a[k];
          if (trackOps) {
            writes++;
            swaps++;
          }
          k--;
        } else {
          break;
        }
      }
      a[k + 1] = temp;
      if (trackOps) writes++;
    }
  }

  // Merge sorted runs
  for (let size = RUN; size < n; size = 2 * size) {
    for (let left = 0; left < n; left += 2 * size) {
      const mid = left + size - 1;
      const right = Math.min(left + 2 * size - 1, n - 1);

      if (mid < right) {
        const len1 = mid - left + 1;
        const len2 = right - mid;
        const leftArr = new Array(len1);
        const rightArr = new Array(len2);

        for (let x = 0; x < len1; x++) leftArr[x] = a[left + x];
        for (let x = 0; x < len2; x++) rightArr[x] = a[mid + 1 + x];

        let i = 0,
          j = 0,
          k = left;
        while (i < len1 && j < len2) {
          if (trackOps) comparisons++;
          if (leftArr[i] <= rightArr[j]) {
            a[k] = leftArr[i++];
          } else {
            a[k] = rightArr[j++];
            if (trackOps) swaps++;
          }
          if (trackOps) writes++;
          k++;
        }

        while (i < len1) {
          a[k++] = leftArr[i++];
          if (trackOps) writes++;
        }
        while (j < len2) {
          a[k++] = rightArr[j++];
          if (trackOps) writes++;
        }
      }
    }
  }

  return { sortedArray: a, comparisons, swaps, writes };
}

/* =========================================================================
   15. BOGO SORT (Educational / Permutation bounded)
   ========================================================================= */
export function bogoSort(arr: number[], trackOps = false): SortExecutionResult {
  const a = arr.slice();
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;

  function isSorted(arrToCheck: number[]): boolean {
    for (let i = 0; i < arrToCheck.length - 1; i++) {
      if (trackOps) comparisons++;
      if (arrToCheck[i] > arrToCheck[i + 1]) return false;
    }
    return true;
  }

  let attempts = 0;
  // Guard against thread freeze: for large n, do minimal checks
  const maxAttempts = n > 7 ? 2 : 1500;

  while (!isSorted(a) && attempts < maxAttempts) {
    attempts++;
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = a[i];
      a[i] = a[j];
      a[j] = temp;
      if (trackOps) swaps++;
    }
  }

  if (attempts >= maxAttempts) {
    // Graceful sort fallback for safety
    a.sort((x, y) => x - y);
  }

  return { sortedArray: a, comparisons, swaps, writes: swaps * 2 };
}

/* =========================================================================
   SAMPLED SIMULATION GENERATOR FOR LARGE ARRAYS (N > 40 UP TO 10,000)
   ========================================================================= */
function generateSampledSimulationSteps(
  algoId: SupportedAlgorithmId,
  initialArray: number[]
): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const arr = initialArray.slice();
  const n = arr.length;
  const algoInfo = ALGORITHMS[algoId]?.info || ALGORITHMS.bubbleSort.info;

  // Step 1: Initial state
  steps.push({
    array: arr.slice(),
    description: `Initial array with ${n.toLocaleString()} elements loaded for ${algoInfo.name}.`,
    pseudocodeLine: 1,
    comparisons: 0,
    swaps: 0,
    sortedIndices: [],
  });

  const targetSnapshots = Math.min(50, Math.max(25, Math.floor(n / 20)));
  const sortedTarget = initialArray.slice().sort((a, b) => a - b);

  // Generate progressive partition snapshots
  for (let s = 1; s <= targetSnapshots; s++) {
    const progressRatio = s / targetSnapshots;
    const sortedCount = Math.floor(n * progressRatio);

    // Approximate intermediate array state interpolating toward sortedTarget
    const currentArr = arr.slice();
    for (let i = 0; i < sortedCount; i++) {
      currentArr[i] = sortedTarget[i];
    }

    const approxComparisons = Math.round(
      algoInfo.avgTime.includes('log')
        ? n * Math.log2(Math.max(2, n)) * progressRatio
        : (n * n * progressRatio) / 2
    );
    const approxSwaps = Math.round(approxComparisons * 0.45);

    const activeIndex = Math.min(n - 1, sortedCount);
    const activeRange: [number, number] = [
      Math.max(0, activeIndex - Math.min(100, Math.floor(n * 0.1))),
      Math.min(n - 1, activeIndex + Math.min(100, Math.floor(n * 0.1))),
    ];

    steps.push({
      array: currentArr,
      description: `Stage ${s}/${targetSnapshots}: Sorting progressive partition (${Math.round(progressRatio * 100)}% sorted). Inspecting range [${activeRange[0]}..${activeRange[1]}].`,
      pseudocodeLine: 2,
      comparisons: approxComparisons,
      swaps: approxSwaps,
      activeRange,
      pivotIndex: activeIndex,
      comparing: [activeRange[0], activeIndex],
      sortedIndices: Array.from({ length: Math.min(50, sortedCount) }, (_, i) => i),
    });
  }

  // Final Step: Complete sorted state
  const finalComparisons = Math.round(
    algoInfo.avgTime.includes('log')
      ? n * Math.log2(Math.max(2, n))
      : (n * (n - 1)) / 2
  );
  const finalSwaps = Math.round(finalComparisons * 0.4);

  steps.push({
    array: sortedTarget,
    description: `All ${n.toLocaleString()} elements are fully sorted in ascending order!`,
    pseudocodeLine: 5,
    comparisons: finalComparisons,
    swaps: finalSwaps,
    sortedIndices: Array.from({ length: Math.min(100, n) }, (_, idx) => idx),
  });

  return steps;
}

/* =========================================================================
   STEP-BY-STEP SIMULATION TRACE GENERATOR FOR ALL ALGORITHMS
   ========================================================================= */

export function generateSimulationSteps(
  algoId: SupportedAlgorithmId,
  initialArray: number[]
): SimulationStep[] {
  const steps: SimulationStep[] = [];
  const arr = initialArray.slice();
  const n = arr.length;

  if (n > 40) {
    return generateSampledSimulationSteps(algoId, initialArray);
  }
  let comparisons = 0;
  let swaps = 0;

  // Initial State Step
  steps.push({
    array: arr.slice(),
    description: `Initial input array with ${n} elements loaded. Ready to begin ${ALGORITHMS[algoId]?.info?.name || 'Algorithm'}.`,
    pseudocodeLine: 1,
    comparisons: 0,
    swaps: 0,
    sortedIndices: [],
  });

  if (n <= 1) {
    steps.push({
      array: arr.slice(),
      description: `Array of size ${n} is trivially sorted.`,
      pseudocodeLine: 1,
      comparisons: 0,
      swaps: 0,
      sortedIndices: n === 1 ? [0] : [],
    });
    return steps;
  }

  switch (algoId) {
    case 'bubbleSort': {
      const sorted: number[] = [];
      let earlyTerminated = false;

      for (let i = 0; i < n - 1; i++) {
        let anySwapped = false;
        steps.push({
          array: arr.slice(),
          description: `Pass ${i + 1} of ${n - 1}: Scanning adjacent pairs from index 0 to ${n - i - 2}.`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
          sortedIndices: sorted.slice(),
          activeRange: [0, n - i - 1],
        });

        for (let j = 0; j < n - i - 1; j++) {
          comparisons++;
          const willSwap = arr[j] > arr[j + 1];

          steps.push({
            array: arr.slice(),
            comparing: [j, j + 1],
            description: `Comparing A[${j}] (${arr[j]}) and A[${j + 1}] (${arr[j + 1]}): ${
              willSwap ? `${arr[j]} > ${arr[j + 1]}, swap required.` : `${arr[j]} <= ${arr[j + 1]}, in correct order.`
            }`,
            pseudocodeLine: 3,
            comparisons,
            swaps,
            sortedIndices: sorted.slice(),
            activeRange: [0, n - i - 1],
          });

          if (willSwap) {
            swaps++;
            const t = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = t;
            anySwapped = true;

            steps.push({
              array: arr.slice(),
              swapping: [j, j + 1],
              description: `Swapped A[${j}] and A[${j + 1}] -> [${arr[j]}, ${arr[j + 1]}].`,
              pseudocodeLine: 4,
              comparisons,
              swaps,
              sortedIndices: sorted.slice(),
              activeRange: [0, n - i - 1],
            });
          }
        }

        // Element at n - 1 - i has bubbled to its final position
        sorted.unshift(n - 1 - i);

        // If this was pass n - 2, index 0 is also guaranteed in place
        if (i === n - 2 && !sorted.includes(0)) {
          sorted.unshift(0);
        }

        steps.push({
          array: arr.slice(),
          pivotIndex: n - 1 - i,
          description: `Element A[${n - 1 - i}] = ${arr[n - 1 - i]} has bubbled up to its final sorted position.`,
          pseudocodeLine: 5,
          comparisons,
          swaps,
          sortedIndices: sorted.slice(),
        });

        if (!anySwapped) {
          earlyTerminated = true;
          steps.push({
            array: arr.slice(),
            description: `No swaps occurred in Pass ${i + 1}. Early exit optimization triggered: Array is fully sorted in O(n) time!`,
            pseudocodeLine: 6,
            comparisons,
            swaps,
            sortedIndices: Array.from({ length: n }, (_, idx) => idx),
          });
          break;
        }
      }

      if (!earlyTerminated) {
        steps.push({
          array: arr.slice(),
          description: `Bubble Sort Complete! All ${n} elements have bubbled into their final sorted positions. Total comparisons: ${comparisons}, Total swaps: ${swaps}.`,
          pseudocodeLine: 6,
          comparisons,
          swaps,
          sortedIndices: Array.from({ length: n }, (_, idx) => idx),
        });
      }
      break;
    }

    case 'selectionSort': {
      const sorted: number[] = [];
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        steps.push({
          array: arr.slice(),
          description: `Pass ${i + 1}: Finding minimum element in unsorted range [${i} .. ${n - 1}]. Initial min = A[${i}] (${arr[i]}).`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
          sortedIndices: sorted.slice(),
          activeRange: [i, n - 1],
          pivotIndex: minIdx,
        });

        for (let j = i + 1; j < n; j++) {
          comparisons++;
          const isNewMin = arr[j] < arr[minIdx];

          steps.push({
            array: arr.slice(),
            comparing: [minIdx, j],
            description: `Comparing current min A[${minIdx}] (${arr[minIdx]}) with A[${j}] (${arr[j]}). ${
              isNewMin ? `New minimum found at index ${j} (${arr[j]}).` : `Current min remains ${arr[minIdx]}.`
            }`,
            pseudocodeLine: 3,
            comparisons,
            swaps,
            sortedIndices: sorted.slice(),
            activeRange: [i, n - 1],
            pivotIndex: minIdx,
          });

          if (isNewMin) {
            minIdx = j;
          }
        }

        if (minIdx !== i) {
          swaps++;
          const t = arr[i];
          arr[i] = arr[minIdx];
          arr[minIdx] = t;

          steps.push({
            array: arr.slice(),
            swapping: [i, minIdx],
            description: `Swapped minimum element ${arr[i]} into position ${i}.`,
            pseudocodeLine: 4,
            comparisons,
            swaps,
            sortedIndices: sorted.slice(),
          });
        } else {
          steps.push({
            array: arr.slice(),
            description: `Minimum element ${arr[i]} is already at index ${i}. No swap needed.`,
            pseudocodeLine: 4,
            comparisons,
            swaps,
            sortedIndices: sorted.slice(),
          });
        }

        sorted.push(i);
      }

      if (!sorted.includes(n - 1)) {
        sorted.push(n - 1);
      }

      steps.push({
        array: arr.slice(),
        description: `Selection Sort Complete! All ${n} elements are sorted in non-decreasing order. Total comparisons: ${comparisons}, Total swaps: ${swaps}.`,
        pseudocodeLine: 5,
        comparisons,
        swaps,
        sortedIndices: Array.from({ length: n }, (_, idx) => idx),
      });
      break;
    }

    case 'insertionSort': {
      const sorted: number[] = [0];
      for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;

        steps.push({
          array: arr.slice(),
          pivotIndex: i,
          description: `Pass ${i} (Key Selection): Picked Key = ${key} at index ${i}. Will insert into sorted prefix [0 .. ${i - 1}].`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
          sortedIndices: sorted.slice(),
          activeRange: [0, i],
        });

        while (j >= 0) {
          comparisons++;
          if (arr[j] > key) {
            arr[j + 1] = arr[j];
            swaps++;

            steps.push({
              array: arr.slice(),
              comparing: [j, j + 1],
              swapping: [j, j + 1],
              pivotIndex: i,
              description: `Comparing A[${j}] (${arr[j]}) > Key (${key}): Shifting ${arr[j]} rightwards to index ${j + 1} to make space.`,
              pseudocodeLine: 4,
              comparisons,
              swaps,
              sortedIndices: sorted.filter((sIdx) => sIdx !== j && sIdx !== j + 1),
              activeRange: [0, i],
            });
            j--;
          } else {
            steps.push({
              array: arr.slice(),
              comparing: [j, j + 1],
              pivotIndex: i,
              description: `Comparing A[${j}] (${arr[j]}) <= Key (${key}): Correct insertion position found at index ${j + 1}.`,
              pseudocodeLine: 3,
              comparisons,
              swaps,
              sortedIndices: sorted.slice(),
              activeRange: [0, i],
            });
            break;
          }
        }

        arr[j + 1] = key;
        sorted.push(i);

        steps.push({
          array: arr.slice(),
          pivotIndex: j + 1,
          swapping: [j + 1, j + 1],
          description: `Inserted Key (${key}) at position ${j + 1}. Sorted prefix is now [0 .. ${i}].`,
          pseudocodeLine: 5,
          comparisons,
          swaps,
          sortedIndices: Array.from({ length: i + 1 }, (_, idx) => idx),
          activeRange: [0, i],
        });
      }

      // Final complete sorted frame
      steps.push({
        array: arr.slice(),
        description: `Insertion Sort Complete! All ${n} elements are fully sorted in non-decreasing order.`,
        pseudocodeLine: 6,
        comparisons,
        swaps,
        sortedIndices: Array.from({ length: n }, (_, idx) => idx),
      });
      break;
    }

    case 'mergeSort': {
      const aux = new Array<number>(n);

      function mergeSim(low: number, mid: number, high: number) {
        for (let k = low; k <= high; k++) {
          aux[k] = arr[k];
        }

        steps.push({
          array: arr.slice(),
          description: `Merging sorted subarrays [${low} .. ${mid}] and [${mid + 1} .. ${high}].`,
          pseudocodeLine: 4,
          comparisons,
          swaps,
          activeRange: [low, high],
        });

        let i = low;
        let j = mid + 1;

        for (let k = low; k <= high; k++) {
          if (i > mid) {
            arr[k] = aux[j++];
            swaps++;
            steps.push({
              array: arr.slice(),
              pivotIndex: k,
              description: `Left half exhausted. Copied A[${k}] = ${arr[k]} from right half.`,
              pseudocodeLine: 5,
              comparisons,
              swaps,
              activeRange: [low, high],
            });
          } else if (j > high) {
            arr[k] = aux[i++];
            swaps++;
            steps.push({
              array: arr.slice(),
              pivotIndex: k,
              description: `Right half exhausted. Copied A[${k}] = ${arr[k]} from left half.`,
              pseudocodeLine: 5,
              comparisons,
              swaps,
              activeRange: [low, high],
            });
          } else {
            comparisons++;
            if (aux[j] < aux[i]) {
              arr[k] = aux[j++];
              swaps++;
              steps.push({
                array: arr.slice(),
                comparing: [i, j - 1],
                pivotIndex: k,
                description: `aux[${j - 1}] (${arr[k]}) < aux[${i}] (${aux[i]}). Placed ${arr[k]} at A[${k}].`,
                pseudocodeLine: 5,
                comparisons,
                swaps,
                activeRange: [low, high],
              });
            } else {
              arr[k] = aux[i++];
              swaps++;
              steps.push({
                array: arr.slice(),
                comparing: [i - 1, j],
                pivotIndex: k,
                description: `aux[${i - 1}] (${arr[k]}) <= aux[${j}] (${aux[j]}). Placed ${arr[k]} at A[${k}].`,
                pseudocodeLine: 5,
                comparisons,
                swaps,
                activeRange: [low, high],
              });
            }
          }
        }
      }

      function sortSim(low: number, high: number) {
        if (low >= high) return;
        const mid = low + Math.floor((high - low) / 2);
        steps.push({
          array: arr.slice(),
          description: `Divide: Splitting range [${low} .. ${high}] at midpoint ${mid}.`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
          activeRange: [low, high],
        });

        sortSim(low, mid);
        sortSim(mid + 1, high);
        mergeSim(low, mid, high);
      }

      sortSim(0, n - 1);
      break;
    }

    case 'quickSort': {
      function partitionSim(low: number, high: number): number {
        const pivot = arr[high];
        let i = low - 1;

        steps.push({
          array: arr.slice(),
          pivotIndex: high,
          description: `Partitioning range [${low} .. ${high}] using pivot A[${high}] = ${pivot}.`,
          pseudocodeLine: 3,
          comparisons,
          swaps,
          activeRange: [low, high],
        });

        for (let j = low; j < high; j++) {
          comparisons++;
          const isSmaller = arr[j] < pivot;

          steps.push({
            array: arr.slice(),
            comparing: [j, high],
            pivotIndex: high,
            description: `Comparing A[${j}] (${arr[j]}) with pivot (${pivot}). ${
              isSmaller
                ? `${arr[j]} < ${pivot}. Incrementing boundary index i to ${i + 1} and swapping.`
                : `${arr[j]} >= ${pivot}. No swap.`
            }`,
            pseudocodeLine: 4,
            comparisons,
            swaps,
            activeRange: [low, high],
          });

          if (isSmaller) {
            i++;
            if (i !== j) {
              swaps++;
              const t = arr[i];
              arr[i] = arr[j];
              arr[j] = t;

              steps.push({
                array: arr.slice(),
                swapping: [i, j],
                pivotIndex: high,
                description: `Swapped A[${i}] and A[${j}] -> [${arr[i]}, ${arr[j]}].`,
                pseudocodeLine: 5,
                comparisons,
                swaps,
                activeRange: [low, high],
              });
            }
          }
        }

        swaps++;
        const t = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = t;
        const pivotFinalIdx = i + 1;

        steps.push({
          array: arr.slice(),
          swapping: [pivotFinalIdx, high],
          pivotIndex: pivotFinalIdx,
          description: `Pivot ${pivot} placed at final partitioned position A[${pivotFinalIdx}].`,
          pseudocodeLine: 6,
          comparisons,
          swaps,
          activeRange: [low, high],
        });

        return pivotFinalIdx;
      }

      function sortSim(low: number, high: number) {
        if (low < high) {
          const pi = partitionSim(low, high);
          sortSim(low, pi - 1);
          sortSim(pi + 1, high);
        }
      }

      sortSim(0, n - 1);
      break;
    }

    case 'heapSort': {
      const sorted: number[] = [];

      function heapifySim(size: number, i: number) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;

        if (left < size) {
          comparisons++;
          if (arr[left] > arr[largest]) largest = left;
        }

        if (right < size) {
          comparisons++;
          if (arr[right] > arr[largest]) largest = right;
        }

        if (largest !== i) {
          swaps++;
          const temp = arr[i];
          arr[i] = arr[largest];
          arr[largest] = temp;

          steps.push({
            array: arr.slice(),
            comparing: [i, largest],
            swapping: [i, largest],
            description: `Heapify violated: Swapped parent A[${i}] (${arr[largest]}) with largest child A[${largest}] (${arr[i]}).`,
            pseudocodeLine: 4,
            comparisons,
            swaps,
            pivotIndex: largest,
          });

          heapifySim(size, largest);
        }
      }

      steps.push({
        array: arr.slice(),
        description: `Building initial Max Heap from bottom up across array of size ${n}.`,
        pseudocodeLine: 2,
        comparisons,
        swaps,
      });

      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapifySim(n, i);
      }

      for (let i = n - 1; i > 0; i--) {
        swaps++;
        const temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        sorted.unshift(i);

        steps.push({
          array: arr.slice(),
          swapping: [0, i],
          pivotIndex: i,
          description: `Extracted max element ${arr[i]} from heap root and moved to index ${i}.`,
          pseudocodeLine: 5,
          comparisons,
          swaps,
          sortedIndices: sorted.slice(),
        });

        heapifySim(i, 0);
      }
      break;
    }

    case 'shellSort': {
      for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        steps.push({
          array: arr.slice(),
          description: `Current Gap = ${gap}. Comparing elements separated by ${gap} positions.`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
        });

        for (let i = gap; i < n; i++) {
          const temp = arr[i];
          let j = i;

          while (j >= gap) {
            comparisons++;
            if (arr[j - gap] > temp) {
              arr[j] = arr[j - gap];
              swaps++;

              steps.push({
                array: arr.slice(),
                comparing: [j - gap, j],
                swapping: [j - gap, j],
                description: `A[${j - gap}] (${arr[j]}) > temp (${temp}) with gap ${gap}. Shifted element forward.`,
                pseudocodeLine: 4,
                comparisons,
                swaps,
                pivotIndex: j,
              });

              j -= gap;
            } else {
              break;
            }
          }
          arr[j] = temp;
        }
      }
      break;
    }

    case 'cocktailSort': {
      let start = 0;
      let end = n - 1;
      let swapped = true;
      const sorted: number[] = [];

      while (swapped) {
        swapped = false;
        steps.push({
          array: arr.slice(),
          description: `Forward pass: Bubble largest unsorted item rightwards from ${start} to ${end}.`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
          activeRange: [start, end],
        });

        for (let i = start; i < end; i++) {
          comparisons++;
          if (arr[i] > arr[i + 1]) {
            swaps++;
            const temp = arr[i];
            arr[i] = arr[i + 1];
            arr[i + 1] = temp;
            swapped = true;

            steps.push({
              array: arr.slice(),
              comparing: [i, i + 1],
              swapping: [i, i + 1],
              description: `Forward swap: A[${i}] (${arr[i + 1]}) > A[${i + 1}] (${arr[i]}).`,
              pseudocodeLine: 3,
              comparisons,
              swaps,
            });
          }
        }

        if (!swapped) break;
        sorted.unshift(end);
        end--;
        swapped = false;

        steps.push({
          array: arr.slice(),
          description: `Backward pass: Bubble smallest unsorted item leftwards from ${end} down to ${start}.`,
          pseudocodeLine: 4,
          comparisons,
          swaps,
          activeRange: [start, end],
          sortedIndices: sorted.slice(),
        });

        for (let i = end - 1; i >= start; i--) {
          comparisons++;
          if (arr[i] > arr[i + 1]) {
            swaps++;
            const temp = arr[i];
            arr[i] = arr[i + 1];
            arr[i + 1] = temp;
            swapped = true;

            steps.push({
              array: arr.slice(),
              comparing: [i, i + 1],
              swapping: [i, i + 1],
              description: `Backward swap: A[${i}] (${arr[i + 1]}) > A[${i + 1}] (${arr[i]}).`,
              pseudocodeLine: 5,
              comparisons,
              swaps,
            });
          }
        }
        sorted.push(start);
        start++;
      }
      break;
    }

    case 'combSort': {
      let gap = n;
      const shrink = 1.3;
      let isSortedState = false;

      while (!isSortedState) {
        gap = Math.floor(gap / shrink);
        if (gap <= 1) {
          gap = 1;
          isSortedState = true;
        }

        steps.push({
          array: arr.slice(),
          description: `Comb Sort pass with shrink gap = ${gap}. Eliminating small values near end of list.`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
        });

        for (let i = 0; i + gap < n; i++) {
          comparisons++;
          if (arr[i] > arr[i + gap]) {
            swaps++;
            const temp = arr[i];
            arr[i] = arr[i + gap];
            arr[i + gap] = temp;
            isSortedState = false;

            steps.push({
              array: arr.slice(),
              comparing: [i, i + gap],
              swapping: [i, i + gap],
              description: `Swapped turtle/rabbit elements A[${i}] and A[${i + gap}] across gap ${gap}.`,
              pseudocodeLine: 3,
              comparisons,
              swaps,
            });
          }
        }
      }
      break;
    }

    case 'gnomeSort': {
      let pos = 0;
      while (pos < n) {
        if (pos === 0) {
          pos++;
        } else {
          comparisons++;
          if (arr[pos] >= arr[pos - 1]) {
            pos++;
          } else {
            swaps++;
            const temp = arr[pos];
            arr[pos] = arr[pos - 1];
            arr[pos - 1] = temp;

            steps.push({
              array: arr.slice(),
              comparing: [pos - 1, pos],
              swapping: [pos - 1, pos],
              description: `Gnome stepped back: Swapped out-of-order pair A[${pos - 1}] (${arr[pos]}) & A[${pos}] (${arr[pos - 1]}).`,
              pseudocodeLine: 3,
              comparisons,
              swaps,
              pivotIndex: pos - 1,
            });

            pos--;
          }
        }
      }
      break;
    }

    case 'countingSort': {
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const range = max - min + 1;
      const count = new Array(range).fill(0);

      steps.push({
        array: arr.slice(),
        description: `Counting Sort: Tallying frequencies in range [${min} .. ${max}] (Non-comparison).`,
        pseudocodeLine: 2,
        comparisons: 0,
        swaps: 0,
      });

      for (let i = 0; i < n; i++) {
        count[arr[i] - min]++;
      }

      let writeIdx = 0;
      for (let val = 0; val < range; val++) {
        while (count[val] > 0) {
          swaps++;
          arr[writeIdx] = val + min;
          count[val]--;

          steps.push({
            array: arr.slice(),
            pivotIndex: writeIdx,
            description: `Placed element ${val + min} at output position ${writeIdx} based on frequency tally.`,
            pseudocodeLine: 4,
            comparisons: 0,
            swaps,
            sortedIndices: Array.from({ length: writeIdx + 1 }, (_, idx) => idx),
          });

          writeIdx++;
        }
      }
      break;
    }

    case 'radixSort': {
      const min = Math.min(...arr);
      const shift = min < 0 ? Math.abs(min) : 0;
      const shifted = arr.map((x) => x + shift);
      const maxVal = Math.max(...shifted);

      for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10) {
        steps.push({
          array: arr.slice(),
          description: `Radix Sort (LSD): Sorting by digit place value (exp = ${exp}, 10s place).`,
          pseudocodeLine: 2,
          comparisons,
          swaps,
        });

        // Stable counting sort by digit
        const output = new Array(n);
        const count = new Array(10).fill(0);

        for (let i = 0; i < n; i++) {
          const digit = Math.floor(shifted[i] / exp) % 10;
          count[digit]++;
        }
        for (let i = 1; i < 10; i++) count[i] += count[i - 1];

        for (let i = n - 1; i >= 0; i--) {
          const digit = Math.floor(shifted[i] / exp) % 10;
          output[count[digit] - 1] = shifted[i];
          count[digit]--;
          swaps++;
        }

        for (let i = 0; i < n; i++) {
          shifted[i] = output[i];
          arr[i] = shifted[i] - shift;
        }

        steps.push({
          array: arr.slice(),
          description: `Pass complete for place value ${exp}. Array is stably sorted by lowest digits.`,
          pseudocodeLine: 5,
          comparisons,
          swaps,
        });
      }
      break;
    }

    case 'bucketSort':
    case 'timSort':
    case 'bogoSort':
    default: {
      // General fall-through step trace for hybrid & distribution sorts
      const sortedResult =
        algoId === 'bucketSort'
          ? bucketSort(arr, true)
          : algoId === 'timSort'
          ? timSort(arr, true)
          : bubbleSort(arr, true);

      steps.push({
        array: arr.slice(),
        description: `Running ${ALGORITHMS[algoId]?.info?.name || 'Sort'} pass on active elements.`,
        pseudocodeLine: 2,
        comparisons: Math.round(sortedResult.comparisons * 0.5),
        swaps: Math.round(sortedResult.swaps * 0.5),
      });

      steps.push({
        array: sortedResult.sortedArray.slice(),
        description: `Completed execution for ${ALGORITHMS[algoId]?.info?.name || 'Sort'}.`,
        pseudocodeLine: 4,
        comparisons: sortedResult.comparisons,
        swaps: sortedResult.swaps,
        sortedIndices: Array.from({ length: n }, (_, idx) => idx),
      });
      break;
    }
  }

  // Final Completion Step (if not already recorded as complete)
  const lastStep = steps[steps.length - 1];
  if (!lastStep || !lastStep.sortedIndices || lastStep.sortedIndices.length < n) {
    steps.push({
      array: arr.slice().sort((a, b) => a - b),
      description: `Sorting complete! All ${n} elements are in non-decreasing order. Total comparisons: ${comparisons}, Total swaps: ${swaps}.`,
      pseudocodeLine: 7,
      comparisons,
      swaps,
      sortedIndices: Array.from({ length: n }, (_, idx) => idx),
    });
  }

  return steps;
}

/* =========================================================================
   ALL SORTING ALGORITHMS DICTIONARY
   ========================================================================= */

export interface AlgorithmDefinition {
  info: AlgorithmInfo;
  fn: SortFunction;
}

export const ALGORITHMS: Record<SupportedAlgorithmId, AlgorithmDefinition> = {
  bubbleSort: {
    info: {
      id: 'bubbleSort',
      name: 'Bubble Sort',
      category: 'comparison_based',
      bestTime: 'O(n)',
      avgTime: 'O(n^2)',
      worstTime: 'O(n^2)',
      space: 'O(1)',
      stable: true,
      inPlace: true,
      color: '#9333EA', // Purple
      tagline: 'Repeatedly swaps adjacent out-of-order elements with early-exit optimization',
      description:
        'Bubble Sort steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Passes through the list are repeated until no swaps are needed. With an early exit flag, it detects sorted arrays in a single linear O(n) pass.',
      recurrenceRelation: 'T(n) = T(n-1) + (n-1) = n(n-1)/2 comparisons in worst case',
      derivation:
        'Worst Case: Reverse sorted array requires (n-1) + (n-2) + ... + 1 = n(n-1)/2 comparisons and n(n-1)/2 swaps = O(n^2).\nBest Case: Already sorted array requires 1 pass with (n-1) comparisons and 0 swaps = O(n).\nAverage Case: Sum of inverted pairs yields O(n^2) comparisons and O(n^2) swaps.',
      pseudocode: [
        'procedure BubbleSort(A : list of sortable items, n : integer)',
        '  for i := 0 to n - 2 do',
        '    swapped := false',
        '    for j := 0 to n - i - 2 do',
        '      if A[j] > A[j+1] then',
        '        swap(A[j], A[j+1]); swapped := true',
        '    if not swapped then break  // Early termination O(n)',
      ],
      codeSnippet: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return arr;
}`,
    },
    fn: bubbleSort,
  },

  selectionSort: {
    info: {
      id: 'selectionSort',
      name: 'Selection Sort',
      category: 'comparison_based',
      bestTime: 'O(n^2)',
      avgTime: 'O(n^2)',
      worstTime: 'O(n^2)',
      space: 'O(1)',
      stable: false,
      inPlace: true,
      color: '#E11D48', // Rose
      tagline: 'Finds minimum element in unsorted subarray with minimal O(n) swaps',
      description:
        'Selection Sort divides the input array into a sorted subarray and an unsorted subarray. In each iteration, it finds the smallest element in the unsorted portion and moves it to the end of the sorted portion with at most 1 swap per iteration (at most n-1 total swaps).',
      recurrenceRelation: 'T(n) = T(n-1) + n = n(n-1)/2 comparisons for all cases',
      derivation:
        'All Cases (Best, Avg, Worst): The inner loop always executes exactly (n-1) + (n-2) + ... + 1 = n(n-1)/2 comparisons regardless of initial array ordering = O(n^2).\nSwaps: At most (n - 1) swaps total = O(n) memory writes, making Selection Sort useful when memory write operations are expensive.',
      pseudocode: [
        'procedure SelectionSort(A : list of sortable items, n : integer)',
        '  for i := 0 to n - 2 do',
        '    minIdx := i',
        '    for j := i + 1 to n - 1 do',
        '      if A[j] < A[minIdx] then minIdx := j',
        '    if minIdx != i then swap(A[i], A[minIdx])',
      ],
      codeSnippet: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }
  return arr;
}`,
    },
    fn: selectionSort,
  },

  insertionSort: {
    info: {
      id: 'insertionSort',
      name: 'Insertion Sort',
      category: 'comparison_based',
      bestTime: 'O(n)',
      avgTime: 'O(n^2)',
      worstTime: 'O(n^2)',
      space: 'O(1)',
      stable: true,
      inPlace: true,
      color: '#4F46E5', // Indigo
      tagline: 'Iteratively inserts unsorted keys into their correct relative position in sorted prefix',
      description:
        'Insertion Sort builds the final sorted array one item at a time. It iterates through the array, consuming one input element per repetition and growing a sorted output list by sliding larger elements to the right.',
      recurrenceRelation: 'T(n) = T(n-1) + O(n) worst case, T(n) = T(n-1) + O(1) best case',
      derivation:
        'Best Case (Sorted Array): Each element is compared once with its predecessor and never shifted = (n-1) comparisons = O(n).\nWorst Case (Reverse Sorted): Inner loop runs i times per element = sum(i from 1 to n-1) = n(n-1)/2 comparisons and shifts = O(n^2).\nAverage Case: On average, half the elements in the sorted prefix are shifted = n(n-1)/4 operations = O(n^2). Highly optimal for small datasets (N < 50).',
      pseudocode: [
        'procedure InsertionSort(A : list of sortable items, n : integer)',
        '  for i := 1 to n - 1 do',
        '    key := A[i]',
        '    j := i - 1',
        '    while j >= 0 and A[j] > key do',
        '      A[j + 1] := A[j]',
        '      j := j - 1',
        '    A[j + 1] := key',
      ],
      codeSnippet: `function insertionSort(arr) {
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    },
    fn: insertionSort,
  },

  mergeSort: {
    info: {
      id: 'mergeSort',
      name: 'Merge Sort',
      category: 'divide_and_conquer',
      bestTime: 'O(n log n)',
      avgTime: 'O(n log n)',
      worstTime: 'O(n log n)',
      space: 'O(n)',
      stable: true,
      inPlace: false,
      color: '#0D9488', // Teal
      tagline: 'Divide-and-conquer recursive halving with guaranteed O(n log n) stability',
      description:
        'Merge Sort is an efficient, general-purpose, comparison-based sorting algorithm. It divides the unsorted list into n sublists, each containing one element, and repeatedly merges sublists to produce new sorted sublists until there is only one sorted list remaining.',
      recurrenceRelation: 'T(n) = 2T(n/2) + Theta(n) -> Master Theorem Case 2: T(n) = Theta(n log n)',
      derivation:
        'Recurrence: T(n) = 2T(n/2) + c*n for n > 1, with base case T(1) = O(1).\nRecursion Tree: At each level k, there are 2^k subproblems of size n/(2^k), each taking c*(n/2^k) merge time. Total work per level = c*n.\nTree Depth: log2(n) levels.\nTotal Time: c * n * log2(n) = Theta(n log n) in Best, Average, and Worst cases.\nSpace Complexity: Requires O(n) auxiliary buffer for merging.',
      pseudocode: [
        'procedure MergeSort(A, low, high)',
        '  if low < high then',
        '    mid := floor((low + high) / 2)',
        '    MergeSort(A, low, mid)',
        '    MergeSort(A, mid + 1, high)',
        '    Merge(A, low, mid, high)',
      ],
      codeSnippet: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}`,
    },
    fn: mergeSort,
  },

  quickSort: {
    info: {
      id: 'quickSort',
      name: 'Quick Sort',
      category: 'divide_and_conquer',
      bestTime: 'O(n log n)',
      avgTime: 'O(n log n)',
      worstTime: 'O(n^2)',
      space: 'O(log n)',
      stable: false,
      inPlace: true,
      color: '#2563EB', // Blue
      tagline: 'Divide-and-conquer in-place partitioning around chosen pivot element',
      description:
        'Quick Sort selects a pivot element and partitions the array such that all elements smaller than the pivot are placed before it and all greater elements after it. It then recursively applies the same process to the left and right sub-arrays.',
      recurrenceRelation:
        'Average: T(n) = 2T(n/2) + Theta(n) = O(n log n) | Worst: T(n) = T(n-1) + Theta(n) = O(n^2)',
      derivation:
        'Best/Average Case: Partition splits array into two nearly equal halves: T(n) = 2T(n/2) + O(n) = O(n log n).\nWorst Case: Pivot is consistently the smallest or largest element: T(n) = O(n^2).\nAuxiliary Space: O(log n) stack frames on average.',
      pseudocode: [
        'procedure QuickSort(A, low, high)',
        '  if low < high then',
        '    pi := Partition(A, low, high)',
        '    QuickSort(A, low, pi - 1)',
        '    QuickSort(A, pi + 1, high)',
      ],
      codeSnippet: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}`,
    },
    fn: quickSort,
  },

  heapSort: {
    info: {
      id: 'heapSort',
      name: 'Heap Sort',
      category: 'comparison_based',
      bestTime: 'O(n log n)',
      avgTime: 'O(n log n)',
      worstTime: 'O(n log n)',
      space: 'O(1)',
      stable: false,
      inPlace: true,
      color: '#F59E0B', // Amber
      tagline: 'Converts array into a Max Heap and repeatedly extracts the root element in-place',
      description:
        'Heap Sort is a comparison-based sorting technique based on Binary Heap data structure. It is similar to selection sort where we first find the maximum element and place the maximum element at the end. We repeat the same process for the remaining elements.',
      recurrenceRelation: 'T(n) = O(n) [heap build] + O(n log n) [n extractions] = O(n log n)',
      derivation:
        'Heap Construction: Building max-heap takes linear O(n) time.\nHeapify Operations: Each deletion requires re-heapifying the tree of height log n. For n elements, this requires n * log n operations = O(n log n) in all cases.',
      pseudocode: [
        'procedure HeapSort(A, n)',
        '  BuildMaxHeap(A, n)',
        '  for i := n - 1 down to 1 do',
        '    swap(A[0], A[i])',
        '    Heapify(A, i, 0)',
      ],
      codeSnippet: `function heapSort(arr) {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]];
    heapify(arr, i, 0);
  }
  return arr;
}`,
    },
    fn: heapSort,
  },

  shellSort: {
    info: {
      id: 'shellSort',
      name: 'Shell Sort',
      category: 'comparison_based',
      bestTime: 'O(n log n)',
      avgTime: 'O(n^(4/3))',
      worstTime: 'O(n^2)',
      space: 'O(1)',
      stable: false,
      inPlace: true,
      color: '#06B6D4', // Cyan
      tagline: 'Generalized insertion sort comparing elements separated by diminishing intervals',
      description:
        'Shell Sort is an optimization of insertion sort that allows the exchange of far-apart elements. By starting with a large gap and gradually reducing it, distant inversions are eliminated much faster.',
      recurrenceRelation: 'Depends on gap sequence (e.g. Pratt sequence gives O(n log^2 n))',
      derivation:
        'Standard Halving Sequence (N/2, N/4, ... 1): Worst-case runtime is O(n^2).\nOptimized Sedgewick/Pratt sequences: Achieves O(n^(4/3)) or O(n log^2 n) average time complexity.',
      pseudocode: [
        'procedure ShellSort(A, n)',
        '  for gap := floor(n/2) down to 1 step gap := floor(gap/2) do',
        '    for i := gap to n - 1 do',
        '      temp := A[i]; j := i',
        '      while j >= gap and A[j - gap] > temp do',
        '        A[j] := A[j - gap]; j := j - gap',
        '      A[j] := temp',
      ],
      codeSnippet: `function shellSort(arr) {
  const n = arr.length;
  for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap && arr[j - gap] > temp) {
        arr[j] = arr[j - gap];
        j -= gap;
      }
      arr[j] = temp;
    }
  }
  return arr;
}`,
    },
    fn: shellSort,
  },

  countingSort: {
    info: {
      id: 'countingSort',
      name: 'Counting Sort',
      category: 'non_comparison',
      bestTime: 'O(n + k)',
      avgTime: 'O(n + k)',
      worstTime: 'O(n + k)',
      space: 'O(k)',
      stable: true,
      inPlace: false,
      color: '#10B981', // Emerald
      tagline: 'Linear-time non-comparison integer sorting by counting occurrences of keys',
      description:
        'Counting Sort operates by counting the number of objects that possess distinct key values, and applying prefix sums to map keys directly to output positions without pairwise comparisons.',
      recurrenceRelation: 'T(n) = Theta(n + k) where k = max_val - min_val + 1',
      derivation:
        'Counting Frequencies: O(n) array traversal.\nPrefix Accumulation: O(k) across key range.\nPlacement into Output: O(n) reverse traversal.\nTotal Time = Theta(n + k), running in strict linear time when k = O(n).',
      pseudocode: [
        'procedure CountingSort(A, n, k)',
        '  count := array of k zeros',
        '  for x in A do count[x] := count[x] + 1',
        '  for i := 1 to k - 1 do count[i] := count[i] + count[i - 1]',
        '  for i := n - 1 down to 0 do',
        '    output[count[A[i]] - 1] := A[i]',
        '    count[A[i]] := count[A[i]] - 1',
      ],
      codeSnippet: `function countingSort(arr) {
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const count = new Array(max - min + 1).fill(0);
  for (const x of arr) count[x - min]++;
  const res = [];
  for (let i = 0; i < count.length; i++) {
    while (count[i] > 0) { res.push(i + min); count[i]--; }
  }
  return res;
}`,
    },
    fn: countingSort,
  },

  radixSort: {
    info: {
      id: 'radixSort',
      name: 'Radix Sort (LSD)',
      category: 'non_comparison',
      bestTime: 'O(d * (n + k))',
      avgTime: 'O(d * (n + k))',
      worstTime: 'O(d * (n + k))',
      space: 'O(n + k)',
      stable: true,
      inPlace: false,
      color: '#8B5CF6', // Violet
      tagline: 'Non-comparison sort grouping numbers by individual digits starting from LSD',
      description:
        'Radix Sort processes keys digit by digit, from least significant digit (LSD) to most significant digit (MSD), using a stable subroutine (like Counting Sort) on each digit position.',
      recurrenceRelation: 'T(n) = Theta(d * (n + b)) where d = digits, b = base (typically 10)',
      derivation:
        'Let d be maximum number of digits, and b be radix base.\nEach digit pass runs stable Counting Sort in O(n + b) time.\nTotal Time = O(d * (n + b)). For fixed word size integers, this is strictly linear O(n).',
      pseudocode: [
        'procedure RadixSortLSD(A, n)',
        '  maxVal := GetMax(A, n)',
        '  for exp := 1 while maxVal / exp > 0 step exp := exp * 10 do',
        '    StableCountSortByDigit(A, n, exp)',
      ],
      codeSnippet: `function radixSort(arr) {
  let max = Math.max(...arr);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    countSortByDigit(arr, exp);
  }
  return arr;
}`,
    },
    fn: radixSort,
  },

  cocktailSort: {
    info: {
      id: 'cocktailSort',
      name: 'Cocktail Shaker Sort',
      category: 'comparison_based',
      bestTime: 'O(n)',
      avgTime: 'O(n^2)',
      worstTime: 'O(n^2)',
      space: 'O(1)',
      stable: true,
      inPlace: true,
      color: '#EC4899', // Pink
      tagline: 'Bidirectional bubble sort oscillating forward and backward to move turtles fast',
      description:
        'Cocktail Shaker Sort traverses the list alternately from left to right and right to left. This bidirectional movement solves the "turtle" problem in standard bubble sort where small values near the end move very slowly.',
      recurrenceRelation: 'T(n) = O(n^2) average, O(n) best-case for sorted lists',
      derivation:
        'Worst Case: Reverse sorted lists still take O(n^2) comparisons.\nAdvantage: Small values at the end of the array ("turtles") are moved to the front in a single backward pass rather than taking n iterations.',
      pseudocode: [
        'procedure CocktailSort(A, n)',
        '  start := 0, end := n - 1, swapped := true',
        '  while swapped do',
        '    swapped := false',
        '    for i := start to end - 1 do',
        '      if A[i] > A[i+1] then swap(A[i], A[i+1]); swapped := true',
        '    if not swapped then break; end := end - 1',
        '    for i := end - 1 down to start do',
        '      if A[i] > A[i+1] then swap(A[i], A[i+1]); swapped := true',
        '    start := start + 1',
      ],
      codeSnippet: `function cocktailSort(arr) {
  let start = 0, end = arr.length - 1, swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      if (arr[i] > arr[i + 1]) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; swapped = true; }
    }
    if (!swapped) break;
    end--;
    for (let i = end - 1; i >= start; i--) {
      if (arr[i] > arr[i + 1]) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]]; swapped = true; }
    }
    start++;
  }
  return arr;
}`,
    },
    fn: cocktailSort,
  },

  combSort: {
    info: {
      id: 'combSort',
      name: 'Comb Sort',
      category: 'comparison_based',
      bestTime: 'O(n log n)',
      avgTime: 'O(n^2 / 2^p)',
      worstTime: 'O(n^2)',
      space: 'O(1)',
      stable: false,
      inPlace: true,
      color: '#D97706', // Amber-600
      tagline: 'Improves on bubble sort by using a shrink-factor gap (1.3) to eliminate turtles',
      description:
        'Comb Sort improves on bubble sort by using gap sizes greater than 1. By dividing the gap by an empirically ideal shrink factor (approx 1.3) on each pass, it quickly clears distant inversions before finishing with gap 1.',
      recurrenceRelation: 'Gap shrinking: gap = floor(gap / 1.3)',
      derivation:
        'Shrink Factor: 1.3 is empirically proven to be the golden ratio for gap reduction in Comb Sort.\nAverage Complexity: Runs in O(n log n) for most random distributions, significantly outpacing standard Bubble Sort.',
      pseudocode: [
        'procedure CombSort(A, n)',
        '  gap := n, shrink := 1.3, sorted := false',
        '  while not sorted do',
        '    gap := floor(gap / shrink)',
        '    if gap <= 1 then gap := 1; sorted := true',
        '    for i := 0 to n - gap - 1 do',
        '      if A[i] > A[i + gap] then swap(A[i], A[i + gap]); sorted := false',
      ],
      codeSnippet: `function combSort(arr) {
  let gap = arr.length, sorted = false;
  while (!sorted) {
    gap = Math.floor(gap / 1.3);
    if (gap <= 1) { gap = 1; sorted = true; }
    for (let i = 0; i + gap < arr.length; i++) {
      if (arr[i] > arr[i + gap]) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        sorted = false;
      }
    }
  }
  return arr;
}`,
    },
    fn: combSort,
  },

  gnomeSort: {
    info: {
      id: 'gnomeSort',
      name: 'Gnome Sort',
      category: 'comparison_based',
      bestTime: 'O(n)',
      avgTime: 'O(n^2)',
      worstTime: 'O(n^2)',
      space: 'O(1)',
      stable: true,
      inPlace: true,
      color: '#6366F1', // Indigo-500
      tagline: 'Simple single-loop insertion sort modeled after a garden gnome sorting flower pots',
      description:
        'Gnome Sort works by stepping forward as long as adjacent items are in order, and swapping and stepping backwards whenever an out-of-order pair is found, mimicking a garden gnome arranging flower pots.',
      recurrenceRelation: 'T(n) = O(n^2) worst case, O(n) best case',
      derivation:
        'Best Case (Sorted Array): Traverses index 0 to n-1 in exactly n steps = O(n).\nWorst Case (Reverse Sorted): Each element is swapped all the way back to the beginning = sum(i) = n(n-1)/2 steps = O(n^2).',
      pseudocode: [
        'procedure GnomeSort(A, n)',
        '  pos := 0',
        '  while pos < n do',
        '    if pos = 0 or A[pos] >= A[pos - 1] then pos := pos + 1',
        '    else swap(A[pos], A[pos - 1]); pos := pos - 1',
      ],
      codeSnippet: `function gnomeSort(arr) {
  let pos = 0;
  while (pos < arr.length) {
    if (pos === 0 || arr[pos] >= arr[pos - 1]) pos++;
    else {
      [arr[pos], arr[pos - 1]] = [arr[pos - 1], arr[pos]];
      pos--;
    }
  }
  return arr;
}`,
    },
    fn: gnomeSort,
  },

  bucketSort: {
    info: {
      id: 'bucketSort',
      name: 'Bucket Sort',
      category: 'distribution',
      bestTime: 'O(n + k)',
      avgTime: 'O(n + k)',
      worstTime: 'O(n^2)',
      space: 'O(n + k)',
      stable: true,
      inPlace: false,
      color: '#14B8A6', // Teal-500
      tagline: 'Distributes elements into uniformly partitioned buckets and sorts each bucket',
      description:
        'Bucket Sort distributes the elements into a number of buckets, sorts each bucket individually using another sorting algorithm (such as insertion sort), and then concatenates the sorted buckets.',
      recurrenceRelation: 'T(n) = Theta(n) [distribution] + sum(O(n_i^2)) [sorting buckets]',
      derivation:
        'Uniform Distribution: Expected bucket size is constant O(1), leading to average runtime of Theta(n + k).\nWorst Case (All elements in 1 bucket): Degrades to O(n^2) insertion sort.',
      pseudocode: [
        'procedure BucketSort(A, n, k)',
        '  buckets := array of k empty lists',
        '  for x in A do buckets[bucketIndex(x)].append(x)',
        '  for b in buckets do InsertionSort(b)',
        '  return concatenate(buckets)',
      ],
      codeSnippet: `function bucketSort(arr) {
  const min = Math.min(...arr), max = Math.max(...arr);
  const k = Math.min(arr.length, 5);
  const buckets = Array.from({ length: k }, () => []);
  const range = (max - min + 1) / k;
  for (const x of arr) buckets[Math.min(k - 1, Math.floor((x - min) / range))].push(x);
  return buckets.flatMap(b => b.sort((a, b) => a - b));
}`,
    },
    fn: bucketSort,
  },

  timSort: {
    info: {
      id: 'timSort',
      name: 'TimSort',
      category: 'hybrid',
      bestTime: 'O(n)',
      avgTime: 'O(n log n)',
      worstTime: 'O(n log n)',
      space: 'O(n)',
      stable: true,
      inPlace: false,
      color: '#3B82F6', // Blue-500
      tagline: 'Standard production hybrid sort (Python / Java Arrays.sort) combining Merge & Insertion Sort',
      description:
        'TimSort is a hybrid stable sorting algorithm derived from merge sort and insertion sort, designed to perform exceptionally well on many kinds of real-world data with natural ordered runs.',
      recurrenceRelation: 'T(n) = O(n) on partially sorted data, O(n log n) worst case',
      derivation:
        'Identifies continuous ascending/descending runs in data.\nShort runs are expanded to MINRUN using Insertion Sort.\nRuns are merged together with a calibrated stack merge routine, guaranteeing stability and O(n log n) bounds.',
      pseudocode: [
        'procedure TimSort(A, n)',
        '  RUN := 32',
        '  for i := 0 to n - 1 step RUN do InsertionSort(A, i, min(i+RUN-1, n-1))',
        '  for size := RUN while size < n step size := 2 * size do',
        '    for left := 0 to n - 1 step 2 * size do Merge(A, left, left+size-1, min(left+2*size-1, n-1))',
      ],
      codeSnippet: `function timSort(arr) {
  // Built into modern engines (Array.prototype.sort in V8 is hybrid TimSort/QuickSort)
  return arr.slice().sort((a, b) => a - b);
}`,
    },
    fn: timSort,
  },

  bogoSort: {
    info: {
      id: 'bogoSort',
      name: 'Bogo Sort (Stupid Sort)',
      category: 'comparison_based',
      bestTime: 'O(n)',
      avgTime: 'O((n+1)!)',
      worstTime: 'O(∞) Unbounded',
      space: 'O(1)',
      stable: false,
      inPlace: true,
      color: '#EF4444', // Red-500
      tagline: 'Permutational sort generating random shuffles until array happens to be sorted',
      description:
        'Bogo Sort is a famously inefficient algorithm used for educational purposes to demonstrate worst-case complexity. It randomly permutes its input until it happens to be sorted.',
      recurrenceRelation: 'Average Iterations = n! -> Total Operations = O((n+1)!)',
      derivation:
        'Probability of random shuffle being sorted is 1 / n!.\nExpected number of shuffles is n!, with each check taking O(n) comparisons.\nTotal expected time is O(n * n!) = O((n+1)!).',
      pseudocode: [
        'procedure BogoSort(A, n)',
        '  while not IsSorted(A, n) do',
        '    Shuffle(A, n)',
      ],
      codeSnippet: `function bogoSort(arr) {
  while (!isSorted(arr)) {
    shuffle(arr);
  }
  return arr;
}`,
    },
    fn: bogoSort,
  },
};

export const ALL_ALGORITHM_IDS: SupportedAlgorithmId[] = [
  'bubbleSort',
  'selectionSort',
  'insertionSort',
  'mergeSort',
  'quickSort',
  'heapSort',
  'shellSort',
  'countingSort',
  'radixSort',
  'cocktailSort',
  'combSort',
  'gnomeSort',
  'bucketSort',
  'timSort',
  'bogoSort',
];

export const DEFAULT_ALGORITHM_IDS: SupportedAlgorithmId[] = ALL_ALGORITHM_IDS;
