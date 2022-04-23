//declearing html elements

const imgDiv = document.querySelector('.profile-pic-div');
const img = document.querySelector('#photo');
const file = document.querySelector('#file');
const uploadBtn = document.querySelector('#uploadBtn');

//if user hover on img div 

imgDiv.addEventListener('mouseenter', function(){
    uploadBtn.style.display = "block";
});

//if we hover out from img div

imgDiv.addEventListener('mouseleave', function(){
    uploadBtn.style.display = "none";
});

//lets work for image showing functionality when we choose an image to upload

//when we choose a foto to upload

file.addEventListener('change', function(){
    //this refers to file
    const choosedFile = this.files[0];
    const ext = choosedFile.type.split("/")[1];
    console.log(ext);
    console.log("jpeg")
    if(ext === 'png' || ext === 'PNG' || ext === 'jpg' || ext === 'JPG' || ext === 'JPEG' || ext === 'jpeg'){
        
    } else {
        showAlert("Kindly upload an image only")
        return;
    }

    if (choosedFile) {

        const reader = new FileReader(); //FileReader is a predefined function of JS
        

        reader.addEventListener('load', function(){
            img.setAttribute('src', reader.result);
        });

        reader.readAsDataURL(choosedFile);

        //Allright is done

        //please like the video
        //comment if have any issue related to vide & also rate my work in comment section

        //And aslo please subscribe for more tutorial like this

        //thanks for watching
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