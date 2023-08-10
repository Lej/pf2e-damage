const autocolors = window['chartjs-plugin-autocolors'];

export function updateDamageChart(datas) {
  const ctx = document.createElement("canvas");

  const datasets = [];
  for (const data of datas) {
    const dataset = {
      label: data.name,
      data: data.avg,
      fill: false,
    };
    datasets.push(dataset);
  }

  console.log("datasets", datasets);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [...Array(20).keys()].map(x => `Level ${x + 1}`),
      datasets: datasets
    },
    plugins: [
      autocolors
    ]
  });

  const col = document.createElement("div");
  col.setAttribute("class", "col");
  col.appendChild(ctx);

  const row = document.createElement("div");
  row.setAttribute("class", "row");
  row.appendChild(col);

  const container = document.getElementById("output");
  container.appendChild(row);
}

/*
export function updateDamageChart(datas) {
  const ctx = document.createElement("canvas");

  const datasets = [];
  const tooltips = [];
  let i = 0;
  for (const data of datas) {
    const minDataset = {
      data: data.min,
      pointStyle: false,
      pointHitRadius: 0,
      fill: "+1",
      order: datas.length + i,
      showLine: false,
    };

    const avgDataset = {
      label: data.name,
      data: data.avg,
      fill: false,
      order: i,
    };

    const maxDataset = {
      data: data.max,
      pointStyle: false,
      pointHitRadius: 100,
      fill: "-1",
      order: datas.length + i,
      showLine: false,
    };

    datasets.push(minDataset, avgDataset, maxDataset);
    tooltips[i * 3 + 1] = data.avg.map((x, i) => `${data.name}: ${x} [${data.min[i]}, ${data.max[i]}]`);

    i++;
  }

  console.log("tooltips", tooltips);
  console.log("datasets", datasets);

  const lighten = (color, value) => Chart.helpers.color(color).lighten(value).rgbString();

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"],
      datasets: datasets
    },
    options: {
      plugins: {
        autocolors: {
          repeat: 3,
          customize(context) {
            return {
              background: lighten(context.colors.background, 0.5),
              border: context.colors.border,
            };
          }
        },
        tooltip: {
          filter: x => x.datasetIndex % 3 === 1,
          callbacks: {
            label: x => tooltips[x.datasetIndex][x.dataIndex]
          }
        },
        legend: {
          labels: {
            filter: x => !!x.text
          }
        }
      }
    },
    plugins: [
      autocolors
    ]
  });

  const col = document.createElement("div");
  col.setAttribute("class", "col");
  col.appendChild(ctx);

  const row = document.createElement("div");
  row.setAttribute("class", "row");
  row.appendChild(col);

  const container = document.getElementById("output");
  container.appendChild(row);
}
*/
