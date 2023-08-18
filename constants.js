export const constants = {};

constants.criticalSuccess = "critical-success";
constants.success = "success";
constants.failure = "failure";
constants.criticalFailure = "critical-failure";

constants.degreesOfSuccess = [constants.criticalSuccess, constants.success, constants.failure, constants.criticalFailure];
constants.degreesOfSuccessReverse = constants.degreesOfSuccess.reverse();

constants.defaultInput = {
  name: "Default",
  constants: {
    die: 10,
    fatal: 12,
    map: -5
  },
  functions: {
    attack: "x => x._mod(x._level) + x._prof(x._level, 'fighter') + x._level + x._potency(x._level)",
    strikeDmg: "x => x._weaponDamageDice(x._level) * x._d(x.die) + x._mod(x._level) + x._weaponSpecialization(x._level, 'fighter')",
    strikeCritDmg: "x => 2 * (((x._weaponDamageDice(x._level) + 1) * x._d(x.fatal)) + x._mod(x._level) + x._weaponSpecialization(x._level, 'fighter')) + x._cases(x._level, [[1,0],[5,2*x._weaponDamageDice(x._level)]])",
    powerAttackDmg: "x => (x._weaponDamageDice(x._level) + x._powerAttack(x._level)) * x._d(x.die) + x._mod(x._level) + x._weaponSpecialization(x._level, 'fighter')",
    powerAttackCritDmg: "x => 2 * ((x._weaponDamageDice(x._level) + x._powerAttack(x._level) + 1) * x._d(x.fatal) + x._mod(x._level) + x._weaponSpecialization(x._level, 'fighter')) + x._cases(x._level, [[1,0],[5,2*x._weaponDamageDice(x._level)]])",
    ac: "x => x._ac(x._level, 'moderate')",
  },
  strategies: {
    "Strike, Power Attack": {
      states: {
        "Strike": {
          start: true,
          destination: "Power Attack",
          check: "x => x._d20 + x.attack(x)",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        },
        "Power Attack": {
          check: "x => x._d20 + x.attack(x) + x.map",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.powerAttackCritDmg(x)",
            },
            "success": {
              damage: "x => x.powerAttackDmg(x)",
            }
          }
        }
      }
    },
    "Power Attack, Strike": {
      states: {
        "Power Attack": {
          start: true,
          destination: "Strike",
          check: "x => x._d20 + x.attack(x)",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.powerAttackCritDmg(x)",
            },
            "success": {
              damage: "x => x.powerAttackDmg(x)",
            }
          }
        },
        "Strike": {
          check: "x => x._d20 + x.attack(x) + x._cases(x._level, [[1,2*x.map],[6,x.map]])",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        }
      }
    },
    "Strike, Strike, Strike": {
      states: {
        "Strike #1": {
          start: true,
          destination: "Strike #2",
          check: "x => x._d20 + x.attack(x)",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        },
        "Strike #2": {
          destination: "Strike #3",
          check: "x => x._d20 + x.attack(x) + x.map",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        },
        "Strike #3": {
          check: "x => x._d20 + x.attack(x) + 2 * x.map",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        }
      }
    },
    "Strike, Exacting Strike, Strike": {
      states: {
        "Strike #1": {
          start: true,
          destination: "Exacting Strike",
          check: "x => x._d20 + x.attack(x)",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        },
        "Exacting Strike": {
          destination: "Strike #2 (After Exacting Missing)",
          check: "x => x._d20 + x.attack(x) + x.map",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
              destination: "Strike #2 (After Exacting Hit)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
              destination: "Strike #2 (After Exacting Hit)",
            }
          }
        },
        "Strike #2 (After Exacting Missing)": {
          check: "x => x._d20 + x.attack(x) + x.map",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        },
        "Strike #2 (After Exacting Hit)": {
          check: "x => x._d20 + x.attack(x) + 2 * x.map",
          dc: "x => x.ac(x)",
          transitions: {
            "critical-success": {
              damage: "x => x.strikeCritDmg(x)",
            },
            "success": {
              damage: "x => x.strikeDmg(x)",
            }
          }
        }
      }
    }
  }
}