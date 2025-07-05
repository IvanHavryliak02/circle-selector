
export default function(containerSelector){
    //Execution code
    const selector = document.querySelector(containerSelector); // Contains selector body
    const selectorActivator = selector.querySelector(`${containerSelector}__activator`); // Contains element which when hovered over, triggers the expansion of the entire radial menu, selector trigger
    const elements = selector.querySelectorAll(`${containerSelector}__element`); // Cards, links, images - whatever else you want to arrange the radial menu in a circular layout

    const primaryData = createPrimaryData(selector, elements); // creats object which contains initialization data
    let elementsData = calculateCoords(primaryData, selector, elements); // obj with element, target coords, element coords and other necessary data
    correctStartCoords(elementsData);
    createResponseDesign();

    const flags = {
        animationOutRunning: false, // A flag used to track whether the element MOVING OUT animation is currently running 
        animationInRunning: false // A flag used to track whether the element MOVING IN animation is currently running
    }
    
    selector.addEventListener('click', (e) => { 
        if(e.target.closest(`${containerSelector}__element`)){ // When one of the cards is clicked
            console.log('TEST: Card is clicked!'); // Test code, can be removed
            // Your code
        };
    });

    lookEvent(selectorActivator, 
        'mouseenter', 
        'animationOutRunning', 
        'animationInRunning', 
        () => {
            moveItems(elementsData, 'targetCorner', 'animationOut')
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

    function lookEvent(element, event, primaryAnimationFlag, secondaryAnimationFlag, primaryFunction){
        element.addEventListener(event, () => {
            flags[secondaryAnimationFlag] = false;
            if(!flags[primaryAnimationFlag] && !flags[secondaryAnimationFlag]){
                flags[primaryAnimationFlag] = true;
                primaryFunction();
            };
        });
    };

    function createPrimaryData(selector, elements){ //data is array with strings
        const startDeg = selector.dataset.startDeg;
        const childrenLeft = parseFloat(selector.dataset.childrenLeft);
        const childrenTop = parseFloat(selector.dataset.childrenTop);
        return {
            startDeg: startDeg,
            elementsAmount: elements.length,
            childrenLeft: childrenLeft,
            childrenTop: childrenTop
        }
    };

    function calculateCoords(primaryData, selector, elements){
        const result = [];
        const degToRad = deg => deg*(Math.PI / 180);
        const elementLeftProc = primaryData.childrenLeft;
        const elementTopProc = primaryData.childrenTop;
        const parentWidth = selector.offsetWidth;
        const parentHeight = selector.offsetHeight;

        elements.forEach((element,i) => {
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;
            const offsetLeft = elementLeftProc/100 * parentWidth - elementWidth/2; //elementCornerX
            const offsetTop = elementTopProc/100 * parentHeight - elementHeight/2; //elementCornerY
            const centerX = parentWidth/2;
            const centerY = parentHeight/2;
            
            const n = primaryData.elementsAmount;
            const startRad = degToRad(primaryData.startDeg);
            const R = parentWidth/2 * 0.7;
            const targetCenterX = centerX + (R * Math.cos(startRad + (2*Math.PI/n) * i)); 
            const targetCenterY = Math.abs(-centerY + (R * Math.sin(startRad + (2*Math.PI/n) * i)));
            const targetCornerX = targetCenterX - elementWidth/2;
            const targetCornerY = targetCenterY - elementHeight/2;

            result.push({
                element: element,
                elementCornerX: offsetLeft,
                elementCornerY: offsetTop,
                targetCornerX: targetCornerX,
                targetCornerY: targetCornerY,
                initElementCornerX: offsetLeft,
                initElementCornerY: offsetTop
            });
        });
        roundData(result);
        return result;
    };

    function roundData(arrOfObjects){
        for(let value of arrOfObjects){
            for(let key in value){
                if(typeof value[key] == 'number'){
                    value[key] = (Math.round(value[key]*1000)/1000)
                };
            };
        };  
    };

    function moveItems(elementsData, target, animationName){
        const start = performance.now();
        const duration = 1000;

        elementsData.forEach(obj => {
            obj.startX = obj.elementCornerX;
            obj.startY = obj.elementCornerY;
        });

        function animate() {
            const now = performance.now();
            const delta = now - start;
            const t = Math.min(delta / duration, 1);

            elementsData.forEach(obj => {
                changeCoordinate(obj, 'startX', 'elementCornerX', `${target}X`, t, 'left');
                changeCoordinate(obj, 'startY', 'elementCornerY', `${target}Y`, t, 'top');
            });

            if (delta < duration) {
                requestAnimationFrame(animate);
            } else {
                flags[`${animationName}Running`] = false;
            };
        };
        animate();
    };

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
        obj.element.style[side] = `${obj[elementCoord]}px`;
    }

    function createResponseDesign(){
        let currentWidth = selector.offsetWidth;

        window.addEventListener('resize', () => {
            if(currentWidth !== selector.offsetWidth){
                currentWidth = selector.offsetWidth
                elementsData = calculateCoords(primaryData, selector, elements);
                correctStartCoords(elementsData);
            };
        });
    };

    function correctStartCoords(elementsData){
        elementsData.forEach(obj => {
            selectorActivator.style.left = obj.elementCornerX + 'px';
            selectorActivator.style.top = obj.elementCornerY + 'px';
            obj.element.style.left = obj.elementCornerX + 'px';
            obj.element.style.top = obj.elementCornerY + 'px';
        });
    };

};