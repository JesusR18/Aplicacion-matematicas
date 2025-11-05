// Redirección a login si no está logueado
if (!localStorage.getItem('loggedUser')) {
    if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
    }
}
    // Botón volver al menú
    document.getElementById('backBtn')?.addEventListener('click', () => {
        window.location.href = 'menu.html';
    });

// Fracciones: inicialización segura y funcionalidades interactivas
document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('fractionApp') || document.getElementById('fractionPage') || document.body;
    // Si los elementos esperados no existen, salir (el script puede cargarse en otras páginas)
    if (!document.getElementById('numerator1')) return;

    // Estado
    let currentQuestion = 0;
    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    let startTime = Date.now();

    // Preguntas de ejemplo (se pueden extender o generar aleatoriamente)
    const questions = [
        {
            fraction1: { numerator: 1, denominator: 2 },
            fraction2: { numerator: 2, denominator: 4 },
            correct: "=",
            hint: "Simplifica las fracciones para compararlas mejor"
        },
        {
            fraction1: { numerator: 3, denominator: 4 },
            fraction2: { numerator: 2, denominator: 3 },
            correct: ">",
            hint: "Convierte a decimales: 3/4 = 0.75, 2/3 ≈ 0.67"
        },
        {
            fraction1: { numerator: 1, denominator: 3 },
            fraction2: { numerator: 3, denominator: 8 },
            correct: "<",
            hint: "1/3 ≈ 0.33, 3/8 = 0.375"
        }
    ];

    // Visual pizza (seguro)
    function updatePizzaVisual(pizzaId, fraction) {
        const pizza = document.getElementById(pizzaId);
        if (!pizza) return;
        pizza.innerHTML = '';

        const totalSlices = Math.max(1, fraction.denominator);
        const filledSlices = Math.max(0, Math.min(totalSlices, fraction.numerator));
        const sliceAngle = 360 / totalSlices;

        for (let i = 0; i < totalSlices; i++) {
            const slice = document.createElement('div');
            slice.className = 'pizza-slice';
            slice.style.transform = `rotate(${i * sliceAngle}deg)`;
            if (i < filledSlices) slice.classList.add('filled');
            pizza.appendChild(slice);
        }
    }

    function updateFractionDisplay(question) {
        document.getElementById('numerator1').textContent = question.fraction1.numerator;
        document.getElementById('denominator1').textContent = question.fraction1.denominator;
        document.getElementById('numerator2').textContent = question.fraction2.numerator;
        document.getElementById('denominator2').textContent = question.fraction2.denominator;
        updatePizzaVisual('pizza1', question.fraction1);
        updatePizzaVisual('pizza2', question.fraction2);
    }

    function showQuestion() {
        if (currentQuestion >= questions.length) {
            endGame();
            return;
        }

        const question = questions[currentQuestion];
        const qNumEl = document.getElementById('questionNum');
        if (qNumEl) qNumEl.textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
        const qText = document.getElementById('questionText');
        if (qText) qText.textContent = "¿Qué fracción es mayor?";
        updateFractionDisplay(question);

        const progressBar = document.getElementById('progressBar');
        if (progressBar) {
            const progress = ((currentQuestion + 1) / questions.length) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    function checkAnswer(answer) {
        const question = questions[currentQuestion];
        const isCorrect = answer === question.correct;

        if (isCorrect) {
            correctAnswers++;
            score += 100;
        } else {
            incorrectAnswers++;
        }

        updateStats();
        return isCorrect;
    }

    // Event binding seguro para botones de respuesta (en HTML usan .answer-btn y data-answer)
    document.querySelectorAll('.answer-btn').forEach(button => {
        button.addEventListener('click', () => {
            const answer = button.dataset.answer;
            const isCorrect = checkAnswer(answer);
            button.classList.add(isCorrect ? 'correct' : 'incorrect');

            // Mostrar feedback y pasar a siguiente pregunta
            setTimeout(() => {
                button.classList.remove('correct', 'incorrect');
                currentQuestion++;
                showQuestion();
            }, 800);
        });
    });

    const hintBtn = document.getElementById('hintBtn');
    if (hintBtn) hintBtn.addEventListener('click', () => {
        const qText = document.getElementById('questionText');
        if (qText) qText.textContent = questions[currentQuestion].hint;
    });

    function updateStats() {
        const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
        const accuracyRate = Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100) || 0;

        const scoreEl = document.getElementById('score');
        if (scoreEl) scoreEl.textContent = score;
        const correctEl = document.getElementById('correctAnswers');
        if (correctEl) correctEl.textContent = correctAnswers;
        const incorrectEl = document.getElementById('incorrectAnswers');
        if (incorrectEl) incorrectEl.textContent = incorrectAnswers;
        const accEl = document.getElementById('accuracyRate');
        if (accEl) accEl.textContent = `${accuracyRate}%`;
        const timeEl = document.getElementById('timeElapsed');
        if (timeEl) timeEl.textContent = `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`;
    }

    function endGame() {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        gameArea.innerHTML = `
            <div class="end-game">
                <h2>¡Juego terminado!</h2>
                <p>Puntuación final: ${score}</p>
                <p>Respuestas correctas: ${correctAnswers}</p>
                <p>Precisión: ${Math.round((correctAnswers / questions.length) * 100)}%</p>
                <button id="playAgainBtn">Jugar de nuevo</button>
            </div>
        `;

        document.getElementById('playAgainBtn')?.addEventListener('click', () => location.reload());
    }

    // Iniciar
    showQuestion();
});
