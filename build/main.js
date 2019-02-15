// please note
// The control knob is a virtual div which is what the user engages with
// The control dial is the animated png which is controlled internally
const anime = window.anime;

const MAX_ROTATION = 231;

let knobEngaged = false;
let currentState = 'c1';
const STATES = {
  c1: {
    id: 'c1',
    posX: 7,
    posY: 122,
    rotation: '0',
  },
  c2: {
    id: 'c2',
    posX: 31,
    posY: 18,
    rotation: '77deg',
  },
  c3: {
    id: 'c3',
    posX: 136,
    posY: 18,
    rotation: '154deg',
  },
  c4: {
    id: 'c4',
    posX: 166,
    posY: 122,
    rotation: '231deg',
  },
};

// elements
const $ad = $('#TBM-BMW-ad');
const $knob = $('#control-knob');
const $knobBox = $('#control-box');

// init state
applyStyles(
  $knob,
  createPosStyles(STATES[currentState].posX, STATES[currentState].posY)
);

// events
$event($knob, 'mousedown', e => {
  knobEngaged = true;
});

// prevent the mouseout from bubbling
$event($knob, 'mouseout', e => {
  e.stopPropagation();
});

$event($knobBox, 'mouseout', e => {
  if (e.relatedTarget === $knob) return null
  knobEngaged = false;
});

$event($knobBox, 'mouseup', () => {
  knobEngaged = false;
});

$event($knobBox, 'mousemove', e => {
  if (!knobEngaged) return null;

  // find the offsets based on the knobbox
  // if the mouse is moving in the control knob, the offsets will not be relative to the outer box
  // to fix that, ad the offsetLeft and offsetTop
  let { offsetX, offsetY } = e
  const element = e.target
  if (element !== $knobBox) {
    offsetX += element.offsetLeft
    offsetY += element.offsetTop
  }
  const nxtState = shouldChangeStates(offsetX, offsetY);
  if (nxtState.yesChangeState) {
    changeStates(STATES[currentState], nxtState.nxtState);
  }
});

window.addEventListener('load', () => {
  // play through all states initially
  let initIndex = 1;
  const initialInterval = setInterval(() => {
    anime({
      targets: '.dial-anime',
      rotate: `+=${MAX_ROTATION / 3}deg`,
      duration: 2000,
    });
    initIndex++;
    if (initIndex >= 2) {
      clearInterval(initialInterval);
    }
  }, 1000);
});

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return document.querySelectorAll(selector);
}

function $event(el, eventName, eventHandler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, eventHandler, false);
  } else if (el.attachEvent) {
    el.attachEvent('on' + eventName, eventHandler);
  }
}

function applyStyles(el, styles = {}) {
  Object.keys(styles).forEach(style => {
    el.style[style] = styles[style];
  });
}

function createPosStyles(left, top) {
  return {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function shouldChangeStates(mouseX, mouseY) {
  const getDistFromStateObj = ({ posX, posY }) => {
    const dX = mouseX - posX;
    const dY = mouseY - posY;
    return Math.sqrt(Math.abs(dX * dX + dY * dY));
  };
  const closestStateToMouse = Object.keys(STATES).reduce((closest, nxt) => {
    const nxtVal = STATES[nxt];
    const distanceFromClosest = getDistFromStateObj(closest);
    const distanceFromNxt = getDistFromStateObj(nxtVal);
    if (distanceFromNxt < distanceFromClosest) {
      return nxtVal;
    }
    return closest;
  }, STATES[currentState]);
  const yesChangeState = closestStateToMouse !== STATES[currentState];
  return {
    yesChangeState,
    nxtState: closestStateToMouse,
  };
}

function changeStates(state1, state2) {
  // change the position of the control knob
  applyStyles($knob, createPosStyles(state2.posX, state2.posY));
  currentState = state2.id;
}
