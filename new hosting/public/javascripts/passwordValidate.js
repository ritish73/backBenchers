const password_field = document.querySelector('#password');
const password_fields = document.querySelectorAll('.reveal-pass');
const alertmessage = document.querySelector('#invalid-input-message');
const fullmsg = document.querySelector('#fullmsg');
const signUpBtn = document.querySelector('#sign_up_submit');
const eye = document.querySelectorAll('#trying-eye');
const hideye = document.querySelectorAll('#hideye');

var hidden = true;


eye[0].addEventListener('click',()=>{
    

    if(hidden){

        // far fa-eye   --- remove
        hideye[0].classList.remove('far','fa-eye');
        hideye[0].classList.add('fa', 'fa-eye-slash');
        password_fields[0].setAttribute('type', 'text')
        hidden = false;
        
    }  else {

        // fa fa-eye-slash --- remove
    hideye[0].classList.add('far', 'fa-eye');
    hideye[0].classList.remove('fa', 'fa-eye-slash');
    password_fields[0].setAttribute('type', 'password')
    hidden = true;

    }
    
})









eye[1].addEventListener('click',()=>{
    

    if(hidden){

        // far fa-eye   --- remove
        hideye[1].classList.remove('far','fa-eye');
        hideye[1].classList.add('fa', 'fa-eye-slash');
        password_fields[1].setAttribute('type', 'text')
        hidden = false;
        
    }  else {

        // fa fa-eye-slash --- remove
    hideye[1].classList.add('far', 'fa-eye');
    hideye[1].classList.remove('fa', 'fa-eye-slash');
    password_fields[1].setAttribute('type', 'password')
    hidden = true;

    }

    
})









invalidInput = (err) =>{
    alertmessage.innerText = err;
    // disable the submit button 
    signUpBtn.setAttribute('disabled', true);
}

showmessage = (msg)=>{
    fullmsg.innerText = msg;
}


password_fields[1].addEventListener('mousedown', ()=>{
showmessage('Password must contain atleast one capital letter, small letter, special character, digit and it must be atleast 8 characters long')
})

password_fields[1].addEventListener('input', ()=>{

    // password_fields[1].type = 'text';
    if(password_fields[1].value.length < 8){
        alertmessage.classList.remove('hide');
        invalidInput("Password must be more than 8 characters long");
        return;
    }  
    if(/\d/.test(password_fields[1].value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain a digit");
        return;
    }
    if(/\s/.test(password_fields[1].value) == true){
        alertmessage.classList.remove('hide');
        invalidInput("Password must not contain whitespaces");
        return;
    }
    if(/[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/.test(password_fields[1].value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain a special character");
        return;
    }
    if(/[A-Z]/.test(password_fields[1].value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain Capital");
        return;
    }

    if(/[a-z]/.test(password_fields[1].value) == false){
        alertmessage.classList.remove('hide');
        invalidInput("Password must contain small letter");
        return;
    }
    
    else {
        alertmessage.classList.add('hide');
        signUpBtn.removeAttribute('disabled');
    }
})