document.addEventListener('DOMContentLoaded',  () => {
    getWorks();
    getFilters();
});

let projects;

const token = localStorage.getItem("token");
    if (token) {
    console.log("Utilisateur connecté");

    const editMode = document.createElement("div");
    editMode.classList.add("edit-mode");
    editMode.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Mode édition';

    document.body.prepend(editMode);

    const loginLink = document.querySelector("#login-link");
    loginLink.textContent = "logout";
    loginLink.removeAttribute("href");
    loginLink.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });

    const filters = document.querySelector(".categories");
    filters.style.display = "none";

    const editButton = document.createElement("button");
    editButton.classList.add("edit-button");
    editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Modifier';

    const titleProjects = document.querySelector(".title-projects");
    titleProjects.appendChild(editButton);

    editButton.addEventListener("click", () => {
    openModal();
    });

    } else {
        console.log("Utilisateur non connecté");
}

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
    }
}

function openModal() {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
        <div class="modal-content">
            <span class="modal-close">&times;</span>
            <div class="gallery-view">
                <h2>Galerie photo</h2>
                <div class="modal-gallery"></div>
                <button class="add-photo">Ajouter une photo</button>
            </div>
            <div class="form-view">
                <button class="back-button">←</button>
                <h2>Ajout photo</h2>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const modalGallery = modal.querySelector(".modal-gallery");

    projects.forEach(project => {
        const projectContainer = document.createElement("div");
        projectContainer.classList.add("modal-project");
        const image = document.createElement("img");
        image.src = project.imageUrl;
        image.alt = project.title;
        const deleteButton = document.createElement("button");
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash-can");
        deleteButton.appendChild(deleteIcon);
        projectContainer.appendChild(image);
        projectContainer.appendChild(deleteButton);
        modalGallery.appendChild(projectContainer);
    });
    const closeModal = modal.querySelector(".modal-close");

    closeModal.addEventListener("click", () => {
        modal.remove();
    });
    modal.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.remove();
    }
    });
    const galleryView = modal.querySelector(".gallery-view");
    const formView = modal.querySelector(".form-view");
    const backButton = modal.querySelector(".back-button");
    const addPhotoButton = modal.querySelector(".add-photo");
    addPhotoButton.addEventListener("click", () => {
        galleryView.style.display = "none";
        formView.style.display = "block";
    });
    backButton.addEventListener("click", () => {
        galleryView.style.display = "block";
        formView.style.display = "none";
    });
}