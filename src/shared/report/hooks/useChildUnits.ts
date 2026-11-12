import { useEffect, useState } from "react";
import { donviService } from "../../../services/unit/unitService";
import type { DonVi } from "../../../types/account";
import { getDirectChildUnits } from "../utils/reportUnitTree";

export function useChildUnits(
  maDonViCurrent: string | undefined,
  isParentUnit: boolean,
  forceLoadChildren: boolean = false,
): { childUnits: DonVi[]; currentUnit: DonVi | null; allUnits: DonVi[] } {
  const [childUnits, setChildUnits] = useState<DonVi[]>([]);
  const [currentUnit, setCurrentUnit] = useState<DonVi | null>(null);
  const [allUnits, setAllUnits] = useState<DonVi[]>([]);

  useEffect(() => {
    const fetchDonViInfo = async () => {
      if (!maDonViCurrent) {
        setChildUnits([]);
        setCurrentUnit(null);
        setAllUnits([]);
        return;
      }
      try {
        const units = await donviService.getDonVi();
        setAllUnits(units);
        setCurrentUnit(units.find((u) => u.maDonVi === maDonViCurrent) ?? null);
        setChildUnits(
          isParentUnit || forceLoadChildren
            ? getDirectChildUnits(units, maDonViCurrent)
            : [],
        );
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Không thể tải thông tin đơn vị:", err);
        }
        setChildUnits([]);
        setCurrentUnit(null);
        setAllUnits([]);
      }
    };
    void fetchDonViInfo();
  }, [maDonViCurrent, isParentUnit, forceLoadChildren]);

  return { childUnits, currentUnit, allUnits };
}
