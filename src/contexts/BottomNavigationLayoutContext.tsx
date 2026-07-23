import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";

export const DEFAULT_BOTTOM_AREA_HEIGHT = 220;

type BottomNavigationLayoutContextValue = {
  bottomAreaHeight: number;
  setBottomAreaHeight: (height: number) => void;
};

const BottomNavigationLayoutContext = createContext<
  BottomNavigationLayoutContextValue | undefined
>(undefined);

export function BottomNavigationLayoutProvider({ children }: PropsWithChildren) {
  const [bottomAreaHeight, setMeasuredHeight] = useState(DEFAULT_BOTTOM_AREA_HEIGHT);
  const setBottomAreaHeight = useCallback((height: number) => {
    setMeasuredHeight((currentHeight) =>
      Math.abs(currentHeight - height) < 0.5 ? currentHeight : height,
    );
  }, []);
  const value = useMemo(
    () => ({ bottomAreaHeight, setBottomAreaHeight }),
    [bottomAreaHeight, setBottomAreaHeight],
  );

  return (
    <BottomNavigationLayoutContext.Provider value={value}>
      {children}
    </BottomNavigationLayoutContext.Provider>
  );
}

export function useBottomNavigationLayout() {
  const context = useContext(BottomNavigationLayoutContext);

  if (!context) {
    throw new Error(
      "useBottomNavigationLayout must be used inside BottomNavigationLayoutProvider",
    );
  }

  return context;
}
