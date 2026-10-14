document.addEventListener('DOMContentLoaded', async () => {

    const token = localStorage.getItem("token");
    if (token) {
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

        editButton.addEventListener("click", async () => {
            const updatedProjects = await getProjects();
            openModal(updatedProjects, categories, token);
        });
    }


    const projects = await getProjects();
    const categories = await getCategories();

    getFilters(projects, categories);

    displayProjects(projects);



});

async function getProjects() {
    const projectResponse = await fetch('http://localhost:5678/api/works');

    return await projectResponse.json();
}

async function getCategories() {
    const categoriesResponse = await fetch('http://localhost:5678/api/categories');

    return await categoriesResponse.json();
}

function getFilters(projects, categories) {


    const allButton = document.createElement("button");
    const sectionCategories = document.querySelector(".categories");
    allButton.innerText = "Tous";
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

function displayProjects(projects) {

    for (let i = 0; i < projects.length; i++) {

        const project = projects[i];
        const sectionProjects = document.querySelector(".gallery");
        const projectElement = document.createElement("article");
        const imageElement = document.createElement("img");
        const titleElement = document.createElement("p");
        imageElement.src = project.imageUrl;
        titleElement.innerText = project.title;
        projectElement.appendChild(imageElement);
        projectElement.appendChild(titleElement);
        sectionProjects.appendChild(projectElement);
    }
}

function openModal(projects, categories, token) {
    const modal = createModal();
    modalProjects(modal, projects, token);
    modalClose(modal);
    modalCategories(modal, categories);
    modalForm(modal);
    modalNavigation(modal);
}

function modalClose(modal) {
    const closeModal = modal.querySelector(".modal-close");

    closeModal.addEventListener("click", () => {
        modal.remove();
    });
    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

function createModal() {
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
                <form class="add-project-form">
                    <div class="image-upload">
                        <input type="file" id="image" accept="image/*">
                        <img class="image-preview">
                    </div>
                    <label for="title">Titre</label>
                    <input type="text" id="title">
                    <label for="category">Catégorie</label>
                    <select id="category">
                    </select>
                    <p class="form-error"></p>
                    <button type="submit">Valider</button>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    return modal;
}

function modalProjects(modal, projects, token) {
    const modalGallery = modal.querySelector(".modal-gallery");

    projects.forEach(project => {
        const projectContainer = document.createElement("div");
        projectContainer.classList.add("modal-project");
        const image = document.createElement("img");
        image.src = project.imageUrl;
        image.alt = project.title;
        const deleteButton = document.createElement("button");
        deleteButton.addEventListener("click", async () => {
            const response = await deleteProject(project.id, token);
            if (response.ok) {
                projectContainer.remove();
                projects = projects.filter((item) => {
                    return project.id !== item.id;
                });
                const sectionProjects = document.querySelector(".gallery");
                sectionProjects.innerHTML = "";
                displayProjects(projects);
            };
        });

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash-can");
        deleteButton.appendChild(deleteIcon);
        projectContainer.appendChild(image);
        projectContainer.appendChild(deleteButton);
        modalGallery.appendChild(projectContainer);
    });
}

function modalCategories(modal, categories) {
    const categorySelect = modal.querySelector("#category");

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];

        const option = document.createElement("option");
        option.value = category.id;
        option.innerText = category.name;

        categorySelect.appendChild(option);
    }

}

function modalForm(modal) {

    const imageInput = modal.querySelector("#image");
    const imagePreview = modal.querySelector(".image-preview");
    const addProjectForm = modal.querySelector(".add-project-form");
    const titleInput = modal.querySelector("#title");
    const formError = modal.querySelector(".form-error");
    const categorySelect = modal.querySelector("#category");


    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        const imageUrl = URL.createObjectURL(file);
        imagePreview.src = imageUrl;
    });
    addProjectForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const title = titleInput.value;
        const category = categorySelect.value;
        const image = imageInput.files[0];
        if (!image || title === "" || category === "") {
            formError.innerText = "Veuillez remplir tous les champs";
            return;
        }
        formError.innerText = "";
    });
}

function modalNavigation(modal) {
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

async function deleteProject(projectId, token) {
    const response = await fetch(
        `http://localhost:5678/api/works/${projectId}`,
        {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response;
}