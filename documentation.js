import { helpers } from "./helpers.js";

export const examples = [
  {
    name: "_mod(level, 0)",
    func: level => helpers._mod(level, 0),
  },
  {
    name: "_mod(level, -1)",
    func: level => helpers._mod(level, -1),
  },
  {
    name: "_mod(level, -2)",
    func: level => helpers._mod(level, -2),
  },
  {
    name: "_prof(level, 'fighter')",
    func: level => helpers._prof(level, "fighter"),
  },
  {
    name: "_prof(level, 'rogue')",
    func: level => helpers._prof(level, "rogue"),
  },
  {
    name: "_ac(level, 'moderate')",
    func: level => helpers._ac(level, "moderate"),
  },
  {
    name: "_ac(level + 2, 'extreme')",
    func: level => helpers._ac(level, "extreme"),
  },
  {
    name: "_weaponDamageDice(level)",
    func: level => helpers._weaponDamageDice(level),
  }
];

function addMarkdownTable(markdown) {

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

function addByLevelExampleTable() {

  const lines = Array(22).fill("");

  lines[0] += "| Level ";
  lines[1] += "| -";
  for (let level = 1; level <= 20; level++) {
    lines[level + 1] += `| **${level}** `;
  }

  for (const example of examples) {
    lines[0] += `| ${example.name} `;
    lines[1] += `| - `;
    for (let level = 1; level <= 20; level++) {
      lines[level + 1] += `| ${example.func(level)} `;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    lines[i] += "|";
  }

  const markdown = lines.join("\n");
  addMarkdownTable(markdown);
}

function addDieValueExampleTable() {

  let markdown = "";
  markdown += "| _dieValue(sides) | Min | Max | Average |\n";
  markdown += "| - | - | - | - |\n";

  const examples = [4, 6, 8, 10, 12];
  for (const sides of examples) {
    markdown += `| **${sides}** | ${helpers._dieValueMin(sides)} | ${helpers._dieValueMax(sides)} | ${helpers._dieValueAvg(sides)} |\n`
  }

  addMarkdownTable(markdown);
}

export function addDocumentation() {
  addDieValueExampleTable();
  addByLevelExampleTable();
}

