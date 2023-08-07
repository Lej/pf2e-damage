import { defaultInput, examples } from "./constants.js";
import { updateDiagram } from "./diagram.js";
import { simulate } from "./simulate.js";

async function click() {
  try {
    const input = JSON.parse(document.getElementById("input").value);
    console.log("input", input);
    await updateDiagram(input);
    await simulate(input);
    Toastify({
      text: "Done",
      duration: 3000,
      style: {
        "color": "white",
        "border-color": "#003d04",
        "background": "#006d09"
      }
    }).showToast();
  } catch (e) {
    Toastify({
      text: e,
      duration: 10000,
      style: {
        "color": "white",
        "border-color": "#77161b",
        "background": "#c9262d"
      }
    }).showToast();
    console.error(e);
  }
}

// Default input
document.getElementById("input").value = JSON.stringify(defaultInput, undefined, 4);

// Documentation
function addDocumentationTable(data) {

  const lines = Array(22).fill("");

  lines[0] += "| Level ";
  lines[1] += "| -";
  for (let level = 1; level <= 20; level++) {
    lines[level + 1] += `| **${level}** `;
  }

  for (const element of data) {
    lines[0] += `| ${element.name} `;
    lines[1] += `| - `;
    for (let level = 1; level <= 20; level++) {
      lines[level + 1] += `| ${element.func(level)} `;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    lines[i] += "|";
  }

  const markdown = lines.join("\n");
  console.log("markdown", markdown);

  const table = document.createElement("div");
  table.innerHTML = marked.parse(markdown, {
    mangle: false,
    headerIds: false
  });
  table.children[0].setAttribute("class", "table table-striped");
  const col = document.createElement("div");
  col.setAttribute("class", "col");
  col.appendChild(table);
  const row = document.createElement("div");
  row.setAttribute("class", "row");
  row.appendChild(col);
  const container = document.getElementById("documentation");
  container.appendChild(row);
}
addDocumentationTable(examples);

document.getElementById("simulate").addEventListener("click", click);
click();
//await updateDiagram();

//console.log = function() {}