var currentUser;
  var httpRequest;
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
  var likesdisplay = document.querySelector('#likecount');
  var messageDisplay = document.querySelector('#message');        
  var sharecount = document.querySelector("#sharecount");
        

    function like(e){
    if(currentUser){
      var curPostSlug = e.getAttribute('getpost');  
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
      // document.querySelector("#message").innerHTML = "you need to log in to like this post";
      window.location = '/register_or_login?m=0'
    }
  }

  function likeRequest(){
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var respJson = JSON.parse(httpRequest.responseText)
          console.log(respJson);
          likesdisplay.innerText = respJson.count;
          showAlert(respJson.message)
        } else {
          alert('There was a problem with the request.');
        }
      }
    }


  function saveToLater(e){
    var curPostSlug = e.getAttribute('getpost');  
    if(currentUser){

      httpRequest = new XMLHttpRequest();
      if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
      }
      httpRequest.onreadystatechange = savetolaterRequest;
      httpRequest.open('GET', '/savetolater/' + curPostSlug);        
      httpRequest.send();
    } else{
      window.location = '/register_or_login?m=0'
    }
    
  }
    
  function savetolaterRequest(){
    if(currentUser){
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
      if (httpRequest.status === 200) {
        if(httpRequest.responseText){

          var respJson = JSON.parse(httpRequest.responseText)
          console.log(respJson);
          showAlert(respJson.message)

        }
        
      } else {
        alert('There was a problem with the request.');
        }
      }
    } else {
      document.querySelector("#message").innerHTML = "you need to log in to save to later this post";
      
    }
  }

  function sharePost(e){
    httpRequest = new XMLHttpRequest();
    var sl = e.getAttribute('getpost')
    if (!httpRequest) {
      alert('Giving up :( Cannot create an XMLHTTP instance');
      return false;
    }
    httpRequest.onreadystatechange = sharePostRequest;
    httpRequest.open('GET', '/sharepost/' + sl);        
    httpRequest.send();
  }

  function sharePostRequest(){

    if(currentUser){
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          var respJson = JSON.parse(httpRequest.responseText)
          console.log(respJson);
          sharecount.innerText = respJson.value;
        } else {
          alert('There was a problem with the request.');
          }
      }
    } else {
      window.location = '/register_or_login?m=0'
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
        // console.log("you need to login to follow an author")
        // var message = "you need to login first to follow an author"
        window.location = '/register_or_login?m=0'
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
