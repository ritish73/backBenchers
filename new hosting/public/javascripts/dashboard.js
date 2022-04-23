


var freeze = ()=>{
  document.body.style.overflow = 'hidden';
  document.querySelector('html').scrollTop = window.scrollY;
}

function enableScroll() {
document.body.style.overflow = null;
}

setTimeout(function(){
  alert.removeClass("show");
  alert.addClass("hide");
},5000);

$('.close-btn').click(function(){
  alert.removeClass("show");
  alert.addClass("hide");
});
// // make sure that email does not change

// const emailinput = document.querySelector('.check-change-mail');
// const updateInfo = document.querySelector('.update-info');
// const initialval = emailinput.value;
// const errorMessage = document.querySelector('#error-message');

// updateInfo.addEventListener('mouseover', ()=>{
//     alert('byvhgbhib')
//     if(emailinput.value != initialval){
//         console.log('disabled')
//         updateInfo.setAttribute('disabled', true);
//         errormessage.innerText = 'Please write correct email-id first';
//     } else{
//         updateInfo.removeAttribute('disabled');
//         errormessage.innerText = '';
//     }
// })

// emailinput.addEventListener('change' , ()=>{
//     cosnsole.log(emailinput.value);
// })

// document.body.style.cursor="wait";

var box = $('.popup_box');
var openpopup = document.querySelector('.click');
var boxp = document.querySelector('.popup_box');
$(document).ready(function(){
  $('.click').click(function(){
      box.css("display", "block");
      freeze();
    });
    $('.btn1').click(function(){
      box.css("display", "none");
      enableScroll()
    });
    $('.btn2').click(function(){
      box.css("display", "none");
      enableScroll()
      alert("Account Permanently Deleted.");
    });
  });



var httpRequest;
function deleteAccount(e){
    
    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = deleteAccountRequest;
    httpRequest.open('GET', '/delete');        
    httpRequest.send();   
    
}

function deleteAccountRequest(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            // let respJson = JSON.parse(httpRequest.responseText);
            window.location = '/logout';
        } else {
            alert('There was a problem with the request.');
        }
    }
}


var removeProfilePic = async (e)=>{

  httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = removeProfilePicRequest;
    httpRequest.open('GET', '/removeProfilePic');        
    httpRequest.send();   

}

function removeProfilePicRequest(){
  if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
          let respJson = JSON.parse(httpRequest.responseText);
          if(respJson.status){
            showAlert(respJson.message)
          } else {
            showAlert(respJson.message)
          }
          
      } else {
          alert('There was a problem with the request.');
      }
  }
}


var showAlert = async (msg)=>{

  var messaged = $('.msg-alert');      
  var alert  = $('.alert');
      messaged.text(msg) 
      alert.addClass("show");
      alert.removeClass("hide");
      alert.addClass("showAlert");

      setTimeout(function(){
      alert.removeClass("show");
      alert.addClass("hide");
      },5000);

  $('.close-btn').click(function(){
      alert.removeClass("show");
      alert.addClass("hide");
  })

}






