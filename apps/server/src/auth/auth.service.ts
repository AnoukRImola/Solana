import {
	ConflictException,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { FieldValue } from 'firebase-admin/firestore'
import { CreateAuthDto } from './dto/create-auth.dto'
import { UpdateAuthDto } from './dto/update-auth.dto'

import { JwtService } from '@nestjs/jwt'
import { FirebaseService } from 'src/firebase/firebase.service'
import { LoginUserDto } from './dto'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class AuthService {
	constructor(
		private readonly firebaseService: FirebaseService,
		private readonly jwtService: JwtService,
	) {}

	create(createAuthDto: CreateAuthDto) {
		return 'This action adds a new auth'
	}

	async findAll() {
		const firestore = this.firebaseService.getFirestore()
		const snapshot = await firestore.collection('users').get()

		if (snapshot.empty) {
			return []
		}

		const documents = []
		snapshot.forEach((doc) => {
			documents.push({ id: doc.id, ...doc.data() })
		})

		return documents
	}

	// Registrar un usuario
	async register(
		wallet: string,
		email: string,
		name: string,
	): Promise<{ message: string }> {
		const firestore = this.firebaseService.getFirestore()
		const usersCollection = firestore.collection('users')
		const userDoc = await usersCollection.doc(wallet).get()

		if (userDoc.exists) {
			throw new ConflictException('Wallet is already registered')
		}

		const newUser = {
			wallet,
			email,
			name,
			createdAt: new Date().toISOString(),
		}

		await usersCollection.doc(wallet).set(newUser)
		return { message: 'User registered successfully' }
	}

	async login(loginUserDto: LoginUserDto) {
		const { wallet } = loginUserDto

		if (!wallet) {
			throw new UnauthorizedException('Wallet is required')
		}

		const firestore = this.firebaseService.getFirestore()
		const usersCollection = firestore.collection('users')
		const user = await usersCollection.doc(wallet).get()

		console.log('user:', user.data())

		if (user.data() === undefined)
			throw new UnauthorizedException('User are not registered')

		console.log({ wallet: user.data().address })

		const data = {
			...user.data(),
			token: this.getJwtToken({ wallet: user.data().address }),
		}

		usersCollection.doc(wallet).update({
			apiKey: FieldValue.arrayUnion(data.token),
		})

		return data
	}

	private getJwtToken(payload: JwtPayload) {
		console.log("payload from 'getJwtToken':", payload)
		const token = this.jwtService.sign(payload)
		return token
	}
}
