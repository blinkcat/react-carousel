import { useLayoutEffect, useRef } from "react";

export default function usePrev<T>(value: T) {
  const ref = useRef<T>(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
