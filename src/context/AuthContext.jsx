import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import api from "../utils/api";
import { deriveKey } from "../utils/crypto";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  encryptionKey: null,
  isAuthenticated: false,
  isLoading: true,
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        encryptionKey: action.payload.encryptionKey ?? state.encryptionKey,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "DONE_LOADING":
      return { ...state, isLoading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // restore session on page refresh
  useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        dispatch({ type: "DONE_LOADING" });
        return;
      }

      try {
        const res = await api.get("/auth/me");
        const encryptionKey = sessionStorage.getItem("encKey") || null;
        dispatch({
          type: "SET_USER",
          payload: { user: res.data.data.user, encryptionKey },
        });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        dispatch({ type: "DONE_LOADING" });
      }
    };
    restore();
  }, []);

  // forced logout from api interceptor
  useEffect(() => {
    const handler = () => {
      sessionStorage.removeItem("encKey");
      dispatch({ type: "LOGOUT" });
    };
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { user, accessToken, refreshToken } = res.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const key = deriveKey(email, password);
    sessionStorage.setItem("encKey", key);

    dispatch({ type: "SET_USER", payload: { user, encryptionKey: key } });
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    const { user, accessToken, refreshToken } = res.data.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const key = deriveKey(email, password);
    sessionStorage.setItem("encKey", key);

    dispatch({ type: "SET_USER", payload: { user, encryptionKey: key } });
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("encKey");
    dispatch({ type: "LOGOUT" });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
