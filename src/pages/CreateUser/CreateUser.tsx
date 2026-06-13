import { useState, useEffect } from "react";
import { donviService } from "../../services/unit/unitService";
import { roleService } from "../../services/role/roleService";
import { accountService } from "../../services/account/accountService";
import type { DonVi, Role } from "../../types/account";

export default function CreateUser() {
  const [donViList, setDonViList] = useState<DonVi[]>([]);
  const [roleList, setRoleList] = useState<Role[]>([]);
  const [form, setForm] = useState({
    tenTaiKhoan: "",
    tenDangNhap: "",
    matkhau: "",
    donVi: "",
    vaiTro: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string[]>([]);

  useEffect(() => {
    donviService.getDonVi().then(setDonViList).catch(console.error);
    roleService.getRoles().then(setRoleList).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await accountService.createAccount(form);
      setCreated((prev) => [
        ...prev,
        `${form.tenTaiKhoan} (${form.tenDangNhap})`,
      ]);
      setForm((f) => ({ ...f, tenTaiKhoan: "", tenDangNhap: "", matkhau: "" }));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Lỗi tạo tài khoản";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Inline styles đơn giản
  const s = {
    page: {
      maxWidth: 520,
      margin: "40px auto",
      padding: "0 16px",
      fontFamily: "sans-serif",
    } as React.CSSProperties,
    card: {
      background: "#fff",
      border: "1px solid #ddd",
      borderRadius: 12,
      padding: 32,
    } as React.CSSProperties,
    title: {
      fontSize: 22,
      fontWeight: 700,
      marginBottom: 24,
    } as React.CSSProperties,
    label: {
      display: "block",
      fontWeight: 600,
      marginBottom: 6,
      fontSize: 14,
    } as React.CSSProperties,
    input: {
      width: "100%",
      padding: "9px 12px",
      border: "1px solid #ccc",
      borderRadius: 8,
      fontSize: 14,
      boxSizing: "border-box" as const,
      marginBottom: 16,
    },
    btn: {
      width: "100%",
      padding: "11px",
      background: "#218673",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
    } as React.CSSProperties,
    error: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "10px 14px",
      borderRadius: 8,
      marginBottom: 16,
      fontSize: 14,
    } as React.CSSProperties,
    success: { marginTop: 24 } as React.CSSProperties,
    item: {
      padding: "6px 0",
      borderBottom: "1px solid #eee",
      fontSize: 14,
    } as React.CSSProperties,
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.title}>Tạo tài khoản nhanh</div>
        {error && <div style={s.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <label style={s.label}>Tên tài khoản</label>
          <input
            style={s.input}
            value={form.tenTaiKhoan}
            onChange={(e) =>
              setForm((f) => ({ ...f, tenTaiKhoan: e.target.value }))
            }
            required
          />

          <label style={s.label}>Tên đăng nhập</label>
          <input
            style={s.input}
            value={form.tenDangNhap}
            onChange={(e) =>
              setForm((f) => ({ ...f, tenDangNhap: e.target.value }))
            }
            required
          />

          <label style={s.label}>Mật khẩu</label>
          <input
            style={s.input}
            type="password"
            value={form.matkhau}
            onChange={(e) =>
              setForm((f) => ({ ...f, matkhau: e.target.value }))
            }
            required
          />

          <label style={s.label}>Đơn vị</label>
          <select
            style={s.input}
            value={form.donVi}
            onChange={(e) => setForm((f) => ({ ...f, donVi: e.target.value }))}
            required
          >
            <option value="">-- Chọn đơn vị --</option>
            {donViList.map((d) => (
              <option key={d.maDonVi} value={d.maDonVi}>
                {d.tenDonvi} ({d.kyhieuDonvi})
              </option>
            ))}
          </select>

          <label style={s.label}>Vai trò</label>
          <select
            style={s.input}
            value={form.vaiTro}
            onChange={(e) => setForm((f) => ({ ...f, vaiTro: e.target.value }))}
            required
          >
            <option value="">-- Chọn vai trò --</option>
            {roleList.map((r) => (
              <option key={r.idVaiTro ?? ""} value={r.idVaiTro ?? ""}>
                {r.tenVaiTro}
              </option>
            ))}
          </select>

          <button style={s.btn} type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo tài khoản"}
          </button>
        </form>

        {created.length > 0 && (
          <div style={s.success}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>
              Đã tạo ({created.length}):
            </div>
            {created.map((name, i) => (
              <div key={i} style={s.item}>
                ✓ {name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
