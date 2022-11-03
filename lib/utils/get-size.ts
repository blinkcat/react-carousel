/**
 * forked from desandro/get-size
 */

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize(value: string) {
  let num = parseFloat(value);
  // not a percent like '100%', and a number
  let isValid = value.indexOf("%") == -1 && !isNaN(num);
  return isValid && num;
}

// -------------------------- measurements -------------------------- //

let measurements = [
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "marginLeft",
  "marginRight",
  "marginTop",
  "marginBottom",
  "borderLeftWidth",
  "borderRightWidth",
  "borderTopWidth",
  "borderBottomWidth",
];

let measurementsLength = measurements.length;

function getZeroSize() {
  let size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0,
  };
  measurements.forEach((measurement) => {
    (size as any)[measurement] = 0;
  });
  return size as Size;
}

export interface Size {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  outerWidth: number;
  outerHeight: number;
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  borderLeftWidth: number;
  borderRightWidth: number;
  borderTopWidth: number;
  borderBottomWidth: number;
  isBorderBox: boolean;
}

// -------------------------- getSize -------------------------- //

export default function getSize(elem: Element) {
  // use querySeletor if elem is string
  // if (typeof elem == "string") elem = document.querySelector(elem)!;

  // do not proceed on non-objects
  // let isElement = elem && typeof elem == "object" && elem.nodeType;
  // if (!isElement) return;

  let style = getComputedStyle(elem);

  // if hidden, everything is 0
  if (style.display == "none") return getZeroSize();

  let size = {} as Size;
  size.width = (elem as HTMLElement).offsetWidth;
  size.height = (elem as HTMLElement).offsetHeight;

  let isBorderBox = (size.isBorderBox = style.boxSizing == "border-box");

  // get all measurements
  measurements.forEach((measurement) => {
    let value = (style as any)[measurement];
    let num = parseFloat(value);
    // any 'auto', 'medium' value will be 0
    (size as any)[measurement] = !isNaN(num) ? num : 0;
  });

  let paddingWidth = size.paddingLeft + size.paddingRight;
  let paddingHeight = size.paddingTop + size.paddingBottom;
  let marginWidth = size.marginLeft + size.marginRight;
  let marginHeight = size.marginTop + size.marginBottom;
  let borderWidth = size.borderLeftWidth + size.borderRightWidth;
  let borderHeight = size.borderTopWidth + size.borderBottomWidth;

  // overwrite width and height if we can get it from style
  let styleWidth = getStyleSize(style.width);
  if (styleWidth !== false) {
    size.width =
      styleWidth +
      // add padding and border unless it's already including it
      (isBorderBox ? 0 : paddingWidth + borderWidth);
  }

  let styleHeight = getStyleSize(style.height);
  if (styleHeight !== false) {
    size.height =
      styleHeight +
      // add padding and border unless it's already including it
      (isBorderBox ? 0 : paddingHeight + borderHeight);
  }

  size.innerWidth = size.width - (paddingWidth + borderWidth);
  size.innerHeight = size.height - (paddingHeight + borderHeight);

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}
