import { useState, useEffect, useCallback, type ReactNode } from "react";
import { accountService } from "../services/account/accountService";
import { donviService } from "../services/unit/unitService";
import { roleService } from "../services/role/roleService";
import { storage } from "../utils/storage";
import type { Account, Role, DonVi } from "../types/account";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = storage.getToken();

  const [account, setAccount] = useState<Account | null>(null);
  const [donVi, setDonVi] = useState<DonVi | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(!!token);

  const fetchData = useCallback(async () => {
    try {
      const accountResponse = await accountService.getAccount();

      if (accountResponse.success) {
        setAccount(accountResponse.Result);

        if (accountResponse.Result.vaiTro?.idVaiTro) {
          const roleData = await roleService.getRoleById(
            accountResponse.Result.vaiTro.idVaiTro,
          );
          setAccount((prev) =>
            prev
              ? {
                  ...prev,
                  vaiTro: roleData,
                }
              : null,
          );
          setRoles([roleData]);
        }

        if (accountResponse.Result.donVi?.maDonVi) {
          const allDonVi = await donviService.getDonVi();
          const donViData = allDonVi.find(
            (dv) => dv.maDonVi === accountResponse.Result.donVi?.maDonVi,
          );
          setDonVi(donViData || null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch auth data:", error);
      storage.removeToken();
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      if (token && active) {
        await fetchData();
      }
    };

    initAuth();

    return () => {
      active = false;
    };
  }, [fetchData, token]);

  const hasRole = useCallback(
    (roleName: string): boolean => account?.vaiTro?.tenVaiTro === roleName,
    [account?.vaiTro?.tenVaiTro],
  );

  const isParentUnit = useCallback((): boolean => {
    return donVi ? donVi.donViCon.length > 0 : false;
  }, [donVi]);

  const hasChildUnits = useCallback((): boolean => {
    return isParentUnit();
  }, [isParentUnit]);

  const getChildUnits = useCallback((): DonVi[] => {
    if (!donVi || !donVi.donViCon.length) return [];
    return donVi.donViCon.map((childName) => ({
      maDonVi: "",
      tenDonvi: childName,
      donViCha: donVi.tenDonvi,
      donViCon: [],
      kyhieuDonvi: "",
      quanSoHsqBs: 0,
      quanSoQncn: 0,
      quanSoSiQuan: 0,
      quanSoTong: 0,
      createdAt: "",
      updatedAt: "",
      deletedAt: null,
      isDeleted: false,
    }));
  }, [donVi]);

  const refreshAccount = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  const clearAuth = useCallback(() => {
    setAccount(null);
    setDonVi(null);
    setRoles([]);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        account,
        donVi,
        roles,
        loading,
        hasRole,
        isParentUnit,
        hasChildUnits,
        getChildUnits,
        refreshAccount,
        clearAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
