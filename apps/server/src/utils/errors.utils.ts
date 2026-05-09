/**
 * Maps Anchor program error codes (6000+) to human-readable messages.
 * Error codes match the Escrow program's errors.rs definitions.
 */
export function mapErrorCodeToMessage(code: number | string): string {
  const errorCode = typeof code === 'string' ? Number(code) : code;

  switch (errorCode) {
    case 6000:
      return 'Escrow not funded';
    case 6001:
      return 'Failed to deserialize escrow data';
    case 6002:
      return 'Amount cannot be zero';
    case 6003:
      return 'Escrow already initialized';
    case 6004:
      return 'Only the signer can fund the escrow';
    case 6005:
      return 'Escrow already funded';
    case 6006:
      return 'Escrow already fully funded';
    case 6007:
      return 'Signer has insufficient funds';
    case 6008:
      return 'Not enough allowance to fund this escrow';
    case 6009:
      return 'Escrow already completed';
    case 6010:
      return 'Signer has insufficient funds to complete escrow';
    case 6011:
      return 'Only the signer can request a refund';
    case 6012:
      return 'No funds available to refund';
    case 6013:
      return 'Contract has no balance to repay';
    case 6014:
      return 'Escrow not found';
    case 6015:
      return 'Only the release signer can distribute earnings';
    case 6016:
      return 'Escrow not completed';
    case 6017:
      return 'Escrow balance insufficient for distribution';
    case 6018:
      return 'Contract has insufficient funds';
    case 6019:
      return 'Only platform address may execute this function';
    case 6020:
      return 'Escrow not initialized';
    case 6021:
      return 'Only the service provider can change milestone status';
    case 6022:
      return 'No milestones defined';
    case 6023:
      return 'Invalid milestone index';
    case 6024:
      return 'Only the approver can change milestone flag';
    case 6025:
      return 'Only the dispute resolver can execute this function';
    case 6026:
      return 'Escrow already in dispute';
    case 6027:
      return 'Escrow not in dispute';
    case 6028:
      return 'Insufficient funds for resolution';
    case 6029:
      return 'Invalid state';
    case 6030:
      return 'Escrow opened for dispute resolution';
    case 6031:
      return 'Amount to deposit is greater than escrow amount';
    case 6032:
      return 'Operation may cause overflow';
    case 6033:
      return 'Operation may cause underflow';
    case 6034:
      return 'Operation may cause division error';
    case 6035:
      return 'Admin not found';
    case 6036:
      return 'Insufficient approver funds for commissions';
    case 6037:
      return 'Insufficient service provider funds for commissions';
    case 6038:
      return "Milestone approved, can't change escrow properties";
    case 6039:
      return 'Escrow has funds';
    case 6040:
      return 'Escrow already resolved';
    case 6041:
      return 'Too many escrows requested';
    case 6042:
      return 'Unauthorized to change dispute flag';
    case 6043:
      return 'Argument conversion failed';
    case 6044:
      return 'Too many milestones in escrow';
    case 6045:
      return 'Allowance has expired';
    case 6046:
      return 'Insufficient allowance';
    case 6047:
      return 'Invalid expiration slot';
    case 6048:
      return 'Decimal must not be greater than 18';
    case 6049:
      return 'Unauthorized';
    case 6050:
      return 'Invalid decimals';
    case 6051:
      return 'Already initialized';
    default:
      return 'Unknown error occurred in the contract';
  }
}
