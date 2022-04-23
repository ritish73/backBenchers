
const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");
const pass = document.querySelector('#password')


sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// here we validate the password 
const sign_up = document.querySelector('.submitAfterValidation')
const username = document.querySelector('#username')
const email = document.querySelector('#email')
const password = document.querySelector('#password')
var gusername, gemail;
// const sign_up_btn = document.querySelector('#sign_up_submit');

var httpRequest = new XMLHttpRequest();
function validateInputs(e){

  
  


    gusername = username.value
  gemail = email.value
  gpass = pass.value


    if (!/\S/.test(gusername)) {
      // Didn't find something other than a space which means it's empty
      showAlert('You must provide a valid username')
      // return
  
    }

    else if (gusername.length >25) {
      // Didn't find something other than a space which means it's empty
      showAlert('Username too long')
      // return
    }
  
    else if (!/\S/.test(gemail)) {
      // Didn't find something other than a space which means it's empty
      showAlert('You must provide a valid email')
      // return
    }
  
    else if(!gemail){
      showAlert('Please fill the email')
      // return
    }
   
    else if(!gpass){
      showAlert('Please fill the password')
      // return
    }
  


  

  
    
    if (!httpRequest) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
    httpRequest.onreadystatechange = validInputsRequest;
    httpRequest.open('GET', '/registerUserValidation/'+gusername+'/'+gemail);    
    httpRequest.send();   
   
}

function validInputsRequest(){

    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        // console.log(httpRequest.responseText)
        var respJson = JSON.parse(httpRequest.responseText)
        
        if(!respJson.status) showAlert(respJson.message)
        else{
          sign_up.setAttribute("type", "submit");
          sign_up.removeAttribute('onclick');
          sign_up.click();
        }


        // if status == 1 means no problem so just submit the user 
        // add an attribute type="submit" and remove the onclick event and click the button automattically



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


