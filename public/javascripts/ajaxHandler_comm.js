

var httpRequest;     
var currentUser;
var messagebox = document.getElementById('messagebox')
function findUser(){
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = findUserRequest;
    httpRequest.open('GET', '/findUser');        
    httpRequest.send();
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

    function saveLaterRequest(){
    
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200 ) {
                var resJson = JSON.parse(httpRequest.responseText)
                console.log(resJson.message);
                showAlert(resJson.message)
            } else {
            alert('There was a problem with the request.');
            }
        }
    }


    async function addFollowerRequest(){
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200 ) {
                var resJson = JSON.parse(httpRequest.responseText)
                console.log(resJson.message);
                showAlert(resJson.message)
            } else {
            alert('There was a problem with the request.');
            }
        }
    }



    function deletePostRequest(){
    
        if (httpRequest.readyState === XMLHttpRequest.DONE) {
            if (httpRequest.status === 200 ) {
                
                console.log('post deleted')
                showAlert('post deleted')
            } else {
            alert('There was a problem with the request.');
            }
        }
    }


    function sharePostRequest(){
    
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200 ) {       
                var resJson = JSON.parse(httpRequest.responseText)
                document.getElementById('sharecount').innerHTML = resJson.value;
                showAlert(resJson.message)
            } else {
                alert('There was a problem with the request.');
            }
        }
    }



      
   function saveToLater(e){
     
     var curPostSlug = e.getAttribute('getpost');    
     console.log("curpostslug " + curPostSlug)
     if(currentUser){
         httpRequest = new XMLHttpRequest();
     if (!httpRequest) {
       alert('Giving up :( Cannot create an XMLHTTP instance');
       return false;
     }
     httpRequest.onreadystatechange = saveLaterRequest;
     httpRequest.open('GET', '/savetolater/' + curPostSlug);        
     httpRequest.send();
   } else {
    window.location = '/register_or_login?m=0' 
    console.log("you need to login to save this post")
   }
 }   

 function deletePost(e){
    var curPostSlug = e.getAttribute('getpost');   
    if(currentUser){
        httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
        }
        httpRequest.onreadystatechange = deletePostRequest;
        httpRequest.open('GET', '/posts/delete/' + curPostSlug);        
        httpRequest.send();
   } else {
       console.log("you need to login to save this post")
       window.location = '/register_or_login?m=0'
   }
}

async function addFollower(e){
    if(currentUser){
        var authname = await e.getAttribute('getauthor');
        console.log("authname : ", authname);
        httpRequest = new XMLHttpRequest();
        if(!httpRequest){
            alert('Giving up :( Cannot create an XMLHTTP instance')
            return false;
        }
        httpRequest.onreadystatechange = addFollowerRequest;
        httpRequest.open('GET', '/addfollower/' +authname);
        httpRequest.send();
    } else {
        console.log("you need to login to follow an author")
        var message = "you need to login first to follow an author"
        // window.location = '/register_or_login/?message='+message;
        window.location = '/register_or_login?m=0'
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
        console.log("You need to login to share this post.")
        window.location = '/register_or_login?m=0'
    }
}



function like(e){
    
    if(currentUser){
        var curPostSlug = e.getAttribute('getpost');  
        httpRequest = new XMLHttpRequest();
        if (!httpRequest) {
          alert('Giving up :( Cannot create an XMLHTTP instance');
          return false;
        }
        httpRequest.onreadystatechange = function(){
            likeRequest(e)
        };
        httpRequest.open('GET', '/posts/liked/' + curPostSlug);        
        httpRequest.send();
      
      }
     else {
        window.location = '/register_or_login?m=0'
    }
  }

  function likeRequest(ev){
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          
          let respJson = JSON.parse(httpRequest.responseText)
        console.log(respJson.status)
        showAlert(respJson.message)

        if(respJson.status){


            count(ev)
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




var count = (e)=>{
    console.log("count : ", e)
    
    var post_index = e.getAttribute('post_index');
    var page_no = e.getAttribute('pageno')

    var ind = post_index - (page_no-1)*10

    console.log("post_index : ", post_index , " and page_no : ", page_no, " and ind : ", ind);
    var inc = document.querySelectorAll('#likecount')[ind];
    var val = parseInt(inc.innerText);
    
    inc.innerText = val+1;  
    
}