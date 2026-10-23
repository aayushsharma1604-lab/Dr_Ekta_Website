"use client";

import { useAppDispatch } from "@/store/hooks";
import { logoutRequest } from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const dispatch = useAppDispatch();

  return (
    <Button variant="destructive" onClick={() => dispatch(logoutRequest())}>
      Logout
    </Button>
  );
}
