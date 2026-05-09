import { Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { EscrowFirestoreService } from 'src/solana-contract/escrow/firestore-services/escrow-firestore.service';
import { ComplianceController } from './compliance.controller';
import { ComplianceService } from './compliance.service';
import { KycGuard } from './guards/kyc.guard';
import { TravelRuleGuard } from './guards/travel-rule.guard';
import { KytService } from './services/kyt.service';

@Module({
  imports: [AuthModule, FirebaseModule],
  controllers: [ComplianceController],
  providers: [
    ComplianceService,
    KycGuard,
    TravelRuleGuard,
    KytService,
    EscrowFirestoreService,
  ],
  exports: [ComplianceService, KycGuard, TravelRuleGuard, KytService],
})
export class ComplianceModule {}
