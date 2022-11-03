import { useContext } from "react";
import { ReduxStoreContext } from "../ReduxStoreContext";

export default function useStore() {
  const store = useContext(ReduxStoreContext);

  if (store == null) {
    throw Error("redux store must be created first");
  }

  return store;
}
