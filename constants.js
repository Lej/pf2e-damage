export const constants = {};

constants.criticalSuccess = "critical-success";
constants.success = "success";
constants.failure = "failure";
constants.criticalFailure = "critical-failure";

constants.degreesOfSuccess = [constants.criticalSuccess, constants.success, constants.failure, constants.criticalFailure];

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