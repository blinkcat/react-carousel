import { State } from './reducers/cells';

export function cells2Array(target: State) {
  return Object.keys(target)
    .sort((a, b) => target[a].index - target[b].index)
    .map((k) => target[k]);
}

let id = 0;

export function getUniqueCellId() {
  return `Cell ${id++}`;
}

export function mod(a: number, b: number) {
  return ((a % b) + b) % b;
}
