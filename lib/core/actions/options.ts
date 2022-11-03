import { actionTypes, State } from '../reducers/options';
import { CarouselThunkAction } from '../types';
import { reLayout, ReLayoutReason } from './carousel';

export function updateOptions(options: Partial<State>): CarouselThunkAction {
  return (dispatch, getState) => {
    const { options: prevOptions } = getState();

    for (const k in options) {
      // for typescript
      const kk = k as keyof typeof options;

      if (options[kk] !== prevOptions[kk]) {
        dispatch({
          type: actionTypes.update,
          payload: options,
        });
        dispatch(reLayout(ReLayoutReason.OptionsChanged));
        return;
      }
    }
  };
}
