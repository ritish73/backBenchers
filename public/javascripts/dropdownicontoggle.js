const drop = document.querySelector('.profile')
const icon = document.querySelector('.fa-chevron-down');
const img = document.querySelector('.navbar-image')


if(icon){









    

icon.addEventListener('click', ()=>{
    icon.classList.toggle("fa-chevron-up")
    icon.classList.toggle("fa-chevron-down")
})

img.addEventListener('click', ()=>{
    icon.classList.toggle("fa-chevron-up")
    icon.classList.toggle("fa-chevron-down")
})

document.querySelector('main').addEventListener('click',()=>{
    drop.classList.remove("active");
    icon.classList.add("fa-chevron-down")
    icon.classList.remove("fa-chevron-up")
})

document.querySelector('.container').addEventListener('click',()=>{
    drop.classList.remove("active");
    icon.classList.add("fa-chevron-down")
    icon.classList.remove("fa-chevron-up")
})












}
