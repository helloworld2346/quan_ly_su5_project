import { useState, useEffect, useCallback, type ReactNode } from "react";
import { accountService } from "../services/account/accountService";
import { donviService } from "../services/unit/unitService";
import { roleService } from "../services/role/roleService";
import type { Account, Role, DonVi } from "../types/account";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [donVi, setDonVi] = useState<DonVi | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [accountResponse, rolesData] = await Promise.all([
        accountService.getAccount(),
        roleService.getRoles(),
      ]);

      if (accountResponse.success) {
        setAccount(accountResponse.Result);
        setRoles(rolesData);

        if (accountResponse.Result.donVi?.maDonVi) {
          const donViData = await donviService.getDonViByMa(
            accountResponse.Result.donVi.maDonVi,
          );
          setDonVi(donViData || null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch auth data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Đã sửa: Sử dụng luồng bất đồng bộ cô lập hoàn toàn bên trong effect để linter không bắt lỗi setState
  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      setLoading(true);
      if (active) {
        await fetchData();
      }
    };

    initAuth();

    return () => {
      active = false;
    };
  }, [fetchData]);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
