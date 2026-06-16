import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface EnrollContextValue {
  isOpen: boolean;
  preselectedCourseId: string | null;
  openEnroll: (academicCourseId?: string | null) => void;
  closeEnroll: () => void;
}

const EnrollContext = createContext<EnrollContextValue | null>(null);

export function EnrollProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [preselectedCourseId, setPreselectedCourseId] = useState<string | null>(null);

  const openEnroll = useCallback((academicCourseId?: string | null) => {
    setPreselectedCourseId(academicCourseId ?? null);
    setIsOpen(true);
  }, []);

  const closeEnroll = useCallback(() => setIsOpen(false), []);

  return (
    <EnrollContext.Provider value={{ isOpen, preselectedCourseId, openEnroll, closeEnroll }}>
      {children}
    </EnrollContext.Provider>
  );
}

export function useEnroll(): EnrollContextValue {
  const ctx = useContext(EnrollContext);
  if (!ctx) throw new Error("useEnroll must be used within EnrollProvider");
  return ctx;
}
