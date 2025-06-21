// main.js
const speedSliderParam = {
  label: "Speed (ms)",
  id: "speed",
  type: "range",
  default: 500,
  min: 20,
  max: 2000,
  step: 20,
};

// --- Unified Visualizer ---
function visualizeArray(state, done) {
  const vis = document.getElementById("visualization");
  const arr = state.arr;

  if (!arr) {
    vis.innerHTML = "";
    return;
  }

  // Default styling
  const defaultStyle = {
    background: "#222",
    border: "#444",
    color: "#fff",
    fontWeight: "normal",
  };

  vis.innerHTML = arr
    .map((value, index) => {
      let style = {...defaultStyle};

      // Process visualization commands
      if (state.visualCommands) {
        state.visualCommands.forEach((command) => {
          if (command.indices.includes(index)) {
            // Apply command styling
            Object.assign(style, command.style);
          }
        });
      }

      return `<span style="
      display:inline-block;
      width:40px;height:40px;
      line-height:40px;
      text-align:center;
      margin:2px;
      border:2px solid ${style.border};
      background:${style.background};
      color:${style.color};
      font-weight:${style.fontWeight};
      opacity:${style.opacity || 1};
    ">${value}</span>`;
    })
    .join("");

  // Add status message if provided
  if (state.message) {
    vis.innerHTML += `<div style="margin-top:10px;color:${state.messageColor || "#fff"};">${
      state.message
    }</div>`;
  }

  // Add completion message
  if (done && state.result !== undefined) {
    const isSuccess = state.result !== -1;
    const color = isSuccess ? "#90ee90" : "#ff6f6f";
    const message =
      state.completionMessage || (isSuccess ? `Result: ${state.result}` : "Operation completed");
    vis.innerHTML += `<div style="margin-top:10px;color:${color};">${message}</div>`;
  }
}

// --- Algorithm registration system ---
const algorithms = [
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
    run: linearSearchRunner,
    visualize: visualizeArray,
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
    run: binarySearchRunner,
    visualize: visualizeArray,
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
    run: bubbleSortRunner,
    visualize: visualizeArray,
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
    run: selectionSortRunner,
    visualize: visualizeArray,
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
    run: insertionSortRunner,
    visualize: visualizeArray,
  },
];

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
          speed: speed / 2,
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
          speed: speed / 2,
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
        speed: speed / 2,
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
        speed: speed / 2,
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
        speed: speed / 2,
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
        speed: speed / 2,
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

// --- UI Management Functions ---
function populateMenu() {
  const list = document.getElementById("algorithm-list");
  const topics = [...new Set(algorithms.map((a) => a.topic))];
  topics.forEach((topic) => {
    const header = document.createElement("li");
    header.textContent = topic;
    header.classList.add("topic-header");
    list.appendChild(header);
    const ul = document.createElement("ul");
    ul.classList.add("topic-group");
    algorithms
      .filter((a) => a.topic === topic)
      .forEach((algo) => {
        const li = document.createElement("li");
        li.textContent = algo.name;
        li.onclick = () => selectAlgorithm(algo.id);
        ul.appendChild(li);
      });
    list.appendChild(ul);
  });
}

function selectAlgorithm(id) {
  stopAlgorithm();
  const main = document.getElementById("main-content");

  const oldPanel = document.getElementById("parameters-panel");
  if (oldPanel) oldPanel.remove();

  const algo = algorithms.find((a) => a.id === id);
  if (!algo) {
    console.error("Algorithm not found:", id);
    return;
  }

  runnerState.currentAlgorithm = algo;
  runnerState.paused = false;

  const panel = document.createElement("div");
  panel.id = "parameters-panel";
  panel.innerHTML = `
    <div id='algorithm-description'>${algo.description}</div>
    <form id='algo-form'>
      ${algo.params
        .map(
          (p) => `
            <label>${p.label}:<br><input id='param-${p.id}' type='${p.type}' value='${p.default}' 
               ${p.min ? `min='${p.min}'` : ""} 
               ${p.max ? `max='${p.max}'` : ""} 
               ${p.step ? `step='${p.step}'` : ""}></label><br>
          `
        )
        .join("")}
      <button type='button' id='start-btn'>Start</button>
      <button type='button' id='pause-btn'>Pause</button>
      <button type='button' id='resume-btn'>Resume</button>
    </form>
    <div id='return-value'></div>
  `;
  document.body.appendChild(panel);
  main.innerHTML = `<h2>${algo.name}</h2><div id='visualization'></div>`;

  document.getElementById("start-btn").onclick = () => startAlgorithm(algo);
  document.getElementById("pause-btn").onclick = () => pauseAlgorithm();
  document.getElementById("resume-btn").onclick = () => resumeAlgorithm(algo);
}

// --- Algorithm Runner State ---
let runnerState = {
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

  runnerState.paused = false;
  runnerState.step = 0;
  runnerState.result = null;
  runnerState.context = algo.run(params);
  runnerState.currentAlgorithm = algo;

  document.getElementById("return-value").textContent = "";
  document.getElementById("visualization").innerHTML = "";

  runAlgorithmStep(algo);
}

function stopAlgorithm() {
  if (runnerState.timeoutId) {
    clearTimeout(runnerState.timeoutId);
    runnerState.timeoutId = null;
  }
  runnerState.paused = false;
  runnerState.step = 0;
  runnerState.result = null;
  runnerState.context = null;
  runnerState.currentAlgorithm = null;
}

function pauseAlgorithm() {
  runnerState.paused = true;
  if (runnerState.timeoutId) {
    clearTimeout(runnerState.timeoutId);
    runnerState.timeoutId = null;
  }
}

function resumeAlgorithm(algo) {
  if (runnerState.paused) {
    runnerState.paused = false;
    runAlgorithmStep(algo);
  }
}

function runAlgorithmStep() {
  if (runnerState.paused || !runnerState.context) return;

  const {done, value} = runnerState.context.next();
  let algo = runnerState.currentAlgorithm;
  if (algo) {
    algo.visualize(value, done);
  }

  if (done) {
    runnerState.result = value.result;
    const returnValue = document.getElementById("return-value");
    returnValue.textContent = `Return value: ${JSON.stringify(value.result)}`;
    runnerState.timeoutId = null;
  } else {
    runnerState.timeoutId = setTimeout(() => {
      runAlgorithmStep();
    }, value.speed || 500);
  }
}

document.addEventListener("DOMContentLoaded", populateMenu);
