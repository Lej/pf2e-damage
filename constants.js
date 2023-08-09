export const defaultInput = {
  strategies: {
    "Strikes": {
      variants: {
        "Normal": {
          str: "_mod(level, 0)",
          prof: "_prof(level, 'fighter')",
          ac: "_ac(level, 'moderate')",
          map: -5,
          weaponDie: 10,
        },
        "Agile": {
          str: "_mod(level, 0)",
          prof: "_prof(level, 'fighter')",
          ac: "_ac(level, 'moderate')",
          map: -4,
          weaponDie: 10,
        }
      },
      start: "Strike #1",
      states: {
        "Strike #1": {
          check: "d20 + str + prof",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * (_weaponDamage(level, weaponDie) + str)",
              destination: "Strike #2"
            },
            "success": {
              damage: "_weaponDamage(level, weaponDie) + str",
              destination: "Strike #2"
            },
            "else": {
              destination: "Strike #2"
            }
          }
        },
        "Strike #2": {
          check: "d20 + str + prof + map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * (_weaponDamage(level, weaponDie) + str)",
              destination: "Strike #3"
            },
            "success": {
              damage: "_weaponDamage(level, weaponDie) + str",
              destination: "Strike #3"
            },
            "else": {
              destination: "Strike #3"
            }
          }
        },
        "Strike #3": {
          check: "d20 + str + prof + 2 * map",
          dc: "ac",
          transitions: {
            "critical-success": {
              damage: "2 * (_weaponDamage(level, weaponDie) + str)",
            },
            "success": {
              damage: "_weaponDamage(level, weaponDie) + str",
            }
          }
        }
      }
    }
  }
}