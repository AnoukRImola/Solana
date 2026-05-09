import { useEffect } from 'react'
import { useGlobalUIBoundedStore } from '~/core/store/ui'
import { useGlobalAuthenticationStore } from '~/core/store/data'

/**
 * Hook to manage notifications
 * Auto-initializes notifications when user is authenticated
 * Provides methods with JWT token automatically injected
 */
export function useNotifications() {
	const {
		notifications,
		unreadCount,
		isLoading,
		currentPage,
		totalPages,
		isWebSocketConnected,
		isFallbackMode,
		initializeNotifications,
		fetchNotifications,
		fetchUnreadCount,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		connectWebSocket,
		disconnectWebSocket,
		setupFirebaseFallback,
		disableFirebaseFallback,
		clearNotifications,
	} = useGlobalUIBoundedStore()

	// Get wallet address from auth store
	const { address } = useGlobalAuthenticationStore()

	// Get user wallet address
	const getWalletAddress = (): string | null => {
		return address || null
	}

	// Auto-initialize notifications when component mounts and user is authenticated
	useEffect(() => {
		const walletAddress = getWalletAddress()

		if (walletAddress) {
			initializeNotifications(walletAddress)

			// Setup connection error handler for fallback mode
			const handleConnectionError = () => {
				console.log('🔄 WebSocket connection lost, enabling Firestore fallback')
				setupFirebaseFallback(walletAddress)
			}

			// Setup connection success handler to disable fallback
			const handleConnectionSuccess = () => {
				console.log('✅ WebSocket reconnected, disabling Firestore fallback')
				disableFirebaseFallback()
			}

			// Listen for connection events
			window.addEventListener('offline', handleConnectionError)
			window.addEventListener('online', handleConnectionSuccess)

			// Cleanup
			return () => {
				window.removeEventListener('offline', handleConnectionError)
				window.removeEventListener('online', handleConnectionSuccess)
				clearNotifications()
			}
		}
	}, [])

	// Get user-specific unread count
	const getUserUnreadCount = (): number => {
		const walletAddress = getWalletAddress()
		if (!walletAddress) return 0

		return notifications.filter(
			(notif) => !notif.readBy?.includes(walletAddress),
		).length
	}

	// Check if notification is read by current user
	const isNotificationRead = (notificationId: string): boolean => {
		const walletAddress = getWalletAddress()
		if (!walletAddress) return false

		const notification = notifications.find((n) => n.id === notificationId)
		return notification?.readBy?.includes(walletAddress) || false
	}

	return {
		// State
		notifications,
		unreadCount: getUserUnreadCount(),
		globalUnreadCount: unreadCount,
		isLoading,
		currentPage,
		totalPages,
		isWebSocketConnected,
		isFallbackMode,

		// Actions
		fetchNotifications,
		fetchUnreadCount,
		markAsRead,
		markAllAsRead,
		deleteNotification,
		connectWebSocket,
		disconnectWebSocket,
		isNotificationRead,

		// Utilities
		getWalletAddress,
	}
}
