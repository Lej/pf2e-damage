function assertLevel(min, max, level) {
  if (level < min || level > max) {
    throw new Error(`Invalid level: ${level}`);
  }
}

function prof(level, type) {
  assertLevel(1, 20, level);
  if (type === "fighter") {
    return [4, 4, 4, 4, 6, 6, 6, 6, 6, 6,  6,  6,  8,  8,  8,  8,  8,  8,  8,  8][level - 1];
  } else if (type === "rogue") {
    return [2, 2, 2, 2, 4, 4, 4, 4, 4, 4,  4,  4,  6,  6,  6,  6,  6,  6,  6,  6][level - 1];
  }
  throw new Error(`Proficiency not implemented: ${type}`);
}

function weaponSpecialization(level, type, weaponSpecializationLevel, greaterWeaponSpecializationLevel) {

  if (level < weaponSpecializationLevel) {
    return 0;
  }

  const step = ((prof(level, type) / 2) - 1);
  if (step < 1) {
    return 0;
  }

  return level >= greaterWeaponSpecializationLevel
    ? 2 * (step + 1)
    : step + 1;
}

function cases(level, cases) {
  for (let i = cases.length - 1; i >= 0; i--) {
    if (cases[i][0] <= level) {
      return cases[i][1];
    }
  }
  throw new Error("Failed to find valid case.");
}

function resistance(level, type) {
  assertLevel(-1, 24, level);
  if (type === "max") {
    return [1, 3, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 23, 24, 25, 26][level + 1];
  } else if (type === "min") {
    return [1, 1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13][level + 1];
  }
  throw new Error(`Resistance/weakness not implemented: ${type}`);
}

export const helpers = {
  _mod: (level, offset = 0) => {
    const boosts = 4 + Math.floor(level / 5) + offset;
    const doubleBoosts = Math.min(boosts, 4);
    const singleBoosts = Math.max(boosts - 4, 0);
    return doubleBoosts + Math.floor(singleBoosts / 2);
  },
  _prof: prof,
  _potency: (level) => {
    if (level < 2) {
      return 0;
    } else if (level < 10) {
      return 1;
    } else if (level < 16) {
      return 2;
    }
    return 3;
  },
  _cases: cases,
  _ac: (level, type) => {
    assertLevel(-1, 24, level);
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
  _weaponDamageDice: (level) => {
    if (level < 4) {
      return 1;
    } else if (level < 12) {
      return 2;
    } else if (level < 19) {
      return 3;
    }
    return 4;
  },
  _weaponSpecialization: (level, type) => {
    if (type === "fighter") {
      return weaponSpecialization(level, type, 7, 15);
    }
    throw new Error(`(Greater) weapon specialization not implemented: ${type}`);
  },
  _powerAttack: (level) => cases(level, [[1,1],[10,2],[18,3]]),
  _dieValueAvg: (sides) => (sides + 1) / 2,
  _dieValueMin: (sides) => 1,
  _dieValueMax: (sides) => sides,
  _resistance: resistance,
  _weakness: resistance
}