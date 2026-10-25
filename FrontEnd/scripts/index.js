document.addEventListener('DOMContentLoaded', async () => {

    const projects = await getProjects();
    const categories = await getCategories();

    createFilters(projects, categories);
    displayProjects(projects);
    createEditMode(categories);
});

async function getProjects() {
    const projectResponse = await fetch('http://localhost:5678/api/works');
    return await projectResponse.json();
}

async function getCategories() {
    const categoriesResponse = await fetch('http://localhost:5678/api/categories');
    return await categoriesResponse.json();
}

function createEditMode(categories) {
    const token = localStorage.getItem("token");

    if (token) {
        const editMode = document.createElement("div");
        editMode.classList.add("edit-mode");
        editMode.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>Mode édition';
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
        editButton.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>Modifier';
        const titleProjects = document.querySelector(".title-projects");
        titleProjects.appendChild(editButton);
        editButton.addEventListener("click", async () => {
            const updatedProjects = await getProjects();
            openModal(updatedProjects, categories, token);
        });
    };
}

function createFilters(projects, categories) {
    const allButton = document.createElement("button");
    const sectionCategories = document.querySelector(".categories");
    allButton.innerText = "Tous";
    sectionCategories.appendChild(allButton);

    for (let i = 0; i < categories.length; i++) {

        const category = categories[i];
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
    displayModalProjects(modal, projects, token);
    closeModal(modal);
    createModalCategories(modal, categories);
    createModalForm(modal, token);
    createModalNavigation(modal);
}

function closeModal(modal) {
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
            <span class="modal-close"><i class="fa-solid fa-xmark"></i></span>
            <div class="gallery-view">
                <h2>Galerie photo</h2>
                <div class="modal-gallery"></div>
                <button class="add-photo">Ajouter une photo</button>
            </div>
            <div class="form-view">
                <button class="back-button"><i class="fa-solid fa-arrow-left"></i></button>
                <h2>Ajout photo</h2>
                <form class="add-project-form">
                    <div class="image-upload">
                        <img class="image-preview">
                        <i class="fa-solid fa-image"></i>
                        <input type="file" id="image" accept="image/*">
                        <label for="image"><i class="fa-solid fa-plus"></i> Ajouter photo</label>
                        <p>jpg, png : 4mo max</p>
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

function displayModalProjects(modal, projects, token) {
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

function createModalCategories(modal, categories) {
    const categorySelect = modal.querySelector("#category");

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];

        const option = document.createElement("option");
        option.value = category.id;
        option.innerText = category.name;

        categorySelect.appendChild(option);
    }
}

function createModalForm(modal, token) {

    const imageInput = modal.querySelector("#image");
    const imagePreview = modal.querySelector(".image-preview");
    const addProjectForm = modal.querySelector(".add-project-form");
    const titleInput = modal.querySelector("#title");
    const formError = modal.querySelector(".form-error");
    const categorySelect = modal.querySelector("#category");
    const faImage = modal.querySelector(".fa-image")
    const addPhotoLabel = modal.querySelector('label[for="image"]')
    const imageFormat = modal.querySelector(".image-upload p")

    imageInput.addEventListener("change", () => {
        const file = imageInput.files[0];
        const imageUrl = URL.createObjectURL(file);
        imagePreview.src = imageUrl;
        imagePreview.style.display = "block";
        faImage.style.display = "none";
        addPhotoLabel.style.display = "none";
        imageFormat.style.display = "none";
    });
    addProjectForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = titleInput.value;
        const category = categorySelect.value;
        const image = imageInput.files[0];
        if (!image || title === "" || category === "") {
            formError.innerText = "Veuillez remplir tous les champs";
            return;
        }

        const formData = new FormData();
        formData.append("image", image);
        formData.append("title", title);
        formData.append("category", category);

        const response = await addProject(formData, token)

        if (!response.ok) {
            formError.innerText = "Erreur lors de l'ajout du projet";
            return;
        }
        formError.innerText = "Projet ajouté avec succès";
        const updatedProjects = await getProjects();
        const sectionProjects = document.querySelector(".gallery");
        sectionProjects.innerHTML = "";
        const modalGallery = modal.querySelector(".modal-gallery");
        modalGallery.innerHTML = "";
        displayProjects(updatedProjects);
        displayModalProjects(modal, updatedProjects, token);
        addProjectForm.reset();
        imagePreview.src = "";
        imagePreview.style.display = "none";
        faImage.style.display = "";
        addPhotoLabel.style.display = "";
        imageFormat.style.display = "";
    });
}

function createModalNavigation(modal) {
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

async function addProject(formData, token) {
    const response = await fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });
    return response
}