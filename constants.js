export const constants = {};

constants.criticalSuccess = "critical-success";
constants.success = "success";
constants.failure = "failure";
constants.criticalFailure = "critical-failure";

constants.degreesOfSuccess = [constants.criticalSuccess, constants.success, constants.failure, constants.criticalFailure];

constants.defaultInput = {
  strategies: {
    "Attack, Power Attack": {
      variants: {
        "Normal": {
          attack: "_mod(level) + _prof(level, 'fighter') + level + _potency(level)",
          ac: "_ac(level, 'moderate')",
          sides: 10,
          pickCrit: "2 * _weaponDamageDice(level)",
          powerAttack: "_cases(level, [[1,1],[10,2],[18,3]])",
          fatal: 1,
          fatalSides: 12,
          static: "_mod(level) + _weaponSpecialization(level, 'fighter')",
        }
      },
      states: {
        "Strike": {
          start: true,
          check: "d20 + attack",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * ((_weaponDamageDice(level) + fatal) * _dieValue(fatalSides) + static + pickCrit)",
              destination: "Power Attack"
            },
            "success": {
              damage: "_weaponDamageDice(level) * _dieValue(sides) + static",
              destination: "Power Attack"
            },
            "else": {
              destination: "Power Attack"
            }
          }
        },
        "Power Attack": {
          check: "d20 + attack - 5",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * ((_weaponDamageDice(level) + fatal + powerAttack) * _dieValue(fatalSides) + static + pickCrit)",
            },
            "success": {
              damage: "(_weaponDamageDice(level) + powerAttack) * _dieValue(sides) + static",
            }
          }
        }
      }
    }
  }
}

/*
constants.defaultInput = {
  strategies: {
    "Strikes": {
      variants: {
        "Normal": {
          str: "_mod(level)",
          prof: "_prof(level, 'fighter')",
          potency: "_potency(level)",
          ac: "_ac(level, 'moderate')",
          map: -5,
          sides: 10,
        },
        "Agile": {
          str: "_mod(level)",
          prof: "_prof(level, 'fighter')",
          potency: "_potency(level)",
          ac: "_ac(level, 'moderate')",
          map: -4,
          sides: 10,
        }
      },
      start: "Strike #1",
      states: {
        "Strike #1": {
          start: true,
          check: "d20 + str + prof + potency",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * (_weaponDamageDice(level) * _dieValue(sides) + str)",
              destination: "Strike #2"
            },
            "success": {
              damage: "_weaponDamageDice(level) * _dieValue(sides) + str",
              destination: "Strike #2"
            },
            "else": {
              destination: "Strike #2"
            }
          }
        },
        "Strike #2": {
          check: "d20 + str + prof + potency + map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * (_weaponDamageDice(level) * _dieValue(sides) + str)",
              destination: "Strike #3"
            },
            "success": {
              damage: "_weaponDamageDice(level) * _dieValue(sides) + str",
              destination: "Strike #3"
            },
            "else": {
              destination: "Strike #3"
            }
          }
        },
        "Strike #3": {
          check: "d20 + str + prof + potency + 2 * map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * (_weaponDamageDice(level) * _dieValue(sides) + str)",
            },
            "success": {
              damage: "_weaponDamageDice(level) * _dieValue(sides) + str",
            }
          }
        }
      }
    }
  }
}
*/