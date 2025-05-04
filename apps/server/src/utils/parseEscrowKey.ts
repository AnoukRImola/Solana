import * as StellarSDK from '@stellar/stellar-sdk'
import { Milestone } from 'src/interfaces/milestone.interface'
import { microUSDToDecimal } from './parse.utils'

function parseI128(val: any): number {
	const { hi, lo } = val._value._attributes
	const highPart = BigInt(hi.toString())
	const lowPart = BigInt(lo.toString())
	return Number((highPart << BigInt(64)) | lowPart)
}

function parseString(val: any): string {
	return val._value.toString('utf8')
}

export function handleKey(
	key: string,
	val: any,
	parsed: Record<string, any>,
	trustline_decimals: number,
) {
	switch (key) {
		case 'amount':
			if (val._arm === 'i128') {
				parsed[key] = microUSDToDecimal(parseI128(val), trustline_decimals)
			}
			break
		case 'platform_fee':
		case 'receiver_memo':
		case 'trustline_decimals':
			if (val._arm === 'i128') {
				parsed[key] = parseI128(val)
			}
			break
		case 'approver':
		case 'receiver':
		case 'service_provider':
		case 'platform_address':
		case 'release_signer':
		case 'dispute_resolver':
		case 'trustline':
			if (val._arm === 'address') {
				parsed[key] = StellarSDK.Address.fromScVal(val).toString()
			}
			break
		case 'engagement_id':
		case 'title':
		case 'description':
			if (val._arm === 'str') {
				parsed[key] = parseString(val)
			}
			break
		case 'dispute_flag':
		case 'resolved_flag':
		case 'release_flag':
			if (val._arm === 'b') {
				parsed[key] = val._value
			}
			break
		case 'milestones':
			if (val._arm === 'vec' && Array.isArray(val._value)) {
				parsed.milestones = val._value.map((milestone: any) => {
					const milestoneEntries = milestone._value
					const milestoneParsed: Partial<Milestone> = {}

					milestoneEntries.forEach((entry: any) => {
						const milestoneKey = entry._attributes.key._value.toString('utf8')
						const milestoneVal = entry._attributes.val

						if (milestoneKey === 'description' && milestoneVal._arm === 'str') {
							milestoneParsed.description = parseString(milestoneVal)
						} else if (
							milestoneKey === 'status' &&
							milestoneVal._arm === 'str'
						) {
							milestoneParsed.status = parseString(milestoneVal)
						} else if (
							milestoneKey === 'approved_flag' &&
							milestoneVal._arm === 'b'
						) {
							milestoneParsed.approved_flag = milestoneVal._value
						} else if (
							milestoneKey === 'evidence' &&
							milestoneVal._arm === 'str'
						) {
							milestoneParsed.evidence = parseString(milestoneVal) ?? ''
						}
					})

					return milestoneParsed as Milestone
				})
			}
			break
		default:
			console.warn(`🔹 Unexpected key: ${key}`)
	}
}
