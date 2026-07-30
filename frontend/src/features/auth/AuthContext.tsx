import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../../api/auth";

interface AuthContextValue {
  username: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .getCurrentAdmin()
      .then((admin) => setUsername(admin.username))
      .catch(() => setUsername(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (usernameInput: string, password: string) => {
    const admin = await authApi.login(usernameInput, password);
    setUsername(admin.username);
  };

  const logout = async () => {
    await authApi.logout();
    setUsername(null);
  };

  return (
    <AuthContext.Provider value={{ username, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
