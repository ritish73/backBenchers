
const searchBtn = document.querySelector('#disable-search-btn')
const searchInput = document.querySelector('.search-txt')

console.log(searchInput.value)


searchBtn.addEventListener('click', ()=>{
  if(!searchInput.value){
    
    showAlert("Cannot search empty string")
    searchBtn.setAttribute('disabled', true);
  }
})

searchInput.addEventListener("input", ()=>{
  if(!searchInput.value){

    console.log("empty")
    searchBtn.setAttribute('disabled', true);
    showAlert("No matches found, please try again!")

  } 
  
  else if(/^\s/.test(searchInput.value)){
    searchBtn.setAttribute('disabled', true);
    showAlert("No matches found, please try again!")
  }
  
  
  else {

    console.log("something")
    searchBtn.removeAttribute('disabled');

  }
})