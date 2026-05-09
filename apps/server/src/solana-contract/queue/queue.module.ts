import { Module } from '@nestjs/common';
import { PendingWriteQueueService } from './pending-write-queue.service';

@Module({
  providers: [PendingWriteQueueService],
  exports: [PendingWriteQueueService],
})
export class QueueModule {}
