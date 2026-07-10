import api from "../api";
import type {
  NhatKyPage,
  NhatKySearchPayload,
  NhatKySearchParams,
  NhatKySearchResponse,
} from "../../types/auditLog";

function cleanPayload(payload: NhatKySearchPayload): NhatKySearchPayload {
  const out: NhatKySearchPayload = {};
  (Object.keys(payload) as (keyof NhatKySearchPayload)[]).forEach((k) => {
    const v = payload[k];
    if (v !== undefined && v !== null && v !== "") {
      out[k] = v;
    }
  });
  return out;
}

export const auditLogService = {
  search: async (
    payload: NhatKySearchPayload,
    params: NhatKySearchParams,
  ): Promise<NhatKyPage> => {
    const response = await api.post<NhatKySearchResponse>(
      "/nhatky/search",
      cleanPayload(payload),
      {
        params: {
          page: params.page,
          size: params.size,
          sortBy: params.sortBy ?? "createdAt",
          direction: params.direction ?? "DESC",
        },
      },
    );
    return response.data.Result;
  },
};
