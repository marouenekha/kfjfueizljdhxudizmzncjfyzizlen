// Configuration Firebase
// IMPORTANT: Remplacez ces valeurs par vos clés Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Importez Firebase quand vous aurez vos clés
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);

// Pour l'instant, exportons des fonctions mockées
export const auth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock login:', email);
    return { user: { uid: '123', email } };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    console.log('Mock signup:', email);
    return { user: { uid: '123', email } };
  },
  signOut: async () => {
    console.log('Mock logout');
  }
};

export const signInWithPopup = async (auth: any, provider: any) => {
  console.log('Mock social login');
  return { user: { uid: '123', email: 'user@example.com' } };
};

export const GoogleAuthProvider = class {
  static credential = () => ({});
};

export const FacebookAuthProvider = class {
  static credential = () => ({});
};