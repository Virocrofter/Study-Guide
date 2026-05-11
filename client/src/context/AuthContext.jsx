import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

// Clean the URL to prevent double slashes
const rawBaseUrl = import.meta.env.VITE_BACKEND_URL || "";
const BACKEND_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const api = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, 
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSession = useCallback(async () => {
    if (!BACKEND_URL) return setLoading(false);
    try {
      const res = await api.get("/api/auth/session");
      setUser(res.data?.user || null);
    } catch (err) {
      console.error("Session fetch failed", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchSession(); 
  }, [fetchSession]);

  const login = () => {
    if (!BACKEND_URL) {
      return console.error("VITE_BACKEND_URL is missing!");
    }
    // Correct Path Construction
    window.location.href = `${BACKEND_URL}/api/auth/signin/google`;
  };

  const logout = () => {
    window.location.href = `${BACKEND_URL}/api/auth/signout`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);