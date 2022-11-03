import { combineReducers } from 'redux';
import { reducer as cellsReducer } from './cells';
import { reducer as slidesReducer } from './slides';
import { reducer as carouselReducer } from './carousel';
import { reducer as animationReducer } from './animation';
import { reducer as sliderReducer } from './slider';
import { reducer as optionsReducer } from './options';
import { reducer as dragReducer } from './drag';

export const rootReducer = combineReducers({
  cells: cellsReducer,
  slides: slidesReducer,
  carousel: carouselReducer,
  animation: animationReducer,
  slider: sliderReducer,
  options: optionsReducer,
  drag: dragReducer,
});
