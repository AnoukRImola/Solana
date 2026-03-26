// src/solana-contract/queue/pending-write-queue.module.ts
import { Module } from '@nestjs/common'
import { PendingWriteQueueService } from './pending-write-queue.service'

@Module({
	providers: [PendingWriteQueueService, PendingWriteQueueService],
	exports: [PendingWriteQueueService, PendingWriteQueueService],
})
export class QueueModule {}
