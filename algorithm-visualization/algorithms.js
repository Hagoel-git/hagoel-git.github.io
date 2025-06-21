// algorithms.js
// Contains algorithm runners and registration

// --- Helper functions for creating visualization commands ---
function highlightIndex(index, color = "#ffb347") {
  return {
    indices: [index],
    style: {border: color, fontWeight: "bold"},
  };
}

function highlightMultiple(indices, color = "#ffb347") {
  return {
    indices: indices,
    style: {border: color, fontWeight: "bold"},
  };
}

function markFound(index) {
  return {
    indices: [index],
    style: {background: "#2e7d32", border: "#4caf50", fontWeight: "bold"},
  };
}

function markSwapped(indices) {
  return {
    indices: indices,
    style: {background: "#ff6b35", border: "#ff8c42", fontWeight: "bold"},
  };
}

function markSwappedSuccess(indices) {
  return {
    indices: indices,
    style: {background: "#44a344", border: "#4caf50", fontWeight: "bold"},
  };
}

function markComparing(indices) {
  return {
    indices: indices,
    style: {background: "#444d", border: "#ffb347", fontWeight: "bold"},
  };
}

function disableRange(startIndex, endIndex) {
  const indices = [];
  for (let i = startIndex; i <= endIndex; i++) {
    indices.push(i);
  }
  return {
    indices: indices,
    style: {background: "#181818", opacity: 0.5},
  };
}

function markMinimum(index) {
  return {
    indices: [index],
    style: {border: "#5454ff", fontWeight: "bold"},
  };
}

function markPivot(index) {
  return {
    indices: [index],
    style: {background: "#9c27b0", border: "#e91e63", fontWeight: "bold", color: "#fff"},
  };
}

function markPartitionBoundary(index) {
  return {
    indices: [index],
    style: {background: "#ff9800", border: "#f57c00", fontWeight: "bold"},
  };
}

function markLessThanPivot(indices) {
  return {
    indices: indices,
    style: {background: "#4caf50", border: "#388e3c", fontWeight: "bold"},
  };
}

function markGreaterThanPivot(indices) {
  return {
    indices: indices,
    style: {background: "#f44336", border: "#d32f2f", fontWeight: "bold"},
  };
}

function markCurrentSubarray(startIndex, endIndex) {
  const indices = [];
  for (let i = startIndex; i <= endIndex; i++) {
    indices.push(i);
  }
  return {
    indices: indices,
    style: {border: "#2196f3", background: "#1976d2", opacity: 0.8},
  };
}

// --- Search Implementations ---
function* linearSearchRunner(params) {
  const arr = params.array;
  const target = params.target;
  const speed = params.speed;

  for (let i = 0; i < arr.length; i++) {
    const visualCommands = [highlightIndex(i)];

    if (arr[i] === target) {
      visualCommands.push(markFound(i));
      yield {
        arr,
        visualCommands,
        message: `Found target ${target} at index ${i}`,
        messageColor: "#90ee90",
        speed,
      };
      return {
        arr,
        visualCommands,
        result: i,
        completionMessage: `Element found at index ${i}`,
        speed,
      };
    }

    yield {
      arr,
      visualCommands,
      message: `Checking index ${i}: ${arr[i]} !== ${target}`,
      speed,
    };
  }

  return {
    arr,
    visualCommands: [],
    result: -1,
    completionMessage: "Element not found",
    speed,
  };
}

function* binarySearchRunner(params) {
  const arr = params.array;
  const target = params.target;
  const speed = params.speed;
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    let middle = Math.floor((left + right) / 2);
    const visualCommands = [
      highlightIndex(middle, "#ffb347"),
      disableRange(0, left - 1),
      disableRange(right + 1, arr.length - 1),
    ];

    if (arr[middle] === target) {
      visualCommands.push(markFound(middle));
      yield {
        arr,
        visualCommands,
        message: `Found target ${target} at index ${middle}`,
        messageColor: "#90ee90",
        speed,
      };
      return {
        arr,
        visualCommands,
        result: middle,
        completionMessage: `Element found at index ${middle}`,
        speed,
      };
    }

    yield {
      arr,
      visualCommands,
      message: `Checking middle (${middle}): ${arr[middle]} ${
        arr[middle] > target ? ">" : "<"
      } ${target}`,
      speed,
    };

    if (arr[middle] > target) {
      right = middle - 1;
    } else {
      left = middle + 1;
    }
  }

  return {
    arr,
    visualCommands: [],
    result: -1,
    completionMessage: "Element not found",
    speed,
  };
}

// --- Sort Implementations ---
function* bubbleSortRunner(params) {
  const arr = params.array;
  const speed = params.speed;
  let swapped;

  for (let i = 0; i < arr.length - 1; i++) {
    swapped = false;
    for (let j = 0; j < arr.length - i - 1; j++) {
      const visualCommands = [
        highlightMultiple([j, j + 1]),
        disableRange(arr.length - i, arr.length - 1),
      ];

      yield {
        arr,
        visualCommands,
        message: `Comparing ${arr[j]} and ${arr[j + 1]}`,
        speed,
      };

      if (arr[j] > arr[j + 1]) {
        // Show elements about to be swapped
        yield {
          arr,
          visualCommands: [markSwapped([j, j + 1]), disableRange(arr.length - i, arr.length - 1)],
          message: `Swapping ${arr[j]} and ${arr[j + 1]}`,
          messageColor: "#ff8c42",
          speed: speed,
        };

        // Perform swap
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;

        // Show successful swap
        yield {
          arr,
          visualCommands: [
            markSwappedSuccess([j, j + 1]),
            disableRange(arr.length - i, arr.length - 1),
          ],
          message: `Swapped! New order: ${arr[j]}, ${arr[j + 1]}`,
          messageColor: "#90ee90",
          speed: speed,
        };
      }
    }
    if (!swapped) break;
  }

  return {
    arr,
    visualCommands: [],
    result: arr,
    completionMessage: "Array is sorted",
    speed,
  };
}

function* selectionSortRunner(params) {
  const arr = params.array;
  const speed = params.speed;

  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;

    yield {
      arr,
      visualCommands: [markMinimum(minIndex), disableRange(0, i - 1)],
      message: `Finding minimum in unsorted portion (starting from index ${i})`,
      speed,
    };

    for (let j = i + 1; j < arr.length; j++) {
      const visualCommands = [markMinimum(minIndex), highlightIndex(j), disableRange(0, i - 1)];

      if (arr[j] < arr[minIndex]) {
        minIndex = j;
      }

      yield {
        arr,
        visualCommands,
        message: `Current minimum: ${arr[minIndex]} at index ${minIndex}`,
        speed,
      };
    }

    if (minIndex !== i) {
      // Show elements about to be swapped
      yield {
        arr,
        visualCommands: [markSwapped([i, minIndex]), disableRange(0, i - 1)],
        message: `Swapping minimum ${arr[minIndex]} with ${arr[i]}`,
        messageColor: "#ff8c42",
        speed: speed,
      };

      // Perform swap
      const temp = arr[minIndex];
      arr[minIndex] = arr[i];
      arr[i] = temp;

      // Show successful swap
      yield {
        arr,
        visualCommands: [markSwappedSuccess([i, minIndex]), disableRange(0, i - 1)],
        message: `Swapped! ${arr[i]} is now in position ${i}`,
        messageColor: "#90ee90",
        speed: speed,
      };
    }
  }

  return {
    arr,
    visualCommands: [],
    result: arr,
    completionMessage: "Array is sorted",
    speed,
  };
}

function* insertionSortRunner(params) {
  const arr = params.array;
  const speed = params.speed;

  for (let i = 1; i < arr.length; i++) {
    let currentIndex = i;
    const key = arr[i];

    yield {
      arr,
      visualCommands: [highlightIndex(i), disableRange(i + 1, arr.length - 1)],
      message: `Inserting ${key} into sorted portion`,
      speed,
    };

    while (currentIndex > 0 && arr[currentIndex - 1] > arr[currentIndex]) {
      // Show elements about to be swapped
      yield {
        arr,
        visualCommands: [
          markSwapped([currentIndex - 1, currentIndex]),
          disableRange(i + 1, arr.length - 1),
        ],
        message: `Moving ${arr[currentIndex]} left (swapping with ${arr[currentIndex - 1]})`,
        messageColor: "#ff8c42",
        speed: speed,
      };

      // Perform swap
      const temp = arr[currentIndex - 1];
      arr[currentIndex - 1] = arr[currentIndex];
      arr[currentIndex] = temp;
      currentIndex--;

      // Show successful swap
      yield {
        arr,
        visualCommands: [
          markSwappedSuccess([currentIndex, currentIndex + 1]),
          disableRange(i + 1, arr.length - 1),
        ],
        message: `Moved ${key} to position ${currentIndex}`,
        messageColor: "#90ee90",
        speed: speed,
      };
    }
  }

  return {
    arr,
    visualCommands: [],
    result: arr,
    completionMessage: "Array is sorted",
    speed,
  };
}

function* quickSortRunner(params) {
  const arr = params.array;
  const speed = params.speed;

  // Initial state showing the entire array
  yield {
    arr,
    visualCommands: [markCurrentSubarray(0, arr.length - 1)],
    message: "Starting Quick Sort on entire array",
    speed,
  };

  yield* quickSortHelper(arr, 0, arr.length - 1, speed, 0);

  return {
    arr,
    visualCommands: [],
    result: arr,
    completionMessage: "Array is sorted",
    speed,
  };
}

function* quickSortHelper(arr, low, high, speed, depth) {
  if (low < high) {
    // Show current subarray being processed
    yield {
      arr,
      visualCommands: [
        markCurrentSubarray(low, high),
        disableRange(0, low - 1),
        disableRange(high + 1, arr.length - 1),
      ],
      message: `Sorting subarray from index ${low} to ${high} (depth ${depth})`,
      speed,
    };

    const pivotIndex = yield* partition(arr, low, high, speed);

    // Show the result of partitioning
    const lessThanIndices = [];
    const greaterThanIndices = [];
    for (let i = low; i < pivotIndex; i++) lessThanIndices.push(i);
    for (let i = pivotIndex + 1; i <= high; i++) greaterThanIndices.push(i);

    yield {
      arr,
      visualCommands: [
        markPivot(pivotIndex),
        ...(lessThanIndices.length > 0 ? [markLessThanPivot(lessThanIndices)] : []),
        ...(greaterThanIndices.length > 0 ? [markGreaterThanPivot(greaterThanIndices)] : []),
        disableRange(0, low - 1),
        disableRange(high + 1, arr.length - 1),
      ],
      message: `Partitioned around pivot ${arr[pivotIndex]} at index ${pivotIndex}`,
      messageColor: "#e91e63",
      speed: speed * 1.5,
    };

    // Recursively sort left partition
    if (low < pivotIndex - 1) {
      yield {
        arr,
        visualCommands: [
          markCurrentSubarray(low, pivotIndex - 1),
          markPivot(pivotIndex),
          disableRange(0, low - 1),
          disableRange(pivotIndex, arr.length - 1),
        ],
        message: `Recursively sorting left partition [${low}...${pivotIndex - 1}]`,
        messageColor: "#4caf50",
        speed,
      };
      yield* quickSortHelper(arr, low, pivotIndex - 1, speed, depth + 1);
    }

    // Recursively sort right partition
    if (pivotIndex + 1 < high) {
      yield {
        arr,
        visualCommands: [
          markCurrentSubarray(pivotIndex + 1, high),
          markPivot(pivotIndex),
          disableRange(0, pivotIndex),
          disableRange(high + 1, arr.length - 1),
        ],
        message: `Recursively sorting right partition [${pivotIndex + 1}...${high}]`,
        messageColor: "#f44336",
        speed,
      };
      yield* quickSortHelper(arr, pivotIndex + 1, high, speed, depth + 1);
    }
  }
  return arr;
}

function* partition(arr, low, high, speed) {
  const pivot = arr[high];
  let i = low - 1; // Index of smaller element

  // Show initial state with pivot
  yield {
    arr,
    visualCommands: [
      markPivot(high),
      markCurrentSubarray(low, high - 1),
      disableRange(0, low - 1),
      disableRange(high + 1, arr.length - 1),
    ],
    message: `Partitioning with pivot ${pivot} at index ${high}`,
    messageColor: "#9c27b0",
    speed,
  };

  for (let j = low; j < high; j++) {
    // Show current element being compared
    yield {
      arr,
      visualCommands: [
        markPivot(high),
        highlightIndex(j),
        markPartitionBoundary(i + 1),
        disableRange(0, low - 1),
        disableRange(high + 1, arr.length - 1),
      ],
      message: `Comparing ${arr[j]} with pivot ${pivot}`,
      speed,
    };

    if (arr[j] < pivot) {
      i++;

      if (i !== j) {
        // Show elements about to be swapped
        yield {
          arr,
          visualCommands: [
            markPivot(high),
            markSwapped([i, j]),
            disableRange(0, low - 1),
            disableRange(high + 1, arr.length - 1),
          ],
          message: `${arr[j]} < ${pivot}, swapping with position ${i}`,
          messageColor: "#ff8c42",
          speed: speed,
        };

        // Perform swap
        [arr[i], arr[j]] = [arr[j], arr[i]];

        // Show successful swap
        yield {
          arr,
          visualCommands: [
            markPivot(high),
            markSwappedSuccess([i, j]),
            disableRange(0, low - 1),
            disableRange(high + 1, arr.length - 1),
          ],
          message: `Swapped! ${arr[i]} moved to smaller elements section`,
          messageColor: "#4caf50",
          speed: speed,
        };
      } else {
        // Element is already in correct position
        yield {
          arr,
          visualCommands: [
            markPivot(high),
            markSwappedSuccess([i]),
            disableRange(0, low - 1),
            disableRange(high + 1, arr.length - 1),
          ],
          message: `${arr[j]} < ${pivot}, already in correct position`,
          messageColor: "#4caf50",
          speed: speed,
        };
      }
    } else {
      // Element is greater than or equal to pivot
      yield {
        arr,
        visualCommands: [
          markPivot(high),
          highlightIndex(j, "#f44336"),
          markPartitionBoundary(i + 1),
          disableRange(0, low - 1),
          disableRange(high + 1, arr.length - 1),
        ],
        message: `${arr[j]} >= ${pivot}, stays in greater elements section`,
        messageColor: "#f44336",
        speed: speed,
      };
    }
  }

  // Show final pivot placement
  yield {
    arr,
    visualCommands: [
      markSwapped([i + 1, high]),
      disableRange(0, low - 1),
      disableRange(high + 1, arr.length - 1),
    ],
    message: `Moving pivot ${pivot} to its final position ${i + 1}`,
    messageColor: "#ff8c42",
    speed: speed,
  };

  // Place pivot in correct position
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

  // Show final partitioned state
  const lessThanIndices = [];
  const greaterThanIndices = [];
  for (let k = low; k < i + 1; k++) lessThanIndices.push(k);
  for (let k = i + 2; k <= high; k++) greaterThanIndices.push(k);

  yield {
    arr,
    visualCommands: [
      markPivot(i + 1),
      ...(lessThanIndices.length > 0 ? [markLessThanPivot(lessThanIndices)] : []),
      ...(greaterThanIndices.length > 0 ? [markGreaterThanPivot(greaterThanIndices)] : []),
      disableRange(0, low - 1),
      disableRange(high + 1, arr.length - 1),
    ],
    message: `Partition complete! Pivot ${arr[i + 1]} is in final position ${i + 1}`,
    messageColor: "#9c27b0",
    speed: speed * 1.5,
  };

  return i + 1;
}

// Export for use in main.js
window.linearSearchRunner = linearSearchRunner;
window.binarySearchRunner = binarySearchRunner;
window.bubbleSortRunner = bubbleSortRunner;
window.selectionSortRunner = selectionSortRunner;
window.insertionSortRunner = insertionSortRunner;

window.highlightIndex = highlightIndex;
window.highlightMultiple = highlightMultiple;
window.markFound = markFound;
window.markSwapped = markSwapped;
window.markSwappedSuccess = markSwappedSuccess;
window.markComparing = markComparing;
window.disableRange = disableRange;
window.markMinimum = markMinimum;
