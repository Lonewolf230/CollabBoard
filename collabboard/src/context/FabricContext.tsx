// context/FabricContext.tsx
import { createContext, useContext } from "react";
import * as fabric from "fabric";

export const FabricContext = createContext<fabric.Canvas | null>(null);
export const useFabric = () => useContext(FabricContext);
