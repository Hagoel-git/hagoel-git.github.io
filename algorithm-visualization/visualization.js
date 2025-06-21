// visualization.js
// Contains the visualizeArray function and related helpers

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

// Export for use in main.js
window.visualizeArray = visualizeArray;
