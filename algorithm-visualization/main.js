// main.js

// --- Algorithm registration system ---
const algorithms = [
    {
        name: 'Linear Search',
        id: 'linear-search',
        description: 'Linear search scans each element in the array sequentially to find the target value. Returns the index if found, otherwise -1.',
        params: [
            { label: 'Array (comma separated)', id: 'array', type: 'text', default: '2,6,-2,4,3,2' },
            { label: 'Target', id: 'target', type: 'number', default: -2 },
            { label: 'Speed (ms)', id: 'speed', type: 'range', default: 500, min: 100, max: 2000, step: 100 }
        ],
        run: linearSearchRunner,
        visualize: linearSearchVisualizer
    },
    {
        name: 'Binary Search',
        id: 'binary-search',
        description: 'Binary search finds the position of a target value within a sorted array. It compares the target to the middle element and narrows down the search range accordingly.',
        params: [
            { label: 'Sorted Array (comma separated)', id: 'array', type: 'text', default: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16' },
            { label: 'Target', id: 'target', type: 'number', default: 5 },
            { label: 'Speed (ms)', id: 'speed', type: 'range', default: 500, min: 100, max: 2000, step: 100 }
        ],
        run: binarySearchRunner,
        visualize: binarySearchVisualizer
    },
    {
        name: 'Bubble Sort',
        id: 'bubble-sort',
        description: 'Bubble Sort is the simplest sorting algorithm that works by repeatedly swapping the adjacent elements if they are in the wrong order. This algorithm is not suitable for large data sets as its average and worst-case time complexity are quite high.',
        params: [
            { label: 'Array (comma separated)', id: 'array', type: 'text', default: '4,-2,-8,0,5,2,1,1,0' },
            { label: 'Speed (ms)', id: 'speed', type: 'range', default: 500, min: 100, max: 2000, step: 100 }
        ],
        run: bubbleSortRunner,
        visualize: bubbleSortVisualizer
    },
    {
        name: 'Selection Sort',
        id: 'selection-sort',
        description: 'Selection sort is a sorting algorithm, specifically an in-place comparison sort. It has O(n2) time complexity, making it inefficient on large lists, and generally performs worse than the similar insertion sort. Selection sort is noted for its simplicity, and it has performance advantages over more complicated algorithms in certain situations, particularly where auxiliary memory is limited.',
        params: [
            { label: 'Array (comma separated)', id: 'array', type: 'text', default: '4,-2,-8,0,5,2,1,1,0' },
            { label: 'Speed (ms)', id: 'speed', type: 'range', default: 500, min: 100, max: 2000, step: 100 }
        ],
        run: selectionSortRunner,
        visualize: selectionSortVisualizer
    }
    // Add more algorithms here
];

function populateMenu() {
    const list = document.getElementById('algorithm-list');
    algorithms.forEach(algo => {
        const li = document.createElement('li');
        li.textContent = algo.name;
        li.onclick = () => selectAlgorithm(algo.id);
        list.appendChild(li);
    });
}

function selectAlgorithm(id) {
    const main = document.getElementById('main-content');
    // Remove old parameters panel if exists
    const oldPanel = document.getElementById('parameters-panel');
    if (oldPanel) oldPanel.remove();
    // Get the selected algorithm object
    const algo = algorithms.find(a => a.id === id);
    // Add parameters panel to bottom right (append to body)
    const panel = document.createElement('div');
    panel.id = 'parameters-panel';
    panel.innerHTML = `
        <div id='algorithm-description'>${algo.description}</div>
        <form id='algo-form'>
            ${algo.params.map(p => `
                <label>${p.label}:<br><input id='param-${p.id}' type='${p.type}' value='${p.default}' 
           ${p.min ? `min='${p.min}'` : ''} 
           ${p.max ? `max='${p.max}'` : ''} 
           ${p.step ? `step='${p.step}'` : ''}></label><br>
            `).join('')}
            <button type='button' id='start-btn'>Start</button>
            <button type='button' id='pause-btn'>Pause</button>
            <button type='button' id='resume-btn'>Resume</button>
        </form>
        <div id='return-value'></div>
    `;
    document.body.appendChild(panel);
    main.innerHTML = `<h2>${algo.name}</h2><div id='visualization'></div>`;

    // Attach event listeners
    document.getElementById('start-btn').onclick = () => startAlgorithm(algo);
    document.getElementById('pause-btn').onclick = () => pauseAlgorithm();
    document.getElementById('resume-btn').onclick = () => resumeAlgorithm(algo);
}

// --- Generic algorithm runner state ---
let runnerState = {
    paused: false,
    interval: null,
    step: 0,
    result: null,
    context: null,
};

function getParams(algo) {
    const params = {};
    for (const p of algo.params) {
        let val = document.getElementById('param-' + p.id).value;
        if (p.type === 'number') val = Number(val);
        if (p.id === 'array') val = val.split(',').map(Number);
        params[p.id] = val;
    }
    return params;
}

function startAlgorithm(algo) {
    runnerState.paused = false;
    runnerState.step = 0;
    runnerState.result = null;
    runnerState.context = algo.run(getParams(algo));
    document.getElementById('return-value').textContent = '';
    document.getElementById('visualization').innerHTML = '';
    runAlgorithmStep(algo);
}

function pauseAlgorithm() {
    runnerState.paused = true;
}

function resumeAlgorithm(algo) {
    if (runnerState.paused) {
        runnerState.paused = false;
        runAlgorithmStep(algo);
    }
}

function runAlgorithmStep(algo) {
    if (runnerState.paused) return;
    const { done, value } = runnerState.context.next();
    algo.visualize(value, done);
    if (done) {
        runnerState.result = value.result;
        document.getElementById('return-value').textContent = `Return value: ${value.result}`;
    } else {
        setTimeout(() => runAlgorithmStep(algo), value.speed || 500);
    }
}

// --- Searches Implementation ---
function* linearSearchRunner(params) {
    const arr = params.array;
    const target = params.target;
    const speed = params.speed;
    for (let i = 0; i < arr.length; i++) {
        yield { arr, target, currentIndex: i, found: arr[i] === target, speed };
        if (arr[i] === target) return { arr, target, currentIndex: i, found: true, result: i, speed };
    }
    return { arr, target, currentIndex: arr.length, found: false, result: -1, speed };
}

function linearSearchVisualizer(state, done) {
    const vis = document.getElementById('visualization');
    vis.innerHTML = state.arr.map((v, i) => `<span style='display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;margin:2px;border:2px solid ${i===state.currentIndex?'#ffb347':'#444'};background:${v===state.target&&i===state.currentIndex?'#2e7d32':'#222'};color:#fff;font-weight:${i===state.currentIndex?'bold':'normal'};'>${v}</span>`).join('');
    if (done) {
        if (state.found) {
            vis.innerHTML += `<div style='margin-top:10px;color:#90ee90;'>Element found at index ${state.currentIndex}.</div>`;
        } else {
            vis.innerHTML += `<div style='margin-top:10px;color:#ff6f6f;'>Element not found.</div>`;
        }
    }
}

function* binarySearchRunner(params) {
    const arr = params.array;
    const target = params.target;
    const speed = params.speed;
    let left = 0;
    let right = arr.length - 1;
    while (left <= right) {
        let middle = Math.floor((left+right)/2);
        yield { arr, target, currentIndex: middle, found: arr[middle] === target, speed };
        if (arr[middle] === target) {
            return {arr, target, currentIndex: middle, found: true, result: middle, speed};
        }
        if (arr[middle] > target) {
            right = middle - 1;
        } else {
            left = middle + 1;
        }
    }
    return { arr, target, currentIndex: arr.length, found: false, result: -1, speed };
}

function binarySearchVisualizer(state, done) {
    const vis = document.getElementById('visualization');
    vis.innerHTML = state.arr.map((v, i) => `<span style='display:inline-block;width:40px;height:40px;line-height:40px;text-align:center;margin:2px;border:2px solid ${i===state.currentIndex?'#ffb347':'#444'};background:${v===state.target&&i===state.currentIndex?'#2e7d32':'#222'};color:#fff;font-weight:${i===state.currentIndex?'bold':'normal'};'>${v}</span>`).join('');
    if (done) {
        if (state.found) {
            vis.innerHTML += `<div style='margin-top:10px;color:#90ee90;'>Element found at index ${state.currentIndex}.</div>`;
        } else {
            vis.innerHTML += `<div style='margin-top:10px;color:#ff6f6f;'>Element not found.</div>`;
        }
    }
}

// --- Sorts Implementation ---

function* bubbleSortRunner(params) {
    const arr = params.array;
    const speed = params.speed;
    let swapped;

    for (let i = 0; i < arr.length - 1; i++) {
        swapped = false;
        for (let j = 0; j < arr.length - i - 1; j++) {
            yield { arr, compareIndex: j, nextIndex: j + 1, speed, swapped: false };

            if (arr[j] > arr[j + 1]) {
                const temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = true;
                yield { arr, compareIndex: j, nextIndex: j + 1, speed, swapped: true };
            }
        }
        if (!swapped) {
            break;
        }
    }
    return { arr, compareIndex: -1, nextIndex: -1, speed, swapped: false };
}


function bubbleSortVisualizer(state, done) {
    const vis = document.getElementById('visualization');
    vis.innerHTML = state.arr.map((v, i) => {
        let borderColor = '#444';
        let background = '#222';
        let disabledBackground = '#181818';
        let fontWeight = 'normal';
        if (i === state.compareIndex || i === state.nextIndex) {
            borderColor = '#ffb347';            
            fontWeight = 'bold';
            if (state.swapped) {
                background = '#44a344';         
            } else {
                background = '#444d';      
            }
        }
        return `<span style="
            display:inline-block;
            width:40px;height:40px;
            line-height:40px;
            text-align:center;
            margin:2px;
            border:2px solid ${borderColor};
            background:${i> state.nextIndex ? disabledBackground : background};
            color:#fff;
            font-weight:${fontWeight};
        ">${v}</span>`;
    }).join('');

    if (done) {
        vis.innerHTML += `<div style="margin-top:10px;color:#90ee90;">Array is sorted.</div>`;
    }
}

function* selectionSortRunner(params) {
    const arr = params.array;
    const speed = params.speed;
    

    for (let i = 0; i < arr.length - 1; i++) {
        let jmin = i;
        for (let j = i + 1; j < arr.length; j++) {
            yield { arr, minIndex: jmin, currentIndex: j, speed, swapped: false };

            if (arr[j] < arr[jmin]) {
                jmin = j;
            }
        }
        if (jmin != i) {
            const temp = arr[jmin];
            arr[jmin] = arr[i];
            arr[i] = temp;
            yield { arr, minIndex: jmin, currentIndex: i, speed, swapped: true };

        }
    }
    return { arr, minIndex: -1, currentIndex: -1, speed, swapped: false };
}

function selectionSortVisualizer(state, done) {
    const vis = document.getElementById('visualization');
    vis.innerHTML = state.arr.map((v, i) => {
        let borderColor = '#444';
        let background = '#222';
        let disabledBackground = '#181818';
        let fontWeight = 'normal';
        if (i === state.minIndex || i === state.currentIndex) {
            borderColor = '#ffb347';            
            fontWeight = 'bold';
            if (state.swapped) {
                background = '#44a344';         
            } else {
                background = '#444d';      
            }
        }
        return `<span style="
            display:inline-block;
            width:40px;height:40px;
            line-height:40px;
            text-align:center;
            margin:2px;
            border:2px solid ${borderColor};
            background:${i> state.nextIndex ? disabledBackground : background};
            color:#fff;
            font-weight:${fontWeight};
        ">${v}</span>`;
    }).join('');

    if (done) {
        vis.innerHTML += `<div style="margin-top:10px;color:#90ee90;">Array is sorted.</div>`;
    }
}

document.addEventListener('DOMContentLoaded', populateMenu);
