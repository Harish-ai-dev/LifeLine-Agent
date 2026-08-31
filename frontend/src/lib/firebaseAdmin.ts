import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(), // or supply service account creds
    projectId: "lifeline-3725b",
  });
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth };
