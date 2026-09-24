document.addEventListener('DOMContentLoaded',  () => {
    getWorks();
    getFilters();
});

let projects;

async function getWorks() {

    const reponse = await fetch('http://localhost:5678/api/works');
    projects =  await reponse.json();

    displayProjects(projects);
}

async function getFilters() {
    
    const categoriesResponse = await fetch('http://localhost:5678/api/categories');

    const categories = await categoriesResponse.json();

    const allButton = document.createElement("button");
    allButton.innerText = "Tous";
    const sectionCategories = document.querySelector(".categories");
    sectionCategories.appendChild(allButton);

    for (let i = 0; i < categories.length; i++) {

        const category = categories[i];

        const sectionCategories = document.querySelector(".categories");
        const categoryElement = document.createElement("button");
        categoryElement.dataset.categoryId = category.id;
        categoryElement.innerText = category.name;
        sectionCategories.appendChild(categoryElement);
    }

    const buttonsFilters = document.querySelectorAll(".categories button");
    buttonsFilters.forEach((button) => {
        button.addEventListener('click', () => {
           /* console.log(button.dataset.categoryId); */
       
                const sectionProjects = document.querySelector(".gallery");

                if (button.innerText === "Tous") {
                    sectionProjects.innerHTML = "";
                    displayProjects(projects);
                    return;
                }
                const filteredProjects = projects.filter((project) => {
                    return project.categoryId === Number(button.dataset.categoryId);
                });
                sectionProjects.innerHTML = "";
                displayProjects(filteredProjects);  
        });
    });
}

function displayProjects(projectsToDisplay) {

    for (let i = 0; i < projectsToDisplay.length; i++) {

        const project = projectsToDisplay[i];

        const sectionProjects = document.querySelector(".gallery");
        const projectElement = document.createElement("article");


        const imageElement = document.createElement("img");
        imageElement.src = project.imageUrl;
        const titleElement = document.createElement("p");
        titleElement.innerText = project.title;
        projectElement.appendChild(imageElement);
        projectElement.appendChild(titleElement);
        sectionProjects.appendChild(projectElement);
        /* console.log(project.categoryId); */

    }
}