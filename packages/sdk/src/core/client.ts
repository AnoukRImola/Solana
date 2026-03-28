import type { AxiosInstance } from 'axios'
import type { TrustlessWorkOptions } from '../types/config'
import { createHttpClient } from './http'
import { createAuthModule, type AuthModule } from './modules/auth'
import { createDeployerModule, type DeployerModule } from './modules/deployer'
import { createEscrowModule, type EscrowModule } from './modules/escrow'
import {
	createMultiReleaseModule,
	type MultiReleaseModule,
} from './modules/multi-release'
import { createHelperModule, type HelperModule } from './modules/helper'
import { createComplianceModule, type ComplianceModule } from './modules/compliance'

export class TrustlessWork {
	private http: AxiosInstance

	public readonly auth: AuthModule
	public readonly deployer: DeployerModule
	public readonly escrow: EscrowModule
	public readonly multiRelease: MultiReleaseModule
	public readonly helper: HelperModule
	public readonly compliance: ComplianceModule

	constructor(options: TrustlessWorkOptions) {
		this.http = createHttpClient(options.baseURL, options.apiKey)

		this.auth = createAuthModule(this.http)
		this.deployer = createDeployerModule(this.http)
		this.escrow = createEscrowModule(this.http)
		this.multiRelease = createMultiReleaseModule(this.http)
		this.helper = createHelperModule(this.http)
		this.compliance = createComplianceModule(this.http)
	}

	setApiKey(apiKey: string): void {
		this.http.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`
	}
}
