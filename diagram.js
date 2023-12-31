import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

function normalize(...args) {
  return args.map(x => x.replace(/[\W]+/g, "_")).join("_");
}

function normalizeDisplayName(...args) {
  return args
    .filter(x => !!x)
    .map(x => x
      .replace(/{/g, "")
      .replace(/}/g, "")
      .replace(/:+/g, " =")
      .replace(/,\b(?! )/g, ", ")
      .replace(/["\r]/g, "")
      .trim()
      .replace(/["\n]/g, "<br/>")
    ).join("<br/>");
}

export async function updateDiagram(input) {

  const stateNames = new Set();

  let diagram = "";
  diagram += "stateDiagram-v2\n";
  diagram += "    direction LR\n\n";

  for (const strategyName in input.strategies) {
    const strategy = input.strategies[strategyName];

    let variantCount = 0;
    for (const variantName in strategy.variants) {
      variantCount++;
    }

    const variants = strategy.variants || {
      "Default": {}
    };

    for (const variantName in variants) {

      const variant = variants[variantName];
      const normalizedVariantDisplayName = variantCount === 1
        ? normalizeDisplayName(`${strategyName}`)
        : normalizeDisplayName(`${strategyName} (${variantName})`);
      const normalizedVariantName = normalize(strategyName, variantName);
      console.log("normalizedVariantName", normalizedVariantName);

      if (stateNames.has(normalizedVariantName)) {
        throw new Error(`Duplicate state name: ${normalizedVariantName}`);
      }
      stateNames.add(normalizedVariantName);

      diagram += `    ${normalizedVariantName}: ${normalizedVariantDisplayName}\n`;

      if (input.constants) {
        diagram += `        note right of ${normalizedVariantName}\n`;
        for (const constantName in input.constants) {
          diagram += `            ${normalizeDisplayName(constantName)} = ${normalizeDisplayName(input.constants[constantName]?.toString())}\n`;
        }
        diagram += `        end note\n\n`;
      }

      if (input.functions) {
        diagram += `        note right of ${normalizedVariantName}\n`;
        for (const functionName in input.functions) {
          diagram += `            ${normalizeDisplayName(functionName)} = ${normalizeDisplayName(input.functions[functionName]?.toString())}\n`;
        }
        diagram += `        end note\n\n`;
      }

      diagram += `    [*] --> ${normalizedVariantName}\n\n`;
      diagram += `    state ${normalizedVariantName} {\n\n`;
      diagram += `        direction LR\n\n`;

      for (const stateName in strategy.states) {
        const state = strategy.states[stateName];
        const normalizedStateDisplayName = normalizeDisplayName(stateName, `${state.check} vs ${state.dc}`);
        const normalizedStateName = normalize(strategyName, variantName, stateName);

        if (stateNames.has(normalizedStateName)) {
          throw new Error(`Duplicate state name: ${normalizedStateName}`);
        }
        stateNames.add(normalizedStateName);

        diagram += `        ${normalizedStateName}: ${normalizedStateDisplayName}\n`;

        if (strategy.start === stateName) {
          diagram += `        [*] --> ${normalizedStateName}\n\n`;
        }

        let noTransition = true;
        if (!!state.transitions) {
          for (const transitionName in state.transitions) {
            const transition = state.transitions[transitionName];
            const normalizedTransitionDisplayName = normalizeDisplayName(transitionName, `${transition.damage}`);

            const destination = transition.destination || state.destination;
            if (!!destination) {
              diagram += `        ${normalizedStateName} --> ${normalize(strategyName, variantName, destination)}: ${normalizedTransitionDisplayName}\n\n`;
            } else {
              diagram += `        ${normalizedStateName} --> [*]: ${normalizedTransitionDisplayName}\n\n`;
            }

            noTransition = false;
          }
        }

        if (!!state.destination && (!state.transitions || !state.transitions["else"])) {
          diagram += `        ${normalizedStateName} --> ${normalize(strategyName, variantName, state.destination)}: else\n\n`;
          noTransition = false;
        }

        if (noTransition) {
          diagram += `        ${normalizedStateName} --> [*]`;
        }
      }

      diagram += `\n    }\n\n`;

    }
  }

  console.log(diagram);

  const diagramElement = document.getElementById("mermaid");
  diagramElement.innerHTML = diagram;
  diagramElement.removeAttribute("data-processed");
  await mermaid.run();

  const svg = diagramElement.children[0];
  const viewBox = svg.attributes["viewBox"].value;
  const width = viewBox.replace(/^\S+\s+\S+\s/, "").replace(/\s+\S+$/, "");
  svg.setAttribute("width", width);
}