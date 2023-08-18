import { constants } from "./constants.js";
import { helpers } from "./helpers.js";
import { getTotal, getLoadingBar} from "./loading-bar.js";

function getVariantVariableFunctions(variant, variableNames, helperNames) {
  const variableFunctions = {};
  for (const variableName of variableNames) {
    variableFunctions[variableName] = new Function(...helperNames, "level", "_d", `return ${variant[variableName]}`);
  }
  console.log("variableFunctions", variableFunctions);
  return variableFunctions;
}

function getVariantVariableValues(variableNames, variableFunctions, helperImpls, level, dieValueFunction) {
  const variableValues = [];
  for (const variableName of variableNames) {
    const fn = variableFunctions[variableName];
    const value = fn(...helperImpls, level, dieValueFunction);
    variableValues.push(value);
  }
  return variableValues;
}

/*
function getCheckFunctions(strategy, variableNames) {
  const functions = {};
  for (const stateName in strategy.states) {
    const state = strategy.states[stateName];
    const code = `return ${state.check};`;
    console.log("code", code);
    functions[stateName] = new Function(...variableNames, code);
  }
  return functions;
}

function getDcFunctions(strategy, variableNames) {
  const functions = {};
  for (const stateName in strategy.states) {
    const state = strategy.states[stateName];
    const code = `return ${state.dc};`;
    console.log("code", code);
    functions[stateName] = new Function(...variableNames, code);
  }
  return functions;
}
*/

/*
function getTransitions(strategy) {
  const transitions = {};
  for (const stateName in strategy.states) {
    const state = strategy.states[stateName];
    const stateTransitions = {
      "critical-success": state.transitions["critical-success"] || state.transitions["success"] || state.transitions["else"],
      "success": state.transitions["success"] || state.transitions["else"],
      "failure": state.transitions["failure"] || state.transitions["else"],
      "critical-failure": state.transitions["critical-failure"] || state.transitions["failure"] || state.transitions["else"]
    };
    for (const degreeOfSuccess of constants.degreesOfSuccess) {
      if (!!state.destination) {
        const transition = stateTransitions[degreeOfSuccess] || {};
        transition.destination = transition.destination || state.destination;
        stateTransitions[degreeOfSuccess] = transition;
      }

    }
    transitions[stateName] = stateTransitions;
  }
  console.log("transitions", transitions);
  return transitions;
}
*/

/*
function getDamageFunctions(transitions, parameterNames) {
  const functions = {};
  for (const stateName in transitions) {
    functions[stateName] = {};
    for (const degreeOfSuccess of constants.degreesOfSuccess) {
      functions[stateName][degreeOfSuccess] = new Function(...parameterNames, `return ${transitions[stateName][degreeOfSuccess]?.damage || 0};`);
    }
  }
  return functions;
}
*/

function getVariantVariableNames(strategy) {
  const variantVariableNames = [];
  for (const variantName in strategy.variants) {
    const variant = strategy.variants[variantName];
    for (let variableName in variant) {
      variantVariableNames.push(variableName);
    }
    console.log("variantVariableNames", variantVariableNames);
    return variantVariableNames;
  }
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

function getCheckDegreeOfSuccess(stateName, checkFunctions, dcFunctions, variableValues, d20) {

    const checkResult = checkFunctions[stateName](...variableValues);
    if (typeof(checkResult) !== "number") {
      throw new Error(`Expected state '${stateName}' check to return a number but got '${checkResult}'.`);
    }

    const dcResult = dcFunctions[stateName](...variableValues);
    if (typeof(dcResult) !== "number") {
      throw new Error(`Expected state '${stateName}' DC to return a number but got '${dcResult}'.`);
    }

    return getDegreeOfSuccess(d20, checkResult, dcResult);
}

function createContext(parent, child) {
  const context = Object.assign({}, parent);
  if (child.constants) {
    for (const constantName in child.constants) {
      context[constantName] = child.constants[constantName];
    }
  }
  if (child.functions) {
    for (const functionName in child.functions) {
      const func = child.functions[functionName];
      context[functionName] = new Function("x", `return (${func})(x);`);
    }
  }
  return context;
}

async function getDamage(input) {

  let remaining = getTotal(input);
  const loadingBar = getLoadingBar(remaining);

  // Context
  const context = createContext(helpers, input);

  // Strategies
  const results = {};
  for (const strategyName in input.strategies) {

    results[strategyName] = {};

    // Check and DC functions
    const strategy = input.strategies[strategyName];
    const stateInfo = {};
    for (const stateName in strategy.states) {
      const state = strategy.states[stateName];

      const criticalSuccess = state.transitions["critical-success"] || state.transitions["success"] || state.transitions["else"];
      const success = state.transitions["success"] || state.transitions["else"];
      const failure = state.transitions["failure"] || state.transitions["else"];
      const criticalFailure = state.transitions["critical-failure"] || state.transitions["failure"] || state.transitions["else"];

      stateInfo[stateName] = {
        check: new Function("x", `return (${state.check})(x);`),
        dc: new Function("x", `return (${state.dc})(x);`),
        transitions: {
          "critical-success": {
            damage: new Function("x", `return (${criticalSuccess?.damage || "x => 0"})(x)`),
            destination: criticalSuccess?.destination || state.destination,
          },
          "success": {
            damage: new Function("x", `return (${success?.damage || "x => 0"})(x)`),
            destination: success?.destination || state.destination,
          },
          "failure": {
            damage: new Function("x", `return (${failure?.damage || "x => 0"})(x)`),
            destination: failure?.destination || state.destination,
          },
          "critical-failure": {
            damage: new Function("x", `return (${criticalFailure?.damage || "x => 0"})(x)`),
            destination: criticalFailure?.destination || state.destination
          }
        }
      };
    }
    console.log("stateInfo", stateInfo);

    const variants = strategy.variants || {
      "Default": {}
    };

    // Variants
    for (const variantName in variants) {

      results[strategyName][variantName] = {};

      // Variant Context
      const variant = variants[variantName];
      const variantContext = createContext(context, variant);

      // Levels
      for (let level = 1; level <= 20; level++) {

        results[strategyName][variantName][level] = {};

        variantContext._level = level;

        // States
        for (const stateName in strategy.states) {

          const state = strategy.states[stateName];
/*
          const variantVariableValuesAvg = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level, helpers._dAvg);
          const variantVariableValuesMin = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level, helpers._dMin);
          const variantVariableValuesMax = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level, helpers._dMax);

          const damageParameterValuesAvg = [...helperImpls, ...variantVariableValuesAvg, level, (sides) => (sides + 1) / 2];
          const damageParameterValuesMin = [...helperImpls, ...variantVariableValuesMin, level, (sides) => 1];
          const damageParameterValuesMax = [...helperImpls, ...variantVariableValuesMax, level, (sides) => sides];
*/
          const result = {
            start: state.start || false,
          }
          for (const degreeOfSuccess of constants.degreesOfSuccess) {
            variantContext._d = helpers._dAvg;
            const avg = stateInfo[stateName].transitions[degreeOfSuccess].damage(variantContext);
            variantContext._d = helpers._dMin;
            const min = stateInfo[stateName].transitions[degreeOfSuccess].damage(variantContext);
            variantContext._d = helpers._dMax;
            const max = stateInfo[stateName].transitions[degreeOfSuccess].damage(variantContext);
            result[degreeOfSuccess] = {
              rolls: [],
              destination: stateInfo[stateName].transitions[degreeOfSuccess].destination,
              avg: avg,
              min: min,
              max: max,
            }
          }

          // Rolls
          for (let d20 = 1; d20 <= 20; d20++) {

            variantContext._d20 = d20;
            const check = stateInfo[stateName].check(variantContext);
            const dc = stateInfo[stateName].dc(variantContext);
            const degreeOfSuccess = getDegreeOfSuccess(d20, check, dc);

            result[degreeOfSuccess].rolls.push(d20);

            await loadingBar(--remaining);
          }

          result.count = 20;
          result.total = 0;
          result.min = null;
          result.max = null;
          for (const degreeOfSuccess of constants.degreesOfSuccess) {
            const dos = result[degreeOfSuccess];
            dos.count = dos.rolls.length;
            dos.chance = dos.count / result.count;
            result.total += dos.avg * dos.count;
            result.min = Math.min(result.min || Number.MAX_SAFE_INTEGER, dos.min);
            result.max = Math.max(result.max || Number.MIN_SAFE_INTEGER, dos.max);
          }
          result.avg = result.total / result.count;

          results[strategyName][variantName][level][stateName] = result;
        }
      }
    }
  }

  console.log("results", results);
  return results;
}

function getDamageSummary(states, stateName, chance) {

  if (!stateName) {
    return {
      avg: 0,
      min: 0,
      max: 0,
    };
  }

  const state = states[stateName];

  const result = {
    avg: chance * state.avg,
    min: state.min,
    max: state.max,
  };

  let childMin = 0;
  let childMax = 0;
  for (const degreeOfSuccess of constants.degreesOfSuccess) {
    const dos = state[degreeOfSuccess];
    const child = getDamageSummary(states, dos.destination, chance * dos.chance);
    result.avg += child.avg;
    childMin = Math.min(childMin, child.min);
    childMax = Math.max(childMax, child.max);
  }
  result.min += childMin;
  result.max += childMax;

  return result;
}

function getStart(states) {
  for (const stateName in states) {
    const state = states[stateName];
    if (!!state.start) {
      return stateName;
    }
  }
  throw new Error("Failed to find start state.");
}

function getChartData(damage) {
  const results = [];
  for (const strategyName in damage) {
    const strategy = damage[strategyName];

    let variantCount = 0;
    for (const variantName in strategy) {
      variantCount++;
    }

    for (const variantName in strategy) {
      const variant = strategy[variantName];
      const result = {
        name: variantCount === 1
          ? `${strategyName}`
          : `${strategyName} (${variantName})`,
        avg: [],
        min: [],
        max: [],
      };
      for (let level = 1; level <= 20; level++) {
        const states = variant[level];
        const start = getStart(states);
        const summary = getDamageSummary(states, start, 1);
        result.avg.push(summary.avg);
        result.min.push(summary.min);
        result.max.push(summary.max);
      }
      results.push(result);
    }
  }
  return results;
}

export async function simulate(input) {
  const damage = await getDamage(input);
  return getChartData(damage);
}