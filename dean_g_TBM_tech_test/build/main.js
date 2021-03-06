// please note
// The control knob is a virtual div which is what the user engages with
// The control dial is the animated png which is controlled internally
//

// scope variables from libraries
const anime = window.anime;
const CountUp = window.CountUp;

// set based on pngs to be animated
const MAX_ROTATION = 231;

// Ad state control
let knobEngaged = false;
let currentState = 0;
let isChangingStates = true;
const STATES = [
  {
    id: 0,
    photoId: 'car1',
    posX: 7,
    posY: 122,
    rot: 0,
    price: 249,
    carDesc1: 'BMW 118i',
    carDesc2: 'SPORT 5-DOOR.',
    initRental: '4,549',
    utilBlockHeight: 0,
    termsInfo: '',
  },
  {
    id: 1,
    photoId: 'car2',
    posX: 31,
    posY: 18,
    rot: 77,
    price: 359,
    carDesc1: 'BMW X2',
    carDesc2: 'sDRIVE20i M SPORT.',
    initRental: '8,069',
    utilBlockHeight: 40,
    termsInfo: 'Includes optional Misano Blue Xirallic paint.',
  },
  {
    id: 2,
    photoId: 'car3',
    posX: 136,
    posY: 18,
    rot: 154,
    price: 409,
    carDesc1: 'BMW X3',
    carDesc2: 'xDRIVE20i M SPORT.',
    initRental: '8,699',
    utilBlockHeight: 155,
    termsInfo: 'Includes optional Sophisto Grey Xirallic paint.',
  },
  {
    id: 3,
    photoId: 'car4',
    posX: 166,
    posY: 122,
    rot: 231,
    price: 679,
    carDesc1: 'BMW X5',
    carDesc2: 'xDRIVE30d M SPORT.',
    initRental: '10,419',
    utilBlockHeight: 155,
    termsInfo: '',
  },
];
  
const getCurSta = () => STATES[currentState];

// elements
const $price = $('.con__price');
const $utilityBlock = $('.ad__dial-utility');
const $carDesc1 = $('#car-desc1');
const $carDesc2 = $('#car-desc2');
const $initRental = $('#init-rental');
const $termsInfo = $('#terms-info');

// virtual elements for user interaction
const $knob = $('#control-knob');
const $knobBox = $('#control-box');

//

// init DOM state/styles/values
$price.innerText = getCurSta().price;
$carDesc1.innerText = getCurSta().carDesc1;
$carDesc2.innerText = getCurSta().carDesc2;
$initRental.innerText = getCurSta().initRental;
$termsInfo.innerText = getCurSta().termsInfo;

applyStyles($knob, createPosStyles(getCurSta().posX, getCurSta().posY));

applyStyles($utilityBlock, {
  height: `${getCurSta().utilBlockHeight}px`,
});

applyStyles($(`#${getCurSta().photoId}`), { opacity: 1 });

//

// events
$event($knob, 'mousedown', e => {
  engageKnob(true);
});

$event($knob, 'mouseout', e => {
  // prevent the mouseout from bubbling
  e.stopPropagation();
});

$event($knobBox, 'mouseout', e => {
  if (e.relatedTarget === $knob) return null;
  engageKnob(false);
});

$event($knobBox, 'mouseup', () => {
  engageKnob(false);
});

$event($knobBox, 'mousemove', e => {
  if (!knobEngaged) return null;

  // find the offsets based on the knobbox
  // if the mouse is moving in the control knob,
  // the offsets will not be relative to the outer box
  // to fix that, ad the offsetLeft and offsetTop
  let { offsetX, offsetY } = e;
  const element = e.target;
  if (element !== $knobBox) {
    offsetX += element.offsetLeft;
    offsetY += element.offsetTop;
  }
  const nxtState = shouldChangeStates(offsetX, offsetY);
  if (nxtState.yesChangeState) {
    changeStates(getCurSta(), nxtState.nxtState);
  }
});

//

// consistent glow animation
const dialAnim = anime({
  targets: '.ad__glow',
  duration: 1000,
  easing: 'linear',
  opacity: [0, 0.6],
  direction: 'alternate',
  loop: true,
});

// initial load animation (plays through all cars)
window.addEventListener('load', () => {
  // play through all states initially
  let initIndex = 1;
  const initialInterval = setInterval(() => {
    changeStates(getCurSta(), STATES[initIndex]);
    initIndex++;
    if (initIndex >= 4) {
      clearInterval(initialInterval);
    }
  }, 2000);
});

//

// DOM helper functions
function $(selector) {
  return document.querySelector(selector);
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

//

// ad helper functions
function createPosStyles(left, top) {
  return {
    top: `${top}px`,
    left: `${left}px`,
  };
}

function engageKnob(engage) {
  const glowAnimDefaults = {
    targets: '.ad__glow',
    duration: 300,
    ease: 'easeInOutSine',
  };

  if (engage) {
    // animate glow on
    dialAnim.pause();
    knobEngaged = true;
    anime({
      ...glowAnimDefaults,
      opacity: 1,
    });
    return null;
  }

  // if the knobEngage is already false, return and avoid restarting anim
  if (!knobEngaged) return null;

  // animate glow off
  anime({
    ...glowAnimDefaults,
    opacity: 0,
    complete: () => {
      dialAnim.restart();
      dialAnim.play();
    },
  });
  knobEngaged = false;
}

// this function is called when the user is dragging the knob
// it determines if the ad should animate to a new car (ie change states)
// it does this based on where the mouse is relative to each potential state
function shouldChangeStates(mouseX, mouseY) {
  if (isChangingStates) return { yesChangeState: false };
  
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
  }, getCurSta());

  // only change states if next state is one state away
  let yesChangeState = false;
  if (closestStateToMouse === STATES[getCurSta().id + 1]) {
    yesChangeState = true;
  }
  if (closestStateToMouse === STATES[getCurSta().id - 1]) {
    yesChangeState = true;
  }

  return {
    yesChangeState,
    nxtState: closestStateToMouse,
  };
}

//

// animation helper function..
function animateDial(state1, state2) {
  anime.timeline({
    targets: '.dial-anime',
    duration: 800,
    easing: 'easeInOutSine',
    rotate: [`${state1.rot}deg`, `${state2.rot}deg`],
    // sorry this will probably not look pretty, but it saves a lot of lines..
    // im setting wether the util block will update before the animation or after
    // if it's always set afterwards there's a moment where it flashes
    ...(() => {
      if (state2.utilBlockHeight < state1.utilBlockHeight) {
        var updateUtil = 'before';
      } else {
        var updateUtil = 'complete';
      }
      return {
        [updateUtil]: () =>
          applyStyles($utilityBlock, {
            height: `${state2.utilBlockHeight}px`,
          }),
      };
    })(),
  }).add({
    complete: () => {
      isChangingStates = false;
    }
  });
}

function animatePrice(st1, st2) {
  const defaultPriceAnim = {
    useEasing: true,
    useGrouping: true,
    separator: ',',
    decimal: '.',
  };
  var priceAnim = new CountUp(
    $price,
    st1.price,
    st2.price,
    0,
    1,
    defaultPriceAnim
  );
  if (!priceAnim.error) {
    priceAnim.start();
  } else {
    console.error(priceAnim.error);
  }
}

function animateCarPhoto(st1, st2) {
  anime
    .timeline({
      targets: `#${st1.photoId}`,
      duration: 200,
      easing: 'linear',
    })
    .add({
      opacity: 0,
    })
    .add(
      {
        duration: 500,
        targets: `#${st2.photoId}`,
        opacity: 1,
        easing: 'easeOutQuint',
      },
      -100
    );
}

function animateCarDesc(st2) {
  anime
    .timeline({
      duration: 200,
      easing: 'linear',
      targets: '.anim-text',
    })
    .add({
      opacity: 0.2,
      complete: () => {
        $carDesc1.innerText = st2.carDesc1;
        $carDesc2.innerText = st2.carDesc2;
        $initRental.innerText = st2.initRental;
        $termsInfo.innerText = st2.termsInfo;
      },
    })
    .add({
      duration: 500,
      opacity: 1,
      easing: 'easeOutQuint',
    });
}

// this function is called anytime the state will change
// it calls all updates/animations
function changeStates(state1, state2) {
  isChangingStates = true;
  // change the position of the control knob
  applyStyles($knob, createPosStyles(state2.posX, state2.posY));
  animateDial(state1, state2);
  animateCarPhoto(state1, state2);
  animatePrice(state1, state2);
  animateCarDesc(state2);
  currentState = state2.id;
}
