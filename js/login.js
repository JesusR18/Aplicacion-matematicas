
// Login/Registro: inicialización y persistencia básica
document.addEventListener('DOMContentLoaded', () => {
    let selectedAge = null;

    function toggleForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        if (!loginForm || !registerForm) return;
        loginForm.classList.toggle('active');
        registerForm.classList.toggle('active');
    }

    // Selección de edad
    document.querySelectorAll('.age-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.age-option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedAge = this.getAttribute('data-age');
        });
    });

    // Indicador de fortaleza de contraseña
    const registerPasswordEl = document.getElementById('registerPassword');
    if (registerPasswordEl) {
        registerPasswordEl.addEventListener('input', function() {
            const password = this.value;
            const strengthBar = document.getElementById('strengthBar');
            if (!strengthBar) return;
            strengthBar.className = 'password-strength-bar';
            strengthBar.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
            if (password.length < 6) strengthBar.classList.add('strength-weak');
            else if (password.length < 10) strengthBar.classList.add('strength-medium');
            else strengthBar.classList.add('strength-strong');
        });
    }

    // Utilidades de usuarios en localStorage
    function getUsers() {
        return JSON.parse(localStorage.getItem('users') || '[]');
    }
    function saveUsers(users) {
        localStorage.setItem('users', JSON.stringify(users));
    }

    // Manejo del formulario de login
    const loginFormEl = document.getElementById('loginForm');
    if (loginFormEl) {
        loginFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const users = getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                localStorage.setItem('loggedUser', JSON.stringify({ name: user.name, email: user.email }));
                window.location.href = 'menu.html';
            } else {
                alert('Correo o contraseña incorrectos.');
            }
        });
    }

    // Manejo del formulario de registro
    const registerFormEl = document.getElementById('registerForm');
    if (registerFormEl) {
        registerFormEl.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!selectedAge) { alert('Por favor, selecciona tu rango de edad 😊'); return; }
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const users = getUsers();
            if (users.find(u => u.email === email)) { alert('Ya existe una cuenta con ese correo.'); return; }
            const newUser = { name, email, password, age: selectedAge };
            users.push(newUser);
            saveUsers(users);
            const successMessage = document.getElementById('successMessage');
            if (successMessage) successMessage.style.display = 'block';
            setTimeout(() => {
                if (successMessage) successMessage.style.display = 'none';
                toggleForm();
                registerFormEl.reset();
                document.querySelectorAll('.age-option').forEach(opt => opt.classList.remove('selected'));
                selectedAge = null;
            }, 1400);
        });
    }
});
