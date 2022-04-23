var controller = new ScrollMagic.Controller();


var logoScene = new ScrollMagic.Scene({
    triggerElement: '.triggerForLogo',
    duration:'90%',
    triggerHook:0.7,
    reverse:true
})
.setClassToggle('.logologo', 'fade-in')
// .addIndicators()
.addTo(controller);

var visionHeadingScene = new ScrollMagic.Scene({
    triggerElement: '.box',
    duration:'60%',
    triggerHook:0.6
})
.setClassToggle('.box', 'show')
// .addIndicators()
.addTo(controller);

var visionParagraphScene = new ScrollMagic.Scene({
    triggerElement: '.vision-text p',
    duration:'50%',
    triggerHook:0.8,
})
.setClassToggle('.vision-text p', 'shift')
// .addIndicators()
.addTo(controller);


var cards = new ScrollMagic.Scene({
    triggerElement: '.main-container',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.container', 'fade')
// .addIndicators()
.addTo(controller);

// var pins = document.querySelectorAll('section.pin');
// for(var i=0; i<pins.length;i++){
//     var scene = new ScrollMagic.Scene({
//         triggerElement: 'pin',
//         duration:'100%',
//         triggerHook: 0
//     })
//     .setPin('.pin', {pushFollowers: false})
//     .addIndicators()
//     .addTo(controller);
// }

var pinLandPage = new ScrollMagic.Scene({
    triggerElement: '.landing-page',
    duration:'90%',
    triggerHook:0
})
.setPin('.landing-page', {pushFollowers: false})
// .addIndicators()
.addTo(controller);


var visionScene = new ScrollMagic.Scene({
    triggerElement: '.vision',
    duration:'120%',
    triggerHook:0
})
.setPin('.vision', {pushFollowers: false})
// .addIndicators()
.addTo(controller);


var techCards = new ScrollMagic.Scene({
    triggerElement: '.tech-cards',
    duration: '130%',
    triggerHook:0
})
.setPin('.tech-cards', {pushFollowers: false})
// .addIndicators()
.addTo(controller);


// var cardsshift1 = new ScrollMagic.Scene({
//     triggerElement: '.cards-shift',
//     duration:'70%',
//     triggerHook:0.4
// })
// .setClassToggle('.container:nth-child(1)', 'cardShift1')
// .addIndicators()
// .addTo(controller); 

// var cardsshift2 = new ScrollMagic.Scene({
//     triggerElement: '.cards-shift',
//     duration:'70%',
//     triggerHook:0.4
// })
// .setClassToggle('.container:nth-child(2)', 'cardShift2')
// .addIndicators()
// .addTo(controller); 

// var cardsshift3 = new ScrollMagic.Scene({
//     triggerElement: '.cards-shift',
//     duration:'70%',
//     triggerHook:0.4
// })
// .setClassToggle('.container:nth-child(3)', 'cardShift3')
// .addIndicators()
// .addTo(controller); 

var personalitydev = new ScrollMagic.Scene({
    triggerElement: '.personality-dev',
    duration:'130%',
    triggerHook:0
})
.setPin('.personality-dev', {pushFollowers: false})
// .addIndicators()
.addTo(controller);


var Commerce = new ScrollMagic.Scene({
    triggerElement: '.Commerce',
    duration:'127%',
    triggerHook:0
})
.setPin('.Commerce', {pushFollowers: false})
// .addIndicators()
.addTo(controller);


var businesseconomics = new ScrollMagic.Scene({
    triggerElement: '.business-economics',
    duration:'127%',
    triggerHook:0
})
.setPin('.business-economics', {pushFollowers: false})
// .addIndicators()
.addTo(controller);



var latest1 = new ScrollMagic.Scene({
    triggerElement: '.one-1',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.one-1', 'fade')
// .addIndicators()
.addTo(controller);

var recommended1 = new ScrollMagic.Scene({
    triggerElement: '.two-1',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.two-1', 'fade')
// .addIndicators()
.addTo(controller);

var mostviewed1 = new ScrollMagic.Scene({
    triggerElement: '.three-1',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.three-1', 'fade')
// .addIndicators()
.addTo(controller);




var latest2 = new ScrollMagic.Scene({
    triggerElement: '.one-2',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.one-2', 'fade')
// .addIndicators()
.addTo(controller);

var recommended2 = new ScrollMagic.Scene({
    triggerElement: '.two-2',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.two-2', 'fade')
// .addIndicators()
.addTo(controller);

var mostviewed2 = new ScrollMagic.Scene({
    triggerElement: '.three-2',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.three-2', 'fade')
// .addIndicators()
.addTo(controller);




var latest3 = new ScrollMagic.Scene({
    triggerElement: '.one-3',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.one-3', 'fade')
// .addIndicators()
.addTo(controller);

var recommended3 = new ScrollMagic.Scene({
    triggerElement: '.two-3',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.two-3', 'fade')
// .addIndicators()
.addTo(controller);

var mostviewed3 = new ScrollMagic.Scene({
    triggerElement: '.three-3',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.three-3', 'fade')
// .addIndicators()
.addTo(controller);







var latest4 = new ScrollMagic.Scene({
    triggerElement: '.one-4',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.one-4', 'fade')
// .addIndicators()
.addTo(controller);

var recommended4 = new ScrollMagic.Scene({
    triggerElement: '.two-4',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.two-4', 'fade')
// .addIndicators()
.addTo(controller);

var mostviewed4 = new ScrollMagic.Scene({
    triggerElement: '.three-4',
    duration:'50%',
    triggerHook:0.4,
})
.setClassToggle('.three-4', 'fade')
// .addIndicators()
.addTo(controller);


var backtotop = new ScrollMagic.Scene({
    triggerElement: 'section.footer',
    duration:'50%',
    triggerHook:0
})
.setClassToggle('.back-to-top', 'fadeb')
// .addIndicators()
.addTo(controller);



// var reviews = new ScrollMagic.Scene({
//     triggerElement: '.reviews',
//     duration:'90%',
//     triggerHook:0
// })
// .setPin('.reviews', {pushFollowers: false})
// // .addIndicators()
// .addTo(controller);

// var footer = new ScrollMagic.Scene({
//     triggerElement: '.footer',
//     duration:'70%',
//     triggerHook:0,
// })
// .setPin('.footer', {pushFollowers: false})
// .addIndicators()
// .addTo(controller);





// parallax effect on vision

// var parallaxScene1 = new ScrollMagic.Scene({
//     triggerElement: '.parallax1',
//     duration: '220%',
//     triggerHook: 0.3
//   })
//   .setTween(TweenMax.from('.bgimg1', 1, {y: '-5%', ease:Power0.easeNone}))
//   .addIndicators()
//   .addTo(controller);
