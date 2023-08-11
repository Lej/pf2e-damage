import { constants } from "./constants.js";
import { helpers } from "./helpers.js";
import { getTotal, getLoadingBar} from "./loading-bar.js";

/*
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
*/

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

function getVariantVariableFunctions(variant, variableNames, helperNames) {
  const variableFunctions = {};
  for (const variableName of variableNames) {
    variableFunctions[variableName] = new Function(...helperNames, "level", "_dieValue", `return ${variant[variableName]}`);
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
  //console.log("variableValues", variableValues);
  return variableValues;
}

/*
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
*/

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

async function getDamage(input) {

  let remaining = getTotal(input);
  const loadingBar = getLoadingBar(remaining);

  // Helpers
  const [helperNames, helperImpls] = getHelpers();

  // Strategies
  const results = {};
  for (const strategyName in input.strategies) {

    results[strategyName] = {};

    const strategy = input.strategies[strategyName];
    //const transitions = getTransitions(strategy);
    const variantVariableNames = getVariantVariableNames(strategy);

    const degreeOfSuccessParameterNames = [...helperNames, ...variantVariableNames, "level", "d20"];
    const checkFunctions = getCheckFunctions(strategy, degreeOfSuccessParameterNames);
    const dcFunctions = getDcFunctions(strategy, degreeOfSuccessParameterNames);

    const transitions = getTransitions(strategy);
    const damageParameterNames = [...helperNames, ...variantVariableNames, "level", "_dieValue"];
    const damageFunctions = getDamageFunctions(transitions, damageParameterNames);

    // Variants
    for (const variantName in strategy.variants) {

      results[strategyName][variantName] = {};

      const variant = strategy.variants[variantName];
      const variantVariableFunctions = getVariantVariableFunctions(variant, variantVariableNames, helperNames);

      // Levels
      for (let level = 1; level <= 20; level++) {

        results[strategyName][variantName][level] = {};

        //console.log("level", level);

        // States
        for (const stateName in strategy.states) {

          const state = strategy.states[stateName];

          const variantVariableValuesAvg = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level, helpers._dieValueAvg);
          const variantVariableValuesMin = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level, helpers._dieValueMin);
          const variantVariableValuesMax = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level, helpers._dieValueMax);

          const damageParameterValuesAvg = [...helperImpls, ...variantVariableValuesAvg, level, (sides) => (sides + 1) / 2];
          const damageParameterValuesMin = [...helperImpls, ...variantVariableValuesMin, level, (sides) => 1];
          const damageParameterValuesMax = [...helperImpls, ...variantVariableValuesMax, level, (sides) => sides];

          function getResult() {
            const result = {
              start: state.start || false,
            };
            for (const degreeOfSuccess of constants.degreesOfSuccess) {
              result[degreeOfSuccess] = {
                rolls: [],
                destination: transitions[stateName][degreeOfSuccess]?.destination,
                min: damageFunctions[stateName][degreeOfSuccess](...damageParameterValuesMin),
                avg: damageFunctions[stateName][degreeOfSuccess](...damageParameterValuesAvg),
                max: damageFunctions[stateName][degreeOfSuccess](...damageParameterValuesMax),
              }
            }
            return result;
          }

          const result = getResult();

          // Rolls
          for (let d20 = 1; d20 <= 20; d20++) {
            // Ok to use variantVariableValuesAvg?
            const degreeOfSuccessParameterValues = [...helperImpls, ...variantVariableValuesAvg, level, d20];
            const degreeOfSuccess = getCheckDegreeOfSuccess(stateName, checkFunctions, dcFunctions, degreeOfSuccessParameterValues, d20);

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

  /*
  return  + getAvgDamage(states, state)

  let total = 0;
  let damage = 0;

  const degreesOfSuccess = ["critical-success", "success", "failure", "critical-failure"];
  for (const degreeOfSuccess of degreesOfSuccess) {
    const state = current[degreeOfSuccess];
    total += state.rolls.length;
    damage += state.rolls.length * state.damage.avg;
  }

  const average = damage / total;
  return average;
  */

  /*
  const criticalSuccess = current["critical-success"];
  const success = current["success"];
  const failure = current["failure"];
  const criticalFailure = current["critical-failure"];

  const numCriticalSuccessRolls = criticalSuccess.rolls.length;
  const numSuccessRolls = success.rolls.length;
  const numFailureRolls = failure.rolls.length;
  const numCriticalFailureRolls = criticalFailure.rolls.length;

  const numRolls = numCriticalSuccessRolls + numSuccessRolls + numFailureRolls + numCriticalFailureRolls;

  const chanceCriticalSuccess = numCriticalFailureRolls / numRolls;
  const chanceSuccess = numSuccessRolls / numRolls;
  const chanceFailure = numFailureRolls / numRolls;
  const chanceCriticalFailure = numCriticalFailureRolls / numRolls;

  const damageCriticalSuccess = chanceCriticalSuccess * (criticalSuccess.damage.avg + getAvgDamage(states, states[criticalSuccess?.destination]));
  const damageSuccess = chanceCriticalSuccess * (success.damage.avg + getAvgDamage(states, states[success?.destination]));
  const damageFailure = chanceCriticalSuccess * (failure.damage.avg + getAvgDamage(states, states[failure?.destination]));
  const damageCriticalFailure = chanceCriticalSuccess * (criticalFailure.damage.avg + getAvgDamage(states, states[criticalFailure?.destination]));

  const damageTotal = damageCriticalSuccess + damageSuccess + damageFailure + damageCriticalFailure;
  return damageTotal;*/
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