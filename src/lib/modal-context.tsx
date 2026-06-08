import { createContext, useContext, useState, type ReactNode } from "react";

interface ModalContextType {
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <ModalContext.Provider value={{ modalOpen, setModalOpen }}>{children}</ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
}
