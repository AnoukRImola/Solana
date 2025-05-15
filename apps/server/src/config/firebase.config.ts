import * as admin from 'firebase-admin'

const serviceAccount = require('../../my-firebase-service-config.json')

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
})

export const firestore = admin.firestore()
