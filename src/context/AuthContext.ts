import { createContext } from "react";
import type { Account, Role, DonVi } from "../types/account";

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
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
