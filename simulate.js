import { helpers } from "./constants.js";

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

function getHelpers() {
  const helperNames = [];
  const helperImpls = [];
  for (const helperName in helpers) {
    helperNames.push(helperName);
    helperImpls.push(helpers[helperName]);
  }
  console.log("helperNames", helperNames);
  console.log("helperImpls", helperImpls);
  return [helperNames, helperImpls];
}

function getVariableFunctions(variant, helperNames) {
  const variableNames = [];
  const variableFunctions = {};
  for (let variableName in variant) {
    variableNames.push(variableName);
    const impl = `return ${variant[variableName]}`;
    const fn = new Function(...helperNames, "level", impl);
    //variableFunctions.push(fn);
    variableFunctions[variableName] = fn;
  }
  console.log("variableNames", variableNames);
  console.log("variableFunctions", variableFunctions);
  return [variableNames, variableFunctions];
  //return variableNames;

}

function getVariableValues(variableNames, variableFunctions, helperImpls, level) {
  const variableValues = [];
  for (const variableName of variableNames) {
    const fn = variableFunctions[variableName];
    const value = fn(...helperImpls, level);
    variableValues.push(value);
  }
  console.log("variableValues", variableValues);
  return variableValues;
}

function getTransitions(strategy) {
  const transitions = {};
  for (const stateName in strategy.states) {
    const state = strategy.states[stateName];
    if (!state.transitions) {
      transitions[stateName] = {
        "critical-success": null,
        "success": null,
        "failure": null,
        "critical-failure": null,
      };
    } else {
      transitions[stateName] = {
        "critical-success": state.transitions["critical-success"] || state.transitions["success"] || state.transitions["else"] || null,
        "success": state.transitions["success"] || state.transitions["else"] || null,
        "failure": state.transitions["failure"] || state.transitions["else"] || null,
        "critical-failure": state.transitions["critical-failure"] || state.transitions["failure"] || state.transitions["else"] || null,
      };
    }
  }
  return transitions;
}

function runIteration(strategy, transitions, checkFunctions, dcFunctions, variableValues) {

  let currentStateName = strategy.start;
  let handbreak = 100;
  while (true) {

    //console.log("currentStateName", currentStateName);

    let currentState = strategy.states[currentStateName];
    //console.log("currentState", currentState);

    const d20 = roll(1, 20);
    //console.log("d20", d20);

    const checkResult = checkFunctions[currentStateName](...variableValues, d20);
    //console.log("checkResult", checkResult);
    if (typeof(checkResult) !== "number") {
      throw new Error(`Expected state '${currentStateName}' check to return a number but got '${checkResult}'.`);
    }

    const dcResult = dcFunctions[currentStateName](...variableValues);
    //console.log("dcResult", dcResult);
    if (typeof(dcResult) !== "number") {
      throw new Error(`Expected state '${currentStateName}' DC to return a number but got '${checkResult}'.`);
    }

    const degreeOfSuccess = getDegreeOfSuccess(d20, checkResult, dcResult);
    //console.log("degreeOfSuccess", degreeOfSuccess);

    const transition = transitions[currentStateName][degreeOfSuccess];
    //console.log("transition", transition);
    if (!transition) {
      break;
    }

    currentStateName = transition.destination;

    handbreak--;
    if (handbreak === 0) {
      throw new Error(`Evaluation of strategy ${strategyName} did not finish in a timely manner.`);
    }
  }
}

export async function simulate() {

  const input = JSON.parse(document.getElementById("input").value);
  console.log("input", input);

  const minIterations = 1;
  const maxIterations = 10000;
  if (!(input.iterations >= minIterations && input.iterations <= maxIterations)) {
    throw new Error(`Expected iterations between ${minIterations} and ${maxIterations} but got ${input.iterations}.`);
  }

  const loading = document.getElementById("loading");
  const loaded = document.getElementById("loaded");
  loaded.style.width = "0%";
  loading.classList.remove("d-none");
  let prevPercent = 0;
  let percent = 0;
  const sleep = ms => new Promise(res => setTimeout(res, ms));

  let currentIteration = 0;
  let totalIterations = 0;
  for (const strategyName in input.strategies) {
    const strategy = input.strategies[strategyName];
    totalIterations += strategy.variants.length * 20 * input.iterations;
  }

  // Helpers
  const [helperNames, helperImpls] = getHelpers();

  // Strategies
  for (const strategyName in input.strategies) {

    // Transitions
    const strategy = input.strategies[strategyName];
    const transitions = getTransitions(strategy);

    // Variants
    for (const variant of strategy.variants) {

      // Get variant variable names
      const [variableNames, variableFunctions] = getVariableFunctions(variant, helperNames);

      // Check and DC function for each state
      const checkFunctions = {};
      const dcFunctions = {};
      for (const stateName in strategy.states) {

        const state = strategy.states[stateName];

        // Check function
        const checkCode = `return ${state.check}`;
        console.log("checkCode", checkCode);
        checkFunctions[stateName] = new Function(...variableNames, "d20", checkCode);

        // DC function
        const dcCode = `return ${state.dc}`;
        console.log("dcCode", dcCode);
        dcFunctions[stateName] = new Function(...variableNames, dcCode);
      }

      // Levels
      for (let level = 1; level <= 20; level++) {

        // Get variant variable values for level
        const variableValues = getVariableValues(variableNames, variableFunctions, helperImpls, level);

        // Iterations
        for (let i = 0; i < input.iterations; i++) {
          runIteration(strategy, transitions, checkFunctions, dcFunctions, variableValues);

          currentIteration++;
          percent = Math.floor(100 * currentIteration / totalIterations);
          if (percent > prevPercent) {
            console.log(percent, currentIteration, totalIterations);
            prevPercent = percent;
            loaded.style.width = percent + "%";
            await sleep(0);
          }
        }
      }
    }
  }

  loading.classList.add("d-none");
  console.log("Simulation complete");
}