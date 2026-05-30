import { useState } from "react";

export function useNavGroupState(
  storageKey: string,
  defaultValue: boolean = false,
): [boolean, (value: boolean) => void] {
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? saved === "true" : defaultValue;
  });

  const setOpen = (value: boolean) => {
    setIsOpen(value);
    localStorage.setItem(storageKey, String(value));
  };

  return [isOpen, setOpen];
}
