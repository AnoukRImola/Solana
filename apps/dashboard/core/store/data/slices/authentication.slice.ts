import type { StateCreator } from 'zustand'
import type { UserPayload } from '~/@types/user.entity'
import {
	addUser,
	getAllUsers,
	getUser,
	updateUser,
} from '~/components/modules/auth/server/authentication.firebase'
import type { WalletType } from '../@types/authentication.entity'
import type { AuthenticationGlobalStore } from '../@types/authentication.entity'

const AUTHENTICATION_ACTIONS = {
	CONNECT_WALLET: 'authentication/connect',
	DISCONNECT_WALLET: 'authentication/disconnect',
	UPDATE_USER: 'authentication/updateUser',
	REMOVE_API_KEY: 'authentication/removeApiKey',
	SET_USERS: 'authentication/setUsers',
} as const

export const useGlobalAuthenticationSlice: StateCreator<
	AuthenticationGlobalStore,
	[['zustand/devtools', never]],
	[],
	AuthenticationGlobalStore
> = (set) => {
	return {
		// Stores
		address: '',
		name: '',
		walletType: null,
		loggedUser: null,
		users: [],

		// Modifiers
		connectWalletStore: async (
			address: string,
			name: string,
			walletType: WalletType,
		) => {
			const { success, data } = await getUser({ address })

			if (!success) {
				const { success: registrationSuccess, data: userData } = await addUser({
					address,
				})

				if (registrationSuccess) {
					set(
						{ address, name, walletType, loggedUser: userData },
						false,
						AUTHENTICATION_ACTIONS.CONNECT_WALLET,
					)
				}
			} else {
				set(
					{ address, name, walletType, loggedUser: data },
					false,
					AUTHENTICATION_ACTIONS.CONNECT_WALLET,
				)
			}
		},

		disconnectWalletStore: () =>
			set(
				{ address: '', name: '', walletType: null, loggedUser: null },
				false,
				AUTHENTICATION_ACTIONS.DISCONNECT_WALLET,
			),

		updateUser: async (address: string, payload: UserPayload) => {
			const { success, data } = await updateUser({
				address,
				payload,
			})

			if (success) {
				set({ loggedUser: data }, false, AUTHENTICATION_ACTIONS.UPDATE_USER)
			}
		},

		getAllUsers: async () => {
			const { success, message, data } = await getAllUsers()

			if (success) {
				set({ users: data }, false, AUTHENTICATION_ACTIONS.SET_USERS)
			} else {
				console.error(message)
			}
		},
	}
}
