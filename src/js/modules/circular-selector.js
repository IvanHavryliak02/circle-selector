
export default function(containerSelector){
    //Execution code
    const selector = document.querySelector(containerSelector); // Contains selector body
    const selectorActivator = selector.querySelector(`${containerSelector}__activator`); // Contains element which when hovered over, triggers the expansion of the entire radial menu, selector trigger
    const elements = selector.querySelectorAll(`${containerSelector}__element`); // Cards, links, images - whatever else you want to arrange the radial menu in a circular layout

    const primaryData = createPrimaryData(selector, elements); // creats object which contains initialization data
    let elementsData = calculateCoords(primaryData, selector, elements); // obj with element, target coords, element coords and other necessary data
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
                function step(){
                    if(flags[primaryAnimationFlag]){                   
                        primaryFunction(elementsData);
                        requestAnimationFrame(step);
                    };
                };
                step();
            };
        });
    };

    function createPrimaryData(selector, elements){ //data is array with strings
        const startDeg = selector.dataset.startDeg;
        return {
            startDeg: startDeg,
            elementsAmount: elements.length
        }
    };

    function calculateCoords(primaryData, selector, elements){
        const result = [];
        const degToRad = deg => deg*(Math.PI / 180);
        const elementLeftProc = parseFloat(selector.dataset.childrenLeft);
        const elementTopProc = parseFloat(selector.dataset.childrenTop);
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

            const diffX = Math.abs(targetCornerX - offsetLeft);
            const diffY = Math.abs(targetCornerY - offsetTop);
            const stepX = diffX/60;
            const stepY = diffY/60;

            result.push({
                element: element,
                elementCornerX: offsetLeft,
                elementCornerY: offsetTop,
                targetCornerX: targetCornerX,
                targetCornerY: targetCornerY,
                initElementCornerX: offsetLeft,
                initElementCornerY: offsetTop,
                stepX: stepX,
                stepY: stepY,
                flag: false
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
        elementsData.forEach(obj => {
            changeCoordinate(obj, 'elementCornerX', `${target}X`, 'stepX', 'left');
            changeCoordinate(obj, 'elementCornerY', `${target}Y`, 'stepY', 'top');
            if(
                Math.abs(obj.elementCornerX - obj[`${target}X`]) < 1 &&
                Math.abs(obj.elementCornerY - obj[`${target}Y`]) < 1 
            ){
                obj.flag = true;
            };
        });
        if(elementsData.every(obj => obj.flag)){
            flags[`${animationName}Running`] = false;
            elementsData.forEach(obj => obj.flag = false)
        };
    }

    function changeCoordinate(obj, elementCoord, targetCoord, step, side){
        if(obj[elementCoord] !== obj[targetCoord]){
            if(obj[elementCoord] < obj[targetCoord]){
                obj[elementCoord] += obj[step];
                obj.element.style[side] = `${obj[elementCoord]}px`;
            }else if(obj[elementCoord] > obj[targetCoord]){
                obj[elementCoord] -= obj[step];
                obj.element.style[side] = `${obj[elementCoord]}px`;
            };
        };
    };

    function createResponseDesign(){
        let currentWidth = selector.offsetWidth;

        window.addEventListener('resize', () => {
            if(currentWidth !== selector.offsetWidth){
                currentWidth = selector.offsetWidth
                elementsData = calculateCoords(primaryData, selector, elements);
                correctStartCoords(elementsData);
            };
        });

        function correctStartCoords(elementsData){
            elementsData.forEach(obj => {
                obj.element.style.left = obj.elementCornerX + 'px';
                obj.element.style.top = obj.elementCornerY + 'px';
            });
        };
    };
};