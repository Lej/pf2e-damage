import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";

function normalize(...args) {
  return args.map(x => x.replace(/[\W]+/g, "_")).join("_");
}

function normalizeDisplayName(...args) {
  return args.map(x => x.replace(/{/g, "[").replace(/}/g, "]").replace(/:+/g, "=").replace(/["]/g, "").replace(/,\b(?! )/g, ", ")).join("<br/>");
}

export async function updateDiagram() {

  const input = JSON.parse(document.getElementById("input").value);
  console.log("input", input);

  const stateNames = new Set();

  let diagram = "";
  diagram += "stateDiagram-v2\n";
  diagram += "    direction LR\n\n";

  for (const strategyName in input.strategies) {
    const strategy = input.strategies[strategyName];

    for (const variant of strategy.variants) {

      const variantJson = JSON.stringify(variant);
      const normalizedVariantDisplayName = normalizeDisplayName(`${strategyName} ${variantJson}`);
      const normalizedVariantName = normalize(strategyName, variantJson);
      console.log("normalizedVariantName", normalizedVariantName);

      if (stateNames.has(normalizedVariantName)) {
        throw new Error(`Duplicate state name: ${normalizedVariantName}`);
      }
      stateNames.add(normalizedVariantName);

      diagram += `    ${normalizedVariantName}: ${normalizedVariantDisplayName}\n`;
      diagram += `    [*] --> ${normalizedVariantName}\n\n`;
      diagram += `    state ${normalizedVariantName} {\n\n`;
      diagram += `        direction LR\n\n`;

      for (const stateName in strategy.states) {
        const state = strategy.states[stateName];
        const normalizedStateDisplayName = normalizeDisplayName(stateName, `${state.check} vs ${state.dc}`);
        const normalizedStateName = normalize(strategyName, variantJson, stateName);

        if (stateNames.has(normalizedStateName)) {
          throw new Error(`Duplicate state name: ${normalizedStateName}`);
        }
        stateNames.add(normalizedStateName);

        diagram += `        ${normalizedStateName}: ${normalizedStateDisplayName}\n`;
        /*
        diagram += `        note right of ${normalizedStateName}\n`;
        diagram += `            ${state.check} vs ${state.dc}\n`;
        diagram += `        end note\n\n`;
        */

        if (strategy.start === stateName) {
          diagram += `        [*] --> ${normalizedStateName}\n\n`;
        }

        let noTransition = true;
        if (!!state.transitions) {
          for (const transitionName in state.transitions) {
            const transition = state.transitions[transitionName];
            diagram += `        ${normalizedStateName} --> ${normalize(strategyName, variantJson, transition.destination)}: ${transitionName}\n\n`;
            noTransition = false;
          }
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
}