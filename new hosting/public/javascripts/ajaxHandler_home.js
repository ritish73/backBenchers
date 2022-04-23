var httpRequest;     
var currentUser;
function findUser(){

httpRequest = new XMLHttpRequest();
httpRequest.onreadystatechange = findUserRequest;
httpRequest.open('GET', '/findUser');        
httpRequest.send();
}

var freeze = ()=>{
    document.body.style.overflow = 'hidden';
    document.querySelector('html').scrollTop = window.scrollY;
}

window.onload = findUser();



function findUserRequest(){

if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200 ) {
        var resJson = JSON.parse(httpRequest.responseText)
        currentUser = resJson.CurrentUser;
        console.log(currentUser)
        if(currentUser === undefined){
            console.log("no one is logged in");
        } else {
            console.log('user found!!')
        }
        
    } else {
    alert('There was a problem with the request.');
    }
}
}




function like(e){

// document.getElementById('changelikecolor').style.color = "#ab2d24";
if(currentUser){
    let curPostSlug = e.getAttribute('getpost');  
    httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = likeRequest;
    httpRequest.open('GET', '/posts/liked/' + curPostSlug);        
    httpRequest.send();
    
    }
    else {
//   document.querySelector("#message").innerHTML = "you need to log in to like this post";
    window.location = '/register_or_login?m=0';
}
}

function likeRequest(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200) {
        let respJson = JSON.parse(httpRequest.responseText)
        console.log(respJson.message)
    
        showAlert(respJson.message);
        
    //   document.querySelector('.count').innerText = respJson.message;
    } else {
        alert('There was a problem with the request.');
    }
    }
}



async function sharePost(e){
if(currentUser){
    var curPostSlug = e.getAttribute('getpost');  
    
    httpRequest = new XMLHttpRequest();
    if(!httpRequest){
        alert('Giving up :( Cannot create an XMLHTTP instance')
        return false;
    }
    httpRequest.onreadystatechange = sharePostRequest;
    httpRequest.open('GET', '/sharePost/' +curPostSlug);
    httpRequest.send();
} else {
    console.log("you need to login to share this post")
    window.location = '/register_or_login?m=0'
}
}

function sharePostRequest(){

if (httpRequest.readyState === XMLHttpRequest.DONE) {
    if (httpRequest.status === 200 ) {       
            var resJson = JSON.parse(httpRequest.responseText)
            document.getElementById('sharecount').innerHTML = resJson.value;
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



let slidePosition = 0;
        const slides = document.getElementsByClassName('review-card');
        const totalSlides = slides.length;

        document.
        getElementById('right')
        .addEventListener("click", function() {
            moveToNextSlide();
        });
        document.
        getElementById('left')
        .addEventListener("click", function() {
            moveToPrevSlide();
        });

        function updateSlidePosition() {
        for (let slide of slides) {
            slide.classList.remove('carousel__item--visible');
            slide.classList.add('carousel__item--hidden');
        }

        slides[slidePosition].classList.add('carousel__item--visible');
        }

        function moveToNextSlide() {
        if (slidePosition === totalSlides - 1) {
            slidePosition = 0;
        } else {
            slidePosition++;
        }

        updateSlidePosition();
        }

        function moveToPrevSlide() {
        if (slidePosition === 0) {
            slidePosition = totalSlides - 1;
        } else {
            slidePosition--;
        }

        updateSlidePosition();
        }
