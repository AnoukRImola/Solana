import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { FirebaseModule } from '../firebase/firebase.module'
import { AuthModule } from '../auth/auth.module'
import { EscrowFirestoreService } from '../solana-contract/escrow/firestore-services/escrow-firestore.service'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsGateway } from './gateways/notifications.gateway'

@Module({
	imports: [ScheduleModule.forRoot(), FirebaseModule, AuthModule],
	controllers: [NotificationsController],
	providers: [NotificationsService, NotificationsGateway, EscrowFirestoreService],
	exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
