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

function getTransitions(strategy) {
  const transitions = {};
  for (const stateName in strategy.states) {
    const state = strategy.states[stateName];
    transitions[stateName] = {
      "critical-success": state.transitions["critical-success"] || state.transitions["success"] || state.transitions["else"],
      "success": state.transitions["success"] || state.transitions["else"],
      "failure": state.transitions["failure"] || state.transitions["else"],
      "critical-failure": state.transitions["critical-failure"] || state.transitions["failure"] || state.transitions["else"]
    };
  }
  console.log("transitions", transitions);
  return transitions;
}

function getDamageFunctions(transitions, parameterNames) {
  const functions = {};
  for (const stateName in transitions) {

    function getDamageFunction(code) {
      return new Function(...parameterNames, `return ${code};`);
    }

    functions[stateName] = {
      "critical-success": getDamageFunction(transitions[stateName]["critical-success"]?.damage || 0),
      "success": getDamageFunction(transitions[stateName]["success"]?.damage || 0),
      "failure": getDamageFunction(transitions[stateName]["failure"]?.damage || 0),
      "critical-failure": getDamageFunction(transitions[stateName]["critical-failure"]?.damage || 0),
    };;
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
  const damage = {};
  for (const strategyName in input.strategies) {

    damage[strategyName] = {};

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

      damage[strategyName][variantName] = {};

      const variant = strategy.variants[variantName];
      const variantVariableFunctions = getVariantVariableFunctions(variant, variantVariableNames, helperNames);

      // Levels
      for (let level = 1; level <= 20; level++) {

        damage[strategyName][variantName][level] = {};

        console.log("level", level);
        const variantVariableValues = getVariantVariableValues(variantVariableNames, variantVariableFunctions, helperImpls, level);

        // States
        for (const stateName in strategy.states) {

          const damageParameterValues = [...helperImpls, ...variantVariableValues, level];
          const damageParameterValuesMin = [...damageParameterValues, (sides) => 1];
          const damageParameterValuesAvg = [...damageParameterValues, (sides) => (sides + 1) / 2];
          const damageParameterValuesMax = [...damageParameterValues, (sides) => sides];

          function getDamage(degreeOfSuccess) {
            return {
              min: damageFunctions[stateName][degreeOfSuccess](...damageParameterValuesMin),
              avg: damageFunctions[stateName][degreeOfSuccess](...damageParameterValuesAvg),
              max: damageFunctions[stateName][degreeOfSuccess](...damageParameterValuesMax),
            }
          }

          damage[strategyName][variantName][level][stateName] = {
            "critical-success": {
              destination: transitions[stateName]["critical-success"]?.destination,
              damage: getDamage("critical-success"),
              rolls: []
            },
            "success": {
              destination: transitions[stateName]["success"]?.destination,
              damage: getDamage("success"),
              rolls: []
            },
            "failure": {
              destination: transitions[stateName]["failure"]?.destination,
              damage: getDamage("failure"),
              rolls: []
            },
            "critical-failure": {
              destination: transitions[stateName]["critical-failure"]?.destination,
              damage: getDamage("critical-failure"),
              rolls: []
            }
          };

          console.log("damage[strategyName][variantName][level][stateName]", damage[strategyName][variantName][level][stateName]);

          // Rolls
          for (let d20 = 1; d20 <= 20; d20++) {
            const degreeOfSuccessParameterValues = [...helperImpls, ...variantVariableValues, level, d20];
            const degreeOfSuccess = getCheckDegreeOfSuccess(stateName, checkFunctions, dcFunctions, degreeOfSuccessParameterValues, d20);

            damage[strategyName][variantName][level][stateName][degreeOfSuccess].rolls.push(d20);

            /*result[strategyName] = result[strategyName] || {};
            result[strategyName][variantName] = result[strategyName][variantName] || {};
            result[strategyName][variantName][]*/

            /*
            results.push({
              strategyName: strategyName,
              variantName: variantName,
              stateName: stateName,
              level: level,
              d20: d20,
              degreeOfSuccess: degreeOfSuccess,
              minDamage: minDamage,
              avgDamage: avgDamage,
              maxDamage: maxDamage
            });
            */

            await loadingBar(--remaining);
          }
        }
      }
    }
  }

  console.log("damage", damage);
}