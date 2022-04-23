var currentLikes = 0;
	var likesCount = document.querySelector(".content span"); 
    var likeBtn = document.querySelector("#clap");
    // var likeIcon = document.querySelector(".fa-heart");
	// likeBtn.addEventListener("click", function(){
	// 	currentLikes = currentLikes + 1;
	// })
	function myFunction(){
		currentLikes = currentLikes + 1;
        likesCount.innerHTML = currentLikes;
        // likeIcon.style.color = "red";
	}