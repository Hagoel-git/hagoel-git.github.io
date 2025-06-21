// ui.js
// Contains UI management: menu, parameter panel, and event listeners

function populateMenu() {
  const list = document.getElementById("algorithm-list");
  const topics = [...new Set(window.algorithms.map((a) => a.topic))];
  topics.forEach((topic) => {
    const header = document.createElement("li");
    header.textContent = topic;
    header.classList.add("topic-header");
    list.appendChild(header);
    const ul = document.createElement("ul");
    ul.classList.add("topic-group");
    window.algorithms
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

  const algo = window.algorithms.find((a) => a.id === id);
  if (!algo) {
    console.error("Algorithm not found:", id);
    return;
  }

  window.runnerState.currentAlgorithm = algo;
  window.runnerState.paused = false;

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

window.populateMenu = populateMenu;
window.selectAlgorithm = selectAlgorithm;
