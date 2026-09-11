const reponse = await fetch('http://localhost:5678/api/works');
const projects = await reponse.json();

for (let i = 0; i < projects.length; i++) {

    const project = projects[i];

    const sectionProjects = document.querySelector(".gallery");
    const projectElement = document.createElement("article");


    const imageElement = document.createElement("img");
    imageElement.src = project.imageUrl;
    const titleElement = document.createElement("p");
    titleElement.innerText = project.title;
    projectElement.appendChild(imageElement);
    projectElement.appendChild(titleElement);
    sectionProjects.appendChild(projectElement);
}


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
    categoryElement.innerText = category.name;
    sectionCategories.appendChild(categoryElement);
}
