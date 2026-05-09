import type { FirebaseService } from 'src/firebase/firebase.service';
import type { Notification } from 'src/interfaces/notifications.interface';

export const addEscrow = async (
  firebaseService: FirebaseService,
  escrow: Record<string, unknown>,
  contractId: string,
): Promise<{ success: boolean; message: string; data?: unknown }> => {
  const firestore = firebaseService.getFirestore();
  const collectionRef = firestore.collection('escrows');

  try {
    const docRef = await collectionRef.add({
      ...escrow,
      contractId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdDoc = await docRef.get();

    if (createdDoc.exists) {
      return {
        success: true,
        message: `Escrow ${escrow.title} created successfully`,
        data: { id: docRef.id, ...createdDoc.data() },
      };
    }

    return {
      success: false,
      message: 'Document was created but no data was found.',
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message || 'An error occurred',
    };
  }
};

interface UpdateEscrowProps {
  escrowId: string;
  payload: Record<string, unknown>;
}

export const updateEscrow = async (
  firebaseService: FirebaseService,
  { escrowId, payload }: UpdateEscrowProps,
): Promise<{ success: boolean; message: string; data?: unknown }> => {
  try {
    const firestore = firebaseService.getFirestore();

    // 🔍 Buscar documento por contractId
    const query = firestore
      .collection('escrows')
      .where('contractId', '==', escrowId);
    const snapshot = await query.get();

    if (snapshot.empty) {
      throw new Error('No matching documents found.');
    }

    const doc = snapshot.docs[0];
    const docRef = firestore.collection('escrows').doc(doc.id);

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined),
    );

    const updatesWithTimestamp = {
      ...cleanedPayload,
      updatedAt: new Date(),
    };

    await docRef.update(updatesWithTimestamp);

    const updatedDoc = await docRef.get();
    if (!updatedDoc.exists) {
      throw new Error('Escrow not found.');
    }

    const updatedEscrow = updatedDoc.data();

    return {
      success: true,
      message: `Escrow with ID ${escrowId} updated successfully.`,
      data: { escrowId, ...updatedEscrow },
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error).message || 'An error occurred during the update.',
    };
  }
};

export const updateEscrowByDocId = async (
  firebaseService: FirebaseService,
  { docId, payload }: { docId: string; payload: Record<string, unknown> },
): Promise<{ success: boolean; message: string; data?: unknown }> => {
  try {
    const firestore = firebaseService.getFirestore();
    const docRef = firestore.collection('escrows').doc(docId);

    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error('Document not found by ID.');
    }

    const cleanedPayload = Object.fromEntries(
      Object.entries(payload).filter(([_, value]) => value !== undefined),
    );

    const updatesWithTimestamp = {
      ...cleanedPayload,
      updatedAt: new Date(),
    };

    await docRef.update(updatesWithTimestamp);

    const updatedDoc = await docRef.get();

    return {
      success: true,
      message: 'Escrow updated successfully by document ID.',
      data: { docId, ...updatedDoc.data() },
    };
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error).message || 'An error occurred during the update.',
    };
  }
};

export const getTrustlineById = async (
  firebaseService: FirebaseService,
  trustline: string,
) => {
  const firestore = firebaseService.getFirestore();
  const trustlinesRef = firestore.collection('trustlines');

  try {
    // Obtener todos los documentos en la colección "trustlines"
    const snapshot = await trustlinesRef
      .where('trustline', '==', trustline)
      .get();

    if (snapshot.empty) {
      console.log('Trustline not found in Firestore');
      return {
        success: false,
        message: 'Trustline not found.',
      };
    }

    const matchedDoc = snapshot.docs[0];
    const matchedTrustline = matchedDoc.data();

    console.log('Matched Trustline Data:', matchedTrustline);
    return {
      success: true,
      message: 'Trustline found.',
      data: matchedTrustline, // Retorna el trustline encontrado
    };
  } catch (error) {
    console.log('Error fetching trustline:', error);
    return {
      success: false,
      message:
        (error as Error).message ||
        'An error occurred while fetching the trustline.',
    };
  }
};

// Notifications
export const createNotification = async (
  firebaseService: FirebaseService,
  notification: Notification,
) => {
  const firestore = firebaseService.getFirestore();

  try {
    const newNotification = {
      ...notification,
      createdAt: new Date(),
      read: false,
    };
    await firestore.collection('notifications').add(newNotification);

    return {
      success: true,
      message: 'Notification created successfully.',
      data: newNotification,
    };
  } catch (error) {
    console.log('Error fetching trustline:', error);
    return {
      success: false,
      message:
        (error as Error).message ||
        'An error occurred while fetching the trustline.',
    };
  }
};
