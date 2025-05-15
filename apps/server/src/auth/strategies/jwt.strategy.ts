import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { FirebaseService } from 'src/firebase/firebase.service'
import { User } from '../entities/user.entity'
import { JwtPayload } from '../interfaces/jwt-payload.interface'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
	constructor(private readonly firebaseService: FirebaseService) {
		super({
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			passReqToCallback: undefined,
		})
	}

	async validate(payload: JwtPayload): Promise<User> {
		const { wallet } = payload

		if (!wallet || typeof wallet !== 'string') {
			throw new UnauthorizedException(
				'Invalid token: wallet is missing or invalid',
			)
		}

		const firestore = this.firebaseService.getFirestore()
		const usersCollection = firestore.collection('users')

		const userSnapshot = await usersCollection.doc(wallet).get()

		if (!userSnapshot.exists) {
			throw new UnauthorizedException('Token not valid')
		}

		const userData = userSnapshot.data()
		return userData as User
	}
}
