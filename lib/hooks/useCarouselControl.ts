import { useMemo } from 'react';
import { next, previous } from '../core/actions/slider';
import useDispatch from './useDispatch';

export default function useCarouselControl() {
  const dispatch = useDispatch();

  return useMemo(
    () => ({
      previous(instant = false) {
        dispatch(previous(instant));
      },
      next(instant = false) {
        dispatch(next(instant));
      },
    }),
    [dispatch]
  );
}
