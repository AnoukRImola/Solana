import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { FirebaseModule } from '../firebase/firebase.module'
import { EscrowFirestoreService } from '../solana-contract/escrow/firestore-services/escrow-firestore.service'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'

@Module({
	imports: [ScheduleModule.forRoot(), FirebaseModule],
	controllers: [NotificationsController],
	providers: [NotificationsService, EscrowFirestoreService],
	exports: [NotificationsService],
})
export class NotificationsModule {}
