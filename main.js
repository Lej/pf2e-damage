import { constants } from "./constants.js";
import { updateDiagram } from "./diagram.js";
import { simulate } from "./simulate.js";
import { getDamageChart } from "./damage-chart.js";
import { hideLoadingBar } from "./loading-bar.js";
import { setGraph as setDamageChart, setError } from "./output.js";
import { init, save } from "./db.js"

async function click() {
  try {
    const input = JSON.parse(document.getElementById("input").value);
    console.log("input", input);
    save(input);
    await updateDiagram(input);
    const chartData = await simulate(input);
    const chart = await getDamageChart(chartData);
    setDamageChart(chart);
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
    try {
      Toastify({
        text: e,
        duration: 10000,
        style: {
          "color": "white",
          "border-color": "#77161b",
          "background": "#c9262d"
        }
      }).showToast();
    } catch (e) {
      console.error(e);
    }
    try {
      setError(e.stack || e || "Unknown error.");
    } catch (e) {
      console.error(e);
    }
    try {
      hideLoadingBar();
    } catch (e) {
      console.error(e);
    }
  }
}

document.getElementById("simulate").addEventListener("click", click);

init();
click();

