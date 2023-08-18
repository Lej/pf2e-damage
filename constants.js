export const constants = {};

constants.criticalSuccess = "critical-success";
constants.success = "success";
constants.failure = "failure";
constants.criticalFailure = "critical-failure";

constants.degreesOfSuccess = [constants.criticalSuccess, constants.success, constants.failure, constants.criticalFailure];

constants.defaultInput = {
  name: "Default",
  strategies: {
    "Strike, Power Attack": {
      variants: {
        "Normal": {
          attack: "_mod(level) + _prof(level, 'fighter') + level + _potency(level)",
          strikeDmg: "_weaponDamageDice(level) * _dieValue(10) + _mod(level) + _weaponSpecialization(level, 'fighter')",
          strikeCritDmg: "2 * (((_weaponDamageDice(level) + 1) * _dieValue(12)) + _mod(level) + _weaponSpecialization(level, 'fighter') + 2 * _weaponDamageDice(level))",
          powerAttackDmg: "(_weaponDamageDice(level) + _powerAttack(level)) * _dieValue(10) + _mod(level) + _weaponSpecialization(level, 'fighter')",
          powerAttackCritDmg: "2 * ((_weaponDamageDice(level) + _powerAttack(level) + 1) * _dieValue(12) + _mod(level) + _weaponSpecialization(level, 'fighter') + 2 * _weaponDamageDice(level))",
          ac: "_ac(level, 'moderate')",
          map: -5
        }
      },
      states: {
        "Strike": {
          start: true,
          destination: "Power Attack",
          check: "d20 + attack",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        },
        "Power Attack": {
          check: "d20 + attack + map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "powerAttackCritDmg",
            },
            "success": {
              damage: "powerAttackDmg",
            }
          }
        }
      }
    },
    "Power Attack, Strike": {
      variants: {
        "Normal": {
          attack: "_mod(level) + _prof(level, 'fighter') + level + _potency(level)",
          strikeDmg: "_weaponDamageDice(level) * _dieValue(10) + _mod(level) + _weaponSpecialization(level, 'fighter')",
          strikeCritDmg: "2 * (((_weaponDamageDice(level) + 1) * _dieValue(12)) + _mod(level) + _weaponSpecialization(level, 'fighter') + 2 * _weaponDamageDice(level))",
          powerAttackDmg: "(_weaponDamageDice(level) + _powerAttack(level)) * _dieValue(10) + _mod(level) + _weaponSpecialization(level, 'fighter')",
          powerAttackCritDmg: "2 * ((_weaponDamageDice(level) + _powerAttack(level) + 1) * _dieValue(12) + _mod(level) + _weaponSpecialization(level, 'fighter') + 2 * _weaponDamageDice(level))",
          ac: "_ac(level, 'moderate')",
          map: -5
        }
      },
      states: {
        "Power Attack": {
          start: true,
          destination: "Strike",
          check: "d20 + attack",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "powerAttackCritDmg",
            },
            "success": {
              damage: "powerAttackDmg",
            }
          }
        },
        "Strike": {
          check: "d20 + attack + map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        }
      }
    },
    "Strike, Strike, Strike": {
      variants: {
        "Normal": {
          attack: "_mod(level) + _prof(level, 'fighter') + level + _potency(level)",
          strikeDmg: "_weaponDamageDice(level) * _dieValue(10) + _mod(level) + _weaponSpecialization(level, 'fighter')",
          strikeCritDmg: "2 * (((_weaponDamageDice(level) + 1) * _dieValue(12)) + _mod(level) + _weaponSpecialization(level, 'fighter') + 2 * _weaponDamageDice(level))",
          ac: "_ac(level, 'moderate')",
          map: -5
        }
      },
      states: {
        "Strike #1": {
          start: true,
          destination: "Strike #2",
          check: "d20 + attack",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        },
        "Strike #2": {
          destination: "Strike #3",
          check: "d20 + attack + map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        },
        "Strike #3": {
          check: "d20 + attack + 2 * map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        }
      }
    },
    "Strike, Exacting Strike, Strike": {
      variants: {
        "Normal": {
          attack: "_mod(level) + _prof(level, 'fighter') + level + _potency(level)",
          strikeDmg: "_weaponDamageDice(level) * _dieValue(10) + _mod(level) + _weaponSpecialization(level, 'fighter')",
          strikeCritDmg: "2 * (((_weaponDamageDice(level) + 1) * _dieValue(12)) + _mod(level) + _weaponSpecialization(level, 'fighter') + 2 * _weaponDamageDice(level))",
          ac: "_ac(level, 'moderate')",
          map: -5
        }
      },
      states: {
        "Strike #1": {
          start: true,
          destination: "Exacting Strike",
          check: "d20 + attack",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        },
        "Exacting Strike": {
          destination: "Strike #2 (MAP -5)",
          check: "d20 + attack + map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
              destination: "Strike #2 (MAP -10)",
            },
            "success": {
              damage: "strikeDmg",
              destination: "Strike #2 (MAP -10)",
            }
          }
        },
        "Strike #2 (MAP -5)": {
          check: "d20 + attack + map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        },
        "Strike #2 (MAP -10)": {
          check: "d20 + attack + 2 * map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "strikeCritDmg",
            },
            "success": {
              damage: "strikeDmg",
            }
          }
        }
      }
    }
  }
}