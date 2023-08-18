export function getTotal(input) {
  let total = 0;
  for (const strategyName in input.strategies) {
    const strategy = input.strategies[strategyName];
    total += Object.keys(strategy.variants).length * Object.keys(strategy.states).length * 20/*Levels*/ * 20/*Rolls*/;
  }
  return total;
}

export function getLoadingBar(total) {

  const loading = document.getElementById("loading");
  const loaded = document.getElementById("loaded");
  loaded.style.width = "0%";
  loading.classList.remove("d-none");
  let prevPercent = 0;

  const sleep = ms => new Promise(res => setTimeout(res, ms));

  return async (remaining) => {

    const current = (total - remaining);
    const percent = Math.floor(100 * current / total);
    if (percent > prevPercent) {
      prevPercent = percent;
      loaded.style.width = percent + "%";
      await sleep(0);
    }
    if (percent === 100) {
      loading.classList.add("d-none");
    }
  };
}

export function hideLoadingBar() {
  const loading = document.getElementById("loading");
  loading.classList.add("d-none");
}