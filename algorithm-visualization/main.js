// main.js
// Entry point, runner state, and glue code

// --- Import scripts ---
// In index.html, add:
// <script src="algorithms.js"></script>
// <script src="visualization.js"></script>
// <script src="ui.js"></script>
// <script src="main.js"></script>

// --- Algorithm registration system ---
const speedSliderParam = {
  label: "Speed (ms)",
  id: "speed",
  type: "range",
  default: 500,
  min: 20,
  max: 2000,
  step: 20,
};

window.algorithms = [
  {
    name: "Linear Search",
    id: "linear-search",
    description:
      "Linear search scans each element in the array sequentially to find the target value. Returns the index if found, otherwise -1.",
    topic: "Searches",
    params: [
      {label: "Array (comma separated)", id: "array", type: "text", default: "2,6,-2,4,3,2"},
      {label: "Target", id: "target", type: "number", default: -2},
      speedSliderParam,
    ],
    run: window.linearSearchRunner,
    visualize: window.visualizeArray,
  },
  {
    name: "Binary Search",
    id: "binary-search",
    description:
      "Binary search finds the position of a target value within a sorted array. It compares the target to the middle element and narrows down the search range accordingly.",
    topic: "Searches",
    params: [
      {
        label: "Sorted Array (comma separated)",
        id: "array",
        type: "text",
        default: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16",
      },
      {label: "Target", id: "target", type: "number", default: 5},
      speedSliderParam,
    ],
    run: window.binarySearchRunner,
    visualize: window.visualizeArray,
  },
  {
    name: "Bubble Sort",
    id: "bubble-sort",
    description:
      "Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in the wrong order.",
    topic: "Sorting",
    params: [
      {label: "Array (comma separated)", id: "array", type: "text", default: "4,-2,-8,0,5,2,1,1,0"},
      speedSliderParam,
    ],
    run: window.bubbleSortRunner,
    visualize: window.visualizeArray,
  },
  {
    name: "Selection Sort",
    id: "selection-sort",
    description:
      "Selection sort is a sorting algorithm with O(n²) time complexity, noted for its simplicity.",
    topic: "Sorting",
    params: [
      {label: "Array (comma separated)", id: "array", type: "text", default: "4,-2,-8,0,5,2,1,1,0"},
      speedSliderParam,
    ],
    run: window.selectionSortRunner,
    visualize: window.visualizeArray,
  },
  {
    name: "Insertion Sort",
    id: "insertion-sort",
    description: "Insertion sort builds the final sorted array one item at a time.",
    topic: "Sorting",
    params: [
      {label: "Array (comma separated)", id: "array", type: "text", default: "4,-2,-8,0,5,2,1,1,0"},
      speedSliderParam,
    ],
    run: window.insertionSortRunner,
    visualize: window.visualizeArray,
  },
  {
    name: "Quick Sort",
    id: "quick-sort",
    description:
      "Quick Sort is an efficient sorting algorithm that uses a divide-and-conquer strategy to sort elements.",
    topic: "Sorting",
    params: [
      {label: "Array (comma separated)", id: "array", type: "text", default: "4,-2,-8,0,5,2,1,1,0"},
      {
        label: "Speed (ms)",
        id: "speed",
        type: "range",
        default: 1000,
        min: 20,
        max: 4000,
        step: 20,
      },
    ],
    run: window.quickSortRunner,
    visualize: window.visualizeArray,
  },
];

// --- Algorithm Runner State ---
window.runnerState = {
  paused: false,
  timeoutId: null,
  step: 0,
  result: null,
  context: null,
  currentAlgorithm: null,
};

function getParams(algo) {
  const params = {};
  for (const p of algo.params) {
    let val = document.getElementById("param-" + p.id).value;
    if (p.type === "number") val = Number(val);
    if (p.id === "array") val = val.split(",").map(Number);
    params[p.id] = val;
  }
  return params;
}

function startAlgorithm(algo) {
  stopAlgorithm();
  const params = getParams(algo);
  if (!params) {
    console.error("Invalid parameters for algorithm:", algo.name);
    return;
  }

  window.runnerState.paused = false;
  window.runnerState.step = 0;
  window.runnerState.result = null;
  window.runnerState.context = algo.run(params);
  window.runnerState.currentAlgorithm = algo;

  document.getElementById("return-value").textContent = "";
  document.getElementById("visualization").innerHTML = "";

  runAlgorithmStep(algo);
}

function stopAlgorithm() {
  if (window.runnerState.timeoutId) {
    clearTimeout(window.runnerState.timeoutId);
    window.runnerState.timeoutId = null;
  }
  window.runnerState.paused = false;
  window.runnerState.step = 0;
  window.runnerState.result = null;
  window.runnerState.context = null;
  window.runnerState.currentAlgorithm = null;
}

function pauseAlgorithm() {
  window.runnerState.paused = true;
  if (window.runnerState.timeoutId) {
    clearTimeout(window.runnerState.timeoutId);
    window.runnerState.timeoutId = null;
  }
}

function resumeAlgorithm(algo) {
  if (window.runnerState.paused) {
    window.runnerState.paused = false;
    runAlgorithmStep(algo);
  }
}

function runAlgorithmStep() {
  if (window.runnerState.paused || !window.runnerState.context) return;

  const {done, value} = window.runnerState.context.next();
  let algo = window.runnerState.currentAlgorithm;
  if (algo) {
    algo.visualize(value, done);
  }

  if (done) {
    window.runnerState.result = value.result;
    const returnValue = document.getElementById("return-value");
    returnValue.textContent = `Return value: ${JSON.stringify(value.result)}`;
    window.runnerState.timeoutId = null;
  } else {
    window.runnerState.timeoutId = setTimeout(() => {
      runAlgorithmStep();
    }, value.speed || 500);
  }
}

// --- Entry point ---
document.addEventListener("DOMContentLoaded", window.populateMenu);

// Export for use in ui.js
window.getParams = getParams;
window.startAlgorithm = startAlgorithm;
window.stopAlgorithm = stopAlgorithm;
window.pauseAlgorithm = pauseAlgorithm;
window.resumeAlgorithm = resumeAlgorithm;
window.runAlgorithmStep = runAlgorithmStep;
