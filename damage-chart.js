const autocolors = window['chartjs-plugin-autocolors'];

export function getDamageChart(datas) {
  const ctx = document.createElement("canvas");

  const tooltips = [];
  const datasets = [];
  for (const data of datas) {
    const dataset = {
      label: data.name,
      data: data.avg,
      fill: false,
    };
    datasets.push(dataset);
    tooltips.push(data.avg.map((x, i) => `${data.name}: Avg=${data.avg[i]}, Min=${data.min[i]}, Max=${data.max[i]}`));
  }

  console.log("datasets", datasets);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [...Array(20).keys()].map(x => `${x + 1}`),
      datasets: datasets
    },
    options: {
      scales: {
        x: {
          title: {
            display: true,
            text: "Level"
          }
        },
        y: {
          title: {
            display: true,
            text: "Average Damage"
          }
        }
      },
      plugins: {
        legend: {
          position: "right"
        },
        tooltip: {
          callbacks: {
            label: x => tooltips[x.datasetIndex][x.dataIndex]
          }
        }
      }
    },
    plugins: [
      autocolors
    ]
  });

  return ctx;
}