import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("token")
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        console.log('Restored user from localStorage:', parsed);
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved user data:', e);
        return null;
      }
    }
    return null;
  });

  const login = (token, userData) => {
    console.log('AuthContext.login called with userData:', userData);
    setAccessToken(token);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    // Verify storage
    console.log('Stored in localStorage - token:', !!token, 'user role:', userData?.role);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}



