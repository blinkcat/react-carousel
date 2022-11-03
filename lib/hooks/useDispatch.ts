import { CarouselDispatch } from '../core';
import useStore from './useStore';

export default function useDispatch() {
  return useStore().dispatch as CarouselDispatch;
}
