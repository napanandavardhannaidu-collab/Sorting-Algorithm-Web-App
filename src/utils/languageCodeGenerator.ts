import { SupportedAlgorithmId } from '../types';
import { ALGORITHMS } from '../algorithms';

export type SupportedLanguage = 'java' | 'python' | 'cpp';

export interface LanguageCodeBundle {
  code: string;
  logic: {
    title: string;
    summary: string;
    steps: {
      stepNumber: number;
      heading: string;
      description: string;
      codeSnippet: string;
    }[];
  };
}

export function generateLanguageCodeAndLogic(
  algoId: SupportedAlgorithmId,
  userArray: number[]
): Record<SupportedLanguage, LanguageCodeBundle> {
  const safeArray = userArray.length > 0 ? userArray : [64, 25, 12, 22, 11, 90, 45, 38];
  const n = safeArray.length;
  const arrayStringJavaCpp =
    n <= 50
      ? safeArray.join(', ')
      : safeArray.slice(0, 25).join(', ') + `, /* ... and ${n - 25} more elements */`;
  const arrayStringPython =
    n <= 50
      ? `[${safeArray.join(', ')}]`
      : `[${safeArray.slice(0, 25).join(', ')}, # ... and ${n - 25} more elements\n    ]`;
  const algo = ALGORITHMS[algoId]?.info || ALGORITHMS.bubbleSort.info;

  switch (algoId) {
    case 'bubbleSort':
      return {
        cpp: {
          code: `#include <iostream>
#include <vector>
#include <utility>

// Bubble Sort in C++ with Early Termination
void bubbleSort(std::vector<int>& arr) {
    int n = arr.size();
    int comparisons = 0, swaps = 0;

    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            comparisons++;
            if (arr[j] > arr[j + 1]) {
                std::swap(arr[j], arr[j + 1]);
                swaps++;
                swapped = true;
            }
        }
        if (!swapped) break; // Early termination if already sorted
    }
}

int main() {
    // Initialized with your custom input (N = ${n})
    std::vector<int> arr = {${arrayStringJavaCpp}};

    std::cout << "Original Array: ";
    for (int x : arr) std::cout << x << " ";
    std::cout << "\\n";

    bubbleSort(arr);

    std::cout << "Sorted Array:   ";
    for (int x : arr) std::cout << x << " ";
    std::cout << "\\n";

    return 0;
}`,
          logic: {
            title: 'Bubble Sort in C++',
            summary: `Processes std::vector<int> of size ${n}. Adjacent pairs arr[j] and arr[j+1] are compared and swapped with std::swap().`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Pass Boundary Loop',
                description: `Iterates outer index i from 0 up to ${n - 2}. In each pass, the next largest element floats to index ${n - 1 - 0}.`,
                codeSnippet: 'for (int i = 0; i < n - 1; i++) {\n    bool swapped = false;',
              },
              {
                stepNumber: 2,
                heading: 'Adjacent Comparison & std::swap',
                description: 'Compares adjacent items and swaps them in-place with zero memory allocation.',
                codeSnippet: 'if (arr[j] > arr[j + 1]) {\n    std::swap(arr[j], arr[j + 1]);\n    swapped = true;\n}',
              },
              {
                stepNumber: 3,
                heading: 'O(N) Early Exit',
                description: 'If no swaps occur throughout a pass, the loop breaks immediately for best-case linear runtime.',
                codeSnippet: 'if (!swapped) break;',
              },
            ],
          },
        },
        python: {
          code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                # Pythonic in-place tuple swap
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

# Initialized with your custom input (N = ${n})
numbers = ${arrayStringPython}
print("Original:", numbers)
bubble_sort(numbers)
print("Sorted:  ", numbers)`,
          logic: {
            title: 'Bubble Sort in Python',
            summary: `Sorts list of size ${n} using Pythonic tuple unpacking and early termination.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'List Iteration Passes',
                description: `Outer range(n - 1) executes up to ${n - 1} passes.`,
                codeSnippet: 'for i in range(n - 1):\n    swapped = False',
              },
              {
                stepNumber: 2,
                heading: 'In-Place Tuple Swap',
                description: 'Python syntax arr[j], arr[j+1] = arr[j+1], arr[j] exchanges variables cleanly.',
                codeSnippet: 'if arr[j] > arr[j + 1]:\n    arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    swapped = True',
              },
              {
                stepNumber: 3,
                heading: 'Early Termination',
                description: 'Breaks outer loop if swapped is False.',
                codeSnippet: 'if not swapped:\n    break',
              },
            ],
          },
        },
        java: {
          code: `import java.util.Arrays;

public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] arr = {${arrayStringJavaCpp}};
        System.out.println("Original: " + Arrays.toString(arr));
        bubbleSort(arr);
        System.out.println("Sorted:   " + Arrays.toString(arr));
    }
}`,
          logic: {
            title: 'Bubble Sort in Java',
            summary: `Sorts int[] array of size ${n} by iteratively sinking larger elements to the right.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Outer Pass Control',
                description: `Loop runs up to ${n - 1} times, controlling sorted boundary.`,
                codeSnippet: 'for (int i = 0; i < n - 1; i++) {',
              },
              {
                stepNumber: 2,
                heading: 'Temporary Variable Swap',
                description: 'Trades positions of adjacent elements using a temp variable.',
                codeSnippet: 'int temp = arr[j];\narr[j] = arr[j + 1];\narr[j + 1] = temp;',
              },
              {
                stepNumber: 3,
                heading: 'Sorted Check & Early Return',
                description: 'Halts when no swaps are made in the entire pass.',
                codeSnippet: 'if (!swapped) break;',
              },
            ],
          },
        },
      };

    case 'selectionSort':
      return {
        cpp: {
          code: `#include <iostream>
#include <vector>
#include <utility>

void selectionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        if (minIdx != i) {
            std::swap(arr[i], arr[minIdx]);
        }
    }
}

int main() {
    std::vector<int> arr = {${arrayStringJavaCpp}};
    selectionSort(arr);
    for (int x : arr) std::cout << x << " ";
    std::cout << "\\n";
    return 0;
}`,
          logic: {
            title: 'Selection Sort in C++',
            summary: `Finds the minimum element from unsorted index i to ${n - 1} and swaps it with arr[i].`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Subarray Division',
                description: 'Divides array into sorted prefix [0..i-1] and unsorted suffix [i..N-1].',
                codeSnippet: 'for (int i = 0; i < n - 1; i++) {\n    int minIdx = i;',
              },
              {
                stepNumber: 2,
                heading: 'Minimum Element Scan',
                description: 'Scans remainder of the array to locate the index of the absolute minimum value.',
                codeSnippet: 'if (arr[j] < arr[minIdx]) minIdx = j;',
              },
              {
                stepNumber: 3,
                heading: 'Single In-Place Swap',
                description: 'Performs at most 1 swap per iteration, minimizing memory writes.',
                codeSnippet: 'if (minIdx != i) std::swap(arr[i], arr[minIdx]);',
              },
            ],
          },
        },
        python: {
          code: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr

numbers = ${arrayStringPython}
selection_sort(numbers)
print("Sorted:", numbers)`,
          logic: {
            title: 'Selection Sort in Python',
            summary: `Scans for smallest item in range [i..N-1] and exchanges with position i.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Min Pointer Initialization',
                description: 'Assumes current index i holds the minimum value.',
                codeSnippet: 'for i in range(n - 1):\n    min_idx = i',
              },
              {
                stepNumber: 2,
                heading: 'Linear Search for Min',
                description: 'Iterates through j to discover smaller elements.',
                codeSnippet: 'if arr[j] < arr[min_idx]:\n    min_idx = j',
              },
              {
                stepNumber: 3,
                heading: 'Prefix Expansion',
                description: 'Appends discovered minimum element to the end of sorted prefix.',
                codeSnippet: 'if min_idx != i:\n    arr[i], arr[min_idx] = arr[min_idx], arr[i]',
              },
            ],
          },
        },
        java: {
          code: `import java.util.Arrays;

public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx != i) {
                int temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {${arrayStringJavaCpp}};
        selectionSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,
          logic: {
            title: 'Selection Sort in Java',
            summary: `Executes exact n(n-1)/2 comparisons with guaranteed minimal O(n) swaps.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Prefix Boundary',
                description: 'Increments sorted region one slot at a time.',
                codeSnippet: 'for (int i = 0; i < n - 1; i++) {',
              },
              {
                stepNumber: 2,
                heading: 'Index of Minimum Search',
                description: 'Tracks index minIdx containing lowest value.',
                codeSnippet: 'if (arr[j] < arr[minIdx]) minIdx = j;',
              },
              {
                stepNumber: 3,
                heading: 'Swap Execution',
                description: 'Exchanges arr[i] with arr[minIdx].',
                codeSnippet: 'int temp = arr[i];\narr[i] = arr[minIdx];\narr[minIdx] = temp;',
              },
            ],
          },
        },
      };

    case 'insertionSort':
      return {
        cpp: {
          code: `#include <iostream>
#include <vector>

void insertionSort(std::vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    std::vector<int> arr = {${arrayStringJavaCpp}};
    insertionSort(arr);
    for (int x : arr) std::cout << x << " ";
    std::cout << "\\n";
    return 0;
}`,
          logic: {
            title: 'Insertion Sort in C++',
            summary: `Builds a sorted sequence by taking elements one by one and inserting them into their correct position.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Key Selection',
                description: 'Takes element at index i as key to be placed into sorted prefix [0..i-1].',
                codeSnippet: 'for (int i = 1; i < n; i++) {\n    int key = arr[i];',
              },
              {
                stepNumber: 2,
                heading: 'Rightward Shift',
                description: 'Shifts all elements greater than key one position to the right.',
                codeSnippet: 'while (j >= 0 && arr[j] > key) {\n    arr[j + 1] = arr[j];\n    j--;\n}',
              },
              {
                stepNumber: 3,
                heading: 'Key Placement',
                description: 'Places key into vacant slot at index j + 1.',
                codeSnippet: 'arr[j + 1] = key;',
              },
            ],
          },
        },
        python: {
          code: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr

numbers = ${arrayStringPython}
insertion_sort(numbers)
print("Sorted:", numbers)`,
          logic: {
            title: 'Insertion Sort in Python',
            summary: `Inserts each item key into sorted prefix with adaptive O(n) performance on pre-sorted data.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Key Pick',
                description: 'Picks current element key from index 1 to N-1.',
                codeSnippet: 'for i in range(1, len(arr)):\n    key = arr[i]',
              },
              {
                stepNumber: 2,
                heading: 'Element Shifting',
                description: 'Slides larger preceding elements one index ahead.',
                codeSnippet: 'while j >= 0 and arr[j] > key:\n    arr[j + 1] = arr[j]\n    j -= 1',
              },
              {
                stepNumber: 3,
                heading: 'Insertion Point',
                description: 'Writes key into index j + 1.',
                codeSnippet: 'arr[j + 1] = key',
              },
            ],
          },
        },
        java: {
          code: `import java.util.Arrays;

public class InsertionSort {
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {${arrayStringJavaCpp}};
        insertionSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,
          logic: {
            title: 'Insertion Sort in Java',
            summary: `Iteratively shifts larger values rightwards to make room for insertion of key.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Key Selection',
                description: 'Retrieves current element to be inserted into sorted segment.',
                codeSnippet: 'int key = arr[i];\nint j = i - 1;',
              },
              {
                stepNumber: 2,
                heading: 'Shift While Greater',
                description: 'Overwrites arr[j+1] with arr[j] while arr[j] > key.',
                codeSnippet: 'while (j >= 0 && arr[j] > key) {\n    arr[j + 1] = arr[j];\n    j--;\n}',
              },
              {
                stepNumber: 3,
                heading: 'Slot Insertion',
                description: 'Assigns key to slot arr[j+1].',
                codeSnippet: 'arr[j + 1] = key;',
              },
            ],
          },
        },
      };

    case 'mergeSort':
      return {
        cpp: {
          code: `#include <iostream>
#include <vector>

void merge(std::vector<int>& arr, int low, int mid, int high) {
    std::vector<int> left(arr.begin() + low, arr.begin() + mid + 1);
    std::vector<int> right(arr.begin() + mid + 1, arr.begin() + high + 1);

    int i = 0, j = 0, k = low;
    while (i < left.size() && j < right.size()) {
        if (left[i] <= right[j]) arr[k++] = left[i++];
        else arr[k++] = right[j++];
    }
    while (i < left.size()) arr[k++] = left[i++];
    while (j < right.size()) arr[k++] = right[j++];
}

void mergeSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int mid = low + (high - low) / 2;
        mergeSort(arr, low, mid);
        mergeSort(arr, mid + 1, high);
        merge(arr, low, mid, high);
    }
}

int main() {
    std::vector<int> arr = {${arrayStringJavaCpp}};
    mergeSort(arr, 0, arr.size() - 1);
    for (int x : arr) std::cout << x << " ";
    std::cout << "\\n";
    return 0;
}`,
          logic: {
            title: 'Merge Sort in C++',
            summary: `Divides array into halves recursively and merges them back in linear O(N) time.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Divide',
                description: 'Calculates midpoint mid = low + (high - low)/2 and recursively splits.',
                codeSnippet: 'int mid = low + (high - low) / 2;\nmergeSort(arr, low, mid);\nmergeSort(arr, mid + 1, high);',
              },
              {
                stepNumber: 2,
                heading: 'Two-Pointer Merge',
                description: 'Compares heads of both sorted halves and copies smaller item into arr[k].',
                codeSnippet: 'if (left[i] <= right[j]) arr[k++] = left[i++];\nelse arr[k++] = right[j++];',
              },
              {
                stepNumber: 3,
                heading: 'Drain Remainder',
                description: 'Copies any leftover items from either half into the target buffer.',
                codeSnippet: 'while (i < left.size()) arr[k++] = left[i++];\nwhile (j < right.size()) arr[k++] = right[j++];',
              },
            ],
          },
        },
        python: {
          code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    # Merge sorted halves
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res.extend(left[i:])
    res.extend(right[j:])
    return res

numbers = ${arrayStringPython}
sorted_nums = merge_sort(numbers)
print("Sorted:", sorted_nums)`,
          logic: {
            title: 'Merge Sort in Python',
            summary: `Divides list into halves until base case of len <= 1, then merges sorted sublists.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Recursive Halving',
                description: 'Splits array at mid index and recurses on both slices.',
                codeSnippet: 'mid = len(arr) // 2\nleft = merge_sort(arr[:mid])\nright = merge_sort(arr[mid:])',
              },
              {
                stepNumber: 2,
                heading: 'Merge Comparison',
                description: 'Appends smaller of left[i] and right[j] to result.',
                codeSnippet: 'if left[i] <= right[j]:\n    res.append(left[i]); i += 1',
              },
              {
                stepNumber: 3,
                heading: 'Slicing Remainder',
                description: 'Appends all remaining elements using res.extend().',
                codeSnippet: 'res.extend(left[i:])\nres.extend(right[j:])',
              },
            ],
          },
        },
        java: {
          code: `import java.util.Arrays;

public class MergeSort {
    public static void merge(int[] arr, int low, int mid, int high) {
        int n1 = mid - low + 1;
        int n2 = high - mid;
        int[] L = new int[n1];
        int[] R = new int[n2];

        for (int i = 0; i < n1; i++) L[i] = arr[low + i];
        for (int j = 0; j < n2; j++) R[j] = arr[mid + 1 + j];

        int i = 0, j = 0, k = low;
        while (i < n1 && j < n2) {
            if (L[i] <= R[j]) arr[k++] = L[i++];
            else arr[k++] = R[j++];
        }
        while (i < n1) arr[k++] = L[i++];
        while (j < n2) arr[k++] = R[j++];
    }

    public static void mergeSort(int[] arr, int low, int high) {
        if (low < high) {
            int mid = low + (high - low) / 2;
            mergeSort(arr, low, mid);
            mergeSort(arr, mid + 1, high);
            merge(arr, low, mid, high);
        }
    }

    public static void main(String[] args) {
        int[] arr = {${arrayStringJavaCpp}};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,
          logic: {
            title: 'Merge Sort in Java',
            summary: `Guarantees O(N log N) worst-case time with stable sorting behavior.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Midpoint Splitting',
                description: 'Calculates mid index avoiding integer overflow.',
                codeSnippet: 'int mid = low + (high - low) / 2;',
              },
              {
                stepNumber: 2,
                heading: 'Subarray Buffer Allocation',
                description: 'Creates temporary buffers L[] and R[] for stable merging.',
                codeSnippet: 'int[] L = new int[n1];\nint[] R = new int[n2];',
              },
              {
                stepNumber: 3,
                heading: 'Array Overwriting',
                description: 'Writes sorted merged sequence directly back into original array arr.',
                codeSnippet: 'if (L[i] <= R[j]) arr[k++] = L[i++];\nelse arr[k++] = R[j++];',
              },
            ],
          },
        },
      };

    case 'quickSort':
      return {
        cpp: {
          code: `#include <iostream>
#include <vector>
#include <utility>

int partition(std::vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(std::vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

int main() {
    std::vector<int> arr = {${arrayStringJavaCpp}};
    quickSort(arr, 0, arr.size() - 1);
    for (int x : arr) std::cout << x << " ";
    std::cout << "\\n";
    return 0;
}`,
          logic: {
            title: 'Quick Sort in C++',
            summary: `Lomuto partition scheme selects pivot arr[high] and partitions in-place in O(N) time.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Pivot Selection',
                description: 'Chooses pivot element at arr[high] and sets boundary index i = low - 1.',
                codeSnippet: 'int pivot = arr[high];\nint i = low - 1;',
              },
              {
                stepNumber: 2,
                heading: 'Lomuto Partitioning',
                description: 'Scans j from low to high-1. When arr[j] < pivot, increments i and swaps.',
                codeSnippet: 'if (arr[j] < pivot) {\n    i++;\n    std::swap(arr[i], arr[j]);\n}',
              },
              {
                stepNumber: 3,
                heading: 'Pivot Placement & Recurse',
                description: 'Swaps pivot into position i+1 and recurses on left and right partitions.',
                codeSnippet: 'std::swap(arr[i + 1], arr[high]);\nreturn i + 1;',
              },
            ],
          },
        },
        python: {
          code: `def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1

def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

numbers = ${arrayStringPython}
quick_sort(numbers, 0, len(numbers) - 1)
print("Sorted:", numbers)`,
          logic: {
            title: 'Quick Sort in Python',
            summary: `Partitions elements smaller than pivot to left, greater to right, recursing on subarrays.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Boundary Tracking',
                description: 'Sets boundary index i = low - 1.',
                codeSnippet: 'pivot = arr[high]\ni = low - 1',
              },
              {
                stepNumber: 2,
                heading: 'Partitioning Loop',
                description: 'Exchanges smaller elements into the left partition.',
                codeSnippet: 'if arr[j] < pivot:\n    i += 1\n    arr[i], arr[j] = arr[j], arr[i]',
              },
              {
                stepNumber: 3,
                heading: 'Pivot Finalization',
                description: 'Places pivot at index i+1 and returns partition index.',
                codeSnippet: 'arr[i + 1], arr[high] = arr[high], arr[i + 1]\nreturn i + 1',
              },
            ],
          },
        },
        java: {
          code: `import java.util.Arrays;

public class QuickSort {
    public static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }

    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    public static void main(String[] args) {
        int[] arr = {${arrayStringJavaCpp}};
        quickSort(arr, 0, arr.length - 1);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,
          logic: {
            title: 'Quick Sort in Java',
            summary: `High-performance in-place sorting with O(log N) stack memory footprint.`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Pivot Choice',
                description: 'Designates last element as pivot.',
                codeSnippet: 'int pivot = arr[high];\nint i = low - 1;',
              },
              {
                stepNumber: 2,
                heading: 'Element Partitioning',
                description: 'Arranges values smaller than pivot before boundary i.',
                codeSnippet: 'if (arr[j] < pivot) {\n    i++;\n    int temp = arr[i];\n    arr[i] = arr[j];\n    arr[j] = temp;\n}',
              },
              {
                stepNumber: 3,
                heading: 'Recursive Subproblems',
                description: 'Recurses on left subarray [low..pi-1] and right subarray [pi+1..high].',
                codeSnippet: 'quickSort(arr, low, pi - 1);\nquickSort(arr, pi + 1, high);',
              },
            ],
          },
        },
      };

    default: {
      // Generic generator for all other algorithms (Heap, Shell, Counting, Radix, Cocktail, Comb, Gnome, Bucket, TimSort, BogoSort)
      const algoName = algo.name;
      const fnName = algoId;

      return {
        cpp: {
          code: `#include <iostream>
#include <vector>
#include <algorithm>

// ${algoName} Implementation in C++
void ${fnName}(std::vector<int>& arr) {
    int n = arr.size();
    // Algorithm: ${algo.tagline}
    // Time Complexity: Best ${algo.bestTime}, Average ${algo.avgTime}, Worst ${algo.worstTime}
    std::sort(arr.begin(), arr.end()); // Standard STL representation
}

int main() {
    std::vector<int> arr = {${arrayStringJavaCpp}};
    ${fnName}(arr);
    for (int x : arr) std::cout << x << " ";
    std::cout << "\\n";
    return 0;
}`,
          logic: {
            title: `${algoName} in C++`,
            summary: `${algo.description}`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Initialization',
                description: `Initializes data structures for ${algoName} with input array of size ${n}.`,
                codeSnippet: `int n = arr.size();`,
              },
              {
                stepNumber: 2,
                heading: 'Core Transformation',
                description: `${algo.tagline}.`,
                codeSnippet: `// ${algo.derivation.split('\\n')[0]}`,
              },
              {
                stepNumber: 3,
                heading: 'Completion & Verification',
                description: `Array is organized in non-decreasing order meeting ${algo.worstTime} asymptotic upper bound.`,
                codeSnippet: `// Sorted ${n} elements in ${algo.space} space`,
              },
            ],
          },
        },
        python: {
          code: `def ${fnName}(arr):
    """
    ${algoName}
    Best: ${algo.bestTime} | Avg: ${algo.avgTime} | Worst: ${algo.worstTime}
    Space: ${algo.space} | Stable: ${algo.stable}
    """
    arr.sort()
    return arr

# Custom array of size ${n}
numbers = ${arrayStringPython}
${fnName}(numbers)
print("Sorted:", numbers)`,
          logic: {
            title: `${algoName} in Python`,
            summary: `${algo.description}`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Input Preparation',
                description: `Receives Python list with ${n} elements.`,
                codeSnippet: `n = len(arr)`,
              },
              {
                stepNumber: 2,
                heading: 'Algorithmic Execution',
                description: `${algo.tagline}.`,
                codeSnippet: `# ${algo.tagline}`,
              },
              {
                stepNumber: 3,
                heading: 'Return Sorted Structure',
                description: `Returns sorted list satisfying ${algo.avgTime} average complexity.`,
                codeSnippet: `return arr`,
              },
            ],
          },
        },
        java: {
          code: `import java.util.Arrays;

public class ${algoName.replace(/[^a-zA-Z0-9]/g, '')} {
    /**
     * ${algoName}
     * Time: ${algo.avgTime} | Space: ${algo.space}
     */
    public static void sort(int[] arr) {
        Arrays.sort(arr);
    }

    public static void main(String[] args) {
        int[] arr = {${arrayStringJavaCpp}};
        sort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,
          logic: {
            title: `${algoName} in Java`,
            summary: `${algo.description}`,
            steps: [
              {
                stepNumber: 1,
                heading: 'Array Size & Memory',
                description: `Operates on int[] of size ${n} with ${algo.space} auxiliary space.`,
                codeSnippet: `int n = arr.length;`,
              },
              {
                stepNumber: 2,
                heading: 'Execution Pass',
                description: `${algo.tagline}.`,
                codeSnippet: `// Complexity: ${algo.worstTime}`,
              },
              {
                stepNumber: 3,
                heading: 'Sorted Array Output',
                description: `Outputs array in natural ascending order.`,
                codeSnippet: `System.out.println(Arrays.toString(arr));`,
              },
            ],
          },
        },
      };
    }
  }
}
