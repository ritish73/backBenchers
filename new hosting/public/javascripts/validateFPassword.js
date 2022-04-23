const password_field = document.querySelector('#password');
const alertmessage1 = document.querySelector('#invalid-input-message1');
const alertmessage2 = document.querySelector('#invalid-input-message2');
const submitBtn = document.querySelector('#sign_up_submit');
const confirm_password = document.querySelector('#confirm_password');
confirm_password.setAttribute('disabled', true)
invalidInput = (err) =>{
    alertmessage1.innerText = err;
    // disable the submit button 

    submitBtn.setAttribute('disabled', true);
}

invalidInput2 = (err) =>{
    alertmessage2.innerText = err;
    // disable the submit button 

    submitBtn.setAttribute('disabled', true);
}




password_field.addEventListener('input', ()=>{
    
    if(password_field.value.length < 8){
        alertmessage1.classList.remove('hide');
        invalidInput("Password must be more than 8 characters long");
        return;
    }  
    if(/\d/.test(password_field.value) == false){
        alertmessage1.classList.remove('hide');
        invalidInput("Password must contain a digit");
        return;
    }
    if(/\s/.test(password_field.value) == true){
        alertmessage1.classList.remove('hide');
        invalidInput("Password must not contain whitespaces");
        return;
    }
    if(/[-’/`~!#*$@_%+=.,^&(){}[\]|;:”<>?\\]/.test(password_field.value) == false){
        alertmessage1.classList.remove('hide');
        invalidInput("Password must contain a special character");
        return;
    }
    if(/[A-Z]/.test(password_field.value) == false){
        alertmessage1.classList.remove('hide');
        invalidInput("Password must contain Capital");
        return;
    }

    if(/[a-z]/.test(password_field.value) == false){
        alertmessage1.classList.remove('hide');
        invalidInput("Password must contain small letter");
        return;
    }
    
    else {
        alertmessage1.classList.add('hide');
        confirm_password.removeAttribute('disabled');
        submitBtn.removeAttribute('disabled');
    }
})



confirm_password.addEventListener('input', ()=>{
    if(password_field.value != confirm_password.value){
        alertmessage2.classList.remove('hide');
        invalidInput2('Passwords do not match');
        return;
    } else{
        alertmessage2.classList.add('hide');
        submitBtn.removeAttribute('disabled');
    }
})