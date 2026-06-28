import { useState, useEffect, useCallback, type ReactNode } from "react";
import { accountService } from "../services/account/accountService";
import { donviService } from "../services/unit/unitService";
import { roleService } from "../services/role/roleService";
import { storage } from "../utils/storage";
import type { Account, Role, DonVi } from "../types/account";
import { AuthContext } from "./AuthContext";
import { WebSocketLink } from "../services/websocket/WebSocket";
import { notificationService } from "../services/notification/notificationService";
import { notificationStorage } from "../utils/notificationStorage";
import type { Notification } from "../components/ui/NotificationBell/NotificationBell";
import type { ApiNotification } from "../types/notification";
import { useToast } from "./useToast";
import { generateId } from "../utils/uuid";  


function mapApiNotification(n: ApiNotification): Notification {
  return {
    id: n.idThongbao,
    title: n.tieuDe,
    message: n.noiDung,
    time: n.thoiGian ?? new Date().toISOString(),
    isRead: n.daDoc,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = storage.getToken();

  const [account, setAccount] = useState<Account | null>(null);
  const [donVi, setDonVi] = useState<DonVi | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(!!token);
  const [notifications, setNotifications] = useState<Notification[]>(() =>
    notificationStorage.get(),
  );
  const [showForceLogout, setShowForceLogout] = useState(false);
  const { showError, showSuccess } = useToast();

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

        const notifId = accountResponse.Result.donVi?.maDonVi;

        if (notifId) {
          try {
            const apiNotifs =
              await notificationService.getNotifications(notifId);
            const mapped = (apiNotifs.Result ?? []).map(mapApiNotification);
            notificationStorage.set(mapped);
            setNotifications(mapped);
          } catch {
            // Không block auth nếu notification lỗi
          }
        }
      }

      const connectWebSocket = () => {
        WebSocketLink.setOnOpen(() => {
          WebSocketLink.send({
            type: "REGISTER",
            role: accountResponse.Result.vaiTro?.idVaiTro ?? "",
            donViId: accountResponse.Result.donVi?.maDonVi ?? "",
            userId: accountResponse.Result.idTaiKhoan,
            token: storage.getToken() ?? "",
          });
        });

        WebSocketLink.setOnMessage((data) => {
          const msg = data as {
            type?: string;
            title?: string;
            message?: string;
            id?: string;
          };

          if (msg.type === "FORCE_LOGOUT") {
            setShowForceLogout(true);
            setTimeout(() => {
              localStorage.clear();
              window.location.href = "/login";
            }, 2500);
            return;
          }

          if (msg.title || msg.message) {
            const newNotif: Notification = {
              id: msg.id ?? generateId(),
              title: msg.title ?? "",
              message: msg.message ?? "",
              time: new Date().toISOString(),
              isRead: false,
            };
            setNotifications((prev) => {
              const updated = [newNotif, ...prev];
              notificationStorage.set(updated);
              return updated;
            });
            window.dispatchEvent(
              new CustomEvent("new-notification", { detail: newNotif }),
            );
          }

          window.dispatchEvent(new CustomEvent("report-data-changed"));

          if (msg.type === "URGENT" || msg.type === "WARNING") {
            showError(`${msg.title}: ${msg.message}`);
          } else if (msg.title) {
            showSuccess(`${msg.title}: ${msg.message}`);
          }
        });

        WebSocketLink.connect();
      };
      connectWebSocket();
    } catch (error) {
      console.error("Failed to fetch auth data:", error);
      storage.removeToken();
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, [showError, showSuccess]);

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
      capDonVi: null,
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

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      );
      notificationStorage.set(updated);
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      notificationStorage.set(updated);
      return updated;
    });
  }, []);

  const clearRead = useCallback(() => {
    const maDonVi = account?.donVi?.maDonVi;
    if (maDonVi) {
      void notificationService.deleteReadNotifications(maDonVi);
    }
    setNotifications((prev) => {
      const updated = prev.filter((n) => !n.isRead);
      notificationStorage.set(updated);
      return updated;
    });
  }, [account?.donVi?.maDonVi]);

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
        notifications,
        markRead,
        markAllRead,
        clearRead,
      }}
    >
      {children}
      {showForceLogout && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "32px 40px",
              textAlign: "center",
              maxWidth: "360px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            }}
          >
            <p
              style={{
                fontSize: "18px",
                fontWeight: 600,
                marginBottom: "8px",
                color: "#d32f2f",
              }}
            >
              Phiên đăng nhập bị ngắt
            </p>
            <p style={{ color: "#444", marginBottom: "16px" }}>
              Tài khoản này vừa đăng nhập ở thiết bị khác.
            </p>
            <p style={{ color: "#999", fontSize: "14px" }}>
              Tự động đăng xuất sau vài giây...
            </p>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
