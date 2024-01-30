import { startAmazonDemo, updateCanvasDimensions } from './amazonDemo.js';

function readJSON(path, callback) {
    fetch(path)
        .then((res) => {
        return res.json();
    })
    .then((data) => {
        callback(data);
        startAmazonDemo().then(
            () => {window.onresize = updateCanvasDimensions;} // Updating the dimension means drawing, which means that the game must be started
        ); 
    });
}

function createProjects(jsonData){
    const portfolioContent = document.getElementById("projects-content");
    let i = 0;
    function projectGeneration(projectJSON){
        const portfolioItem = document.createElement("div");
        let projectTags = "";
        for(const tag of projectJSON["tags"]){
            projectTags += `<div class="single-tag">${tag}</div>\n`;
        }
        let projectMedias = "";
        let mediaCount = 0;
        if (projectJSON["title"] == "Game of the Amazons"){
            projectMedias += `<canvas class="images" id="gameCanvas"></canvas>\n`;
            mediaCount++;
        }
        for(const media of projectJSON["media"]){
            let mediaType = media["path"].split("/")[1];
            if (mediaType == "images" || mediaType == "gif"){
                projectMedias += `<img src="ressources/${media["path"]}" alt="${media["alt-text"]}">\n`;
            }else if (mediaType == "videos"){
                let videoExtension = media["path"].split(".")[1];
                projectMedias += `  <video class="media-video" muted="true" loop="true" autoplay="true">
                                        <source src="ressources/${media["path"]}" type="video/${videoExtension}"/>
                                    </video>`
            }else{
                console.error("Invalid media type for project generation of \"", projectJSON["title"], "\", media type was : ", mediaType);
                continue;
            }
            mediaCount++;
        }
        portfolioItem.className = "projects-item";
        let titleDiv = `<div class="project-title">${projectJSON["title"]}</div>`;
        let dateDiv = `<div class="project-date">${projectJSON["date"]} - ${projectJSON["type"]}</div>`;
        let tagsDiv = `<div class="project-tag">`+ projectTags +`</div>`;
        
        let mediaDiv = `<div class="project-media">
                            <div class="images" data-image-count="`+ mediaCount +`"> 
                                `+ projectMedias +`
                            </div>`;
        if (mediaCount > 1){
            mediaDiv += `<button class="carousel-button prev" name="button-prev" onclick="updateSlide(event, -1);">&#10094;</button>
                        <button class="carousel-button next" name="button-next" onclick="updateSlide(event, +1);">&#10095;</button>`;
        }
        mediaDiv += `</div>`;
        let descriptionDiv = `<div class="project-description">${projectJSON["description"]}</div>`;
        portfolioItem.innerHTML = titleDiv + dateDiv + tagsDiv;
        if (i%2 == 0){
            portfolioItem.innerHTML += mediaDiv + descriptionDiv;
        }else{
            portfolioItem.innerHTML += descriptionDiv + mediaDiv;
        }
        portfolioContent.appendChild(portfolioItem);
    }
    // console.log(jsonData)
    // Loop through the projects to generate them
    for (const project of jsonData) {
        projectGeneration(project)
        i++;
    }
}

readJSON("/ressources/json/projects.json", createProjects);
