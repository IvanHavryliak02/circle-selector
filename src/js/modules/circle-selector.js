
export default function(containerSelector){
    //Execution code
    const selector = document.querySelector(containerSelector);
    const selectorActivator = selector.querySelector(`${containerSelector}__activator`);
    const elements = selector.querySelectorAll(`${containerSelector}__element`);
    
    const primaryData = getSelectorParams(selector); //object
    setSelectorSize(primaryData, selector); //sets container size
    addPrimaryData(primaryData, selector, elements) //adds to primaryData radius, elementsAmount
    const elementsData = calculateCoords(primaryData, selector, elements); //obj with target coords, element coords and element
    //functions

    selectorActivator.addEventListener('mouseenter', () => {
        function moveItems(){
            elementsData.forEach(obj => {
            const currentElement = obj.element;
            currentElement.style.display = 'block';
            const diffX = Math.abs(obj.targetCornerX - obj.elementCornerX);
            const diffY = Math.abs(obj.targetCornerY - obj.elementCornerY);
            const stepX = diffX/100;
            const stepY = diffY/100;
                if(obj.elementCornerX !== obj.targetCornerX){
                    if(obj.elementCornerX < obj.targetCornerX){
                        obj.elementCornerX += stepX;
                        currentElement.style.left = `${obj.elementCornerX}px`;
                    }else if(obj.elementCornerX > obj.targetCornerX){
                        obj.elementCornerX -= stepX;
                        currentElement.style.left = `${obj.elementCornerX}px`;
                    }
                }
                if(obj.elementCornerY !== obj.targetCornerY){
                    if(obj.elementCornerY < obj.targetCornerY){
                        obj.elementCornerY += stepY;
                        currentElement.style.top = `${obj.elementCornerY}px`;
                    }else if(obj.elementCornerY > obj.targetCornerY){
                        obj.elementCornerY -= stepY;
                        currentElement.style.top = `${obj.elementCornerY}px`;
                    }
                }
            })
            requestAnimationFrame(moveItems);
        }
        moveItems();
    })

    function getSelectorParams(selector){
        const startDeg = selector.dataset.startDeg, //string
              size = selector.dataset.sizeInPx; //string
              return {startDeg: startDeg, size: size};
    }

    function setSelectorSize(primaryData, selector){
        const width = primaryData.size, //string
              height = primaryData.size; //string
        selector.style.width = width;
        selector.style.height = height;
    }

    function addPrimaryData(primaryData, selector, elements){ //data is array with strings
        const selectorWidth = parseFloat(selector.style.width)/2,
        radius = 0.7 * selectorWidth;
        primaryData.radius = radius;
        primaryData.elementsAmount = elements.length;
    }

    function calculateCoords(primaryData, selector, elements){
        const result = []
        const degToRad = deg => deg*(Math.PI / 180);
        elements.forEach((element,i) => {
            const elementWidth = parseFloat(getComputedStyle(element).width);
            const elementHeight = parseFloat(getComputedStyle(element).height);
            const elementLeftProc = parseFloat(selector.dataset.childrenLeft);
            const elementTopProc = parseFloat(selector.dataset.childrenTop);
            const parentWidth = parseFloat(getComputedStyle(selector).width);
            const parentHeight = parseFloat(getComputedStyle(selector).height);
            const offsetLeft = elementLeftProc/100 * parentWidth - elementWidth/2; //elementCornerX
            const offsetTop = elementTopProc/100 * parentHeight - elementHeight/2; //elementCornerY
            const centerX = parentWidth/2;
            const centerY = parentHeight/2;
            
            const n = primaryData.elementsAmount;
            const startRad = degToRad(primaryData.startDeg);
            const R = primaryData.radius;
            const targetCenterX = centerX + (R * Math.cos(startRad + (2*Math.PI/n) * i)); 
            const targetCenterY = Math.abs(-centerY + (R * Math.sin(startRad + (2*Math.PI/n) * i)));
            const targetCornerX = targetCenterX - elementWidth/2;
            const targetCornerY = targetCenterY - elementHeight/2;

            result.push({
                element: element,
                elementCornerX: offsetLeft,
                elementCornerY: offsetTop,
                targetCornerX: targetCornerX,
                targetCornerY: targetCornerY
            });
        })
        return result
    }
}