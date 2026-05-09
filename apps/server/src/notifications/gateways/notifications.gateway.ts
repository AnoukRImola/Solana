import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Notification } from 'src/interfaces/notifications.interface';

interface AuthenticatedSocket extends Socket {
  walletAddress?: string;
}

interface JwtPayload {
  wallet: string;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.WEBSOCKET_CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  private readonly userConnections = new Map<string, Set<string>>(); // walletAddress -> Set<socketId>

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth or query
      const token: unknown =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1] ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn(
          `Connection rejected: No token provided - Socket ID: ${client.id}`,
        );
        client.emit('connection:error', {
          message: 'Authentication required',
        });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        token as string,
        {
          secret: process.env.JWT_SECRET,
        },
      );

      if (!payload?.wallet) {
        this.logger.warn(
          `Connection rejected: Invalid token payload - Socket ID: ${client.id}`,
        );
        client.emit('connection:error', {
          message: 'Invalid token',
        });
        client.disconnect();
        return;
      }

      const walletAddress = payload.wallet;

      // Store wallet address in socket
      client.walletAddress = walletAddress;

      // Add client to user-specific room
      const room = `user:${walletAddress}`;
      await client.join(room);

      // Track connection
      if (!this.userConnections.has(walletAddress)) {
        this.userConnections.set(walletAddress, new Set());
      }
      this.userConnections.get(walletAddress)!.add(client.id);

      this.logger.log(
        `✅ Client connected - Wallet: ${walletAddress}, Socket ID: ${client.id}, Room: ${room}`,
      );
      this.logger.debug(
        `Active connections for ${walletAddress}: ${this.userConnections.get(walletAddress)!.size}`,
      );

      // Notify client of successful connection
      client.emit('connection:success', {
        message: 'Connected to notifications',
        walletAddress,
      });
    } catch (error: unknown) {
      this.logger.error(
        `Connection error - Socket ID: ${client.id}`,
        error instanceof Error ? error.stack : 'Unknown error',
      );
      client.emit('connection:error', {
        message: 'Authentication failed',
      });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const walletAddress = client.walletAddress;

    if (walletAddress) {
      // Remove from tracking
      const connections = this.userConnections.get(walletAddress);
      if (connections) {
        connections.delete(client.id);
        if (connections.size === 0) {
          this.userConnections.delete(walletAddress);
        }
      }

      this.logger.log(
        `❌ Client disconnected - Wallet: ${walletAddress}, Socket ID: ${client.id}`,
      );
      this.logger.debug(
        `Remaining connections for ${walletAddress}: ${connections?.size || 0}`,
      );
    } else {
      this.logger.log(`❌ Client disconnected - Socket ID: ${client.id}`);
    }
  }

  /**
   * Emit a new notification to a specific user
   * @param walletAddress - Target wallet address
   * @param notification - Notification data
   */
  emitNotificationToUser(walletAddress: string, notification: Notification) {
    const room = `user:${walletAddress}`;
    this.server.to(room).emit('notification:new', notification);
    this.logger.debug(
      `📨 Emitted notification:new to ${walletAddress} - Type: ${notification.type}`,
    );
  }

  /**
   * Emit notification update (e.g., marked as read)
   * @param walletAddress - Target wallet address
   * @param notificationId - Notification ID
   * @param updates - Partial notification updates
   */
  emitNotificationUpdate(
    walletAddress: string,
    notificationId: string,
    updates: Partial<Notification>,
  ) {
    const room = `user:${walletAddress}`;
    this.server.to(room).emit('notification:updated', {
      id: notificationId,
      ...updates,
    });
    this.logger.debug(
      `🔄 Emitted notification:updated to ${walletAddress} - ID: ${notificationId}`,
    );
  }

  /**
   * Emit all notifications marked as read event
   * @param walletAddress - Target wallet address
   */
  emitAllNotificationsRead(walletAddress: string) {
    const room = `user:${walletAddress}`;
    this.server.to(room).emit('notification:all_read');
    this.logger.debug(`✅ Emitted notification:all_read to ${walletAddress}`);
  }

  /**
   * Check if a user is currently connected
   * @param walletAddress - Wallet address to check
   * @returns true if user has at least one active connection
   */
  isUserConnected(walletAddress: string): boolean {
    return (
      this.userConnections.has(walletAddress) &&
      this.userConnections.get(walletAddress)!.size > 0
    );
  }

  /**
   * Get number of active connections for a user
   * @param walletAddress - Wallet address
   * @returns number of active connections
   */
  getUserConnectionCount(walletAddress: string): number {
    return this.userConnections.get(walletAddress)?.size || 0;
  }

  /**
   * Get total number of connected users
   * @returns number of unique users connected
   */
  getTotalConnectedUsers(): number {
    return this.userConnections.size;
  }

  /**
   * Handle ping from client (for connection health check)
   */
  @SubscribeMessage('ping')
  handlePing(client: AuthenticatedSocket): void {
    client.emit('pong', { timestamp: Date.now() });
  }
}
