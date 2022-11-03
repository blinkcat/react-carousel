import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Carousel from '../../lib';
import Navigation from '../../lib/features/Navigation';
import './index.css';

const initialState = {
  cells: [1, 2, 3, 4, 5, 6, 7, 8],
  count: 9,
  loop: false,
  cellAlign: 'center',
  groupCells: 1,
  freeScroll: false,
  draggable: true,
  friction: 28,
  attraction: 25,
  freeScrollFriction: 75,
  direction: 'horizontal',
  initialIndex: 0,
};

const storageKey = 'react-carousel-demo';

const App: React.FC = () => {
  const [state, setState] = useState<typeof initialState>(() => {
    const serializeState = sessionStorage.getItem(storageKey);

    if (serializeState) {
      return JSON.parse(serializeState);
    }

    return initialState;
  });
  const {
    freeScroll,
    loop,
    cellAlign,
    groupCells,
    direction,
    draggable,
    friction,
    attraction,
    freeScrollFriction,
    initialIndex,
  } = state;

  useEffect(() => {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  return (
    <>
      <div className="carousel-wrap">
        <Carousel
          direction={direction as any}
          freeScroll={freeScroll}
          loop={loop}
          extra={<Navigation />}
          debug
          cellAlign={cellAlign as any}
          groupCells={groupCells}
          className={direction === 'horizontal' ? 'carousel' : 'carousel vertical'}
          draggable={draggable}
          friction={friction / 100}
          attraction={attraction / 1000}
          freeScrollFriction={freeScrollFriction / 1000}
          initialIndex={initialIndex}
        >
          {state.cells.map((v) => (
            <PlaceHolder key={v} className={direction === 'horizontal' ? '' : 'vertical'}>
              {v}
            </PlaceHolder>
          ))}
        </Carousel>
      </div>
      <div className="options">
        <div className="item">
          <h3>add</h3>
          <button
            onClick={() => {
              setState((state) => {
                return {
                  ...state,
                  cells: [...state.cells, state.count],
                  count: state.count + 1,
                };
              });
            }}
          >
            append
          </button>
          <button
            onClick={() => {
              setState((state) => {
                return {
                  ...state,
                  cells: [state.count, ...state.cells],
                  count: state.count + 1,
                };
              });
            }}
          >
            prepend
          </button>
          <button
            onClick={() => {
              const i = Math.floor(Math.random() * state.cells.length);
              const old = [...state.cells];

              old.splice(i, 0, state.count + 1);
              setState((state) => {
                return {
                  ...state,
                  cells: old,
                  count: state.count + 1,
                };
              });
            }}
          >
            random
          </button>

          <h3>remove</h3>
          {state.cells.map((v, i) => (
            <button
              onClick={() => {
                const old = [...state.cells];

                old.splice(i, 1);
                setState((state) => {
                  return {
                    ...state,
                    cells: old,
                  };
                });
              }}
              key={v}
            >
              {v}
            </button>
          ))}

          <h3>reset</h3>
          <button onClick={() => setState(initialState)}>reset</button>
        </div>
        <div className="item">
          <h3>direction</h3>
          <label>
            <input
              type="radio"
              value="horizontal"
              checked={direction === 'horizontal'}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, direction: e.target.value };
                });
              }}
            />
            <span>horizontal</span>
          </label>
          <label>
            <input
              type="radio"
              value="vertical"
              checked={direction === 'vertical'}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, direction: e.target.value };
                });
              }}
            />
            <span>vertical</span>
          </label>
        </div>
        <div className="item">
          <h3>loop</h3>
          <label>
            <input
              type="checkbox"
              checked={loop}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, loop: e.target.checked };
                });
              }}
            />
            <span>loop</span>
          </label>
        </div>
        <div className="item">
          <h3>cellAlign</h3>
          <label>
            <input
              type="radio"
              name="cellAlign"
              value="left"
              defaultChecked={cellAlign === 'left'}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, cellAlign: e.target.value };
                });
              }}
            />
            <span>left</span>
          </label>
          <label>
            <input
              type="radio"
              name="cellAlign"
              value="center"
              defaultChecked={cellAlign === 'center'}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, cellAlign: e.target.value };
                });
              }}
            />
            <span>center</span>
          </label>
          <label>
            <input
              type="radio"
              name="cellAlign"
              value="right"
              defaultChecked={cellAlign === 'right'}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, cellAlign: e.target.value };
                });
              }}
            />
            <span>right</span>
          </label>
        </div>
        <div className="item">
          <h3>groupCells</h3>
          <input
            type="number"
            defaultValue={groupCells}
            onChange={(e) => {
              setState((state) => {
                return { ...state, groupCells: Number(e.target.value) || 1 };
              });
            }}
          />
        </div>
        <div className="item">
          <h3>freeScroll</h3>
          <label>
            <input
              type="checkbox"
              checked={freeScroll}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, freeScroll: e.target.checked };
                });
              }}
            />
            <span>freeScroll</span>
          </label>
        </div>
        <div className="item">
          <h3>draggable</h3>
          <label>
            <input
              type="checkbox"
              defaultChecked={draggable}
              onChange={(e) => {
                setState((state) => {
                  return { ...state, draggable: e.target.checked };
                });
              }}
            />
            <span>draggable</span>
          </label>
        </div>
        <div className="item">
          <h3>friction</h3>
          <input
            type="range"
            min={0}
            max={1000}
            defaultValue={friction}
            onChange={(e) => {
              setState((state) => {
                return { ...state, friction: Number(e.target.value) };
              });
            }}
          />{' '}
          <span>{friction / 100}</span>
        </div>
        <div className="item">
          <h3>attraction</h3>
          <input
            type="range"
            min={0}
            max={1000}
            defaultValue={attraction}
            onChange={(e) => {
              setState((state) => {
                return { ...state, attraction: Number(e.target.value) };
              });
            }}
          />{' '}
          <span>{attraction / 1000}</span>
        </div>
        <div className="item">
          <h3>freeScrollFriction</h3>
          <input
            type="range"
            min={0}
            max={1000}
            defaultValue={freeScrollFriction}
            onChange={(e) => {
              setState((state) => {
                return { ...state, freeScrollFriction: Number(e.target.value) };
              });
            }}
          />{' '}
          <span>{freeScrollFriction / 1000}</span>
        </div>
        <div className="item">
          <h3>initialIndex</h3>
          <input
            type="number"
            value={initialIndex}
            onChange={(e) => {
              setState((state) => {
                return {
                  ...state,
                  initialIndex: Number(e.target.value),
                };
              });
            }}
          />
        </div>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById('app')!);

root.render(<App />);

const PlaceHolder = React.forwardRef<any, { children?: React.ReactNode; className?: string }>(
  ({ children, className }, ref) => {
    const color = useMemo(() => getRandomColor(), []);

    return (
      <div
        style={{ backgroundColor: color }}
        className={className ? `placeholder ${className}` : 'placeholder'}
        ref={ref}
      >
        {children}
      </div>
    );
  }
);

PlaceHolder.displayName = 'PlaceHolder';

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
