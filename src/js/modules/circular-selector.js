
export default function(containerSelector){
    // Execution code: Initialize all needed elements and set up event listeners
    const selector = document.querySelector(containerSelector); // Main container element for the selector
    const selectorActivator = selector.querySelector(`${containerSelector}__activator`); // Element that triggers unfolding/interaction
    const elements = selector.querySelectorAll(`${containerSelector}__element`); // Radial menu items (cards, links, images etc.)
    const background = selector.querySelector(`${containerSelector}__background`) // SVG background for drawing connecting lines

    const primaryData = createPrimaryData(selector, elements); // Initial setup data extracted from DOM/data-attributes
    let elementsData = calculateCoords(primaryData, selector, elements); // Array of objects with positions and dimensions for each menu item
    correctStartCoords(elementsData); // Position all elements at their starting coordinates
    createResponseDesign(); // Set up resize listener to recalculate coords if container size changes

    const flags = {
        animationOutRunning: false, // Tracks if "unfold" animation is currently running
        animationInRunning: false // Tracks if "fold back" animation is currently running
    }
    
    selector.addEventListener('click', (e) => { 
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
        element.addEventListener(event, () => {
            flags[secondaryAnimationFlag] = false; //Stops the secondary animation if it's running
            if(!flags[primaryAnimationFlag] && !flags[secondaryAnimationFlag]){ // If neither animation is running
                flags[primaryAnimationFlag] = true; // Allows animation to run, prevents animation collisions
                primaryFunction(); //calls animation executor
            };
        });
    };

    // Extract initial configuration data from selector element's data attributes
    function createPrimaryData(selector, elements){
        const startDeg = selector.dataset.startDeg;  // Starting rotation angle for radial layout
        const childrenLeft = parseFloat(selector.dataset.childrenLeft); // Left offset % to children center
        const childrenTop = parseFloat(selector.dataset.childrenTop); // Top offset % to children center
        return { 
            startDeg: startDeg,
            elementsAmount: elements.length,
            childrenLeft: childrenLeft,
            childrenTop: childrenTop,
        }
    };
    // Calculate positions for each menu item for both initial and target (expanded) states
    function calculateCoords(primaryData, selector, elements){
        const result = []; 
        const degToRad = deg => deg*(Math.PI / 180); 
        const elementLeftProc = primaryData.childrenLeft;
        const elementTopProc = primaryData.childrenTop;
        const parentWidth = selector.offsetWidth; 
        const parentHeight = selector.offsetHeight; 
        const activatorWidth = selectorActivator.offsetWidth;
        const activatorHeight = selectorActivator.offsetHeight; 

        elements.forEach((element,i) => { //element means menu item
            const elementWidth = element.offsetWidth; 
            const elementHeight = element.offsetHeight;
            // Initial position relative to container based on % offset minus half element size (to center) 
            const offsetLeft = elementLeftProc/100 * parentWidth - elementWidth/2; 
            const offsetTop = elementTopProc/100 * parentHeight - elementHeight/2;
            const centerX = parentWidth/2; 
            const centerY = parentHeight/2; 
            
            const n = primaryData.elementsAmount; 
            const startRad = degToRad(primaryData.startDeg); 
            const R = parentWidth/2 * 0.8; // Radius of circle on which elements will be positioned
            // Calculate target position on circumference of circle for each element
            const targetCenterX = centerX + (R * Math.cos(startRad + (2*Math.PI/n) * i)); 
            const targetCenterY = Math.abs(-centerY + (R * Math.sin(startRad + (2*Math.PI/n) * i))); 
            // Convert center coordinates to top-left corner coordinates for absolute positioning
            const targetCornerX = targetCenterX - elementWidth/2; 
            const targetCornerY = targetCenterY - elementHeight/2; 
            // Store all relevant data for animation and positioning
            result.push({
                element: element, 
                elementCornerX: offsetLeft, 
                elementCornerY: offsetTop, 
                targetCornerX: targetCornerX,
                targetCornerY: targetCornerY, 
                initElementCornerX: offsetLeft, 
                initElementCornerY: offsetTop, 
                activatorCenterX: offsetLeft + activatorWidth/2, 
                activatorCenterY: offsetTop + activatorHeight/2,
                elementWidth: elementWidth,
                elementHeight: elementHeight,
                activatorWidth: activatorWidth,
                activatorHeight: activatorHeight
            });
        });
        roundData(result); // Round numeric values for precision
        return result;
    };

    // Round numeric values in all objects to 3 decimal places to avoid floating point errors
    function roundData(arrOfObjects){
        for(let value of arrOfObjects){
            for(let key in value){
                if(typeof value[key] == 'number'){
                    value[key] = (Math.round(value[key]*1000)/1000)
                };
            };
        };  
    };

    // Animate movement of menu items from current position to target or initial position
    function moveItems(elementsData, target, animationName){
        const start = performance.now();
        const duration = parseInt(selector.dataset.animationDuration);

        elementsData.forEach(obj => {
            obj.startX = obj.elementCornerX; // Save current position as animation start
            obj.startY = obj.elementCornerY;
        });
        function animate() {
            const now = performance.now();
            const delta = now - start;
            const t = Math.min(delta / duration, 1);
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
              dx = elementCenterX - obj.activatorCenterX,
              dy = elementCenterY - obj.activatorCenterY;
        if(len <= 0.01){ // Skip if length is too small
            return
        } 
        const len = Math.sqrt(dx**2 + dy**2),
              ux = dx/len, uy = dy/len,
              activatorR = Math.sqrt(obj.activatorWidth**2 + obj.activatorHeight**2)/2,
              elementR = Math.sqrt(obj.elementWidth**2 + obj.elementHeight**2)/2,
              x1 = obj.activatorCenterX + ux*activatorR,
              y1 = obj.activatorCenterY + uy*activatorR,
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
    };

    // Clear all SVG lines from background
    function removeLines(){
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
        let currentWidth = selector.offsetWidth;

        window.addEventListener('resize', () => {
            if(currentWidth !== selector.offsetWidth){
                currentWidth = selector.offsetWidth
                elementsData = calculateCoords(primaryData, selector, elements);
                correctStartCoords(elementsData);
                removeLines();
            };
        });
    };

    // Apply initial positions to activator and menu items based on calculated data
    function correctStartCoords(elementsData){
        selectorActivator.style.left = elementsData[0].elementCornerX + 'px';
        selectorActivator.style.top = elementsData[0].elementCornerY + 'px';
        elementsData.forEach(obj => {
            obj.element.style.left = obj.elementCornerX + 'px';
            obj.element.style.top = obj.elementCornerY + 'px';
        });
    };

};