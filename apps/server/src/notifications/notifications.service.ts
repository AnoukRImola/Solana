import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Escrow } from 'src/interfaces/escrow.interface';
import { Milestone } from 'src/interfaces/milestone.interface';
import { Notification } from 'src/interfaces/notifications.interface';
import { FirebaseService } from '../firebase/firebase.service';
import {
  CreateNotificationDto,
  NotificationType,
} from './dto/create-notification.dto';
import { PaginationDto } from './dto/pagination.dto';
import { NotificationsGateway } from './gateways/notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  @Cron(CronExpression.EVERY_HOUR) // ! ask: how often?
  async checkPendingEscrows() {
    const firestore = this.firebaseService.getFirestore();

    const escrowsSnapshot = await firestore.collection('escrows').get();

    const now = new Date();
    const X_DAYS = 7; // ! ask: how many days?
    const X_DAYS_AGO = new Date(now.getTime() - X_DAYS * 24 * 60 * 60 * 1000);

    for (const escrowDoc of escrowsSnapshot.docs) {
      const escrow = escrowDoc.data();
      const createdAt = escrow.createdAt?.toDate?.() ?? new Date(0);

      const isPending = escrow.milestones?.some(
        (milestone) => milestone.approved_flag !== true,
      );

      if (isPending && createdAt < X_DAYS_AGO) {
        await this.createNotification({
          contractId: escrow.contractId,
          type: NotificationType.SYSTEM_NOTIFICATION,
          title: 'Escrow Stuck in Pending State',
          message: `Escrow ${escrow.title} has been in a pending state for more than ${X_DAYS} days.`,
          entities: [
            escrow.approver,
            escrow.serviceProvider,
            escrow.platformAddress,
            escrow.releaseSigner,
            escrow.disputeResolver,
            escrow.receiver,
          ].filter(Boolean),
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // ! ask: how often?
  async checkHighValueDisputes() {
    const firestore = this.firebaseService.getFirestore();

    const snapshot = await firestore
      .collection('escrows')
      .where('disputeFlag', '==', true)
      .get();

    const HIGH_VALUE_THRESHOLD = 500; // ! ask: how many USDC?
    for (const doc of snapshot.docs) {
      const escrow = doc.data() as Escrow;
      if (Number(escrow.amount) > HIGH_VALUE_THRESHOLD) {
        // ! ask: amount or balance?
        await this.createNotification({
          contractId: escrow.contractId ?? '',
          type: NotificationType.DISPUTE_OPENED,
          title: 'High Value Escrow in Dispute',
          message: `Escrow ${escrow.title} with value ${escrow.amount} is in dispute`,
          entities: [
            escrow.approver,
            escrow.serviceProvider,
            escrow.platformAddress,
            escrow.releaseSigner,
            escrow.disputeResolver,
            escrow.receiver,
          ].filter(Boolean),
          metadata: {
            amount: escrow.amount,
            threshold: HIGH_VALUE_THRESHOLD,
          },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // ! ask: how often?
  async checkInactiveEscrows() {
    const firestore = this.firebaseService.getFirestore();

    const snapshot = await firestore.collection('escrows').get();

    const X_DAYS = 30; // ! ask: how many days?
    const X_DAYS_AGO = new Date(
      new Date().getTime() - X_DAYS * 24 * 60 * 60 * 1000,
    );

    for (const doc of snapshot.docs) {
      const escrow = doc.data();

      if (escrow.resolvedFlag == true || escrow.releaseFlag == true) continue; // todo: @caleb, please set this filters in the query

      const lastActivity = escrow.updatedAt?.toDate?.() ?? new Date(0);

      if (lastActivity < X_DAYS_AGO) {
        await this.createNotification({
          contractId: escrow.contractId,
          type: NotificationType.SYSTEM_NOTIFICATION,
          title: 'Inactive Escrow',
          message: `Escrow ${escrow.title} has had no activity for ${X_DAYS} days`,
          entities: [
            escrow.approver,
            escrow.serviceProvider,
            escrow.platformAddress,
            escrow.releaseSigner,
            escrow.disputeResolver,
            escrow.receiver,
          ].filter(Boolean),
          metadata: {
            inactiveDays: X_DAYS,
            lastActivity: escrow.updatedAt,
          },
        });
      }
    }
  }

  @Cron(CronExpression.EVERY_6_HOURS) // ! ask: how often?
  async checkCompletedMilestones() {
    const firestore = this.firebaseService.getFirestore();

    const snapshot = await firestore.collection('escrows').get();

    const X_DAYS = 3; // ! ask: how many days?
    const X_DAYS_AGO = new Date(
      new Date().getTime() - X_DAYS * 24 * 60 * 60 * 1000,
    );

    for (const doc of snapshot.docs) {
      const escrow = doc.data();

      if (escrow.resolvedFlag == true || escrow.releaseFlag == true) continue; // todo: @caleb, please set this filters in the query

      if (escrow.milestones) {
        for (const milestone of escrow.milestones as Milestone[]) {
          if (milestone.status === 'completed' && !milestone.approved_flag) {
            const completedAt =
              milestone.completedAt instanceof Date
                ? milestone.completedAt
                : new Date(0);

            if (completedAt < X_DAYS_AGO) {
              await this.createNotification({
                contractId: escrow.contractId,
                type: NotificationType.MILESTONE_COMPLETED,
                title: 'Milestone Pending Approval',
                message: `Milestone "${milestone.description}" in escrow ${escrow.title} has been completed but not approved for ${X_DAYS} days`,
                entities: [escrow.approver].filter(Boolean),
                metadata: {
                  milestoneDescription: milestone.description,
                  pendingDays: X_DAYS,
                },
              });
            }
          }
        }
      }
    }
  }

  // ==================== CRUD Methods ====================

  /**
   * Create a new notification and emit via WebSocket
   */
  async createNotification(
    dto: CreateNotificationDto,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const firestore = this.firebaseService.getFirestore();

    try {
      const newNotification: Notification = {
        ...dto,
        readBy: [],
        createdAt: new Date(),
      };

      const docRef = await firestore
        .collection('notifications')
        .add(newNotification);

      const createdDoc = await docRef.get();
      const notificationData = {
        id: docRef.id,
        ...newNotification,
      };

      // Emit WebSocket event to all users in entities array
      for (const walletAddress of dto.entities) {
        if (this.notificationsGateway.isUserConnected(walletAddress)) {
          this.notificationsGateway.emitNotificationToUser(
            walletAddress,
            notificationData,
          );
          this.logger.debug(
            `📨 WebSocket notification sent to ${walletAddress}`,
          );
        }
      }

      this.logger.log(
        `✅ Notification created - Type: ${dto.type}, Recipients: ${dto.entities.length}`,
      );

      return {
        success: true,
        message: 'Notification created successfully.',
        data: notificationData,
      };
    } catch (error) {
      this.logger.error('Error creating notification:', error.stack);
      return {
        success: false,
        message:
          (error as Error).message ||
          'An error occurred while creating the notification.',
      };
    }
  }

  /**
   * Get notifications for a user with pagination and filters
   */
  async getUserNotifications(walletAddress: string, pagination: PaginationDto) {
    const firestore = this.firebaseService.getFirestore();

    try {
      let query = firestore
        .collection('notifications')
        .where('entities', 'array-contains', walletAddress)
        .orderBy('createdAt', 'desc');

      // Apply filters
      if (pagination.type) {
        query = query.where('type', '==', pagination.type);
      }

      const snapshot = await query.get();

      // Filter by read status if specified
      let notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (pagination.read !== undefined) {
        notifications = notifications.filter((notif: any) => {
          const isRead = notif.readBy?.includes(walletAddress) || false;
          return pagination.read ? isRead : !isRead;
        });
      }

      // Calculate pagination
      const total = notifications.length;
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedNotifications = notifications.slice(startIndex, endIndex);

      return {
        success: true,
        data: paginatedNotifications,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      this.logger.error('Error getting user notifications:', error.stack);
      throw new BadRequestException('Failed to fetch notifications');
    }
  }

  /**
   * Get a single notification
   */
  async getNotification(id: string, walletAddress: string) {
    const firestore = this.firebaseService.getFirestore();

    try {
      const docRef = firestore.collection('notifications').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Notification not found');
      }

      const notification = doc.data() as Notification;

      // Check if user has access to this notification
      if (!notification?.entities?.includes(walletAddress)) {
        throw new NotFoundException('Notification not found');
      }

      return {
        success: true,
        data: {
          id: doc.id,
          ...notification,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error getting notification:', error.stack);
      throw new BadRequestException('Failed to fetch notification');
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(id: string, walletAddress: string) {
    const firestore = this.firebaseService.getFirestore();

    try {
      const docRef = firestore.collection('notifications').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Notification not found');
      }

      const notification = doc.data() as Notification;

      // Check if user has access to this notification
      if (!notification?.entities?.includes(walletAddress)) {
        throw new NotFoundException('Notification not found');
      }

      // Check if already read
      const readBy = notification.readBy || [];
      if (readBy.includes(walletAddress)) {
        return {
          success: true,
          message: 'Notification already marked as read',
          data: {
            id: doc.id,
            ...notification,
          },
        };
      }

      // Add walletAddress to readBy array
      await docRef.update({
        readBy: [...readBy, walletAddress],
      });

      const updatedDoc = await docRef.get();
      const updatedData = updatedDoc.data() as Notification;
      const updatedNotification = {
        id: doc.id,
        ...updatedData,
      };

      // Emit WebSocket update
      this.notificationsGateway.emitNotificationUpdate(
        walletAddress,
        id,
        updatedData,
      );

      return {
        success: true,
        message: 'Notification marked as read',
        data: updatedNotification,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error marking notification as read:', error.stack);
      throw new BadRequestException('Failed to update notification');
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(walletAddress: string) {
    const firestore = this.firebaseService.getFirestore();

    try {
      const snapshot = await firestore
        .collection('notifications')
        .where('entities', 'array-contains', walletAddress)
        .get();

      const batch = firestore.batch();
      let updatedCount = 0;

      for (const doc of snapshot.docs) {
        const notification = doc.data();
        const readBy = notification.readBy || [];

        // Only update if not already read
        if (!readBy.includes(walletAddress)) {
          batch.update(doc.ref, {
            readBy: [...readBy, walletAddress],
          });
          updatedCount++;
        }
      }

      await batch.commit();

      // Emit WebSocket event
      this.notificationsGateway.emitAllNotificationsRead(walletAddress);

      return {
        success: true,
        message: `Marked ${updatedCount} notifications as read`,
        data: { updatedCount },
      };
    } catch (error) {
      this.logger.error('Error marking all as read:', error.stack);
      throw new BadRequestException('Failed to update notifications');
    }
  }

  /**
   * Delete a notification (soft delete)
   */
  async deleteNotification(id: string, walletAddress: string) {
    const firestore = this.firebaseService.getFirestore();

    try {
      const docRef = firestore.collection('notifications').doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        throw new NotFoundException('Notification not found');
      }

      const notification = doc.data() as Notification;

      // Check if user has access to this notification
      if (!notification?.entities?.includes(walletAddress)) {
        throw new NotFoundException('Notification not found');
      }

      // Hard delete (could be changed to soft delete if needed)
      await docRef.delete();

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting notification:', error.stack);
      throw new BadRequestException('Failed to delete notification');
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(walletAddress: string) {
    const firestore = this.firebaseService.getFirestore();

    try {
      const snapshot = await firestore
        .collection('notifications')
        .where('entities', 'array-contains', walletAddress)
        .get();

      const unreadCount = snapshot.docs.filter((doc) => {
        const notification = doc.data();
        const readBy = notification.readBy || [];
        return !readBy.includes(walletAddress);
      }).length;

      return {
        success: true,
        data: { unreadCount },
      };
    } catch (error) {
      this.logger.error('Error getting unread count:', error.stack);
      throw new BadRequestException('Failed to get unread count');
    }
  }
}
