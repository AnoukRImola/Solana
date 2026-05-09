import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { EscrowFirestoreService } from '../escrow/firestore-services/escrow-firestore.service';
import { PendingWriteHandlerService } from '../queue/pending-write-handler.service';
import { QueueModule } from '../queue/queue.module';
import { HelperController } from './helper.controller';
import { HelperService } from './helper.service';

@Module({
  imports: [AuthModule, FirebaseModule, QueueModule],
  controllers: [HelperController],
  providers: [
    HelperService,
    EscrowFirestoreService,
    PendingWriteHandlerService,
  ],
  exports: [HelperService],
})
export class HelperModule {}
