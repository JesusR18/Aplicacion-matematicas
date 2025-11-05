// Menu: inicialización y seguridad
document.addEventListener('DOMContentLoaded', function() {
    // Variables del sistema de puntos
    let userStats = {
        points: parseInt(localStorage.getItem('userPoints')) || 0,
        stars: parseInt(localStorage.getItem('userStars')) || 0,
        trophies: parseInt(localStorage.getItem('userTrophies')) || 0,
        streak: parseInt(localStorage.getItem('userStreak')) || 0,
        lastLogin: localStorage.getItem('lastLogin') || null
    };

    // Función para actualizar las estadísticas visuales
    function updateStats() {
        const pointsEl = document.querySelector('.user-points');
        if (pointsEl) pointsEl.textContent = userStats.points + ' puntos';
        const statNumbers = document.querySelectorAll('.stat-number');
        if (statNumbers[1]) statNumbers[1].textContent = userStats.stars;
        if (statNumbers[2]) statNumbers[2].textContent = userStats.trophies;
        if (statNumbers[3]) statNumbers[3].textContent = userStats.streak;
    }

    // Función para actualizar la racha diaria
    function updateStreak() {
        const today = new Date().toDateString();
        if (userStats.lastLogin) {
            const lastLogin = new Date(userStats.lastLogin);
            const daysDiff = Math.floor((new Date() - lastLogin) / (1000 * 60 * 60 * 24));
            if (daysDiff === 1) {
                userStats.streak++;
            } else if (daysDiff > 1) {
                userStats.streak = 0;
            }
        }
        userStats.lastLogin = today;
        saveStats();
    }

    // Función para guardar estadísticas
    function saveStats() {
        localStorage.setItem('userPoints', userStats.points);
        localStorage.setItem('userStars', userStats.stars);
        localStorage.setItem('userTrophies', userStats.trophies);
        localStorage.setItem('userStreak', userStats.streak);
        localStorage.setItem('lastLogin', userStats.lastLogin);
    }

    // Función para abrir actividad
    function openActivity(activityName) {
        // Guardar la última actividad
        localStorage.setItem('lastActivity', activityName);
        // Abrir la página correspondiente
        switch (activityName) {
            case 'fracciones': window.location.href = 'fracciones.html'; break;
            case 'geometria': window.location.href = 'geometria.html'; break;
            case 'calculadora': window.location.href = 'calculadora.html'; break;
            case 'tablas': window.location.href = 'tablas.html'; break;
            case 'operaciones': window.location.href = 'operaciones.html'; break;
            default: console.log('Actividad no encontrada');
        }
    }

    // Inicializar estadísticas y racha
    updateStats();
    updateStreak();

    // Configurar cards del menú
    const cards = document.querySelectorAll('.menu-card');
    cards.forEach((card) => {
        // Efecto de elevación
        card.addEventListener('mouseenter', function() {
            this.style.zIndex = '20'; this.style.transform = 'scale(1.05)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.zIndex = '10'; this.style.transform = 'scale(1)';
        });

        // Añadir niveles completados (preferir data-activity)
        const badge = card.querySelector('.card-badge');
        const activity = card.dataset.activity || (card.getAttribute('onclick') ? (card.getAttribute('onclick').match(/'(.+)'/) || [])[1] : null);
        const completedLevels = parseInt(localStorage.getItem(`${activity}CompletedLevels`)) || 0;
        const totalLevelsMatch = badge ? badge.textContent.match(/\d+/) : null;
        if (badge && totalLevelsMatch) {
            badge.textContent = `${completedLevels}/${totalLevelsMatch[0]} Niveles`;
        }
    });

    // Efecto de partículas al hacer hover
    document.querySelectorAll('.menu-card').forEach(card => {
        card.addEventListener('mouseenter', function(e) {
            createSparkle(e.pageX, e.pageY);
        });
    });

    function createSparkle(x, y) {
        const sparkle = document.createElement('div');
        sparkle.style.position = 'fixed'; sparkle.style.left = x + 'px'; sparkle.style.top = y + 'px';
        sparkle.style.width = '10px'; sparkle.style.height = '10px'; sparkle.style.background = 'white';
        sparkle.style.borderRadius = '50%'; sparkle.style.pointerEvents = 'none';
        sparkle.style.animation = 'sparkleAnimation 1s ease-out forwards'; sparkle.style.zIndex = '1000';
        document.body.appendChild(sparkle);
        setTimeout(() => sparkle.remove(), 1000);
    }

    // Agregar animación de sparkle
    const style = document.createElement('style');
    style.textContent = `
        @keyframes sparkleAnimation {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // Exponer openActivity si se requiere desde HTML onclick
    window.openActivity = openActivity;
});
