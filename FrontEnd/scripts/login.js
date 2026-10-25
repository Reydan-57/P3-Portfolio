document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm()
});

function setupLoginForm() {
    const usersEmail = document.querySelector("#email");
    const usersPassword = document.querySelector("#password");
    const form = document.querySelector("form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = usersEmail.value;
        const password = usersPassword.value;
        const reponse = await loginUser(email, password);

        await handleLoginResponse(reponse, form);
        
    });
}

async function loginUser(email, password) {
    const response = await fetch('http://localhost:5678/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
};

async function handleLoginResponse(reponse, form) {

    if (reponse.ok) {
        const data = await reponse.json();
        localStorage.setItem("token", data.token);
        window.location.href = "index.html";
    } else {
        displayLoginError(form);
    };
};

function displayLoginError(form) {
    const existingError = document.querySelector(".error-message");
    if (!existingError) {
        const errorMessage = document.createElement("p");
        errorMessage.textContent = "E-mail ou mot de passe incorrect.";
        errorMessage.classList.add("error-message");
        form.appendChild(errorMessage);
    };
};