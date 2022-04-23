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