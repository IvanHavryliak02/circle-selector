var circularSelector = function() {
  "use strict";
  function circularSelector2(containerSelector) {
    const selectorSettings = {
      initDelay: "200ms",
      menuRadius: "0.8",
      breakpoint: "1200px",
      animationDuration: "800ms",
      childrenTop: "50%",
      childrenLeft: "50%",
      startDeg: "90",
      timingFunc: "easeInOutCubic",
      lineColor: "gray",
      lines: "show"
    };
    try {
      let createLine = function() {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const color = selectorSettings.lineColor || "black";
        line.setAttribute("stroke", color);
        background.appendChild(line);
        return line;
      }, setListeners = function() {
        let activatorMousenter, selectorMouseleave, activatorClick, selectorClick;
        const breakpoint = parseInt(selectorSettings.breakpoint) || 1200;
        if (window.innerWidth > breakpoint) {
          activatorMousenter = lookEvent(
            selectorActivator,
            //event listener target
            "mouseenter",
            // event
            "animationOutRunning",
            // Name of the first animation to run
            "animationInRunning",
            // Name of the last animation to run
            () => {
              moveItems(elementsData, "targetCorner", "animationOut");
            }
          );
          selectorMouseleave = lookEvent(
            selector,
            //event listener target
            "mouseleave",
            // event
            "animationInRunning",
            // Name of the first animation to run
            "animationOutRunning",
            // Name of the last animation to run
            () => {
              moveItems(elementsData, "initElementCorner", "animationIn");
            }
          );
        } else {
          activatorClick = lookEvent(
            selectorActivator,
            //event listener target
            "click",
            // event
            "animationOutRunning",
            // Name of the first animation to run
            "animationInRunning",
            // Name of the last animation to run
            () => {
              moveItems(elementsData, "targetCorner", "animationOut");
            }
          );
          selectorClick = lookEvent(
            selector,
            //event listener target
            "click",
            // event
            "animationInRunning",
            // Name of the first animation to run
            "animationOutRunning",
            // Name of the last animation to run
            () => {
              moveItems(elementsData, "initElementCorner", "animationIn");
            }
          );
        }
        return {
          activatorMousenter,
          selectorMouseleave,
          activatorClick,
          selectorClick
        };
      }, lookEvent = function(element, event, primaryAnimationFlag, secondaryAnimationFlag, primaryFunction) {
        const handler = (e) => {
          e.stopPropagation();
          flags[secondaryAnimationFlag] = false;
          if (!flags[primaryAnimationFlag] && !flags[secondaryAnimationFlag]) {
            flags[primaryAnimationFlag] = true;
            primaryFunction();
          }
          ;
        };
        element.addEventListener(event, handler);
        return () => element.removeEventListener(event, handler);
      }, createPrimaryData = function(selector2, elements2) {
        const startDeg = selectorSettings.startDeg || 90, childrenLeft = parseFloat(selectorSettings.childrenLeft) || 50, childrenTop = parseFloat(selectorSettings.childrenTop) || 50;
        return {
          startDeg,
          elementsAmount: elements2.length,
          childrenLeft,
          childrenTop
        };
      }, calculateCoords = function(primaryData2, selector2, elements2) {
        const result = [], degToRad = (deg) => deg * (Math.PI / 180), elementLeftProc = primaryData2.childrenLeft, elementTopProc = primaryData2.childrenTop, parentWidth = selector2.offsetWidth, parentHeight = selector2.offsetHeight, radiusFactor = selectorSettings.menuRadius || 0.8;
        elements2.forEach((element, i) => {
          const elementWidth = element.offsetWidth, elementHeight = element.offsetHeight;
          const elementCornerX = elementLeftProc / 100 * parentWidth - elementWidth / 2, elementCornerY = elementTopProc / 100 * parentHeight - elementHeight / 2, centerX = parentWidth / 2, centerY = parentHeight / 2;
          const n = primaryData2.elementsAmount, startRad = degToRad(primaryData2.startDeg), R = parentWidth / 2 * radiusFactor;
          const targetCenterX = centerX + R * Math.cos(startRad + 2 * Math.PI / n * i), targetCenterY = Math.abs(-centerY + R * Math.sin(startRad + 2 * Math.PI / n * i));
          const targetCornerX = targetCenterX - elementWidth / 2, targetCornerY = targetCenterY - elementHeight / 2;
          let line = background.children[i] || createLine();
          result.push({
            element,
            elementCornerX,
            elementCornerY,
            targetCornerX,
            targetCornerY,
            initElementCornerX: elementCornerX,
            initElementCornerY: elementCornerY,
            elementWidth,
            elementHeight,
            line
          });
        });
        roundData(result);
        return result;
      }, roundData = function(arrOfObjects) {
        for (let obj of arrOfObjects) {
          for (let key in obj) {
            if (typeof obj[key] == "number") {
              obj[key] = Math.round(obj[key] * 1e3) / 1e3;
            }
            ;
          }
          ;
        }
        ;
      }, moveItems = function(elementsData2, target, animationName) {
        const start = performance.now(), duration = parseInt(selectorSettings.animationDuration);
        elementsData2.forEach((obj) => {
          obj.startX = obj.elementCornerX;
          obj.startY = obj.elementCornerY;
        });
        function animate() {
          const now = performance.now(), delta = now - start, t = Math.min(delta / duration, 1);
          elementsData2.forEach((obj) => {
            changeCoordinate(obj, "startX", "elementCornerX", `${target}X`, t, "left");
            changeCoordinate(obj, "startY", "elementCornerY", `${target}Y`, t, "top");
            if (selectorSettings.lines === "show") {
              drawLines(obj);
            }
          });
          if (delta < duration && flags[`${animationName}Running`]) {
            requestAnimationFrame(animate);
          } else {
            flags[`${animationName}Running`] = false;
          }
          ;
        }
        ;
        animate();
      }, drawLines = function(obj) {
        const elementCenterX = obj.elementCornerX + obj.elementWidth / 2, elementCenterY = obj.elementCornerY + obj.elementHeight / 2, dx = elementCenterX - activator.activatorCenterX, dy = elementCenterY - activator.activatorCenterY, len = Math.sqrt(dx ** 2 + dy ** 2), activatorR = Math.sqrt(activator.activatorWidth ** 2 + activator.activatorHeight ** 2) / 2;
        if (len <= activatorR) {
          if (obj.line.hasAttribute("x1")) {
            hideLines();
          }
          return;
        }
        const ux = dx / len, uy = dy / len, elementR = Math.sqrt(obj.elementWidth ** 2 + obj.elementHeight ** 2) / 2, x1 = activator.activatorCenterX + ux * activatorR, y1 = activator.activatorCenterY + uy * activatorR, x2 = elementCenterX - ux * elementR, y2 = elementCenterY - uy * elementR;
        obj.line.setAttribute("x1", `${x1}`);
        obj.line.setAttribute("x2", `${x2}`);
        obj.line.setAttribute("y1", `${y1}`);
        obj.line.setAttribute("y2", `${y2}`);
      }, hideLines = function() {
        elementsData.forEach((obj) => {
          obj.line.removeAttribute("x1");
          obj.line.removeAttribute("x2");
          obj.line.removeAttribute("y1");
          obj.line.removeAttribute("y2");
        });
      }, changeCoordinate = function(obj, startCoord, elementCoord, targetCoord, t, side) {
        let progress;
        switch (selectorSettings.timingFunc) {
          case "linear":
            progress = t;
            break;
          case "easeInQuad":
            progress = t ** 2;
            break;
          case "easeOutQuad":
            progress = t * (2 - t);
            break;
          case "easeInOutQuad":
            progress = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            break;
          case "easeInCubic":
            progress = t ** 3;
            break;
          case "easeOutCubic":
            progress = 1 - (1 - t) ** 3;
            break;
          case "easeInOutCubic":
            progress = t < 0.5 ? 4 * t ** 3 : 1 - 4 * (1 - t) ** 3;
            break;
          case "easeInQuart":
            progress = t ** 4;
            break;
          case "easeOutQuart":
            progress = 1 - (1 - t) ** 4;
            break;
          case "easeInOutQuart":
            progress = t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4;
            break;
          default:
            progress = t;
        }
        const distance = obj[targetCoord] - obj[startCoord];
        obj[elementCoord] = obj[startCoord] + distance * progress;
        obj.element.style[side] = `${obj[elementCoord]}px`;
      }, createResponseDesign = function() {
        let currentWidth = selector.offsetWidth, timeoutId;
        window.addEventListener("resize", () => {
          clearTimeout(timeoutId);
          if (currentWidth !== selector.offsetWidth) {
            flags.animationInRunning = false;
            flags.animationOutRunning = false;
            timeoutId = setTimeout(() => {
              requestAnimationFrame(() => {
                for (let removeMethod in removeListener) {
                  if (typeof removeListener[removeMethod] === "function") {
                    removeListener[removeMethod]();
                  }
                  ;
                }
                ;
                currentWidth = selector.offsetWidth;
                elementsData = calculateCoords(primaryData, selector, elements);
                startCoordsCorrection(elementsData);
                hideLines();
                removeListener = setListeners();
              });
            }, 100);
          }
          ;
        });
      }, startCoordsCorrection = function(elementsData2) {
        let minX = elementsData2[0].elementCornerX, minY = elementsData2[0].elementCornerY, ordNum = 0;
        elementsData2.forEach((obj, i) => {
          const menuItem = obj.element;
          menuItem.style.left = obj.elementCornerX + "px";
          menuItem.style.top = obj.elementCornerY + "px";
          if (obj.elementCornerX < minX || obj.elementCornerY < minY) {
            minX = obj.elementCornerX;
            minY = obj.elementCornerY;
            ordNum = i;
          }
        });
        selectorActivator.style.left = minX + "px";
        selectorActivator.style.top = minY - 2 + "px";
        selectorActivator.style.height = elementsData2[ordNum].elementHeight + 2 + "px";
        elementsData2[ordNum].element.style.zIndex = "";
        elementsData2[ordNum].element.style.zIndex = +getComputedStyle(elementsData2[ordNum].element).zIndex + 1;
        activator = getActivatorParams(selectorActivator, minX, minY);
      }, getActivatorParams = function(activator2, activatorCornerX, activatorCornerY) {
        const activatorWidth = activator2.offsetWidth, activatorHeight = activator2.offsetHeight, activatorCenterX = activatorCornerX + activatorWidth / 2, activatorCenterY = activatorCornerY + activatorHeight / 2;
        return {
          activatorWidth,
          activatorHeight,
          activatorCenterX,
          activatorCenterY
        };
      };
      const selector = document.querySelector(containerSelector), selectorActivator = selector.querySelector(`${containerSelector}__activator`), elements = selector.querySelectorAll(`${containerSelector}__element`), background = selector.querySelector(`${containerSelector}__background`);
      let primaryData, elementsData, activator;
      const flags = {
        animationOutRunning: false,
        // Tracks if "unfold" animation is currently running
        animationInRunning: false
        // Tracks if "fold back" animation is currently running
      };
      setTimeout(() => {
        requestAnimationFrame(() => {
          primaryData = createPrimaryData(selector, elements);
          elementsData = calculateCoords(primaryData, selector, elements);
          startCoordsCorrection(elementsData);
          createResponseDesign();
        });
      }, parseInt(selectorSettings.initDelay) || 200);
      selector.addEventListener("click", (e) => {
        e.stopPropagation();
        if (e.target.closest(`${containerSelector}__element`)) {
          alert("TEST: Card is clicked!");
        }
        ;
      });
      let removeListener = setListeners();
      ;
      ;
      ;
      ;
      ;
      ;
      ;
      ;
      ;
    } catch (error) {
      console.error(`*Circular-selector*: ${error.message}`);
    }
  }
  return circularSelector2;
}();
