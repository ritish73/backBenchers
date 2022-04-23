
var comments;
var cList = document.querySelector('.commentList')

var getcomments = async (e)=>{

var slug = e.getAttribute('getslug');
console.log(slug)
httpRequest = new XMLHttpRequest();
if (!httpRequest) {
    alert('Giving up :( Cannot create an XMLHTTP instance');
    return false;
}
httpRequest.onreadystatechange = getcommentsRequest;
httpRequest.open('GET', '/posts/getcomments/'+slug);        
httpRequest.send();
}




function getcommentsRequest(){

    
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            var respJson = JSON.parse(httpRequest.responseText)
            console.log(respJson);
            if(respJson.status){
                // generateCommentsProgressively();
                comments = respJson.comments;
            }
            
        } else {
            alert('There was a problem with the request.');
            }
    } else {
        console.log('not ready')
    }
    

  }







  var maxindex = 2;
  var start = 2;
  var loadmore = async ()=>{
        
      for(var i=start; i<Math.min(comments.length, maxindex+2); i++){

        let litag = document.createElement('li');
        let markup = 


        `
        

                        
                        <div class="commenterImage">
                            <img src="/uploads/img/profile-pics/${comments[i].writer_image}">
                        </div>
                        <div class="commentText">
                            <p class="">${comments[i].content}</p> 
                            <span class="date sub-text">on ${comments[i].creation_time}</span>
                            <button class="date sub-text-1">${comments[i].writer}</button>
                            
                        </div>
                        
        


        `
        litag.innerHTML = markup;

        cList.append(litag)
      }
      maxindex += 2;
      start += 2
  }

