$(function () {
  $('#slider').unslider({
    speed: 500, //  The speed to animate each slide (in milliseconds)
    delay: 5000, //  The delay between slide animations (in milliseconds)
    keys: true, //  Enable keyboard (left, right) arrow shortcuts
    dots: true, //  Display dot navigation
    fluid: false //  Support responsive design. May break non-responsive designs
  });
});