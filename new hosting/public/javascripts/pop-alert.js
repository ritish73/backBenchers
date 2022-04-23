

var message = $('.msg-alert');
var likebutton = $('.make-pop')
var alert  = $('.alert');
var alert_custom  = $('.alert_custom');
var btn = $('.pop-alert');



setTimeout(function(){
    alert.removeClass("show");
    alert.addClass("hide");
  },5000);

// btn.click(function(){

//     alert.addClass("show");
//     alert.removeClass("hide");
//     alert.addClass("showAlert");

//     setTimeout(function(){
//       alert.removeClass("show");
//       alert.addClass("hide");
//     },5000);

//   });


// likebutton.click(function(){

//     alert.addClass("show");
//     alert.removeClass("hide");
//     alert.addClass("showAlert");

//     setTimeout(function(){
//       alert.removeClass("show");
//       alert.addClass("hide");
//     },5000);

//   });

  $('.close-btn').click(function(){
    alert.removeClass("show");
    alert.addClass("hide");
  });

  $('.close-btn').click(function(){
    alert_custom.removeClass("show");
    alert_custom.addClass("hide");
  });