import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
	public getHello(): string {
		return 'Hello World!'
	}
	public getDate(): string {
		return new Date().toISOString()
	}
	public getDateWithMessage(): string {
		return `Hello World! ${new Date().toISOString()}`
	}
}
