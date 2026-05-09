import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface Notification {
	id: string
	contractId: string
	type: string
	title: string
	message: string
	entities: string[]
	readBy?: string[]
	createdAt: Date
	metadata?: Record<string, any>
}

export interface PaginationParams {
	page?: number
	limit?: number
	read?: boolean
	type?: string
}

export interface PaginatedResponse<T> {
	success: boolean
	data: T[]
	pagination: {
		total: number
		page: number
		limit: number
		totalPages: number
	}
}

export interface ApiResponse<T> {
	success: boolean
	message?: string
	data?: T
}

export class NotificationsApi {
	/**
	 * Get user notifications with pagination
	 */
	static async getNotifications(
		token: string,
		params?: PaginationParams,
	): Promise<PaginatedResponse<Notification>> {
		const response = await axios.get(`${API_URL}/notifications`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params,
		})
		return response.data
	}

	/**
	 * Get unread notifications count
	 */
	static async getUnreadCount(
		token: string,
	): Promise<ApiResponse<{ unreadCount: number }>> {
		const response = await axios.get(`${API_URL}/notifications/unread/count`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return response.data
	}

	/**
	 * Get a single notification
	 */
	static async getNotification(
		token: string,
		id: string,
	): Promise<ApiResponse<Notification>> {
		const response = await axios.get(`${API_URL}/notifications/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return response.data
	}

	/**
	 * Mark a notification as read
	 */
	static async markAsRead(
		token: string,
		id: string,
	): Promise<ApiResponse<Notification>> {
		const response = await axios.patch(
			`${API_URL}/notifications/${id}/read`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
		return response.data
	}

	/**
	 * Mark all notifications as read
	 */
	static async markAllAsRead(
		token: string,
	): Promise<ApiResponse<{ updatedCount: number }>> {
		const response = await axios.patch(
			`${API_URL}/notifications/read-all`,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			},
		)
		return response.data
	}

	/**
	 * Delete a notification
	 */
	static async deleteNotification(
		token: string,
		id: string,
	): Promise<ApiResponse<void>> {
		const response = await axios.delete(`${API_URL}/notifications/${id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		return response.data
	}
}
