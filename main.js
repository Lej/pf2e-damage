import { constants } from "./constants.js";
import { addDocumentation } from "./documentation.js";
import { updateDiagram } from "./diagram.js";
import { simulate } from "./simulate.js";
import { updateDamageChart } from "./damage-chart.js";
import { hideLoadingBar } from "./loading-bar.js";

async function click() {
  try {
    const input = JSON.parse(document.getElementById("input").value);
    console.log("input", input);
    await updateDiagram(input);
    const chartData = await simulate(input);
    await updateDamageChart(chartData);
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
    console.error(e);
    Toastify({
      text: e,
      duration: 10000,
      style: {
        "color": "white",
        "border-color": "#77161b",
        "background": "#c9262d"
      }
    }).showToast();
    hideLoadingBar();
  }
}

addDocumentation();
document.getElementById("input").value = JSON.stringify(constants.defaultInput, undefined, 4);
document.getElementById("simulate").addEventListener("click", click);

click();

