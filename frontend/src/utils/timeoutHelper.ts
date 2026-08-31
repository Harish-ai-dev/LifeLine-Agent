import { doc, getDoc } from 'firebase/firestore';

export async function fetchWithTimeout(db: any, uid: string) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Firestore timeout'));
    }, 2000);

    getDoc(doc(db, 'users', uid)).then(
      (res) => {
        clearTimeout(timer);
        resolve(res);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
