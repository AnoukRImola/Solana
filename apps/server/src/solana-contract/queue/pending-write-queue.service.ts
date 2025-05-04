// src/stellar-contract/queue/pending-write-queue.service.ts
import { Injectable } from '@nestjs/common'

@Injectable()
export class PendingWriteQueueService {
	private queue = new Map<string, PendingWriteQueueQueue>()

	add(xdr: string, data: PendingWriteQueueQueue) {
		this.queue.set(xdr, data)
	}

	get(xdr: string) {
		return this.queue.get(xdr)
	}

	remove(xdr: string) {
		this.queue.delete(xdr)
	}

	has(xdr: string) {
		return this.queue.has(xdr)
	}

	getAll(): Map<string, PendingWriteQueueQueue> {
		return this.queue
	}

	updatePayload(xdr: string, newData: PendingWriteQueueQueue['payload']) {
		const existing = this.queue.get(xdr)
		if (!existing) {
			throw new Error(`No pending write found with hash: ${xdr}`)
		}

		this.queue.set(xdr, {
			...existing,
			payload: {
				...existing.payload,
				...newData,
			},
		})

		return this.queue.get(xdr)
	}

	logAll() {
		console.log('📦 Pending Write Queue:')
		for (const [txHash, data] of this.queue.entries()) {
			console.log(`→ ${txHash}:`, JSON.stringify(data, null, 2))
		}
	}
}

export interface PendingWriteQueueQueue {
	type: string
	payload: Record<string, unknown>
}
