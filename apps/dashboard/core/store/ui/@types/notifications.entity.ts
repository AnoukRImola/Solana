import { Notification } from '~/services/notifications.api'

export interface NotificationsGlobalUIStore {
	// State
	notifications: Notification[]
	unreadCount: number
	isLoading: boolean
	currentPage: number
	totalPages: number
	isWebSocketConnected: boolean
	isFallbackMode: boolean

	// Actions
	initializeNotifications: (walletAddress: string) => Promise<void>
	fetchNotifications: (params?: {
		page?: number
		limit?: number
		read?: boolean
		type?: string
	}) => Promise<void>
	fetchUnreadCount: () => Promise<void>
	markAsRead: (notificationId: string) => Promise<void>
	markAllAsRead: () => Promise<void>
	deleteNotification: (notificationId: string) => Promise<void>
	connectWebSocket: () => void
	disconnectWebSocket: () => void
	setupFirebaseFallback: (walletAddress: string) => void
	disableFirebaseFallback: () => void
	addNotification: (notification: Notification) => void
	updateNotification: (notificationId: string, updates: Partial<Notification>) => void
	clearNotifications: () => void
}
