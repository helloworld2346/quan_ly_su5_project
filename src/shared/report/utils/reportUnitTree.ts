import type { DonVi } from "../../../types/account";

export function getDirectChildUnits(
  allUnits: DonVi[],
  maDonViCurrent: string,
): DonVi[] {
  return allUnits.filter((u) => {
    if (!u.maDonVi.startsWith(maDonViCurrent + ".")) return false;
    const suffix = u.maDonVi.slice(maDonViCurrent.length + 1);
    return !suffix.includes(".");
  });
}
