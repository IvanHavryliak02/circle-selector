
export default function(containerSelector){
    //Execution code
    const selector = document.querySelector(containerSelector);
    const selectorActivator = container.querySelector(`${containerSelector}__activator`);
    const elements = container.querySelectorAll(`${containerSelector}__element`);
    

    //functions

    function getSelectorParams(selector){
        
    }

    //console.log(container, selectorActivator, elements) //debug cheked - ok

    /* const containerWidth = container.dataset.size,
          containerHeight = container.dataset.size,
          startDeg = parseFloat(container.dataset.startDeg),
          radius = 0.8*(parseFloat(container.dataset.size)/2),
          centerX = parseFloat(containerWidth)/2,
          centerY = parseFloat(containerHeight)/2;

          console.log(`Container:{w:${containerWidth}, h:${containerHeight}}`); //debug checked - ok
          console.log(`StartDeg:${startDeg}`);
          console.log(`Radius:${radius}`);
          console.log(`Center:{x:${centerX}, y:${centerY}}`);

    container.style.width = containerWidth;
    container.style.height = containerHeight;

    console.log(`calling initCalculation:`) //debug ok

    const targetsObj = initCalculation(startDeg, radius);
    
    selectorActivator.addEventListener('mouseenter', () => {
        const moveElements = moveOutElement(0);
        let i = 0;
        function step(){
            moveElements();
            i++;
            if(i < 200){
                requestAnimationFrame(step);
            }
        }
        step();
    });

    //functions

    function initCalculation(startDeg, radius){

        const degsToRads = degs => degs*(Math.PI/180),
              elementsAmount = elements.length,
              startRadian = Math.round(degsToRads(startDeg)*1000)/1000,
              radianBetweenElements = Math.round(degsToRads(360/elementsAmount)*1000)/1000,
              result = [];

        console.log(`Elements amount: ${elementsAmount}`); //debug ok
        console.log(`Start rad: ${startRadian}`);
        console.log(`Radian between elements: ${radianBetweenElements}`);

        for(let i = 0; i < elementsAmount; i++){
            const coords = {
                element: elements[i],
                targetCenterX: centerX + radius*Math.cos(startRadian + radianBetweenElements*i), 
                targetCenterY: centerY + radius*Math.sin(startRadian + radianBetweenElements*i),
                elementWidth: parseFloat(getComputedStyle(elements[i]).width),
                elementHeight: parseFloat(getComputedStyle(elements[i]).height),
                offsets: calculateElementCoordinates(elements[i])
            };
            result.push(coords);
            
        }
        console.log(`function finished! Result:`); //debug ok
        console.log(result)
        return result;
    }

    function moveOutElement(i){
        console.log('Mouse in, calling moveOutElement');

        const currentTarget = targetsObj[i];
              console.log(currentTarget);

        let cornerX = currentTarget.offsets[0],
            cornerY = currentTarget.offsets[1];

        const cornerTargetX = currentTarget.x - currentTarget.elementWidth/2,
              cornerTargetY = currentTarget.y + currentTarget.elementHeight/2,
              diffX = Math.abs(cornerTargetX - cornerX),
              diffY = Math.abs(cornerTargetY - cornerY);
              currentTarget.element.style.display = 'block'

        return function (){
            const stepX = diffX / 100,
                  stepY = diffY / 100;
            let newX, newY; 
            
            if(cornerTargetX > 0 && cornerTargetY >= 0){
                newX = cornerX + stepX;
                newY = cornerY + stepY
            }else if(cornerTargetX <= 0 && cornerTargetY > 0){
                newX = cornerX - stepX;
                newY = cornerY + stepY
            }else if(cornerTargetX < 0 && cornerTargetY <= 0){
                newX = cornerX - stepX;
                newY = cornerY - stepY
            }else if(cornerTargetX >= 0 && cornerTargetY < 0){
                newX = cornerX + stepX;
                newY = cornerY - stepY
            }
            currentTarget.element.style.left = `${newX}px`
            currentTarget.element.style.top = `${newY}px`
            cornerX = newX;
            cornerY = newY;
        }
    } 

    function calculateElementCoordinates(element){
              
        const parentWidth = parseFloat(containerWidth),
              parentHeight = parseFloat(containerHeight),
              elementTopProc = parseFloat(getComputedStyle(element).top),
              elementLeftProc = parseFloat(getComputedStyle(element).left),
              elementWidth = parseFloat(getComputedStyle(element).width),
              elementHeight = parseFloat(getComputedStyle(element).height);
              console.log(`ParentWidth: `)
        const offsetLeft = elementLeftProc/100 * parentWidth - elementWidth/2,
              offsetTop = elementTopProc/100 * parentHeight - elementHeight/2;
        return {elementCornerX: offsetLeft, elementCornerY:offsetTop };
    } */
}
