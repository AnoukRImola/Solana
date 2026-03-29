import type { AxiosInstance } from 'axios'
import type { TrustlessWorkOptions } from '../types/config'
import { createHttpClient } from './http'
import { type AuthModule, createAuthModule } from './modules/auth'
import {
	type ComplianceModule,
	createComplianceModule,
} from './modules/compliance'
import { type DeployerModule, createDeployerModule } from './modules/deployer'
import { type EscrowModule, createEscrowModule } from './modules/escrow'
import { type HelperModule, createHelperModule } from './modules/helper'
import {
	type MultiReleaseModule,
	createMultiReleaseModule,
} from './modules/multi-release'

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
