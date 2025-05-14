/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/token.json`.
 */
export type Token = {
	address: '6En2g3XUQgZSBEgBE1DF1sVeRik4KNvug151Zswz8oR5'
	metadata: {
		name: 'token'
		version: '0.1.0'
		spec: '0.1.0'
		description: 'Created with Anchor'
	}
	instructions: [
		{
			name: 'buy'
			discriminator: [102, 6, 61, 18, 1, 218, 235, 234]
			accounts: [
				{
					name: 'user'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
				{
					name: 'userState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'account'
								path: 'user'
							},
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 117, 115, 101, 114]
							},
						]
					}
				},
				{
					name: 'vault'
					writable: true
				},
				{
					name: 'priceFeed'
					address: 'H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG'
				},
				{
					name: 'systemProgram'
					address: '11111111111111111111111111111111'
				},
			]
			args: [
				{
					name: 'solAmount'
					type: 'u64'
				},
			]
		},
		{
			name: 'buyWithStableCoin'
			discriminator: [167, 27, 130, 27, 114, 4, 110, 63]
			accounts: [
				{
					name: 'user'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
				{
					name: 'userState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'account'
								path: 'user'
							},
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 117, 115, 101, 114]
							},
						]
					}
				},
				{
					name: 'vault'
				},
				{
					name: 'stableCoinUser'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'account'
								path: 'user'
							},
							{
								kind: 'const'
								value: [
									6,
									221,
									246,
									225,
									215,
									101,
									161,
									147,
									217,
									203,
									225,
									70,
									206,
									235,
									121,
									172,
									28,
									180,
									133,
									237,
									95,
									91,
									55,
									145,
									58,
									140,
									245,
									133,
									126,
									255,
									0,
									169,
								]
							},
							{
								kind: 'account'
								path: 'stableCoin'
							},
						]
						program: {
							kind: 'const'
							value: [
								140,
								151,
								37,
								143,
								78,
								36,
								137,
								241,
								187,
								61,
								16,
								41,
								20,
								142,
								13,
								131,
								11,
								90,
								19,
								153,
								218,
								255,
								16,
								132,
								4,
								142,
								123,
								216,
								219,
								233,
								248,
								89,
							]
						}
					}
				},
				{
					name: 'stableCoinVault'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'account'
								path: 'vault'
							},
							{
								kind: 'const'
								value: [
									6,
									221,
									246,
									225,
									215,
									101,
									161,
									147,
									217,
									203,
									225,
									70,
									206,
									235,
									121,
									172,
									28,
									180,
									133,
									237,
									95,
									91,
									55,
									145,
									58,
									140,
									245,
									133,
									126,
									255,
									0,
									169,
								]
							},
							{
								kind: 'account'
								path: 'stableCoin'
							},
						]
						program: {
							kind: 'const'
							value: [
								140,
								151,
								37,
								143,
								78,
								36,
								137,
								241,
								187,
								61,
								16,
								41,
								20,
								142,
								13,
								131,
								11,
								90,
								19,
								153,
								218,
								255,
								16,
								132,
								4,
								142,
								123,
								216,
								219,
								233,
								248,
								89,
							]
						}
					}
				},
				{
					name: 'stableCoin'
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				},
				{
					name: 'associatedTokenProgram'
					address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
				},
			]
			args: [
				{
					name: 'stableTokenAmount'
					type: 'u64'
				},
			]
		},
		{
			name: 'changeAdmin'
			discriminator: [193, 151, 203, 161, 200, 202, 32, 146]
			accounts: [
				{
					name: 'admin'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
			]
			args: [
				{
					name: 'newAdmin'
					type: 'pubkey'
				},
			]
		},
		{
			name: 'initUser'
			discriminator: [14, 51, 68, 159, 237, 78, 158, 102]
			accounts: [
				{
					name: 'user'
					writable: true
					signer: true
				},
				{
					name: 'userState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'account'
								path: 'user'
							},
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 117, 115, 101, 114]
							},
						]
					}
				},
				{
					name: 'systemProgram'
					address: '11111111111111111111111111111111'
				},
			]
			args: []
		},
		{
			name: 'initialize'
			discriminator: [175, 175, 109, 31, 13, 152, 155, 237]
			accounts: [
				{
					name: 'admin'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
				{
					name: 'systemProgram'
					address: '11111111111111111111111111111111'
				},
			]
			args: []
		},
		{
			name: 'setLive'
			discriminator: [103, 63, 233, 59, 197, 174, 47, 171]
			accounts: [
				{
					name: 'admin'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
			]
			args: [
				{
					name: 'live'
					type: 'bool'
				},
			]
		},
		{
			name: 'setStage'
			discriminator: [139, 146, 4, 101, 177, 94, 37, 233]
			accounts: [
				{
					name: 'admin'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
			]
			args: [
				{
					name: 'stage'
					type: 'u8'
				},
			]
		},
		{
			name: 'setVaultAddress'
			discriminator: [119, 133, 83, 81, 63, 5, 233, 141]
			accounts: [
				{
					name: 'admin'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
				{
					name: 'vault'
				},
				{
					name: 'usdcVault'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'account'
								path: 'vault'
							},
							{
								kind: 'const'
								value: [
									6,
									221,
									246,
									225,
									215,
									101,
									161,
									147,
									217,
									203,
									225,
									70,
									206,
									235,
									121,
									172,
									28,
									180,
									133,
									237,
									95,
									91,
									55,
									145,
									58,
									140,
									245,
									133,
									126,
									255,
									0,
									169,
								]
							},
							{
								kind: 'account'
								path: 'usdcMint'
							},
						]
						program: {
							kind: 'const'
							value: [
								140,
								151,
								37,
								143,
								78,
								36,
								137,
								241,
								187,
								61,
								16,
								41,
								20,
								142,
								13,
								131,
								11,
								90,
								19,
								153,
								218,
								255,
								16,
								132,
								4,
								142,
								123,
								216,
								219,
								233,
								248,
								89,
							]
						}
					}
				},
				{
					name: 'usdcMint'
					address: 'usdRLypwfSeEUw4DhUcscCcju6zzBviXymFBRjcBXTw'
				},
				{
					name: 'usdtVault'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'account'
								path: 'vault'
							},
							{
								kind: 'const'
								value: [
									6,
									221,
									246,
									225,
									215,
									101,
									161,
									147,
									217,
									203,
									225,
									70,
									206,
									235,
									121,
									172,
									28,
									180,
									133,
									237,
									95,
									91,
									55,
									145,
									58,
									140,
									245,
									133,
									126,
									255,
									0,
									169,
								]
							},
							{
								kind: 'account'
								path: 'usdtMint'
							},
						]
						program: {
							kind: 'const'
							value: [
								140,
								151,
								37,
								143,
								78,
								36,
								137,
								241,
								187,
								61,
								16,
								41,
								20,
								142,
								13,
								131,
								11,
								90,
								19,
								153,
								218,
								255,
								16,
								132,
								4,
								142,
								123,
								216,
								219,
								233,
								248,
								89,
							]
						}
					}
				},
				{
					name: 'usdtMint'
					address: 'usderEuWoVkjMcc3bEYkGopx78La8mHzt6YGdmErrpz'
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				},
				{
					name: 'associatedTokenProgram'
					address: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
				},
				{
					name: 'systemProgram'
					address: '11111111111111111111111111111111'
				},
			]
			args: []
		},
		{
			name: 'startToken'
			discriminator: [253, 172, 159, 168, 69, 117, 168, 65]
			accounts: [
				{
					name: 'admin'
					writable: true
					signer: true
				},
				{
					name: 'globalState'
					writable: true
					pda: {
						seeds: [
							{
								kind: 'const'
								value: [116, 111, 107, 101, 110, 45, 103, 108, 111, 98, 97, 108]
							},
						]
					}
				},
			]
			args: []
		},
	]
	accounts: [
		{
			name: 'globalState'
			discriminator: [163, 46, 74, 168, 216, 123, 133, 98]
		},
		{
			name: 'userState'
			discriminator: [72, 177, 85, 249, 76, 167, 186, 126]
		},
	]
	errors: [
		{
			code: 6000
			name: 'invalidAdmin'
			msg: 'Admin address dismatch'
		},
		{
			code: 6001
			name: 'invalidToken'
			msg: 'Token address dismatch'
		},
		{
			code: 6002
			name: 'notEnoughTo'
			msg: 'Token amount is not enough for all stages'
		},
		{
			code: 6003
			name: 'tokenNumberInvalid'
			msg: 'Token number is not correct'
		},
		{
			code: 6004
			name: 'tokenNotStarted'
			msg: 'Token is not started'
		},
		{
			code: 6005
			name: 'tokenEnded'
			msg: 'Token is ended'
		},
		{
			code: 6006
			name: 'tokenPaused'
			msg: 'Token is paused'
		},
		{
			code: 6007
			name: 'invalidPriceFeed'
			msg: 'Pyth feed address is not right'
		},
		{
			code: 6008
			name: 'invalidStableToken'
			msg: 'Stable token address is not right'
		},
	]
	types: [
		{
			name: 'globalState'
			docs: ['* Stores global state of the program']
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'admin'
						type: 'pubkey'
					},
					{
						name: 'vault'
						type: 'pubkey'
					},
					{
						name: 'tokenSold'
						type: 'u64'
					},
					{
						name: 'tokenSoldUsd'
						type: 'u64'
					},
					{
						name: 'isLive'
						type: 'bool'
					},
					{
						name: 'stageIterator'
						type: 'u8'
					},
					{
						name: 'remainTokens'
						type: {
							array: ['u64', 10]
						}
					},
				]
			}
		},
		{
			name: 'userState'
			docs: ['* Stores user info']
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'user'
						type: 'pubkey'
					},
					{
						name: 'tokens'
						type: 'u64'
					},
					{
						name: 'paidSol'
						type: 'u64'
					},
					{
						name: 'paidUsd'
						type: 'u64'
					},
				]
			}
		},
	]
}
