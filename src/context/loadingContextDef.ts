import { createContext } from "react";

export interface LoadingContextValue {
  pendingCount: number;
  increment: () => void;
  decrement: () => void;
}

export const LoadingContext = createContext<LoadingContextValue>({
  pendingCount: 0,
  increment: () => {},
  decrement: () => {},
});
