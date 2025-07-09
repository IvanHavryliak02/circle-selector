
export default function(containerSelector){
    // Execution code: Initialize all needed elements and set up event listeners
    const selector = document.querySelector(containerSelector), // Main container element for the selector
          selectorActivator = selector.querySelector(`${containerSelector}__activator`), // Element that triggers unfolding/interaction
          elements = selector.querySelectorAll(`${containerSelector}__element`), // Radial menu items (cards, links, images etc.)
          background = selector.querySelector(`${containerSelector}__background`); // SVG background for drawing connecting lines
    let primaryData, elementsData, activator;

        primaryData = createPrimaryData(selector, elements); // Initial setup data extracted from DOM/data-attributes
        elementsData = calculateCoords(primaryData, selector, elements); // Array of objects with positions and dimensions for each menu item
        
        startCoordsCorrection(elementsData); // Position all elements at their starting coordinates
        createResponseDesign(); // Set up resize listener to recalculate coords if container size changes

    const flags = {
        animationOutRunning: false, // Tracks if "unfold" animation is currently running
        animationInRunning: false // Tracks if "fold back" animation is currently running
    }

    selector.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if(e.target.closest(`${containerSelector}__element`)){ // Detect click on any menu item
            alert('TEST: Card is clicked!'); // Placeholder for your custom click handler
            // Add your code here
        };
    });

    // Setup event listeners for mouse enter, leave, and click to trigger animations
    lookEvent(selectorActivator, //event listener target
        'mouseenter', // event
        'animationOutRunning', // Name of the first animation to run
        'animationInRunning', // Name of the last animation to run
        () => {
            moveItems(elementsData, 'targetCorner', 'animationOut'); // Animation executor
    });
    lookEvent(selector, 
        'mouseleave', 
        'animationInRunning', 
        'animationOutRunning', 
        () => {
            moveItems(elementsData, 'initElementCorner', 'animationIn')
    });
    lookEvent(selectorActivator, 
        'click', 
        'animationOutRunning', 
        'animationInRunning', 
        () => {
            moveItems(elementsData, 'targetCorner', 'animationOut')
    });
    //functions    

    // Utility function to add event listener and control animation flags to prevent collisions
    function lookEvent(element, event, primaryAnimationFlag, secondaryAnimationFlag, primaryFunction){
        element.addEventListener(event, (e) => {
            console.log(`Event ${event} is started!`)
            e.stopPropagation;
            flags[secondaryAnimationFlag] = false; //Stops the secondary animation if it's running
            if(!flags[primaryAnimationFlag] && !flags[secondaryAnimationFlag]){ // If neither animation is running
                flags[primaryAnimationFlag] = true; // Allows animation to run, prevents animation collisions
                primaryFunction(); //calls animation executor
            };
        });
    };

    // Extract initial configuration data from selector element's data attributes
    function createPrimaryData(selector, elements){
        const startDeg = selector.dataset.startDeg,  // Starting rotation angle for radial layout
              childrenLeft = parseFloat(selector.dataset.childrenLeft), // Left offset % to children center
              childrenTop = parseFloat(selector.dataset.childrenTop); // Top offset % to children center
        return { 
            startDeg: startDeg,
            elementsAmount: elements.length,
            childrenLeft: childrenLeft,
            childrenTop: childrenTop,
        }
    };
    // Calculate positions for each menu item for both initial and target (expanded) states
    function calculateCoords(primaryData, selector, elements){
        console.log(`Coords calculation`);
        const result = [], 
              degToRad = deg => deg*(Math.PI / 180), 
              elementLeftProc = primaryData.childrenLeft,
              elementTopProc = primaryData.childrenTop,
              parentWidth = selector.offsetWidth,
              parentHeight = selector.offsetHeight;

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
                  R = parentWidth/2 * 0.8; // Radius of circle on which elements will be positioned
            // Calculate target position on circumference of circle for each element
            const targetCenterX = centerX + (R * Math.cos(startRad + (2*Math.PI/n) * i)), 
                  targetCenterY = Math.abs(-centerY + (R * Math.sin(startRad + (2*Math.PI/n) * i))); 
            // Convert center coordinates to top-left corner coordinates for absolute positioning
            const targetCornerX = targetCenterX - elementWidth/2, 
                  targetCornerY = targetCenterY - elementHeight/2; 
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
              duration = parseInt(selector.dataset.animationDuration);

        elementsData.forEach(obj => {
            obj.startX = obj.elementCornerX; // Save current position as animation start
            obj.startY = obj.elementCornerY;
        });
        function animate() {
            const now = performance.now(),
                  delta = now - start,
                  t = Math.min(delta / duration, 1);
            removeLines();

            elementsData.forEach(obj => {
                changeCoordinate(obj, 'startX', 'elementCornerX', `${target}X`, t, 'left');
                changeCoordinate(obj, 'startY', 'elementCornerY', `${target}Y`, t, 'top');
                if(background.dataset.lines === 'show'){ // Draw connecting lines if enabled
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
        const color = background.dataset.lineColor,
              elementCenterX = obj.elementCornerX + obj.elementWidth/2,
              elementCenterY = obj.elementCornerY + obj.elementHeight/2,
              dx = elementCenterX - activator.activatorCenterX,
              dy = elementCenterY - activator.activatorCenterY,
              len = Math.sqrt(dx**2 + dy**2),
              activatorR = Math.sqrt(activator.activatorWidth**2 + activator.activatorHeight**2)/2;
        if(len <= activatorR){ // Skip if line must be in activator
            return
        } 
        const ux = dx/len, uy = dy/len,
              elementR = Math.sqrt(obj.elementWidth**2 + obj.elementHeight**2)/2,
              x1 = activator.activatorCenterX + ux*activatorR,
              y1 = activator.activatorCenterY + uy*activatorR,
              x2 = elementCenterX - ux*elementR,
              y2 = elementCenterY - uy*elementR; 
        background.innerHTML +=`
            <line 
                x1='${x1}' 
                y1='${y1}' 
                x2='${x2}' 
                y2='${y2}' 
                stroke='${color}
            '/>
        `
        console.log(`Lines drawn`)
    };

    // Clear all SVG lines from background
    function removeLines(){
        console.log(`Removing lines`)
        background.innerHTML = '';
    }

    // Interpolates element coordinate between start and target positions based on timing function
    function changeCoordinate(obj, startCoord, elementCoord, targetCoord, t, side) {
        let progress;

        switch (selector.dataset.timingFunc) {
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
            default:
                progress = t;
        }

        const distance = obj[targetCoord] - obj[startCoord];

        obj[elementCoord] = obj[startCoord] + distance * progress;
        obj.element.style[side] = `${obj[elementCoord]}px`; // Update element style (left or top)
    }

    // Add resize listener to recalculate positions if container size changes
    function createResponseDesign(){
        let currentWidth = selector.offsetWidth,
            timeoutId, i = 0;

        window.addEventListener('resize', () => {
            clearTimeout(timeoutId);
            if(currentWidth !== selector.offsetWidth){
                flags.animationInRunning = false;
                flags.animationOutRunning = false;
                console.log(`setting timeout ${++i}`)
                timeoutId = setTimeout(() => {
                    requestAnimationFrame(() => {
                        currentWidth = selector.offsetWidth;
                        elementsData = calculateCoords(primaryData, selector, elements);
                        startCoordsCorrection(elementsData);
                        removeLines();
                    })
                }, 100)
            };
        });
    };

    // Apply initial positions to activator and menu items based on calculated data
    function startCoordsCorrection(elementsData){
        console.log(`Coords correcting`);
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
        selectorActivator.style.top = minY + 'px';
        selectorActivator.style.height = elementsData[ordNum].elementHeight;
        console.log(`Correcting finished`)
        activator = getActivatorParams(selectorActivator, minX, minY);
    };

    function getActivatorParams(activator, activatorCornerX, activatorCornerY){
        console.log(`Creating activator params`);
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
};