import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PaginationDto } from './dto/pagination.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  // ==================== REST API Endpoints ====================

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Get user notifications with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
  })
  async getNotifications(@Request() req, @Query() pagination: PaginationDto) {
    const walletAddress = req.user.wallet;
    return this.notificationsService.getUserNotifications(
      walletAddress,
      pagination,
    );
  }

  @Get('unread/count')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({
    status: 200,
    description: 'Unread count retrieved successfully',
  })
  async getUnreadCount(@Request() req) {
    const walletAddress = req.user.wallet;
    return this.notificationsService.getUnreadCount(walletAddress);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Get a single notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async getNotification(@Request() req, @Param('id') id: string) {
    const walletAddress = req.user.wallet;
    return this.notificationsService.getNotification(id, walletAddress);
  }

  @Patch(':id/read')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Request() req, @Param('id') id: string) {
    const walletAddress = req.user.wallet;
    return this.notificationsService.markAsRead(id, walletAddress);
  }

  @Patch('read-all')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req) {
    const walletAddress = req.user.wallet;
    return this.notificationsService.markAllAsRead(walletAddress);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('jwt-auth')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async deleteNotification(@Request() req, @Param('id') id: string) {
    const walletAddress = req.user.wallet;
    return this.notificationsService.deleteNotification(id, walletAddress);
  }

  // ==================== Test Endpoints ====================

  @Get('test/check-pending')
  async testCheckPendingEscrows() {
    this.logger.log('Manually triggering checkPendingEscrows...');
    await this.notificationsService.checkPendingEscrows();
    return { message: 'Check for pending escrows completed' };
  }

  @Get('test/check-disputes')
  async testCheckHighValueDisputes() {
    this.logger.log('Manually triggering checkHighValueDisputes...');
    await this.notificationsService.checkHighValueDisputes();
    return { message: 'Check for high value disputes completed' };
  }

  @Get('test/check-inactive')
  async testCheckInactiveEscrows() {
    this.logger.log('Manually triggering checkInactiveEscrows...');
    await this.notificationsService.checkInactiveEscrows();
    return { message: 'Check for inactive escrows completed' };
  }

  @Get('test/check-milestones')
  async testCheckCompletedMilestones() {
    this.logger.log('Manually triggering checkCompletedMilestones...');
    await this.notificationsService.checkCompletedMilestones();
    return { message: 'Check for completed milestones completed' };
  }

  @Get('test/check-all')
  async testAllChecks() {
    this.logger.log('Manually triggering all notification checks...');
    await this.notificationsService.checkPendingEscrows();
    await this.notificationsService.checkHighValueDisputes();
    await this.notificationsService.checkInactiveEscrows();
    await this.notificationsService.checkCompletedMilestones();
    return { message: 'All notification checks completed' };
  }
}
