import { useDebugValue } from "react";
import useSyncExternalStoreExports from "use-sync-external-store/shim/with-selector";
import { CarouselState } from "../core";
import useStore from "./useStore";

const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports;

export default function useSelector<Selected>(
  selector: (state: CarouselState) => Selected,
  equalityFn?: (a: Selected, b: Selected) => boolean
): Selected {
  const store = useStore();
  const selectedState = useSyncExternalStoreWithSelector(
    store.subscribe,
    store.getState,
    store.getState,
    selector,
    equalityFn
  );

  useDebugValue(selectedState);

  return selectedState;
}

// forked from https://github.com/pmndrs/zustand/blob/v4.1.4/src/shallow.ts
export function shallow<T>(objA: T, objB: T) {
  if (Object.is(objA, objB)) {
    return true;
  }
  if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) {
    return false;
  }
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof T])
    ) {
      return false;
    }
  }
  return true;
}
