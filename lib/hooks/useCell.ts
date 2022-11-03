import { useLayoutEffect, useMemo, useRef } from 'react';
import { getUniqueCellId } from '../core';
import useDispatch from './useDispatch';
import { addCell, removeCell, updateCellIndex, updateCellSize } from '../core/actions/cells';
import getSize from '../utils/get-size';

export default function useCell(index: number) {
  const id = useMemo(() => getUniqueCellId(), []);
  const dispatch = useDispatch();
  const cellRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    dispatch(addCell(id));

    if (cellRef.current) {
      dispatch(updateCellSize(id, getSize(cellRef.current)));
    }

    return () => {
      dispatch(removeCell(id));
    };
  }, [dispatch, id]);

  useLayoutEffect(() => {
    dispatch(updateCellIndex(id, index));
  }, [dispatch, index, id]);

  return [id, cellRef] as [string, React.RefObject<HTMLElement>];
}
