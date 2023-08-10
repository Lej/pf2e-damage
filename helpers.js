export const helpers = {
  "_mod": (level, offset = 0) => {
    const boosts = 4 + Math.floor(level / 5) + offset;
    const doubleBoosts = Math.min(boosts, 4);
    const singleBoosts = Math.max(boosts - 4, 0);
    return doubleBoosts + Math.floor(singleBoosts / 2);
  },
  "_prof": (level, type) => {
    if (type === "fighter") {
      return [4, 4, 4, 4, 6, 6, 6, 6, 6, 6,  6,  6,  8,  8,  8,  8,  8,  8,  8,  8][level - 1];
    } else if (type === "rogue") {
      return [2, 2, 2, 2, 4, 4, 4, 4, 4, 4,  4,  4,  6,  6,  6,  6,  6,  6,  6,  6][level - 1];
    }
    throw new Error(`Proficiency not implemented: ${type}`);
  },
  "_ac": (level, type) => {
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
  "_weaponDamageDice": (level) => {
    if (level < 4) {
      return 1;
    } else if (level < 12) {
      return 2;
    } else if (level < 19) {
      return 3;
    }
    return 4;
  },
  "_dieValueAvg": (sides) => (sides + 1) / 2,
  "_dieValueMin": (sides) => 1,
  "_dieValueMax": (sides) => sides
}