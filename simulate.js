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
    variableFunctions[variableName] = new Function(...helperNames, "level", `return ${variant[variableName]}`);
  }
  console.log("variableFunctions", variableFunctions);
  return variableFunctions;
}

function getVariantVariableValues(variableNames, variableFunctions, helperImpls, level) {
  const variableValues = [];
  for (const variableName of variableNames) {
    const fn = variableFunctions[variableName];
    const value = fn(...helperImpls, level);
    variableValues.push(value);
  }
  console.log("variableValues", variableValues);
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


function getDamageFunctions(strategy, variableNames) {
  const functions = {};
  for (const stateName in strategy.states) {

    const state = strategy.states[stateName];
    const fns = {};
    const damage = (code) => new Function(...variableNames, `return ${code};`);

    const criticalSuccess = state.transitions["critical-success"] || state.transitions["success"] || state.transitions["else"];
    if (!!criticalSuccess && !!criticalSuccess.damage) {
      fns["critical-success"] = damage(criticalSuccess.damage);
    } else {
      fns["critical-success"] = damage(0);
    }

    const success = state.transitions["success"] || state.transitions["else"];
    if (!!success && !!success.damage) {
      fns["success"] = damage(success.damage);
    } else {
      fns["success"] = damage(0);
    }

    const failure = state.transitions["failure"] || state.transitions["else"];
    if (!!failure && !!failure.damage) {
      fns["failure"] = damage(failure.damage);
    } else {
      fns["failure"] = damage(0);
    }

    const criticalFailure = state.transitions["critical-failure"] || state.transitions["failure"] || state.transitions["else"];
    if (!!criticalFailure && !!criticalFailure.damage) {
      fns["critical-failure"] = damage(criticalFailure.damage);
    } else {
      fns["critical-failure"] = damage(0);
    }

    functions[stateName] = fns;
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

export async function simulate(input) {

  let remaining = getTotal(input);
  const loadingBar = getLoadingBar(remaining);

  // Helpers
  const [helperNames, helperImpls] = getHelpers();

  // Strategies
  const results = [];
  for (const strategyName in input.strategies) {

    const strategy = input.strategies[strategyName];
    //const transitions = getTransitions(strategy);
    const variantVariableNames = getVariantVariableNames(strategy);
    const variableNames = [...helperNames, ...variantVariableNames, "level", "d20"];
    console.log("variableNames", variableNames);
    const checkFunctions = getCheckFunctions(strategy, variableNames);
    const dcFunctions = getDcFunctions(strategy, variableNames);
    const damageFunctions = getDamageFunctions(strategy, variableNames);

    // Variants
    for (const variantName in strategy.variants) {

      const variant = strategy.variants[variantName];
      const variantVariableFunctions = getVariantVariableFunctions(variant, variantVariableNames, helperNames);

      // Levels
      for (let level = 1; level <= 20; level++) {

        console.log("level", level);
        const variantVariableValues = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level);

        // States
        for (const stateName in strategy.states) {

          // Rolls
          for (let d20 = 1; d20 <= 20; d20++) {
            const variableValues = [...helperImpls, ...variantVariableValues, level, d20];
            const degreeOfSuccess = getCheckDegreeOfSuccess(stateName, checkFunctions, dcFunctions, variableValues, d20);

            const minDamage = "";
            const maxDamage = "";
            const avgDamage = "";

            /*result[strategyName] = result[strategyName] || {};
            result[strategyName][variantName] = result[strategyName][variantName] || {};
            result[strategyName][variantName][]*/

            results.push({
              strategyName: strategyName,
              variantName: variantName,
              stateName: stateName,
              level: level,
              d20: d20,
              degreeOfSuccess: degreeOfSuccess
            });

            await loadingBar(--remaining);
          }
        }
      }
    }
  }

  console.log("results", results);
}