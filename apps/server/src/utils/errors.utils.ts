export function mapErrorCodeToMessage(code: string): string {
	switch (code) {
		case '1':
			return 'Escrow not funded'
		case '2':
			return 'Amount cannot be zero'
		case '3':
			return 'Escrow already initialized'
		case '4':
			return 'Only the signer can fund the escrow'
		case '5':
			return 'Escrow already funded'
		case '6':
			return 'This escrow is already fully funded'
		case '7':
			return 'The signer does not have sufficient funds'
		case '8':
			return 'Not enough allowance to fund this escrow'
		case '9':
			return 'Escrow already completed'
		case '10':
			return 'The signer does not have sufficient funds to complete this escrow'
		case '11':
			return 'Only the signer can request a refund'
		case '12':
			return 'No funds available to refund'
		case '13':
			return 'The contract has no balance to repay'
		case '14':
			return 'Escrow not found'
		case '15':
			return 'Only the release signer can distribute the escrow earnings'
		case '16':
			return 'The escrow must be completed to distribute earnings'
		case '17':
			return 'The escrow balance must be equal to the amount of earnings defined for the escrow'
		case '18':
			return 'The contract does not have sufficient funds'
		case '19':
			return 'Only the platform address should be able to execute this function'
		case '20':
			return 'Escrow not initialized'
		case '21':
			return 'Only the service provider can change milestone status'
		case '22':
			return 'Escrow initialized without milestone'
		case '23':
			return 'Invalid milestone index'
		case '24':
			return 'Only the approver can change milestone flag'
		case '25':
			return 'Only the dispute resolver can execute this function'
		case '26':
			return 'Escrow already in dispute'
		case '27':
			return 'Escrow not in dispute'
		case '28':
			return 'Insufficient funds for resolution'
		case '29':
			return 'Invalid state'
		case '30':
			return 'Escrow has been opened for dispute resolution'
		case '31':
			return 'Amount to deposit is greater than the escrow amount'
		case '32':
			return 'This operation can cause an Overflow'
		case '33':
			return 'This operation can cause an Underflow'
		case '34':
			return 'This operation can cause Division error'
		case '35':
			return 'Admin not found!'
		case '36':
			return 'Insufficient approver funds for commissions'
		case '37':
			return 'Insufficient Service Provider funds for commissions'
		case '38':
			return "You can't change the escrow properties after the milestone is approved"
		case '39':
			return 'Escrow has funds'
		default:
			return 'Unknown error occurred in the contract'
	}
}
