import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    User, 
    UserCredential ,
    signInWithPopup,
    sendPasswordResetEmail
  } from 'firebase/auth';
  import { auth,provider } from '../utils/firebase.ts';
  import React, { createContext, useContext, useEffect, useState } from 'react';
  
  export interface AuthContextType {
    createUser: (email: string, password: string) => Promise<UserCredential>
    loginUser: (email: string, password: string) => Promise<UserCredential>
    googleLogin:()=>Promise<UserCredential>
    changePassword:(email:string)=>Promise<void>
    logOut: () => Promise<void>
    user: User | null
    loading: boolean
  }
  
  export const AuthContext = createContext<AuthContextType>({
    createUser: async () => {
      throw new Error('AuthContext not initialized');
    },
    loginUser: async () => {
      throw new Error('AuthContext not initialized');
    },
    googleLogin:async()=>{
      throw new Error('AuthContext not initialized');
    },
    changePassword:async()=>{
      throw new Error('AuthContext not initialized');
    },
    logOut: async () => {
      throw new Error('AuthContext not initialized');
    },
    user: null,
    loading: true
  });
  
  export const useAuth = () => {
    return useContext(AuthContext);
  };
  
  interface AuthProviderProps {
    children: React.ReactNode;
  }
  
  const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    const createUser = async (email: string, password: string): Promise<UserCredential> => {
      setLoading(true);
      return createUserWithEmailAndPassword(auth, email, password);
    };
  
    const loginUser = async (email: string, password: string): Promise<UserCredential> => {
      setLoading(true);
      return signInWithEmailAndPassword(auth, email, password);
    };

    const googleLogin=async():Promise<UserCredential>=>{
      setLoading(true)
      return signInWithPopup(auth,provider)
    }

    const changePassword=async(email:string):Promise<void>=>{
      setLoading(true)
      return sendPasswordResetEmail(auth,email)
    }
  
    const logOut = async (): Promise<void> => {
      setLoading(true);
      return signOut(auth);
    };
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, []);
  
    const authValue: AuthContextType = {
      createUser,
      loginUser,
      googleLogin,
      logOut,
      changePassword,
      user,
      loading
    };
  
    return (
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    );
  };

  export default AuthProvider;
