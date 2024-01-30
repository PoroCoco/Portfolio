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


// Just reset the slide to the first image for now
function resizeSlides(){
    let slides = document.querySelectorAll(".images");
    for (const slide of slides){
        slide.style.transform = "translateX(" + 0 + "px)";
    }
}

window.addEventListener("resize", resizeSlides);