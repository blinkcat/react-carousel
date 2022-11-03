import { createContext } from "react";
import { CarouselStore } from "./core";

export const ReduxStoreContext = createContext<CarouselStore>(null as any);
