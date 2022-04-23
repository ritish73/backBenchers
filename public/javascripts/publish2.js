var file = document.querySelector('#file');
var us = document.querySelector('#upload-submit');
file.addEventListener('change', function(){
    //this refers to file
    const choosedFile = this.files[0];
    const ext = choosedFile.type.split("/")[1];
    console.log(ext);
    if(ext === 'pdf' || ext === 'vnd.openxmlformats-officedocument.wordprocessingml.document' || ext === '.docx' || ext === '.doc' || ext === '.DOCX'){
        us.removeAttribute('disabled')
        
    } else {
        us.setAttribute('disabled', 'disabled');
        showAlert("Kindly upload a pdf or word file")
        return;
    }


});


  
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













// var showAlert = async (msg)=>{

//     var messaged = $('#left .msg-alert');      
//     var alert  = $('#left .alert');
//         messaged.text(msg) 
//         alert.addClass("show");
//         alert.removeClass("hide");
//         alert.addClass("#left showAlert");

//         setTimeout(function(){
//         alert.removeClass("show");
//         alert.addClass("hide");
//         },5000);

//     $('.close-btn').click(function(){
//         alert.removeClass("show");
//         alert.addClass("hide");
        
//     })

// }
