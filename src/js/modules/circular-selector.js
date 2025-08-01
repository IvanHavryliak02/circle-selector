
export default function(containerSelector, selectorSettings, menuItemCallback){
    try{
        // Execution code: Initialize all needed elements and set up event listeners
        const selector = document.querySelector(containerSelector), // Main container element for the selector
            selectorActivator = selector.querySelector(`${containerSelector}__activator`), // Element that triggers unfolding/interaction
            elements = selector.querySelectorAll(`${containerSelector}__element`), // Radial menu items (cards, links, images etc.)
            background = selector.querySelector(`${containerSelector}__background`); // SVG background for drawing connecting lines
        
        let primaryData, elementsData, activator;

        const flags = {
            animationOutRunning: false, // Tracks if "unfold" animation is currently running
            animationInRunning: false // Tracks if "fold back" animation is currently running
        };

        setTimeout(() => {
            requestAnimationFrame(() => {
                primaryData = createPrimaryData(elements); // Initial setup data extracted from DOM/data-attributes
                elementsData = calculateCoords(primaryData, selector, elements); // Array of objects with positions and dimensions for each menu item
                startCoordsCorrection(elementsData); // Position all elements at their starting coordinates
                createResponseDesign(); // Set up resize listener to recalculate coords if container size changes
            })
        }, parseInt(selectorSettings?.initDelay) || 200);

        selector.addEventListener('click', (e) => {
            e.stopPropagation(); 
            if(e.target.closest(`${containerSelector}__element`)){ // Detect click on any menu item
                menuItemCallback?.(e);
            };
        });

        let removeListener = setListeners();
    
        //functions    

        function createLine(){
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            const color = selectorSettings?.lineColor || 'black'; 

            line.setAttribute("stroke", color);

            background.appendChild(line);
            return line;
        }

        // Utility function to add event listener and control animation flags to prevent collisions

        function setListeners(){
            let activatorMousenter, selectorMouseleave, activatorClick, selectorClick;
            const breakpoint = parseInt(selectorSettings?.breakpoint) || 1200;
            if(window.innerWidth > breakpoint){
                activatorMousenter = lookEvent(
                    selectorActivator, //event listener target
                    'mouseenter', // event
                    'animationOutRunning', // Name of the first animation to run
                    'animationInRunning', // Name of the last animation to run
                    () => {
                        moveItems(elementsData, 'targetCorner', 'animationOut'); // Animation executor
                });
                selectorMouseleave = lookEvent(
                    selector, //event listener target
                    'mouseleave', // event
                    'animationInRunning', // Name of the first animation to run
                    'animationOutRunning', // Name of the last animation to run
                    () => {
                        moveItems(elementsData, 'initElementCorner', 'animationIn'); // Animation executor
                });
            }else{
                activatorClick = lookEvent(
                    selectorActivator, //event listener target
                    'click', // event
                    'animationOutRunning', // Name of the first animation to run
                    'animationInRunning', // Name of the last animation to run
                    () => {
                        moveItems(elementsData, 'targetCorner', 'animationOut'); // Animation executor
                });
                selectorClick = lookEvent(
                    selector, //event listener target
                    'click', // event
                    'animationInRunning', // Name of the first animation to run
                    'animationOutRunning', // Name of the last animation to run
                    () => {
                        moveItems(elementsData, 'initElementCorner', 'animationIn'); // Animation executor
                });
            }
            
            return {
                activatorMousenter: activatorMousenter,
                selectorMouseleave: selectorMouseleave,
                activatorClick: activatorClick,
                selectorClick: selectorClick
            }
        }

        function lookEvent(element, event, primaryAnimationFlag, secondaryAnimationFlag, primaryFunction){
            const handler = (e) => {
                e.stopPropagation();
                
                flags[secondaryAnimationFlag] = false; //Stops the secondary animation if it's running
                if(!flags[primaryAnimationFlag] && !flags[secondaryAnimationFlag]){ // If neither animation is running
                    flags[primaryAnimationFlag] = true; // Allows animation to run, prevents animation collisions
                    primaryFunction(); //calls animation executor
                };
            }

            element.addEventListener(event, handler);

            return () => element.removeEventListener(event, handler);
        };

        // Extract initial configuration data from selector element's data attributes
        function createPrimaryData(elements){
            const startDeg = parseInt(selectorSettings?.startDeg) || 90,  // Starting rotation angle for radial layout
                childrenLeft = parseFloat(selectorSettings?.childrenLeft) || 50, // Left offset % to children center
                childrenTop = parseFloat(selectorSettings?.childrenTop) || 50; // Top offset % to children center
            return { 
                startDeg: startDeg,
                elementsAmount: elements.length,
                childrenLeft: childrenLeft,
                childrenTop: childrenTop,
            }
        };
        // Calculate positions for each menu item for both initial and target (expanded) states
        function calculateCoords(primaryData, selector, elements){
            const result = [], 
                degToRad = deg => deg*(Math.PI / 180), 
                elementLeftProc = primaryData.childrenLeft,
                elementTopProc = primaryData.childrenTop,
                parentWidth = selector.offsetWidth,
                parentHeight = selector.offsetHeight,
                radiusFactor = selectorSettings?.menuRadius || 0.8;

            elements.forEach((element,i) => { //element means menu item
                const elementWidth = element.offsetWidth, 
                    elementHeight = element.offsetHeight;
                // Initial position relative to container based on % offset minus half element size (to center) 
                const elementCornerX = elementLeftProc/100 * parentWidth - elementWidth/2, 
                    elementCornerY = elementTopProc/100 * parentHeight - elementHeight/2,
                    centerX = parentWidth/2, 
                    centerY = parentHeight/2; 
        
                const n = primaryData.elementsAmount, 
                    startRad = degToRad(primaryData.startDeg), 
                    R = parentWidth/2 * radiusFactor; // Radius of circle on which elements will be positioned
                // Calculate target position on circumference of circle for each element
                const targetCenterX = centerX + (R * Math.cos(startRad + (2*Math.PI/n) * i)), 
                    targetCenterY = Math.abs(-centerY + (R * Math.sin(startRad + (2*Math.PI/n) * i))); 
                // Convert center coordinates to top-left corner coordinates for absolute positioning
                const targetCornerX = targetCenterX - elementWidth/2, 
                    targetCornerY = targetCenterY - elementHeight/2;

                let line = background.children[i] || createLine();
                // Store all relevant data for animation and positioning
                result.push({
                    element: element, 
                    elementCornerX: elementCornerX, 
                    elementCornerY: elementCornerY, 
                    targetCornerX: targetCornerX,
                    targetCornerY: targetCornerY, 
                    initElementCornerX: elementCornerX, 
                    initElementCornerY: elementCornerY, 
                    elementWidth: elementWidth,
                    elementHeight: elementHeight,
                    line: line
                });
            });
            roundData(result); // Round numeric values for precision
            return result;
        };

        // Round numeric values in all objects to 3 decimal places to avoid floating point errors
        function roundData(arrOfObjects){
            for(let obj of arrOfObjects){
                for(let key in obj){
                    if(typeof obj[key] == 'number'){
                        obj[key] = (Math.round(obj[key]*1000)/1000)
                    };
                };
            };  
        };

        // Animate movement of menu items from current position to target or initial position
        function moveItems(elementsData, target, animationName){
            const start = performance.now(),
                duration = parseInt(selectorSettings?.animationDuration) || 800;

            elementsData.forEach(obj => {
                obj.startX = obj.elementCornerX; // Save current position as animation start
                obj.startY = obj.elementCornerY;
            });
            function animate() {
                const now = performance.now(),
                    delta = now - start,
                    t = Math.min(delta / duration, 1);

                elementsData.forEach(obj => {
                    changeCoordinate(obj, 'startX', 'elementCornerX', `${target}X`, t, 'left');
                    changeCoordinate(obj, 'startY', 'elementCornerY', `${target}Y`, t, 'top');
                    if(selectorSettings?.lines === 'show'){ // Draw connecting lines if enabled
                        drawLines(obj);
                    }
                });

                if (delta < duration && flags[`${animationName}Running`]) {
                    requestAnimationFrame(animate); // Continue animation until duration elapsed
                } else {
                    flags[`${animationName}Running`] = false; // Mark animation as finished
                };
            };
            animate();
        };

        // Draw SVG lines from activator center to each menu item center
        function drawLines(obj){
            const elementCenterX = obj.elementCornerX + obj.elementWidth/2,
                elementCenterY = obj.elementCornerY + obj.elementHeight/2,
                dx = elementCenterX - activator.activatorCenterX,
                dy = elementCenterY - activator.activatorCenterY,
                len = Math.sqrt(dx**2 + dy**2),
                activatorR = Math.sqrt(activator.activatorWidth**2 + activator.activatorHeight**2)/2;
            if(len <= activatorR){ // Skip if line must be in activator
                if(obj.line.hasAttribute('x1')){
                    hideLines();
                }
                return
            } 
            const ux = dx/len, uy = dy/len,
                elementR = Math.sqrt(obj.elementWidth**2 + obj.elementHeight**2)/2,
                x1 = activator.activatorCenterX + ux*activatorR,
                y1 = activator.activatorCenterY + uy*activatorR,
                x2 = elementCenterX - ux*elementR,
                y2 = elementCenterY - uy*elementR;

            obj.line.setAttribute('x1', `${x1}`);
            obj.line.setAttribute('x2', `${x2}`);
            obj.line.setAttribute('y1', `${y1}`);
            obj.line.setAttribute('y2', `${y2}`);
        };

        // Clear all SVG lines from background
        function hideLines(){
            elementsData.forEach(obj => {
                obj.line.removeAttribute('x1');
                obj.line.removeAttribute('x2');
                obj.line.removeAttribute('y1');
                obj.line.removeAttribute('y2');
            })
        }

        // Interpolates element coordinate between start and target positions based on timing function
        function changeCoordinate(obj, startCoord, elementCoord, targetCoord, t, side) {
            let progress;

            switch (selectorSettings?.timingFunc || 'linear') {
                case 'linear':
                    progress = t;
                    break;
                case 'easeInQuad':
                    progress = t ** 2;
                    break;
                case 'easeOutQuad':
                    progress = t * (2-t);
                    break;
                case 'easeInOutQuad':
                    progress = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                    break;
                case 'easeInCubic':
                    progress = t ** 3;
                    break;
                case 'easeOutCubic':
                    progress = 1 - (1 - t) ** 3;
                    break;
                case 'easeInOutCubic':
                    progress = t < 0.5 ? 4 * t ** 3 : 1 - 4 * (1 - t) ** 3;
                    break;
                case 'easeInQuart':
                    progress = t ** 4;
                    break;
                case 'easeOutQuart':
                    progress = 1 - (1 - t) ** 4;
                    break;
                case 'easeInOutQuart':
                    progress = t < 0.5 ? 8 * t ** 4 : 1 - 8 * (1 - t) ** 4;
                    break;
            }

            const distance = obj[targetCoord] - obj[startCoord];

            obj[elementCoord] = obj[startCoord] + distance * progress;
            obj.element.style[side] = `${obj[elementCoord]}px`; // Update element style (left or top)
        }

        // Add resize listener to recalculate positions if container size changes
        function createResponseDesign(){
            let currentWidth = selector.offsetWidth,
                timeoutId;

            window.addEventListener('resize', () => {
                clearTimeout(timeoutId);
                if(currentWidth !== selector.offsetWidth){
                    flags.animationInRunning = false;
                    flags.animationOutRunning = false;
                    timeoutId = setTimeout(() => {
                        requestAnimationFrame(() => {
                            for(let removeMethod in removeListener){
                                if(typeof removeListener[removeMethod] === 'function'){
                                    removeListener[removeMethod]()
                                };
                            };
                            currentWidth = selector.offsetWidth;
                            elementsData = calculateCoords(primaryData, selector, elements);
                            startCoordsCorrection(elementsData);
                            hideLines();
                            removeListener = setListeners();
                        })
                    }, 100)
                };
            });
        };

        // Apply initial positions to activator and menu items based on calculated data
        function startCoordsCorrection(elementsData){
            let minX = elementsData[0].elementCornerX,
                minY = elementsData[0].elementCornerY,
                ordNum = 0;

            elementsData.forEach((obj,i) => {
                const menuItem = obj.element;              
                menuItem.style.left = obj.elementCornerX + 'px';
                menuItem.style.top = obj.elementCornerY + 'px';
                if(obj.elementCornerX < minX || obj.elementCornerY < minY){
                    minX = obj.elementCornerX;
                    minY = obj.elementCornerY;
                    ordNum = i;
                }
            });

            selectorActivator.style.left = minX + 'px';
            selectorActivator.style.top = minY - 2 + 'px';
            selectorActivator.style.height = elementsData[ordNum].elementHeight + 2 + 'px';
            elementsData[ordNum].element.style.zIndex = '';
            elementsData[ordNum].element.style.zIndex = +getComputedStyle(elementsData[ordNum].element).zIndex + 1;
            activator = getActivatorParams(selectorActivator, minX, minY);
        };

        function getActivatorParams(activator, activatorCornerX, activatorCornerY){
            const activatorWidth = activator.offsetWidth,
                activatorHeight = activator.offsetHeight,
                activatorCenterX = activatorCornerX + activatorWidth/2,
                activatorCenterY = activatorCornerY + activatorHeight/2;
            return {
                activatorWidth: activatorWidth,
                activatorHeight: activatorHeight,
                activatorCenterX: activatorCenterX,
                activatorCenterY: activatorCenterY
            };
        };
    }catch(error){
        console.error(`*Circular-selector*: ${error.message}`);
    };   
};