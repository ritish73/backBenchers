

var currentLikes = 108;
	var likesCount = document.querySelector(".show-shares"); 
    var likeBtn = document.querySelector(".share-btn-btn i");

	// likeBtn.addEventListener("click", function(){
	// 	currentLikes = currentLikes + 1;
	// })
	function myFunction(){
		currentLikes = currentLikes + 1;
        likesCount.innerHTML = currentLikes;
        // likeIcon.style.color = "red";
	}

	