import { useContext } from "react";
import { LoadingContext } from "./loadingContextDef";

export function useLoading() {
  return useContext(LoadingContext);
}
