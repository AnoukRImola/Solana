import { Module } from '@nestjs/common'
import { AuthModule } from 'src/auth/auth.module'
import { FirebaseModule } from 'src/firebase/firebase.module'
import { QueueModule } from '../queue/queue.module'
import { EscrowController } from './escrow.controller'
import { EscrowService } from './escrow.service'
import { EscrowFirestoreService } from './firestore-services/escrow-firestore.service'

@Module({
	imports: [AuthModule, FirebaseModule, QueueModule],
	controllers: [EscrowController],
	providers: [EscrowService, EscrowFirestoreService],
	exports: [EscrowFirestoreService],
})
export class EscrowModule {}
