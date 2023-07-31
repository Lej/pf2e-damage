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

function getTransition(transitions, degreeOfSuccess) {
  let transition = null;
  if (degreeOfSuccess === "critical-success") {
    transition = transitions["critical-success"]
      || transitions["success"]
      || transitions["else"];
  } else if (degreeOfSuccess === "success") {
    transition = transitions["success"]
      || transitions["else"];
  } else if (degreeOfSuccess === "failure") {
    transition = transitions["failure"]
      || transitions["else"];
  } else if (degreeOfSuccess === "critical-failure") {
    transition = transitions["critical-failure"]
      || transitions["failure"]
      || transitions["else"];
  }
  if (!transition) {
    throw new Error("Failed to find transition.");
  }
  return transition;
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

function getVariables(helperNames, helperImpls, variant, level) {
  // Calculate values for this variant given level using the helpers
  const variableNames = [];
  const variableValues = [];
  for (let variableName in variant) {
    variableNames.push(variableName);
    const impl = `return ${variant[variableName]}`;
    const fn = new Function(...helperNames, "level", impl);
    const value = fn(...helperImpls, level);
    variableValues.push(value);
  }
  console.log("variableNames", variableNames);
  console.log("variableValues", variableValues);
  return [variableNames, variableValues];
}

function runIteration(strategy, variableNames, variableValues) {

  let currentStateName = strategy.start;
  let handbreak = 100;
  while (true) {

    console.log("currentStateName", currentStateName);

    let currentState = strategy.states[currentStateName];
    console.log("currentState", currentState);

    const checkCode = `return ${strategy.states[currentStateName].check}`;
    console.log("checkCode", checkCode);
    const d20 = roll(1, 20);
    console.log("d20", d20);

    const checkFunction = new Function(...variableNames, "d20", checkCode)
    const checkResult = checkFunction(...variableValues, d20);
    console.log("checkResult", checkResult);
    if (typeof(checkResult) !== "number") {
      throw new Error(`Expected check to return a number but got '${checkResult}':\n\n${checkCode}`);
    }

    const dcCode = `return ${strategy.states[currentStateName].dc}`;
    console.log("dcCode", dcCode);
    const dcFunction = new Function(...variableNames, dcCode);
    const dcResult = dcFunction(...variableValues);
    console.log("dcResult", dcResult);
    if (typeof(dcResult) !== "number") {
      throw new Error(`Expected DC to return a number but got '${dcResult}':\n\n${dcCode}`);
    }

    const degreeOfSuccess = getDegreeOfSuccess(d20, checkResult, dcResult);

    console.log("degreeOfSuccess", degreeOfSuccess);

    if (!currentState.transitions) {
      break;
    }

    const transition = getTransition(currentState.transitions, degreeOfSuccess);
    console.log("transition", transition);

    currentStateName = transition.destination;

    handbreak--;
    if (handbreak === 0) {
      throw new Error(`Evaluation of strategy ${strategyName} did not finish in a timely manner.`);
    }
  }
}

export function simulate() {

  const input = JSON.parse(document.getElementById("input").value);
  console.log("input", input);

  if (!(input.iterations >= 1 && input.iterations <= 1000)) {
    throw new Error(`Expected iterations between 1 and 1000 but got ${input.iterations}`);
  }

  // Helpers
  const [helperNames, helperImpls] = getHelpers();

  // Strategies
  for (const strategyName in input.strategies) {

    // Variants
    const strategy = input.strategies[strategyName];
    for (const variant of strategy.variants) {

      // Levels
      for (let level = 1; level <= 20; level++) {

        // Variables for the variant and level
        const [variableNames, variableValues] = getVariables(helperNames, helperImpls, variant, level);

        // Iterations
        for (let i = 0; i < input.iterations; i++) {
          runIteration(strategy, variableNames, variableValues);
        }
      }
    }
  }
}