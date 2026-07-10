import { useEffect, useState } from "react";
import { donviService } from "../../../services/unit/unitService";
import type { DonVi } from "../../../types/account";
import { getDirectChildUnits } from "../utils/reportUnitTree";

export function useChildUnits(
  maDonViCurrent: string | undefined,
  isParentUnit: boolean,
): { childUnits: DonVi[]; currentUnit: DonVi | null } {
  const [childUnits, setChildUnits] = useState<DonVi[]>([]);
  const [currentUnit, setCurrentUnit] = useState<DonVi | null>(null);

  useEffect(() => {
    const fetchDonViInfo = async () => {
      if (!maDonViCurrent) {
        setChildUnits([]);
        setCurrentUnit(null);
        return;
      }
      try {
        const allUnits = await donviService.getDonVi();
        setCurrentUnit(
          allUnits.find((u) => u.maDonVi === maDonViCurrent) ?? null,
        );
        setChildUnits(
          isParentUnit ? getDirectChildUnits(allUnits, maDonViCurrent) : [],
        );
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Không thể tải thông tin đơn vị:", err);
        }
        setChildUnits([]);
        setCurrentUnit(null);
      }
    };
    void fetchDonViInfo();
  }, [maDonViCurrent, isParentUnit]);

  return { childUnits, currentUnit };
}
