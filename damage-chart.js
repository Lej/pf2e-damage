const autocolors = window['chartjs-plugin-autocolors'];

// Note: changes to the plugin code is not reflected to the chart, because the plugin is loaded at chart construction time and editor changes only trigger an chart.update().
const plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const {ctx} = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#99ffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};

export function getDamageChart(chartData) {

  console.log("chartData", chartData);

  const ctx = document.createElement("canvas");

  const tooltips = [];

  const datasets = [];
  for (const data of chartData) {
    const dataset = {
      label: data.name,
      data: data.avg,
      fill: false,
    };
    datasets.push(dataset);

    // Tooltips
    const tooltip = {
      titles: [],
      labels: [],
      afterBodies: [],
    }
    for (let level = 1; level <= 20; level++) {
      tooltip.titles.push(`Level ${level}`);
      tooltip.labels.push(`${data.name}:`);
      const index = level - 1;
      tooltip.afterBodies.push([
        `Avg: ${data.avg[index]}`,
        `Min: ${data.min[index]}`,
        `Max: ${data.max[index]}`,
        ...data.dos[index],
      ]);
    }
    tooltips.push(tooltip);
    //tooltips.push(data.avg.map((x, i) => `${data.name}: Avg=${data.avg[i]}, Min=${data.min[i]}, Max=${data.max[i]}`));
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
            title: x => tooltips[x[0].datasetIndex].titles[x[0].dataIndex],
            label: x => tooltips[x.datasetIndex].labels[x.dataIndex],
            afterBody: x => tooltips[x[0].datasetIndex].afterBodies[x[0].dataIndex],
          }
        },
        customCanvasBackgroundColor: {
          color: 'white',
        }
      }
    },
    plugins: [
      autocolors,
      plugin
    ]
  });

  return ctx;
}