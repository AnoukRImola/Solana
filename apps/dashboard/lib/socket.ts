import { io, Socket } from 'socket.io-client'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const SOCKET_URL = `${API_URL}/notifications`

type EventListener = (...args: any[]) => void

export class SocketService {
	private static instance: SocketService
	private socket: Socket | null = null
	private reconnectAttempts = 0
	private maxReconnectAttempts = 5
	private reconnectDelay = 2000

	private constructor() {}

	public static getInstance(): SocketService {
		if (!SocketService.instance) {
			SocketService.instance = new SocketService()
		}
		return SocketService.instance
	}

	/**
	 * Connect to WebSocket server with JWT token
	 */
	connect(token: string): void {
		if (this.socket?.connected) {
			console.log('🔌 Socket already connected')
			return
		}

		console.log('🔌 Connecting to WebSocket:', SOCKET_URL)

		this.socket = io(SOCKET_URL, {
			auth: {
				token,
			},
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionDelay: this.reconnectDelay,
			reconnectionAttempts: this.maxReconnectAttempts,
		})

		this.setupDefaultListeners()
	}

	/**
	 * Setup default event listeners
	 */
	private setupDefaultListeners(): void {
		if (!this.socket) return

		this.socket.on('connect', () => {
			console.log('✅ WebSocket connected - ID:', this.socket?.id)
			this.reconnectAttempts = 0
		})

		this.socket.on('disconnect', (reason) => {
			console.log('❌ WebSocket disconnected:', reason)
		})

		this.socket.on('connect_error', (error) => {
			console.error('🔴 WebSocket connection error:', error.message)
			this.reconnectAttempts++

			if (this.reconnectAttempts >= this.maxReconnectAttempts) {
				console.error(
					'🔴 Max reconnection attempts reached. Stopping reconnection.',
				)
				this.disconnect()
			}
		})

		this.socket.on('connection:success', (data) => {
			console.log('✅ Connection success:', data)
		})

		this.socket.on('connection:error', (data) => {
			console.error('🔴 Connection error:', data)
			this.disconnect()
		})
	}

	/**
	 * Disconnect from WebSocket server
	 */
	disconnect(): void {
		if (this.socket) {
			console.log('🔌 Disconnecting from WebSocket')
			this.socket.disconnect()
			this.socket = null
			this.reconnectAttempts = 0
		}
	}

	/**
	 * Register an event listener
	 */
	on(event: string, callback: EventListener): void {
		if (!this.socket) {
			console.warn('⚠️ Cannot register listener: Socket not connected')
			return
		}
		this.socket.on(event, callback)
	}

	/**
	 * Unregister an event listener
	 */
	off(event: string, callback?: EventListener): void {
		if (!this.socket) return
		if (callback) {
			this.socket.off(event, callback)
		} else {
			this.socket.off(event)
		}
	}

	/**
	 * Emit an event
	 */
	emit(event: string, ...args: any[]): void {
		if (!this.socket) {
			console.warn('⚠️ Cannot emit event: Socket not connected')
			return
		}
		this.socket.emit(event, ...args)
	}

	/**
	 * Check if socket is connected
	 */
	isConnected(): boolean {
		return this.socket?.connected || false
	}

	/**
	 * Send a ping to check connection health
	 */
	ping(): void {
		if (this.socket?.connected) {
			this.socket.emit('ping')
			this.socket.once('pong', (data) => {
				console.log('🏓 Pong received:', data)
			})
		}
	}
}

export const socketService = SocketService.getInstance()
