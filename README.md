
# Circular-selector ⚪

This project was created to help you quickly create circulare menus in your projects.
It is based on HTML, CSS, native JavaScript. 
A circular menu is menu whose elements arranged along the circumference of a circle.

## Getting started

### HTML

First, add the HTML structure to your project. 
**Please remember that structure must follow the BEM methodology.** 

```
<div class="circle-selector">
    <div class="circle-selector__activator">Menu name</div>
    <div class="circle-selector__element">Your Content 1</div>
    <div class="circle-selector__element">Your Content 2</div>
    <div class="circle-selector__element">Your Content 3</div>
    ...
    <div class="circle-selector__element">Your Content n</div>
    <svg class="circle-selector__background">Keep it empty!</svg>
</div>
```

**You can replace ```circle-selector``` any other base class name you prefer, but 
remember not to change the part after ```__```**

### CSS 

Second, create a CSS file with the code below and link it to your project
so that its styles are applied to the elements.

```
.circle-selector {
  position: relative;
  width: 800px; // the width you want
  height: 1200px; // the height you want
  z-index: 100;
}

.circle-selector__activator, .circle-selector__element {
  width: 170px; // the width you want
  height: 250px; // or the CSS aspect-ratio property, if you prefer
  position: absolute;
}

.circle-selector__element {
  z-index: 500;
}

.circle-selector__activator {
  z-index: 1000;
}

.circle-selector__background {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: -1000;
  pointer-events: none;
}
```

**Please, do not move or shift elements using CSS styles.**
Their positioning relative to the parent is calculated and controlled by JavaScript.**

### JavaScript

The script is available in two formats for your convenience:

1. As an ES6+ module - suitable for use with bundlers like Webpack or Vite
2. As an IIFE script - which can be included via a ```<script>``` tag either at the end
   of your ```<body>``` or in the ```<head>``` tag with the ```defer``` attribute. 

The ES6 module is available at: ```dist/module/circular-selector.es.js```;
The IIFE version is available at: ```dist/module/circular-selector.iife.js```;

If you're using ES6+ module, you need to include the following code in your main script: 

```
import exampleSelector from 'path/to/ESModule'

exampleSelector('.circle-selector', settingsObj, menuItemCallback);
```

If you're using an IIFE version, simply call: 

```
circularSelector('.circle-selector', settingsObj, menuItemCallback);
// Please remember that in this case the function name must be exactly circularSelector
```

**The circularSelector function accepts 3 arguments:**

1. '.circle-selector' — the class name that identifies the selector itself (see the HTML structure).

2. settingsObj — a settings object, described below.

3. menuItemCallback(event) — a callback function to be executed when any menu item is clicked.
   **Please, note that the same callback is executed for any clicked item**
   The callback receives an ```event``` object on each click at menu element, which you can handle in various ways. 
   Therefore, when creating your callback, remember that the ```event``` object related to the menu item click is 
   available to you at your callback as argument.

### Selector Setup

SettingsObj:
 
```
    {
        initDelay: "200ms", // Script start delay time, recommended 100–200ms depending on style loading speed
        menuRadius: "0.8", // (0.1 - 1) 0.1 - Radius of menu = 10% of half the container's width
        breakpoint: "1200px", // For screen widths above 1200px, the selector activates on hover over the activator.
                              //For screen widths below 1200px, the selector activates on click of the activator and deactivates on a second click outside the activator and items.
        animationDuration: "800ms", // Duration of the menu expand and collapse animation
        childrenTop: '50%', // Offset of the **center** of the items and activator from the **top** edge of the selector
        childrenLeft: '50%', // Offset of the **center** of the items and activator from the **left** edge of the selector
        startDeg: "90degs", // Starting angle of the arc. Determines the angle relative to the X-axis at which the first menu item will be positioned.
        timingFunc: "easeInOutCubic", // animation type, available: linear (default), easeInQuad, easeOutQuad, 
                                      // easeInOutQuad, easeInCubic, easeOutCubic, easeInOutCubic, easeInQuart, easeOutQuart, easeInOutQuart
        lineColor: "gray", // Selector line color, can be specified in hex, rgb, rgba;
        lines: "show" // Enables or disables line rendering. Any value other than 'show' will hide the lines.
    }, 
``` 

### Example of a correct selector call

```
circularSelector('.menu', 
{
    lineColor: "gray", 
    lines: "show", 
    timingFunc: "easeInQuart", 
    startDeg: "0degs" 
}, 
(event) => {
    console.log(`Clicked: ${event.target}`);
});
```

**A demo version of the module, as well as the ES and IIFE versions in module folder, are provided in the dist folder**