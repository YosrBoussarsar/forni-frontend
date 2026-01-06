import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("token")
  );

  const login = (token) => {
    setAccessToken(token);
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setAccessToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}



