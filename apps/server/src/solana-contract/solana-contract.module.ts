import { Module } from '@nestjs/common'
import { DeployerModule } from './deployer/deployer.module'
import { EscrowModule } from './escrow/escrow.module'
import { HelperModule } from './helper/helper.module'

@Module({
	imports: [EscrowModule, HelperModule, DeployerModule],
})
export class SolanaContractModule { }
