export const defaultInput = {
  strategies: {
    "Strikes": {
      variants: {
        "MAP -5": {
          strength: "boosts(level, 0)",
          proficiency: "proficiency(level, 'fighter')",
          ac: "ac(level, 'moderate')",
          map: -5,
          weaponDice: "weaponDice(level, 10)"
        },
        "MAP -10": {
          strength: "boosts(level, 0)",
          proficiency: "proficiency(level, 'fighter')",
          ac: "ac(level, 'moderate')",
          map: -4,
          weaponDice: "weaponDice(level, 10)"
        }
      },
      start: "Strike #1",
      states: {
        "Strike #1": {
          check: "d20 + strength + proficiency",
          dc: "ac",
          transitions: {
       /*     "critical-success": {
              damage: ""
            },*/
            "else": {
              destination: "Strike #2"
            }
          }
        },
        "Strike #2": {
          check: "d20 + strength + proficiency + map",
          dc: "ac",
          transitions: {
            "else": {
              destination: "Strike #3"
            }
          }
        },
        "Strike #3": {
          check: "d20 + strength + proficiency + 2 * map",
          dc: "ac"
        }
      }
    }
  }
}

export const examples = [
  {
    name: "boosts(level, 0)",
    func: level => helpers["boosts"](level, 0),
  },
  {
    name: "boosts(level, -1)",
    func: level => helpers["boosts"](level, -1),
  },
  {
    name: "boosts(level, -2)",
    func: level => helpers["boosts"](level, -2),
  },
  {
    name: "proficiency(level, 'fighter')",
    func: level => helpers["proficiency"](level, "fighter"),
  },
  {
    name: "proficiency(level, 'rogue')",
    func: level => helpers["proficiency"](level, "rogue"),
  },
  {
    name: "ac(level, 'moderate')",
    func: level => helpers["ac"](level, "moderate"),
  },
  {
    name: "ac(level + 2, 'extreme')",
    func: level => helpers["ac"](level, "extreme"),
  },
];

export const helpers = {
  "boosts": function(level, offset) {
    const boosts = 4 + Math.floor(level / 5) + offset;
    const doubleBoosts = Math.min(boosts, 4);
    const singleBoosts = Math.max(boosts - 4, 0);
    return doubleBoosts + Math.floor(singleBoosts / 2);
  },
  "proficiency": function(level, type) {
    if (type === "fighter") {
      return [4, 4, 4, 4, 6, 6, 6, 6, 6, 6,  6,  6,  8,  8,  8,  8,  8,  8,  8,  8][level - 1];
    } else if (type === "rogue") {
      return [2, 2, 2, 2, 4, 4, 4, 4, 4, 4,  4,  4,  6,  6,  6,  6,  6,  6,  6,  6][level - 1];
    }
    throw new Error(`Proficiency not implemented: ${type}`);
  },
  "ac": function(level, type) {
    if (type == "extreme") {
      return [18, 19, 19, 21, 22, 24, 25, 27, 28, 30, 31, 33, 34, 36, 37, 39, 40, 42, 43, 45, 46, 48, 49, 51, 52, 54][level + 1];
    } else if (type == "high") {
      return [15, 16, 16, 18, 19, 21, 22, 24, 25, 27, 28, 30, 31, 33, 34, 36, 37, 39, 40, 42, 43, 45, 46, 48, 49, 51][level + 1];
    } else if (type == "moderate") {
      return [14, 15, 15, 17, 18, 20, 21, 23, 24, 26, 27, 29, 30, 32, 33, 35, 36, 38, 39, 41, 42, 44, 45, 47, 48, 50][level + 1];
    } else if (type == "low") {
      return [12, 13, 13, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28, 30, 31, 33, 34, 36, 37, 39, 40, 42, 43, 45, 46, 48][level + 1];
    }
    throw new Error(`AC not implemented: ${type}`);
  },
  "weaponDice": function(level, sides) {
    if (level < 4) {
      return 1;
    } else if (level < 12) {
      return 2;
    } else if (level < 19) {
      return 3;
    }
    return 4;
  }
}