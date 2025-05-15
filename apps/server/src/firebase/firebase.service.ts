import { Injectable, OnModuleInit } from '@nestjs/common'
import * as admin from 'firebase-admin'

@Injectable()
export class FirebaseService {
	private firestore: admin.firestore.Firestore

	serviceAccount = require('../../trustlessworkdevelop-cafc6-firebase-adminsdk-fbsvc-c603b20c48.json')

	onModuleInit() {
		if (!admin.apps.length) {
			admin.initializeApp({
				credential: admin.credential.cert(this.serviceAccount),
			})
		}
		this.firestore = admin.firestore()
	}

	getFirestore(): admin.firestore.Firestore {
		return this.firestore
	}
}
