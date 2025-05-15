import { Controller, Get, Logger } from '@nestjs/common'
import { NotificationsService } from './notifications.service'

@Controller('notifications/test')
export class NotificationsController {
	private readonly logger = new Logger(NotificationsController.name)

	constructor(private readonly notificationsService: NotificationsService) {}

	@Get('check-pending')
	async testCheckPendingEscrows() {
		this.logger.log('Manually triggering checkPendingEscrows...')
		await this.notificationsService.checkPendingEscrows()
		return { message: 'Check for pending escrows completed' }
	}

	@Get('check-disputes')
	async testCheckHighValueDisputes() {
		this.logger.log('Manually triggering checkHighValueDisputes...')
		await this.notificationsService.checkHighValueDisputes()
		return { message: 'Check for high value disputes completed' }
	}

	@Get('check-inactive')
	async testCheckInactiveEscrows() {
		this.logger.log('Manually triggering checkInactiveEscrows...')
		await this.notificationsService.checkInactiveEscrows()
		return { message: 'Check for inactive escrows completed' }
	}

	@Get('check-milestones')
	async testCheckCompletedMilestones() {
		this.logger.log('Manually triggering checkCompletedMilestones...')
		await this.notificationsService.checkCompletedMilestones()
		return { message: 'Check for completed milestones completed' }
	}

	@Get('check-all')
	async testAllChecks() {
		this.logger.log('Manually triggering all notification checks...')
		await this.notificationsService.checkPendingEscrows()
		await this.notificationsService.checkHighValueDisputes()
		await this.notificationsService.checkInactiveEscrows()
		await this.notificationsService.checkCompletedMilestones()
		return { message: 'All notification checks completed' }
	}
}
