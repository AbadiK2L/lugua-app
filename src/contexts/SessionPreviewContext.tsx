import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import type { UserRole } from "@/src/types/profile";

type SessionPreviewContextValue = {
  role: UserRole | null;
  selectRole: (role: UserRole) => void;
  clearSession: () => void;
};

const SessionPreviewContext = createContext<
  SessionPreviewContextValue | undefined
>(undefined);

export function SessionPreviewProvider({ children }: PropsWithChildren) {
  const [role, setRole] = useState<UserRole | null>(null);
  const value = useMemo(
    () => ({
      role,
      selectRole: setRole,
      clearSession: () => setRole(null),
    }),
    [role],
  );

  return (
    <SessionPreviewContext.Provider value={value}>
      {children}
    </SessionPreviewContext.Provider>
  );
}

export function useSessionPreview() {
  const context = useContext(SessionPreviewContext);

  if (!context) {
    throw new Error(
      "useSessionPreview doit être utilisé dans SessionPreviewProvider",
    );
  }

  return context;
}
