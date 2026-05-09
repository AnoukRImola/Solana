import type { StateCreator } from 'zustand'
import type { NotificationsGlobalUIStore } from '../@types/notifications.entity'
import { socketService } from '~/lib/socket'
import { NotificationsApi, type Notification } from '~/services/notifications.api'
import { toast } from 'sonner'
import { firebaseDB } from '~/firebase'
import {
	collection,
	query,
	where,
	onSnapshot,
	type Unsubscribe,
} from 'firebase/firestore'

let firestoreUnsubscribe: Unsubscribe | null = null

export const useNotificationsSlice: StateCreator<
	NotificationsGlobalUIStore,
	[['zustand/devtools', never]],
	[],
	NotificationsGlobalUIStore
> = (set, get) => {
	// Setup WebSocket listeners
	const setupWebSocketListeners = () => {
		socketService.on('notification:new', (notification: Notification) => {
			console.log('📨 Received new notification:', notification)
			get().addNotification(notification)
			toast.info(notification.title, {
				description: notification.message,
			})
		})

		socketService.on(
			'notification:updated',
			(data: { id: string } & Partial<Notification>) => {
				console.log('🔄 Notification updated:', data)
				const { id, ...updates } = data
				get().updateNotification(id, updates)
			},
		)

		socketService.on('notification:all_read', () => {
			console.log('✅ All notifications marked as read')
			set({ unreadCount: 0 })
		})
	}

	return {
		// State
		notifications: [],
		unreadCount: 0,
		isLoading: false,
		currentPage: 1,
		totalPages: 1,
		isWebSocketConnected: false,
		isFallbackMode: false,

		// Actions
		initializeNotifications: async (walletAddress: string) => {
			try {
				set({ isLoading: true })
				await get().fetchNotifications()
				await get().fetchUnreadCount()
				get().connectWebSocket()
				setupWebSocketListeners()
			} catch (error) {
				console.error('Error initializing notifications:', error)
				toast.error('Failed to load notifications')
			} finally {
				set({ isLoading: false })
			}
		},

		fetchNotifications: async (params = {}) => {
			try {
				set({ isLoading: true })
				const token = getAuthToken()
				if (!token) {
					console.warn('No auth token available')
					return
				}

				const response = await NotificationsApi.getNotifications(token, {
					page: params.page || get().currentPage,
					limit: params.limit || 20,
					read: params.read,
					type: params.type,
				})

				if (response.success) {
					set({
						notifications: response.data,
						currentPage: response.pagination.page,
						totalPages: response.pagination.totalPages,
					})
				}
			} catch (error) {
				console.error('Error fetching notifications:', error)
				toast.error('Failed to load notifications')
			} finally {
				set({ isLoading: false })
			}
		},

		fetchUnreadCount: async () => {
			try {
				const token = getAuthToken()
				if (!token) return

				const response = await NotificationsApi.getUnreadCount(token)
				if (response.success && response.data) {
					set({ unreadCount: response.data.unreadCount })
				}
			} catch (error) {
				console.error('Error fetching unread count:', error)
			}
		},

		markAsRead: async (notificationId: string) => {
			try {
				const token = getAuthToken()
				if (!token) return

				const response = await NotificationsApi.markAsRead(token, notificationId)
				if (response.success) {
					const notifications = get().notifications.map((notif) =>
						notif.id === notificationId
							? { ...notif, readBy: response.data?.readBy || [] }
							: notif,
					)
					set({ notifications })
					await get().fetchUnreadCount()
					toast.success('Notification marked as read')
				}
			} catch (error) {
				console.error('Error marking notification as read:', error)
				toast.error('Failed to mark as read')
			}
		},

		markAllAsRead: async () => {
			try {
				const token = getAuthToken()
				if (!token) return

				const response = await NotificationsApi.markAllAsRead(token)
				if (response.success) {
					await get().fetchNotifications()
					await get().fetchUnreadCount()
					toast.success('All notifications marked as read')
				}
			} catch (error) {
				console.error('Error marking all as read:', error)
				toast.error('Failed to mark all as read')
			}
		},

		deleteNotification: async (notificationId: string) => {
			try {
				const token = getAuthToken()
				if (!token) return

				const response = await NotificationsApi.deleteNotification(
					token,
					notificationId,
				)
				if (response.success) {
					const notifications = get().notifications.filter(
						(notif) => notif.id !== notificationId,
					)
					set({ notifications })
					await get().fetchUnreadCount()
					toast.success('Notification deleted')
				}
			} catch (error) {
				console.error('Error deleting notification:', error)
				toast.error('Failed to delete notification')
			}
		},

		connectWebSocket: () => {
			const token = getAuthToken()
			if (!token) {
				console.warn('Cannot connect WebSocket: No auth token')
				return
			}

			if (socketService.isConnected()) {
				console.log('WebSocket already connected')
				set({ isWebSocketConnected: true })
				return
			}

			socketService.connect(token)
			set({ isWebSocketConnected: true })
			console.log('✅ WebSocket connected')

			// Disable fallback mode if it was enabled
			if (get().isFallbackMode) {
				get().disableFirebaseFallback()
			}
		},

		disconnectWebSocket: () => {
			socketService.disconnect()
			set({ isWebSocketConnected: false })
			console.log('❌ WebSocket disconnected')
		},

		setupFirebaseFallback: (walletAddress: string) => {
			if (firestoreUnsubscribe) {
				console.log('Firestore fallback already active')
				return
			}

			console.log('🔄 Enabling Firestore fallback mode')
			set({ isFallbackMode: true })

			const notificationsRef = collection(firebaseDB, 'notifications')
			const q = query(
				notificationsRef,
				where('entities', 'array-contains', walletAddress),
			)

			firestoreUnsubscribe = onSnapshot(
				q,
				(snapshot) => {
					console.log('🔄 Firestore snapshot received:', snapshot.docs.length)

					const notifications = snapshot.docs.map((doc) => ({
						id: doc.id,
						...doc.data(),
					})) as Notification[]

					// Sort by createdAt descending
					notifications.sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					)

					set({ notifications })

					// Update unread count
					const unreadCount = notifications.filter(
						(notif) => !notif.readBy?.includes(walletAddress),
					).length
					set({ unreadCount })
				},
				(error) => {
					console.error('Firestore listener error:', error)
					toast.error('Firestore fallback error')
				},
			)
		},

		disableFirebaseFallback: () => {
			if (firestoreUnsubscribe) {
				console.log('✅ Firestore fallback mode disabled')
				firestoreUnsubscribe()
				firestoreUnsubscribe = null
				set({ isFallbackMode: false })
			}
		},

		addNotification: (notification: Notification) => {
			const notifications = [notification, ...get().notifications]
			set({ notifications })

			// Update unread count
			const walletAddress = getUserWalletAddress()
			if (walletAddress && !notification.readBy?.includes(walletAddress)) {
				set({ unreadCount: get().unreadCount + 1 })
			}
		},

		updateNotification: (notificationId: string, updates: Partial<Notification>) => {
			const notifications = get().notifications.map((notif) =>
				notif.id === notificationId ? { ...notif, ...updates } : notif,
			)
			set({ notifications })
		},

		clearNotifications: () => {
			get().disconnectWebSocket()
			get().disableFirebaseFallback()
			set({
				notifications: [],
				unreadCount: 0,
				currentPage: 1,
				totalPages: 1,
				isWebSocketConnected: false,
				isFallbackMode: false,
			})
		},
	}
}

// Helper function to get auth token (API key)
function getAuthToken(): string | null {
	if (typeof window === 'undefined') return null

	// The project uses a shared API key for backend authentication
	// This is the same pattern used in other endpoints (see compliance.controller.ts)
	return process.env.NEXT_PUBLIC_API_KEY || null
}

// Helper function to get user wallet address from Zustand store
function getUserWalletAddress(): string | null {
	if (typeof window === 'undefined') return null

	// Get from Zustand auth store
	const storeState = localStorage.getItem('authentication-storage')
	if (storeState) {
		try {
			const parsed = JSON.parse(storeState)
			return parsed?.state?.address || null
		} catch {
			return null
		}
	}
	return null
}
