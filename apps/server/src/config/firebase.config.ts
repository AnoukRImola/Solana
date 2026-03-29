import * as admin from 'firebase-admin'

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
	? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
	: require('../../firebase-service-account.json')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})

export const firestore = admin.firestore()
