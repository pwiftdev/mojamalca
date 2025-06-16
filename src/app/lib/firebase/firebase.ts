import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBY_JTjuD_Zy1h6s4EvhHbfZt0rDnkDLYc",
  authDomain: "mojamalca.firebaseapp.com",
  projectId: "mojamalca",
  storageBucket: "mojamalca.firebasestorage.app",
  messagingSenderId: "260483169855",
  appId: "1:260483169855:web:b0a568fd4e734bef91828a"
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth } 