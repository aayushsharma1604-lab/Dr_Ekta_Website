"use client";

import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loginRequest, logoutRequest } from "@/store/slices/authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, loading, error } = useAppSelector((state) => state.auth);

  const handleLogin = (credentials: { email: string; password: string }) => {
    dispatch(loginRequest(credentials));
  };

  const handleLogout = () => {
    dispatch(logoutRequest());
  };

  return { isAuthenticated, user, loading, error, login: handleLogin, logout: handleLogout };
}
