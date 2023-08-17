export const constants = {};

constants.criticalSuccess = "critical-success";
constants.success = "success";
constants.failure = "failure";
constants.criticalFailure = "critical-failure";

constants.degreesOfSuccess = [constants.criticalSuccess, constants.success, constants.failure, constants.criticalFailure];

// https://www.reddit.com/r/Pathfinder2e/comments/cw8ys6/2hweapon_fighter_analysis_exacting_strike_vs/
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