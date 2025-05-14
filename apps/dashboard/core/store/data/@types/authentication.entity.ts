import type { User, UserPayload } from '~/@types/user.entity'

export type WalletType = 'stellar' | 'solana'

export interface AuthenticationGlobalStore {
	address: string
	name: string
	walletType: WalletType | null
	loggedUser: User | null
	users: User[]

	connectWalletStore: (address: string, name: string, walletType: WalletType) => void
	disconnectWalletStore: () => void
	updateUser: (address: string, payload: UserPayload) => void
	getAllUsers: () => void
}
