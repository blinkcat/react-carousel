import { useEffect, useMemo } from 'react';
import {
  dragEnd,
  dragMove,
  dragStart,
  pointerCancel,
  pointerDown,
  pointerUp,
} from '../core/actions/drag';

import useDispatch from './useDispatch';
import useSelector from './useSelector';

export default function useDrag(element: HTMLElement | null | undefined) {
  const draggable = useSelector((state) => state.options.draggable);
  const dispatch = useDispatch();
  const events = useMemo<DraggerEvents>(
    () => ({
      pointerDown() {
        dispatch(pointerDown());
      },
      dragStart() {
        dispatch(dragStart());
      },
      dragMove(_, moveVector) {
        dispatch(dragMove(moveVector));
      },
      dragEnd() {
        dispatch(dragEnd());
      },
      pointerCancel() {
        dispatch(pointerCancel());
      },
      pointerUp() {
        dispatch(pointerUp());
      },
    }),
    [dispatch]
  );
  const dragger = useMemo(() => {
    if (element && draggable) {
      return new Dragger(element, events);
    }
  }, [element, events, draggable]);

  useEffect(() => {
    if (dragger) {
      dragger.bindHandles();
    }

    return () => {
      if (dragger) {
        dragger.unbindHandles();
      }
    };
  }, [dragger]);
}

// forked from unidragger

interface MoveVector {
  x: number;
  y: number;
}

interface DraggerEvents {
  pointerDown?: (dragger: Dragger) => void;
  pointerMove?: (dragger: Dragger, moveVector: MoveVector) => void;
  dragStart?: (dragger: Dragger) => void;
  dragMove?: (dragger: Dragger, moveVector: MoveVector) => void;
  pointerUp?: (dragger: Dragger) => void;
  dragEnd?: (dragger: Dragger) => void;
  pointerDone?: (dragger: Dragger) => void;
  pointerCancel?: (dragger: Dragger) => void;
}

class Dragger {
  isPointerDown = false;
  isDragging = false;

  private startEvent: string;
  private activeEvents: string[];
  // nodes that have text fields
  private cursorNodes = ['TEXTAREA', 'INPUT', 'SELECT', 'OPTION'];
  // input types that do not have text fields
  private clickTypes = ['radio', 'checkbox', 'button', 'submit', 'image', 'file'];
  private pointerIdentifier?: number;
  // https://developer.mozilla.org/zh-CN/docs/Web/API/MouseEvent/pageX
  private pointerDownPointer: {
    pageX: number;
    pageY: number;
  } = { pageX: 0, pageY: 0 };
  private isPreventingClicks?: boolean;

  constructor(private target: HTMLElement, private events: DraggerEvents = {}) {
    if ('ontouchstart' in window) {
      this.startEvent = 'touchstart';
      this.activeEvents = ['touchmove', 'touchend', 'touchcancel'];
    } else if (window.PointerEvent) {
      // Pointer Events
      this.startEvent = 'pointerdown';
      this.activeEvents = ['pointermove', 'pointerup', 'pointercancel'];
    } else {
      // mouse events
      this.startEvent = 'mousedown';
      this.activeEvents = ['mousemove', 'mouseup'];
    }
  }

  bindHandles() {
    this.target.addEventListener(this.startEvent, this);
    this.target.addEventListener('click', this);
  }

  unbindHandles() {
    this.target.removeEventListener(this.startEvent, this);
    this.target.removeEventListener('click', this);
  }

  private bindActivePointerEvents = () => {
    this.activeEvents.forEach((eventName) => {
      window.addEventListener(eventName, this);
    });
  };

  private unbindActivePointerEvents = () => {
    this.activeEvents.forEach((eventName) => {
      window.removeEventListener(eventName, this);
    });
  };

  handleEvent = (event: Event) => {
    let method = 'on' + event.type;
    if ((this as any)[method]) {
      (this as any)[method](event);
    }
  };

  private onmousedown(event: MouseEvent) {
    this.pointerDown(event, event);
  }

  private ontouchstart(event: TouchEvent) {
    this.pointerDown(event, event.changedTouches[0]);
  }

  private onpointerdown(event: PointerEvent) {
    this.pointerDown(event, event);
  }

  private pointerDown(
    event: Event & { target: any; button?: any },
    pointer: MouseEvent | Touch | PointerEvent
  ) {
    // dismiss multi-touch taps, right clicks, and clicks on text fields
    let isCursorNode = this.cursorNodes.includes(event.target.nodeName);
    let isClickType = this.clickTypes.includes(event.target.type);
    let isOkayElement = !isCursorNode || isClickType;
    let isOkay = !this.isPointerDown && !event.button && isOkayElement;
    if (!isOkay) return;

    this.isPointerDown = true;
    // save pointer identifier to match up touch events
    this.pointerIdentifier =
      (pointer as PointerEvent).pointerId !== undefined
        ? // pointerId for pointer events, touch.indentifier for touch events
          (pointer as PointerEvent).pointerId
        : (pointer as Touch).identifier;
    // track position for move
    this.pointerDownPointer = {
      pageX: pointer.pageX,
      pageY: pointer.pageY,
    };

    this.bindActivePointerEvents();
    this.events.pointerDown?.(this);
  }

  // trigger method with matching pointer
  private withPointer(methodName: string, event: PointerEvent) {
    if (event.pointerId === this.pointerIdentifier) {
      (this as any)[methodName](event, event);
    }
  }

  // trigger method with matching touch
  private withTouch(methodName: string, event: TouchEvent) {
    let touch: Touch | null = null;
    for (let changedTouch of event.changedTouches) {
      if (changedTouch.identifier === this.pointerIdentifier) {
        touch = changedTouch;
      }
    }
    if (touch) (this as any)[methodName](event, touch);
  }

  private onmousemove(event: MouseEvent) {
    this.pointerMove(event, event);
  }

  private onpointermove(event: PointerEvent) {
    this.withPointer('pointerMove', event);
  }

  private ontouchmove(event: TouchEvent) {
    this.withTouch('pointerMove', event);
  }

  private pointerMove(event: Event, pointer: MouseEvent | PointerEvent | Touch) {
    const moveVector = {
      x: pointer.pageX - this.pointerDownPointer.pageX,
      y: pointer.pageY - this.pointerDownPointer.pageY,
    };
    this.events.pointerMove?.(this, moveVector);
    // start drag if pointer has moved far enough to start drag
    let isDragStarting = !this.isDragging && this.hasDragStarted(moveVector);
    if (isDragStarting) this.dragStart();
    if (this.isDragging) this.dragMove(moveVector);
  }

  // condition if pointer has moved far enough to start drag
  private hasDragStarted(moveVector: MoveVector) {
    return Math.abs(moveVector.x) > 3 || Math.abs(moveVector.y) > 3;
  }

  private dragStart() {
    this.isDragging = true;
    this.isPreventingClicks = true; // set flag to prevent clicks
    this.events.dragStart?.(this);
  }

  private dragMove(moveVector: MoveVector) {
    this.events.dragMove?.(this, moveVector);
  }

  private onmouseup(event: MouseEvent) {
    this.pointerUp(event);
  }

  private onpointerup(event: PointerEvent) {
    this.withPointer('pointerUp', event);
  }

  private ontouchend(event: TouchEvent) {
    this.withTouch('pointerUp', event);
  }

  private pointerUp(event: MouseEvent) {
    this.pointerDone();
    this.events.pointerUp?.(this);

    if (this.isDragging) {
      this.dragEnd();
    }
  }

  private dragEnd() {
    this.isDragging = false; // reset flag
    // re-enable clicking async
    setTimeout(() => (this.isPreventingClicks = undefined));

    this.events.dragEnd?.(this);
  }

  // triggered on pointer up & pointer cancel
  private pointerDone() {
    this.isPointerDown = false;
    this.pointerIdentifier = undefined;
    this.unbindActivePointerEvents();
    this.events.pointerDone?.(this);
  }

  private onpointercancel(event: PointerEvent) {
    this.withPointer('pointerCancel', event);
  }

  private ontouchcancel(event: TouchEvent) {
    this.withTouch('pointerCancel', event);
  }

  private pointerCancel() {
    this.pointerDone();
    this.events.pointerCancel?.(this);
  }

  // handle all clicks and prevent clicks when dragging
  private onclick(event: MouseEvent) {
    if (this.isPreventingClicks) event.preventDefault();
  }
}
