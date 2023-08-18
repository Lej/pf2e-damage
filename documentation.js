import { helpers } from "./helpers.js";

const examples = [
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
    name: "_prof(level, 'rogue')",
    func: level => helpers._prof(level, "rogue"),
  },
  {
    name: "_prof(level, 'fighter')",
    func: level => helpers._prof(level, "fighter"),
  },
  {
    name: "_weaponSpecialization(level, 'fighter')",
    func: level => helpers._weaponSpecialization(level, "fighter"),
  },
  {
    name: "_potency(level)",
    func: level => helpers._potency(level),
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
  },
  {
    name: "_cases(level, [[1,1],[10,2],[20,3]])",
    func: level => helpers._cases(level, [[1,1],[10,2],[20,3]]),
  },
  {
    name: "_powerAttack(level)",
    func: level => helpers._powerAttack(level),
  },
  {
    name: "_resistance(level, 'min')",
    func: level => helpers._resistance(level, 'min'),
  },
  {
    name: "_resistance(level, 'max')",
    func: level => helpers._resistance(level, 'max'),
  },

  {
    name: "_weakness(level, 'min')",
    func: level => helpers._weakness(level, 'min'),
  },
  {
    name: "_weakness(level, 'max')",
    func: level => helpers._weakness(level, 'max'),
  },
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

function safe(func, level) {
  try {
    return func(level);
  } catch {
    return "";
  }
}

function addExampleByLevelTable() {

  const minLevel = -2;
  const maxLevel = 24;
  const numLevels = maxLevel - minLevel + 1;
  const lines = Array(numLevels + 2).fill("");

  lines[0] += "| Level ";
  lines[1] += "| -";
  for (let level = minLevel; level <= maxLevel; level++) {
    const index = level - minLevel + 2;
    lines[index] += `| **${level}** `;
  }

  for (const example of examples) {
    lines[0] += `| ${example.name} `;
    lines[1] += `| - `;
    for (let level = minLevel; level <= maxLevel; level++) {
      const index = level - minLevel + 2;
      lines[index] += `| ${safe(example.func, level)} `;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    lines[i] += "|";
  }

  const markdown = lines.join("\n");
  addMarkdownTable(markdown);
}

function addExampleDiceTable() {

  let markdown = "";
  markdown += "| _d(sides) | Average | Min | Max |\n";
  markdown += "| - | - | - | - |\n";

  const examples = [4, 6, 8, 10, 12];
  for (const sides of examples) {
    markdown += `| **${sides}** | ${helpers._dAvg(sides)} | ${helpers._dMin(sides)} | ${helpers._dMax(sides)} |\n`
  }

  addMarkdownTable(markdown);
}

function addDocumentation() {
  addExampleDiceTable();
  addExampleByLevelTable();
}

addDocumentation();