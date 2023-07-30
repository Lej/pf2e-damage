import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';

class Input {
  variables;
  strategies;
}

class Strategy {
  name;
  states;
}

class State {
  name;
  start;
  check;
  transitions;
}

class Transition {
  when;
  then;
}

const defaultInput = {
  variables: {
    strength: 5,
    proficiency: 4,
    ac: 15,
    map: -5
  },
  strategies: {
    "Strikes": {
      start: "Strike #1",
      states: {
        "Strike #1": {
          check: "1d20 + strength + proficiency",
          dc: "ac",
          transitions: {
            "otherwise": {
              destination: "Strike #2"
            }
          }
        },
        "Strike #2": {
          check: "1d20 + strength + proficiency + map",
          dc: "ac",
          transitions: {
            "otherwise": {
              destination: "Strike #3"
            }
          }
        },
        "Strike #3": {
          check: "1d20 + strength + proficiency + 2 * map",
          dc: "ac"
        }
      }
    }
  }
}

const input = document.getElementById("input");
input.value = JSON.stringify(defaultInput, undefined, 4);

function normalize(...args) {
  return args.map(x => x.replace(/[^a-zA-Z0-9-_]/, "_")).join("-");
}

async function updateDiagram(input) {

  const stateNames = new Set();

  let diagram = "";
  diagram += "stateDiagram-v2\n";
  diagram += "    direction LR\n\n";

  for (const strategyName in input.strategies) {
    const strategy = input.strategies[strategyName];
    const normalizedStrategyName = normalize(strategyName);

    if (stateNames.has(normalizedStrategyName)) {
      throw new Error(`Duplicate state name: ${normalizedStrategyName}`);
    }
    stateNames.add(normalizedStrategyName);

    diagram += `    ${normalizedStrategyName}: ${strategyName}\n`;
    diagram += `    [*] --> ${normalizedStrategyName}\n\n`;
    diagram += `    state ${normalizedStrategyName} {\n\n`;
    diagram += `        direction LR\n\n`;

    for (const stateName in strategy.states) {
      const state = strategy.states[stateName];
      const normalizedStateName = normalize(stateName);

      if (stateNames.has(normalizedStateName)) {
        throw new Error(`Duplicate state name: ${normalizedStateName}`);
      }
      stateNames.add(normalizedStateName);

      diagram += `        ${normalizedStateName}: ${stateName}\n`;
      diagram += `        note right of ${normalizedStateName}\n`;
      diagram += `            ${state.check} vs ${state.dc}\n`;
      diagram += `        end note\n\n`;

      if (strategy.start === stateName) {
        diagram += `        [*] --> ${normalizedStateName}\n\n`;
      }

      let noTransition = true;
      if (!!state.transitions) {
        for (const transitionName in state.transitions) {
          const transition = state.transitions[transitionName];
          diagram += `        ${normalizedStateName} --> ${normalize(transition.destination)}\n\n`;
          noTransition = false;
        }
      }
      if (noTransition) {
        diagram += `        ${normalizedStateName} --> [*]`;
      }
    }

    diagram += `\n    }\n\n`;
  }

  console.log(diagram);

  const diagramElement = document.getElementById("mermaid");
  diagramElement.innerHTML = diagram;
  diagramElement.removeAttribute("data-processed");
  await mermaid.run();
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function roll(number, sides) {
  let sum = 0;
  for (let i = 0; i < number; i++) {
    sum += getRandomInt(sides) + 1;
  }
  return sum;
}

function getDegreeOfSuccess(roll, value, dc) {
  let outcome = null;
  if (value >= dc + 10) {
    outcome = 3;
  } else if (value >= dc) {
    outcome = 2;
  } else if (value > dc - 10) {
    outcome = 1;
  } else {
    outcome = 0;
  }
  if (roll === 1 && outcome > 0) {
    outcome--;
  } else if (roll === 20 && outcome < 3) {
    outcome++;
  }
  if (outcome == 3) {
    return "critical-success";
  } else if (outcome == 2) {
    return "success";
  } else if (outcome == 1) {
    return "failure";
  } else {
    return "critical-failure";
  }
}

function getTransition(transitions, degreeOfSuccess) {
  let transition = null;
  if (degreeOfSuccess === "critical-success") {
    transition = transitions["critical-success"]
      || transitions["success"]
      || transitions["otherwise"];
  } else if (degreeOfSuccess === "success") {
    transition = transitions["success"]
      || transitions["otherwise"];
  } else if (degreeOfSuccess === "failure") {
    transition = transitions["failure"]
      || transitions["otherwise"];
  } else if (degreeOfSuccess === "critical-failure") {
    transition = transitions["critical-failure"]
      || transitions["failure"]
      || transitions["otherwise"];
  }
  if (!transition) {
    throw new Error("Failed to find transition.");
  }
  return transition;
}

function simulate(input) {

  for (const strategyName in input.strategies) {
    const strategy = input.strategies[strategyName];

    const scope = {};
    if (!!input.variables) {
      for (const key in input.variables) {
        scope[key] = input.variables[key];
      }
    }
    if (!!strategy.variables) {
      for (const key in strategy.variables) {
        scope[key] = strategy.variables[key];
      }
    }

    let scopeCode = "";
    for (const key in scope) {
      scopeCode += `const ${key} = ${scope[key]};\n`;
    }

    const stateCheckCodes = {};
    const stateDcCodes = {};
    for (const stateName in strategy.states) {
      const stateCheckCode = strategy.states[stateName].check;
      stateCheckCodes[stateName]  = scopeCode + stateCheckCode + ";";

      const stateDcCode = strategy.states[stateName].dc;
      stateDcCodes[stateName]  = scopeCode + stateDcCode + ";";
    }

    for (let i = 0; i < 10; i++) {
      let currentStateName = strategy.start;
      let currentState = strategy.states[currentStateName];
      let handbreak = 100;
      while (true) {

        console.log("currentStateName", currentStateName);

        let d20Roll = null;
        let checkCode = stateCheckCodes[currentStateName];
        if (checkCode.includes("1d20")) {
          d20Roll = roll(1, 20);
          checkCode = checkCode.replace("1d20", d20Roll);
          console.log("d20Roll", d20Roll);
        }

        console.log("checkCode", checkCode);
        const checkResult = eval(checkCode);
        if (typeof(checkResult) !== "number") {
          throw new Error(`Expected check to return a number but got '${checkResult}':\n\n${checkCode}`);
        }

        console.log("checkResult", checkResult);

        const dcCode = stateDcCodes[currentStateName];
        console.log("dcCode", dcCode);
        const dcResult = eval(dcCode);
        if (typeof(dcResult) !== "number") {
          throw new Error(`Expected DC to return a number but got '${dcResult}':\n\n${dcCode}`);
        }

        console.log("dcResult", dcResult);

        const degreeOfSuccess = getDegreeOfSuccess(d20Roll, checkResult, dcResult);

        console.log("degreeOfSuccess", degreeOfSuccess);

        if (!currentState.transitions) {
          break;
        }

        const transition = getTransition(currentState.transitions, degreeOfSuccess);
        console.log("transition", transition);

        handbreak--;
        if (handbreak === 0) {
          throw new Error(`Evaluation of strategy ${strategyName} did not finish in a timely manner.`);
        }
      }
    }

    currentStateCheckCode =

    console.log(currentStateCheckCode);

    const result = eval(currentStateCheckCode);
    console.log(result);
  }
}

async function click() {
  const input = JSON.parse(document.getElementById("input").value);
  console.log(input);
  await updateDiagram(input);
  simulate(input);
}

document.getElementById("simulate").addEventListener("click", click);
click();