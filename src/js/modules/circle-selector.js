
export default function(containerSelector){

    const container = document.querySelector(containerSelector);
    const selectorActivator = container.querySelector(`${containerSelector}__activator`);
    const elements = selectorActivator.querySelectorAll(`${containerSelector}__element`);

    const containerWidth = container.dataset.size,
          containerHeight = container.dataset.size,
          startDeg = parseInt(container.dataset.startDeg),
          radius = 0.8*parseInt(container.dataset.size);

    container.style.width = containerWidth;
    container.style.height = containerHeight;

    console.log(initCalculation(startDeg, radius));
    const elementsData = initCalculation(startDeg, radius);

    selectorActivator.addEventListener('mouseenter', () => {
        requestAnimationFrame(() => {
            
        });
    });

    function moveOutElement(){
        const currentElement = elementsData[0][0];
        currentElement.style.display = 'block';
        const startCords = [getComputedStyle(currentElement).top, getComputedStyle(currentElement).left];
    }

    function initCalculation(startDeg, radius){

        const degsToRads = degs => degs*(pi/180),
              elementsAmount = elements.length,
              pi = Math.PI,
              startRadian = degsToRads(startDeg),
              radianBetweenElements = degsToRads(360/elementsAmount),
              result = [];

        for(let i = 1; i <= elementsAmount; i++){
            const cords = [
                elements[i],
                (Math.round((radius*Math.cos(startRadian + radianBetweenElements*i))*100))/100, 
                (Math.round((radius*Math.sin(startRadian + radianBetweenElements*i))*100))/100
            ];
            result.push(cords);
        }

        return result;
    }
}
  