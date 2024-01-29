function updateSlide(event, increment){
    let projectMediaDiv = event.target.parentNode;
    let imagesContainer = projectMediaDiv.querySelector(".images");

    // If there is no transform style create a dummy one
    if (imagesContainer.style.transform == ""){
        imagesContainer.style.transform = "translateX(0px)";
    }

    let slideWidth = projectMediaDiv.clientWidth;
    // From "translateX(740px)" to "740"
    let currentTranslation = imagesContainer.style.transform.replace(/[^\d.]/g, "");
    let currentSlide = Math.floor(currentTranslation / slideWidth);
    let nextSlide = currentSlide + increment;
    let totalImages = parseInt(imagesContainer.getAttribute("data-image-count"));
    if (nextSlide >= totalImages){
        nextSlide = 0;
    }
    if (nextSlide < 0){
        nextSlide = totalImages - 1;
    }

    let translateXSize = -nextSlide * slideWidth;
    imagesContainer.style.transform = "translateX(" + translateXSize + "px)";
}


function resizeSlides(){
    // let slides = document.querySelectorAll(".images");
    // for (slide in slides){
    //     console.log(slide.clientWidth);
    // }
}

window.onresize = resizeSlides;
