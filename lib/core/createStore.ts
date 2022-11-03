import { applyMiddleware, legacy_createStore as createReduxStore, compose } from "redux";
import thunk from "redux-thunk";
import { rootReducer } from "./reducers";

export function createStore(debug = false) {
  /**
   * @see https://github.com/reduxjs/redux-devtools/tree/main/extension#11-basic-store
   */
  const composeEnhancers =
    (debug && typeof window === "object" && (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ||
    compose;

  return createReduxStore(rootReducer, composeEnhancers(applyMiddleware(thunk)));
}
