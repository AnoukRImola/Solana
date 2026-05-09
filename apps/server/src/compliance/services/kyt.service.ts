import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

interface AuditLogEntry {
  wallet: string;
  action: string;
  contractId?: string;
  amount?: string;
  metadata?: Record<string, unknown>;
}

export interface SuspiciousActivityResult {
  isSuspicious: boolean;
  reasons: string[];
  recentTxCount: number;
}

@Injectable()
export class KytService {
  private readonly logger = new Logger(KytService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async logTransaction(entry: AuditLogEntry): Promise<void> {
    try {
      const firestore = this.firebaseService.getFirestore();
      await firestore.collection('compliance_audit_logs').add({
        ...entry,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to write audit log', error);
    }
  }

  async detectSuspiciousActivity(
    wallet: string,
  ): Promise<SuspiciousActivityResult> {
    const reasons: string[] = [];

    try {
      const firestore = this.firebaseService.getFirestore();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const recentLogs = await firestore
        .collection('compliance_audit_logs')
        .where('wallet', '==', wallet)
        .where('timestamp', '>=', oneHourAgo)
        .get();

      const recentTxCount = recentLogs.size;

      if (recentTxCount > 20) {
        reasons.push(
          `High frequency: ${recentTxCount} transactions in the last hour`,
        );
      }

      let totalAmount = 0;
      for (const doc of recentLogs.docs) {
        const data = doc.data();
        if (data.amount) {
          totalAmount += Number(data.amount);
        }
      }

      if (totalAmount > 1_000_000_000) {
        reasons.push(
          `High volume: ${totalAmount} total amount in the last hour`,
        );
      }

      return {
        isSuspicious: reasons.length > 0,
        reasons,
        recentTxCount,
      };
    } catch (error) {
      this.logger.error('Failed to check suspicious activity', error);
      return { isSuspicious: false, reasons: [], recentTxCount: 0 };
    }
  }

  async getAuditLogs(
    wallet: string,
    page = 1,
    limit = 20,
  ): Promise<{ logs: FirebaseFirestore.DocumentData[]; total: number }> {
    const firestore = this.firebaseService.getFirestore();

    const countSnapshot = await firestore
      .collection('compliance_audit_logs')
      .where('wallet', '==', wallet)
      .count()
      .get();
    const total = countSnapshot.data().count;

    const snapshot = await firestore
      .collection('compliance_audit_logs')
      .where('wallet', '==', wallet)
      .orderBy('timestamp', 'desc')
      .offset((page - 1) * limit)
      .limit(limit)
      .get();

    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { logs, total };
  }
}
