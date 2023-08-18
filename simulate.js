import { constants } from "./constants.js";
import { helpers } from "./helpers.js";
import { getTotal, getLoadingBar} from "./loading-bar.js";

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
            function coalesce(a, b) {
              return !!a || a === 0 ? a : b;
            }
            result.min = Math.min(coalesce(result.min, Number.MAX_SAFE_INTEGER), dos.min);
            result.max = Math.max(coalesce(result.max, Number.MIN_SAFE_INTEGER), dos.max);
          }
          result.avg = result.total / result.count;

          results[strategyName][variantName][level][stateName] = result;
        }
      }
    }
  }

  return results;
}

function getDegreeOfSuccessTooltip(state) {

  const intervals = constants.degreesOfSuccessReverse.map(degreeOfSuccess => {
    const rolls = state[degreeOfSuccess].rolls;
    if (rolls.length === 1) {
      return `${rolls[0]}`;
    } else if (rolls.length > 1) {
      return `${rolls[0]}-${rolls[rolls.length - 1]}`;
    } else {
      return "-";
    }
  });

  const percents = constants.degreesOfSuccessReverse.map(degreeOfSuccess => {
    const percent = 100 * (state[degreeOfSuccess].rolls.length / 20)
    return `${percent}%`;
  });

  return `[${intervals.join(",")}] [${percents.join(",")}]`;
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

  console.log("damage", damage);

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
        dos: [],
      };
      for (let level = 1; level <= 20; level++) {
        const states = variant[level];
        const start = getStart(states);
        const summary = getDamageSummary(states, start, 1);
        result.avg.push(summary.avg);
        result.min.push(summary.min);
        result.max.push(summary.max);
        const stateTooltipLines = [];
        for (const stateName in states) {
          const state = states[stateName];
          const stateTooptipDos = getDegreeOfSuccessTooltip(state);
          stateTooltipLines.push(`${stateName}: ${stateTooptipDos}`);
        }
        result.dos.push(stateTooltipLines);
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