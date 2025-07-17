
import '../sass/main.sass';

import circleSelector from './modules/circular-selector';

circleSelector('.circle-selector', 
    {
        initDelay: "200ms",
        menuRadius: "0.8",
        breakpoint: "1200px",
        animationDuration: "800ms",
        childrenTop: '50%',
        childrenLeft: '50%',
        startDeg: "90degs",
        timingFunc: "easeInOutCubic",
        lineColor: "gray",
        lines: "show"
    },
    () => {console.log(`Menu item is clicked`)}
);