import { createContext } from "react";
import type { Account, Role, DonVi } from "../types/account";
import type { Notification } from "../components/ui/NotificationBell/NotificationBell";

export interface AuthContextType {
  account: Account | null;
  donVi: DonVi | null;
  roles: Role[];
  loading: boolean;
  hasRole: (roleName: string) => boolean;
  isParentUnit: () => boolean;
  hasChildUnits: () => boolean;
  getChildUnits: () => DonVi[];
  refreshAccount: () => Promise<void>;
  clearAuth: () => void;
  notifications: Notification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearRead: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
