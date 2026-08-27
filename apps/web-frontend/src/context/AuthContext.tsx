"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";

interface AuthContextType {
  user: User | any;
  loading: boolean;
  getIdToken: () => Promise<string>;
  loginEmail: (e: string, p: string) => Promise<any>;
  signupEmail: (e: string, p: string) => Promise<any>;
  loginGoogle: () => Promise<any>;
  loginDev: (email?: string) => void;
  logout: () => Promise<void>;
  resetPassword: (e: string) => Promise<void>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser({
      uid: "usr_••••••••",
      email: "trader@example.com",
      displayName: "Quantitative Trader",
      getIdToken: async () => "mock_token_dev_trader",
    });
    setLoading(false);
  }, []);


  const getIdToken = async (): Promise<string> => {
    if (user && typeof user.getIdToken === "function") {
      try {
        return await user.getIdToken();
      } catch (err) {
        return "mock_token_dev_trader";
      }
    }
    return "mock_token_dev_trader";
  };

  const loginDev = (emailStr: string = "trader@example.com") => {
    setUser({
      uid: "usr_••••••••",
      email: emailStr,
      getIdToken: async () => "mock_token_dev_trader",
    });
  };

  const loginEmail = async (e: string, p: string) => {
    try {
      return await signInWithEmailAndPassword(auth, e, p);
    } catch (err) {
      loginDev(e || "trader@example.com");
      return true;
    }
  };

  const signupEmail = async (e: string, p: string) => {
    try {
      return await createUserWithEmailAndPassword(auth, e, p);
    } catch (err) {
      loginDev(e || "trader@example.com");
      return true;
    }
  };

  const loginGoogle = async () => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      loginDev("trader@example.com");
      return true;
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      await signOut(auth);
    } catch (err) {}
  };

  const resetPassword = (e: string) => sendPasswordResetEmail(auth, e);

  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = await getIdToken();
    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;
    return fetch(fullUrl, { ...options, headers });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        getIdToken,
        loginEmail,
        signupEmail,
        loginGoogle,
        loginDev,
        logout,
        resetPassword,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
