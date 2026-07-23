import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

export type HomeActionIndex = 0 | 1 | 2;

type HomeActionContextValue = {
  activeIndex: HomeActionIndex;
  selectAction: (index: HomeActionIndex) => void;
};

const HomeActionContext = createContext<HomeActionContextValue | undefined>(undefined);

export function HomeActionProvider({ children }: PropsWithChildren) {
  const [activeIndex, setActiveIndex] = useState<HomeActionIndex>(0);
  const value = useMemo(
    () => ({ activeIndex, selectAction: setActiveIndex }),
    [activeIndex],
  );

  return (
    <HomeActionContext.Provider value={value}>
      {children}
    </HomeActionContext.Provider>
  );
}

export function useHomeAction() {
  const context = useContext(HomeActionContext);

  if (!context) {
    throw new Error("useHomeAction must be used inside HomeActionProvider");
  }

  return context;
}
