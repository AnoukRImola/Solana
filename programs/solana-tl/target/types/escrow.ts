/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/escrow.json`.
 */
export type Escrow = {
  "address": "8LvnKBjEobkQGsu3SkzCGTwrZaXzMZh1X4Wj5ZGcmqwW",
  "metadata": {
    "name": "escrow",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "approveMultiReleaseMilestone",
      "discriminator": [
        146,
        106,
        72,
        98,
        87,
        177,
        172,
        174
      ],
      "accounts": [
        {
          "name": "approver",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "multiReleaseEscrowData"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u32"
        },
        {
          "name": "approved",
          "type": "bool"
        }
      ]
    },
    {
      "name": "cancelEscrow",
      "discriminator": [
        156,
        203,
        54,
        179,
        38,
        72,
        33,
        21
      ],
      "accounts": [
        {
          "name": "platformSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "changeDisputeFlag",
      "discriminator": [
        146,
        183,
        127,
        129,
        72,
        34,
        38,
        86
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "changeEscrowProperties",
      "discriminator": [
        112,
        69,
        179,
        207,
        70,
        12,
        228,
        63
      ],
      "accounts": [
        {
          "name": "platformSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "newData",
          "type": {
            "defined": {
              "name": "escrowData"
            }
          }
        }
      ]
    },
    {
      "name": "changeMilestoneFlag",
      "discriminator": [
        20,
        66,
        188,
        92,
        137,
        1,
        81,
        167
      ],
      "accounts": [
        {
          "name": "approver",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u32"
        },
        {
          "name": "newFlag",
          "type": "bool"
        }
      ]
    },
    {
      "name": "changeMilestoneStatus",
      "discriminator": [
        26,
        165,
        198,
        111,
        126,
        38,
        15,
        21
      ],
      "accounts": [
        {
          "name": "serviceProvider",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u32"
        },
        {
          "name": "newStatus",
          "type": "string"
        },
        {
          "name": "newEvidence",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "changeMultiReleaseMilestoneStatus",
      "discriminator": [
        157,
        44,
        197,
        111,
        54,
        6,
        101,
        52
      ],
      "accounts": [
        {
          "name": "serviceProvider",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "multiReleaseEscrowData"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u32"
        },
        {
          "name": "newStatus",
          "type": "string"
        },
        {
          "name": "newEvidence",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "closeComplianceRegistry",
      "discriminator": [
        168,
        80,
        61,
        103,
        65,
        103,
        133,
        135
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "disputeMilestone",
      "discriminator": [
        199,
        209,
        70,
        146,
        136,
        43,
        179,
        41
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "multiReleaseEscrowData"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "fundEscrow",
      "discriminator": [
        155,
        18,
        218,
        141,
        182,
        213,
        69,
        201
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "fundMultiReleaseEscrow",
      "discriminator": [
        62,
        51,
        11,
        145,
        238,
        40,
        38,
        140
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "multiReleaseEscrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "userTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "getEscrow",
      "discriminator": [
        237,
        216,
        159,
        100,
        172,
        119,
        114,
        2
      ],
      "accounts": [
        {
          "name": "escrowAccount"
        }
      ],
      "args": [],
      "returns": {
        "defined": {
          "name": "escrowData"
        }
      }
    },
    {
      "name": "initializeComplianceRegistry",
      "discriminator": [
        136,
        178,
        225,
        37,
        135,
        12,
        224,
        122
      ],
      "accounts": [
        {
          "name": "registry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
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
          "name": "travelRuleThreshold",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeEscrow",
      "discriminator": [
        243,
        160,
        77,
        153,
        11,
        92,
        48,
        209
      ],
      "accounts": [
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "new_escrow.engagement_id"
              }
            ]
          }
        },
        {
          "name": "initializer",
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
          "name": "newEscrow",
          "type": {
            "defined": {
              "name": "escrowData"
            }
          }
        }
      ],
      "returns": {
        "defined": {
          "name": "escrowData"
        }
      }
    },
    {
      "name": "initializeMultiReleaseEscrow",
      "discriminator": [
        117,
        180,
        174,
        163,
        14,
        57,
        167,
        71
      ],
      "accounts": [
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "arg",
                "path": "new_escrow.engagement_id"
              }
            ]
          }
        },
        {
          "name": "initializer",
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
          "name": "newEscrow",
          "type": {
            "defined": {
              "name": "multiReleaseEscrowData"
            }
          }
        }
      ]
    },
    {
      "name": "releaseFunds",
      "discriminator": [
        225,
        88,
        91,
        108,
        126,
        52,
        2,
        26
      ],
      "accounts": [
        {
          "name": "releaseSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "trustlessWorkAccount",
          "writable": true
        },
        {
          "name": "platformAccount",
          "writable": true
        },
        {
          "name": "receiverAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "releaseMilestoneFunds",
      "discriminator": [
        44,
        226,
        97,
        240,
        228,
        187,
        163,
        115
      ],
      "accounts": [
        {
          "name": "releaseSigner",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "multiReleaseEscrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "trustlessWorkAccount",
          "writable": true
        },
        {
          "name": "platformAccount",
          "writable": true
        },
        {
          "name": "receiverAccount",
          "docs": [
            "The token account of the milestone's receiver."
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u32"
        }
      ]
    },
    {
      "name": "resolveDispute",
      "discriminator": [
        231,
        6,
        202,
        6,
        96,
        103,
        12,
        230
      ],
      "accounts": [
        {
          "name": "disputeResolver",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "escrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "trustlessWorkAccount",
          "writable": true
        },
        {
          "name": "platformAccount",
          "writable": true
        },
        {
          "name": "approverAccount",
          "writable": true
        },
        {
          "name": "serviceProviderAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "approverFunds",
          "type": "i128"
        },
        {
          "name": "providerFunds",
          "type": "i128"
        }
      ]
    },
    {
      "name": "resolveMilestoneDispute",
      "discriminator": [
        188,
        134,
        87,
        79,
        162,
        164,
        9,
        5
      ],
      "accounts": [
        {
          "name": "disputeResolver",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "multiReleaseEscrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "trustlessWorkAccount",
          "writable": true
        },
        {
          "name": "platformAccount",
          "writable": true
        },
        {
          "name": "approverAccount",
          "docs": [
            "Token account of the approver (client)."
          ],
          "writable": true
        },
        {
          "name": "receiverAccount",
          "docs": [
            "Token account of the milestone's receiver."
          ],
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "milestoneIndex",
          "type": "u32"
        },
        {
          "name": "approverFunds",
          "type": "i128"
        },
        {
          "name": "receiverFunds",
          "type": "i128"
        }
      ]
    },
    {
      "name": "revokeVerification",
      "discriminator": [
        114,
        179,
        245,
        243,
        239,
        182,
        200,
        73
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "verification",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  107,
                  121,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "verification.address",
                "account": "addressVerification"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "setEscrowCompliance",
      "discriminator": [
        253,
        16,
        68,
        228,
        55,
        227,
        128,
        149
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "compliance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "escrowAddress"
              }
            ]
          }
        },
        {
          "name": "escrowAddress"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "requiresKyc",
          "type": "bool"
        }
      ]
    },
    {
      "name": "setTravelRuleData",
      "discriminator": [
        209,
        254,
        37,
        28,
        27,
        69,
        234,
        44
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "compliance",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  115,
                  99,
                  114,
                  111,
                  119,
                  95,
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "compliance.escrow_address",
                "account": "escrowCompliance"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "travelRule",
          "type": {
            "defined": {
              "name": "travelRuleData"
            }
          }
        }
      ]
    },
    {
      "name": "verifyAddress",
      "discriminator": [
        188,
        133,
        26,
        87,
        164,
        67,
        33,
        84
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "registry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  109,
                  112,
                  108,
                  105,
                  97,
                  110,
                  99,
                  101,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "verification",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  107,
                  121,
                  99
                ]
              },
              {
                "kind": "account",
                "path": "address"
              }
            ]
          }
        },
        {
          "name": "address"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "kycProvider",
          "type": "string"
        },
        {
          "name": "jurisdiction",
          "type": "string"
        },
        {
          "name": "riskScore",
          "type": "u8"
        }
      ]
    },
    {
      "name": "withdrawRemainingFunds",
      "discriminator": [
        37,
        75,
        244,
        129,
        60,
        98,
        134,
        150
      ],
      "accounts": [
        {
          "name": "approver",
          "writable": true,
          "signer": true
        },
        {
          "name": "escrowAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  117,
                  108,
                  116,
                  105,
                  95,
                  101,
                  115,
                  99,
                  114,
                  111,
                  119
                ]
              },
              {
                "kind": "account",
                "path": "escrow_account.engagement_id",
                "account": "multiReleaseEscrowData"
              }
            ]
          }
        },
        {
          "name": "escrowTokenAccount",
          "writable": true
        },
        {
          "name": "approverTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "addressVerification",
      "discriminator": [
        112,
        160,
        159,
        201,
        217,
        9,
        25,
        2
      ]
    },
    {
      "name": "complianceRegistry",
      "discriminator": [
        182,
        114,
        30,
        100,
        142,
        177,
        248,
        255
      ]
    },
    {
      "name": "escrowCompliance",
      "discriminator": [
        114,
        206,
        68,
        243,
        77,
        187,
        83,
        103
      ]
    },
    {
      "name": "escrowData",
      "discriminator": [
        249,
        142,
        239,
        239,
        106,
        183,
        96,
        92
      ]
    },
    {
      "name": "multiReleaseEscrowData",
      "discriminator": [
        1,
        175,
        227,
        25,
        108,
        95,
        225,
        228
      ]
    }
  ],
  "events": [
    {
      "name": "addressKycRevoked",
      "discriminator": [
        29,
        8,
        89,
        5,
        1,
        107,
        68,
        186
      ]
    },
    {
      "name": "addressKycVerified",
      "discriminator": [
        151,
        150,
        153,
        77,
        191,
        161,
        96,
        241
      ]
    },
    {
      "name": "complianceRegistryInitialized",
      "discriminator": [
        20,
        225,
        22,
        182,
        91,
        233,
        127,
        83
      ]
    },
    {
      "name": "disputeResolved",
      "discriminator": [
        121,
        64,
        249,
        153,
        139,
        128,
        236,
        187
      ]
    },
    {
      "name": "disputeStarted",
      "discriminator": [
        202,
        190,
        253,
        235,
        49,
        138,
        134,
        93
      ]
    },
    {
      "name": "escrowCancelled",
      "discriminator": [
        98,
        241,
        195,
        122,
        213,
        0,
        162,
        161
      ]
    },
    {
      "name": "escrowComplianceSet",
      "discriminator": [
        53,
        98,
        253,
        197,
        172,
        63,
        2,
        118
      ]
    },
    {
      "name": "escrowFunded",
      "discriminator": [
        228,
        243,
        166,
        74,
        22,
        167,
        157,
        244
      ]
    },
    {
      "name": "escrowInitialized",
      "discriminator": [
        222,
        186,
        157,
        47,
        145,
        142,
        176,
        248
      ]
    },
    {
      "name": "escrowPropertiesChanged",
      "discriminator": [
        106,
        197,
        63,
        124,
        251,
        67,
        149,
        242
      ]
    },
    {
      "name": "fundsReleased",
      "discriminator": [
        178,
        119,
        252,
        230,
        131,
        104,
        210,
        210
      ]
    },
    {
      "name": "milestoneApproved",
      "discriminator": [
        40,
        109,
        159,
        144,
        169,
        230,
        35,
        229
      ]
    },
    {
      "name": "milestoneDisputeResolved",
      "discriminator": [
        49,
        192,
        233,
        87,
        228,
        33,
        175,
        28
      ]
    },
    {
      "name": "milestoneDisputed",
      "discriminator": [
        83,
        106,
        229,
        228,
        159,
        61,
        122,
        16
      ]
    },
    {
      "name": "milestoneFundsReleased",
      "discriminator": [
        222,
        23,
        250,
        143,
        182,
        152,
        202,
        77
      ]
    },
    {
      "name": "milestoneUpdated",
      "discriminator": [
        205,
        184,
        110,
        116,
        2,
        231,
        73,
        147
      ]
    },
    {
      "name": "multiReleaseEscrowFunded",
      "discriminator": [
        82,
        219,
        147,
        59,
        232,
        103,
        198,
        4
      ]
    },
    {
      "name": "multiReleaseEscrowInitialized",
      "discriminator": [
        50,
        131,
        82,
        50,
        114,
        232,
        112,
        217
      ]
    },
    {
      "name": "remainingFundsWithdrawn",
      "discriminator": [
        145,
        236,
        78,
        154,
        231,
        161,
        151,
        136
      ]
    },
    {
      "name": "travelRuleDataSet",
      "discriminator": [
        132,
        236,
        197,
        79,
        61,
        156,
        165,
        183
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "escrowNotFunded",
      "msg": "Escrow not funded"
    },
    {
      "code": 6001,
      "name": "deserializationFailed",
      "msg": "Failed to deserialize escrow data."
    },
    {
      "code": 6002,
      "name": "amountCannotBeZero",
      "msg": "Amount cannot be zero"
    },
    {
      "code": 6003,
      "name": "escrowAlreadyInitialized",
      "msg": "Escrow already initialized"
    },
    {
      "code": 6004,
      "name": "onlySignerCanFundEscrow",
      "msg": "Only the signer can fund the escrow"
    },
    {
      "code": 6005,
      "name": "escrowAlreadyFunded",
      "msg": "Escrow already funded"
    },
    {
      "code": 6006,
      "name": "escrowFullyFunded",
      "msg": "Escrow already fully funded"
    },
    {
      "code": 6007,
      "name": "signerInsufficientFunds",
      "msg": "Signer has insufficient funds"
    },
    {
      "code": 6008,
      "name": "notEnoughAllowance",
      "msg": "Not enough allowance to fund this escrow"
    },
    {
      "code": 6009,
      "name": "escrowAlreadyCompleted",
      "msg": "Escrow already completed"
    },
    {
      "code": 6010,
      "name": "signerInsufficientFundsToComplete",
      "msg": "Signer has insufficient funds to complete escrow"
    },
    {
      "code": 6011,
      "name": "onlySignerCanRequestRefund",
      "msg": "Only the signer can request a refund"
    },
    {
      "code": 6012,
      "name": "noFundsToRefund",
      "msg": "No funds available to refund"
    },
    {
      "code": 6013,
      "name": "contractHasInsufficientBalance",
      "msg": "Contract has no balance to repay"
    },
    {
      "code": 6014,
      "name": "escrowNotFound",
      "msg": "Escrow not found"
    },
    {
      "code": 6015,
      "name": "onlyReleaseSignerCanDistributeEarnings",
      "msg": "Only the release signer can distribute earnings"
    },
    {
      "code": 6016,
      "name": "escrowNotCompleted",
      "msg": "Escrow not completed"
    },
    {
      "code": 6017,
      "name": "escrowBalanceNotEnoughToSendEarnings",
      "msg": "Escrow balance insufficient for distribution"
    },
    {
      "code": 6018,
      "name": "contractInsufficientFunds",
      "msg": "Contract has insufficient funds"
    },
    {
      "code": 6019,
      "name": "onlyPlatformAddressExecuteThisFunction",
      "msg": "Only platform address may execute this function"
    },
    {
      "code": 6020,
      "name": "escrowNotInitialized",
      "msg": "Escrow not initialized"
    },
    {
      "code": 6021,
      "name": "onlyServiceProviderChangeMilstoneStatus",
      "msg": "Only the service provider can change milestone status"
    },
    {
      "code": 6022,
      "name": "noMileStoneDefined",
      "msg": "No milestones defined"
    },
    {
      "code": 6023,
      "name": "invalidMileStoneIndex",
      "msg": "Invalid milestone index"
    },
    {
      "code": 6024,
      "name": "onlyApproverChangeMilstoneFlag",
      "msg": "Only the approver can change milestone flag"
    },
    {
      "code": 6025,
      "name": "onlyDisputeResolverCanExecuteThisFunction",
      "msg": "Only the dispute resolver can execute this function"
    },
    {
      "code": 6026,
      "name": "escrowAlreadyInDispute",
      "msg": "Escrow already in dispute"
    },
    {
      "code": 6027,
      "name": "escrowNotInDispute",
      "msg": "Escrow not in dispute"
    },
    {
      "code": 6028,
      "name": "insufficientFundsForResolution",
      "msg": "Insufficient funds for resolution"
    },
    {
      "code": 6029,
      "name": "invalidState",
      "msg": "Invalid state"
    },
    {
      "code": 6030,
      "name": "escrowOpenedForDisputeResolution",
      "msg": "Escrow opened for dispute resolution"
    },
    {
      "code": 6031,
      "name": "amountToDepositGreatherThanEscrowAmount",
      "msg": "Amount to deposit is greater than escrow amount"
    },
    {
      "code": 6032,
      "name": "overflow",
      "msg": "Operation may cause overflow"
    },
    {
      "code": 6033,
      "name": "underflow",
      "msg": "Operation may cause underflow"
    },
    {
      "code": 6034,
      "name": "divisionError",
      "msg": "Operation may cause division error"
    },
    {
      "code": 6035,
      "name": "adminNotFound",
      "msg": "Admin not found"
    },
    {
      "code": 6036,
      "name": "insufficientApproverFundsForCommissions",
      "msg": "Insufficient approver funds for commissions"
    },
    {
      "code": 6037,
      "name": "insufficientServiceProviderFundsForCommissions",
      "msg": "Insufficient service provider funds for commissions"
    },
    {
      "code": 6038,
      "name": "milestoneApprovedCantChangeEscrowProperties",
      "msg": "Milestone approved, can't change escrow properties"
    },
    {
      "code": 6039,
      "name": "escrowHasFunds",
      "msg": "Escrow has funds"
    },
    {
      "code": 6040,
      "name": "escrowAlreadyResolved",
      "msg": "Escrow already resolved"
    },
    {
      "code": 6041,
      "name": "tooManyEscrowsRequested",
      "msg": "Too many escrows requested"
    },
    {
      "code": 6042,
      "name": "unauthorizedToChangeDisputeFlag",
      "msg": "Unauthorized to change dispute flag"
    },
    {
      "code": 6043,
      "name": "argumentConversionFailed",
      "msg": "Argument conversion failed"
    },
    {
      "code": 6044,
      "name": "tooManyMilestones",
      "msg": "Too many milestones in escrow"
    },
    {
      "code": 6045,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6046,
      "name": "platformFeeTooHigh",
      "msg": "Platform fee exceeds maximum (99%)"
    },
    {
      "code": 6047,
      "name": "milestoneAlreadyReleased",
      "msg": "Milestone already released"
    },
    {
      "code": 6048,
      "name": "milestoneNotApproved",
      "msg": "Milestone not approved"
    },
    {
      "code": 6049,
      "name": "milestoneIsDisputed",
      "msg": "Milestone is disputed"
    },
    {
      "code": 6050,
      "name": "milestoneAlreadyDisputed",
      "msg": "Milestone already disputed"
    },
    {
      "code": 6051,
      "name": "milestoneNotDisputed",
      "msg": "Milestone not disputed"
    },
    {
      "code": 6052,
      "name": "milestoneAlreadyResolved",
      "msg": "Milestone already resolved"
    },
    {
      "code": 6053,
      "name": "notAllMilestonesSettled",
      "msg": "Not all milestones are settled"
    },
    {
      "code": 6054,
      "name": "noRemainingFunds",
      "msg": "No remaining funds to withdraw"
    },
    {
      "code": 6055,
      "name": "milestoneAmountCannotBeZero",
      "msg": "Milestone amount cannot be zero"
    },
    {
      "code": 6056,
      "name": "addressNotKycVerified",
      "msg": "Address is not KYC verified"
    },
    {
      "code": 6057,
      "name": "addressAlreadyVerified",
      "msg": "Address already verified"
    },
    {
      "code": 6058,
      "name": "addressNotVerified",
      "msg": "Address not verified"
    },
    {
      "code": 6059,
      "name": "travelRuleRequired",
      "msg": "Travel rule data required for this amount"
    },
    {
      "code": 6060,
      "name": "complianceRegistryAlreadyInitialized",
      "msg": "Compliance registry already initialized"
    },
    {
      "code": 6061,
      "name": "onlyComplianceAuthority",
      "msg": "Only compliance authority can perform this action"
    },
    {
      "code": 6062,
      "name": "escrowComplianceAlreadySet",
      "msg": "Escrow compliance already set"
    },
    {
      "code": 6063,
      "name": "sanctionedJurisdiction",
      "msg": "Sanctioned jurisdiction"
    },
    {
      "code": 6064,
      "name": "cannotCancelFundedEscrow",
      "msg": "Cannot cancel escrow with existing balance"
    },
    {
      "code": 6065,
      "name": "cannotCancelWithApprovedMilestones",
      "msg": "Cannot cancel escrow with approved milestones"
    },
    {
      "code": 6066,
      "name": "cannotCancelReleasedEscrow",
      "msg": "Cannot cancel already released escrow"
    }
  ],
  "types": [
    {
      "name": "addressKycRevoked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "addressKycVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "kycProvider",
            "type": "string"
          },
          {
            "name": "jurisdiction",
            "type": "string"
          },
          {
            "name": "riskScore",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "addressVerification",
      "docs": [
        "Per-address KYC verification record."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "kycVerified",
            "type": "bool"
          },
          {
            "name": "kycProvider",
            "type": "string"
          },
          {
            "name": "kycTimestamp",
            "type": "i64"
          },
          {
            "name": "riskScore",
            "type": "u8"
          },
          {
            "name": "jurisdiction",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "complianceRegistry",
      "docs": [
        "Global compliance registry — singleton PDA managed by an admin authority."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "travelRuleThreshold",
            "type": "u64"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "complianceRegistryInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "travelRuleThreshold",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "disputeResolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "resolver",
            "type": "pubkey"
          },
          {
            "name": "approverFunds",
            "type": "i128"
          },
          {
            "name": "providerFunds",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "disputeStarted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "initiator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "escrowCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "cancelledBy",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "escrowCompliance",
      "docs": [
        "Per-escrow compliance data — stored in a separate PDA linked to the escrow."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowAddress",
            "type": "pubkey"
          },
          {
            "name": "requiresKyc",
            "type": "bool"
          },
          {
            "name": "travelRule",
            "type": {
              "option": {
                "defined": {
                  "name": "travelRuleData"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "escrowComplianceSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowAddress",
            "type": "pubkey"
          },
          {
            "name": "requiresKyc",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "escrowData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "engagementId",
            "type": "string"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "i128"
          },
          {
            "name": "platformFee",
            "type": "i128"
          },
          {
            "name": "milestones",
            "type": {
              "vec": {
                "defined": {
                  "name": "milestone"
                }
              }
            }
          },
          {
            "name": "flags",
            "type": {
              "defined": {
                "name": "flags"
              }
            }
          },
          {
            "name": "trustline",
            "type": {
              "defined": {
                "name": "trustline"
              }
            }
          },
          {
            "name": "receiverMemo",
            "type": "i128"
          },
          {
            "name": "roles",
            "type": {
              "defined": {
                "name": "roles"
              }
            }
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "escrowFunded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "funder",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "escrowInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "initializer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "escrowPropertiesChanged",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "platformAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "flags",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "dispute",
            "type": "bool"
          },
          {
            "name": "release",
            "type": "bool"
          },
          {
            "name": "resolved",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "fundsReleased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "releaseSigner",
            "type": "pubkey"
          },
          {
            "name": "receiverAmount",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "milestone",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "evidence",
            "type": "string"
          },
          {
            "name": "approvedFlag",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "milestoneApproved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "milestoneIndex",
            "type": "u32"
          },
          {
            "name": "approved",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "milestoneDisputeResolved",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "milestoneIndex",
            "type": "u32"
          },
          {
            "name": "resolver",
            "type": "pubkey"
          },
          {
            "name": "approverFunds",
            "type": "i128"
          },
          {
            "name": "receiverFunds",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "milestoneDisputed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "milestoneIndex",
            "type": "u32"
          },
          {
            "name": "initiator",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "milestoneFlags",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approved",
            "type": "bool"
          },
          {
            "name": "disputed",
            "type": "bool"
          },
          {
            "name": "released",
            "type": "bool"
          },
          {
            "name": "resolved",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "milestoneFundsReleased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "milestoneIndex",
            "type": "u32"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "receiverAmount",
            "type": "i128"
          }
        ]
      }
    },
    {
      "name": "milestoneUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "milestoneIndex",
            "type": "u32"
          },
          {
            "name": "newStatus",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "multiReleaseEscrowData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "engagementId",
            "type": "string"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "platformFee",
            "type": "i128"
          },
          {
            "name": "milestones",
            "type": {
              "vec": {
                "defined": {
                  "name": "multiReleaseMilestone"
                }
              }
            }
          },
          {
            "name": "trustline",
            "type": {
              "defined": {
                "name": "trustline"
              }
            }
          },
          {
            "name": "roles",
            "type": {
              "defined": {
                "name": "multiReleaseRoles"
              }
            }
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "multiReleaseEscrowFunded",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "funder",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "multiReleaseEscrowInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "initializer",
            "type": "pubkey"
          },
          {
            "name": "milestonesCount",
            "type": "u32"
          }
        ]
      }
    },
    {
      "name": "multiReleaseMilestone",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "status",
            "type": "string"
          },
          {
            "name": "evidence",
            "type": "string"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "flags",
            "type": {
              "defined": {
                "name": "milestoneFlags"
              }
            }
          }
        ]
      }
    },
    {
      "name": "multiReleaseRoles",
      "docs": [
        "Roles for multi-release escrow — no global receiver since each milestone has its own."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approver",
            "type": "pubkey"
          },
          {
            "name": "serviceProvider",
            "type": "pubkey"
          },
          {
            "name": "platformAddress",
            "type": "pubkey"
          },
          {
            "name": "releaseSigner",
            "type": "pubkey"
          },
          {
            "name": "disputeResolver",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "remainingFundsWithdrawn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowId",
            "type": "string"
          },
          {
            "name": "approver",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "roles",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "approver",
            "type": "pubkey"
          },
          {
            "name": "serviceProvider",
            "type": "pubkey"
          },
          {
            "name": "platformAddress",
            "type": "pubkey"
          },
          {
            "name": "releaseSigner",
            "type": "pubkey"
          },
          {
            "name": "disputeResolver",
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "travelRuleData",
      "docs": [
        "Travel Rule data attached to an escrow."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "originatorName",
            "type": "string"
          },
          {
            "name": "originatorAccount",
            "type": "string"
          },
          {
            "name": "originatorJurisdiction",
            "type": "string"
          },
          {
            "name": "beneficiaryName",
            "type": "string"
          },
          {
            "name": "beneficiaryAccount",
            "type": "string"
          },
          {
            "name": "beneficiaryJurisdiction",
            "type": "string"
          },
          {
            "name": "transferPurpose",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "travelRuleDataSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "escrowAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "trustline",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "decimals",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
