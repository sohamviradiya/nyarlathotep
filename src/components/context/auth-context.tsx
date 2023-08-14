"use client";

import { useState, useEffect, useContext, createContext } from 'react';

export const AuthContext = createContext({ email: "", setEmail: (email: string) => { } });

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [auth, setAuth] = useState<{ email: string }>({
        email: "",
    });
    const setEmail = (email: string) => {
        setAuth({ email });
    };
    return (
        <AuthContext.Provider value={{ ...auth, setEmail }}>
            {children}
        </AuthContext.Provider>
    );
};
