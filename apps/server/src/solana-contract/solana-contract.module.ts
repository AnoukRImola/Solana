import { Module } from '@nestjs/common'
import { DeployerModule } from './deployer/deployer.module'
import { EscrowModule } from './escrow/escrow.module'
// import { UserModule } from "./user/user.module";
import { HelperModule } from './helper/helper.module'

@Module({
	imports: [EscrowModule /*, UserModule*/, HelperModule, DeployerModule],
})
export class SolanaContractModule { }
