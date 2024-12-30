/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/twenty_one.json`.
 */
export type TwentyOne = {
  "address": "FpyrBGX9rfgCMpDJNXGHvF5g7YrGkUPBeg8Xnj81YxCw",
  "metadata": {
    "name": "twentyOne",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "addNewAdmin",
      "discriminator": [
        24,
        157,
        251,
        185,
        209,
        20,
        37,
        94
      ],
      "accounts": [
        {
          "name": "adminConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mainAdmin",
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        }
      ],
      "args": [
        {
          "name": "admins",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "closeAdminConfig",
      "discriminator": [
        59,
        75,
        200,
        4,
        200,
        71,
        32,
        44
      ],
      "accounts": [
        {
          "name": "adminConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mainAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeBank",
      "discriminator": [
        5,
        98,
        148,
        223,
        249,
        112,
        102,
        111
      ],
      "accounts": [
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "mainAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "closeSession",
      "discriminator": [
        68,
        114,
        178,
        140,
        222,
        38,
        248,
        211
      ],
      "accounts": [
        {
          "name": "session",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "drawCards",
      "discriminator": [
        88,
        105,
        173,
        173,
        28,
        95,
        14,
        119
      ],
      "accounts": [
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "session",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "randomnessAccountData"
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "fundBank",
      "discriminator": [
        168,
        176,
        175,
        44,
        6,
        58,
        239,
        247
      ],
      "accounts": [
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "funder",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "deposit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fundPlayer",
      "discriminator": [
        89,
        58,
        29,
        42,
        93,
        101,
        255,
        133
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "fundDeposit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initAdminConfig",
      "discriminator": [
        148,
        140,
        143,
        75,
        126,
        18,
        172,
        147
      ],
      "accounts": [
        {
          "name": "adminConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mainAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "initBank",
      "discriminator": [
        73,
        111,
        27,
        243,
        202,
        129,
        159,
        80
      ],
      "accounts": [
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "mainAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "deposit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initPlayer",
      "discriminator": [
        114,
        27,
        219,
        144,
        50,
        15,
        228,
        66
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "deposit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initSession",
      "discriminator": [
        121,
        206,
        80,
        106,
        231,
        194,
        225,
        248
      ],
      "accounts": [
        {
          "name": "session",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "randomnessAccountData"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "deposit",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeAdmin",
      "discriminator": [
        74,
        202,
        71,
        106,
        252,
        31,
        72,
        183
      ],
      "accounts": [
        {
          "name": "adminConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "mainAdmin",
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        }
      ],
      "args": [
        {
          "name": "admins",
          "type": {
            "vec": "pubkey"
          }
        }
      ]
    },
    {
      "name": "shuffleCards",
      "discriminator": [
        14,
        254,
        153,
        251,
        227,
        190,
        175,
        229
      ],
      "accounts": [
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "session",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "randomnessAccountData"
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "randomnessAccount",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "stand",
      "discriminator": [
        215,
        119,
        10,
        61,
        97,
        252,
        126,
        243
      ],
      "accounts": [
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "session",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "randomnessAccountData"
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "startRound",
      "discriminator": [
        144,
        144,
        43,
        7,
        193,
        42,
        217,
        215
      ],
      "accounts": [
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "session",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  115,
                  115,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player.authority",
                "account": "playerData"
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "bet",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawBank",
      "discriminator": [
        145,
        185,
        146,
        251,
        166,
        170,
        41,
        3
      ],
      "accounts": [
        {
          "name": "bank",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  110,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "mainAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "destination",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawPlayer",
      "discriminator": [
        225,
        55,
        124,
        133,
        61,
        27,
        21,
        33
      ],
      "accounts": [
        {
          "name": "player",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  121,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "signer"
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "withdrawAmount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "adminConfig",
      "discriminator": [
        156,
        10,
        79,
        161,
        71,
        9,
        62,
        77
      ]
    },
    {
      "name": "bankData",
      "discriminator": [
        64,
        212,
        22,
        255,
        173,
        238,
        23,
        113
      ]
    },
    {
      "name": "playerData",
      "discriminator": [
        197,
        65,
        216,
        202,
        43,
        139,
        147,
        128
      ]
    },
    {
      "name": "sessionData",
      "discriminator": [
        93,
        33,
        176,
        4,
        81,
        16,
        19,
        228
      ]
    },
    {
      "name": "sessionToken",
      "discriminator": [
        233,
        4,
        115,
        14,
        46,
        21,
        1,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "notEnoughEnergy",
      "msg": "Not enough energy"
    },
    {
      "code": 6001,
      "name": "wrongAuthority",
      "msg": "Wrong Authority"
    },
    {
      "code": 6002,
      "name": "overflow",
      "msg": "Balance overflow"
    },
    {
      "code": 6003,
      "name": "underflow",
      "msg": "Underflow error occurred during arithmetic operation."
    },
    {
      "code": 6004,
      "name": "withdrawLimitExceeded",
      "msg": "Specified withdraw amount exceeds accounts balance."
    },
    {
      "code": 6005,
      "name": "insufficientRentExemption",
      "msg": "Withdrawal would leave the account non-rent-exempt."
    },
    {
      "code": 6006,
      "name": "playerNotFound",
      "msg": "Player account not found or invalid."
    },
    {
      "code": 6007,
      "name": "depositBelowMinimal",
      "msg": "Deposit is below the minimal bet."
    },
    {
      "code": 6008,
      "name": "depositExceedsMaximal",
      "msg": "Deposit exceeds the maximal bet."
    },
    {
      "code": 6009,
      "name": "insufficientBalance",
      "msg": "Player account has insufficient balance."
    },
    {
      "code": 6010,
      "name": "belowRentExemption",
      "msg": "Player account balance is below the rent exemption threshold."
    },
    {
      "code": 6011,
      "name": "roundAlreadyStarted",
      "msg": "Round is already started."
    },
    {
      "code": 6012,
      "name": "rountNotStarted",
      "msg": "Round has not been started yet."
    },
    {
      "code": 6013,
      "name": "randomnessAlreadyRevealed",
      "msg": "Randomness has expired."
    },
    {
      "code": 6014,
      "name": "randomnessNotResolved",
      "msg": "Randomness is not resolved."
    },
    {
      "code": 6015,
      "name": "unauthorized",
      "msg": "Unauthorized access attempt."
    },
    {
      "code": 6016,
      "name": "betExceedsBalance"
    },
    {
      "code": 6017,
      "name": "betExceedsMaximalGain"
    },
    {
      "code": 6018,
      "name": "balanceBelowMinimalBet"
    },
    {
      "code": 6019,
      "name": "gameStillActive"
    },
    {
      "code": 6020,
      "name": "notEnoughFundsToPlay"
    },
    {
      "code": 6021,
      "name": "randomnessExpired"
    }
  ],
  "types": [
    {
      "name": "adminConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mainAdmin",
            "type": "pubkey"
          },
          {
            "name": "admins",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "bankData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "reserveBalance",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "playerData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "totalWinnings",
            "type": "u64"
          },
          {
            "name": "totalLosses",
            "type": "u64"
          },
          {
            "name": "wins",
            "type": "u64"
          },
          {
            "name": "loses",
            "type": "u64"
          },
          {
            "name": "draws",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "sessionData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "randomnessAccount",
            "type": "pubkey"
          },
          {
            "name": "initialBank",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "bet",
            "type": "u64"
          },
          {
            "name": "commitSlot",
            "type": "u64"
          },
          {
            "name": "overallDeck",
            "type": "bytes"
          },
          {
            "name": "playerHand",
            "type": "bytes"
          },
          {
            "name": "dealerHand",
            "type": "bytes"
          },
          {
            "name": "state",
            "type": "bool"
          },
          {
            "name": "wins",
            "type": "u8"
          },
          {
            "name": "draws",
            "type": "u8"
          },
          {
            "name": "loses",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "sessionToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "targetProgram",
            "type": "pubkey"
          },
          {
            "name": "sessionSigner",
            "type": "pubkey"
          },
          {
            "name": "validUntil",
            "type": "i64"
          }
        ]
      }
    }
  ]
};
