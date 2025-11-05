
// Tablas: inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    // Variables globales
    let currentTable = 1;
    let currentDifficulty = 'easy';
    let score = 0;
    let questionCount = 0;
    let totalQuestions = 10;
    let correctCount = 0;
    let incorrectCount = 0;
    let timerSeconds = 0;
    let timerInterval;
    let bestTimes = {};

// Generación de preguntas
    function generateQuestion() {
    const multiplier = Math.floor(Math.random() * 10) + 1;
    const correctAnswer = currentTable * multiplier;
    
    let options = [];
    if (currentDifficulty === 'easy') {
        // Genera opciones para modo fácil
        options = generateOptions(correctAnswer);
    }
    
    return {
        firstNumber: currentTable,
        secondNumber: multiplier,
        answer: correctAnswer,
        options: options
    };
}

// Genera opciones para modo fácil
function generateOptions(correctAnswer) {
    let options = [correctAnswer];
    while (options.length < 4) {
        const randomOption = correctAnswer + (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? -1 : 1);
        if (randomOption > 0 && !options.includes(randomOption)) {
            options.push(randomOption);
        }
    }
    return options.sort(() => Math.random() - 0.5);
}

// Game Area
// - currentQuestion: Número de pregunta actual
// - totalQuestions: Total de preguntas
// - progressFill: Barra de progreso
// - streakCount: Contador de racha
// - firstNumber: Primer número de la multiplicación
// - secondNumber: Segundo número de la multiplicación

// Answer Modes
// - inputMode: Contenedor del modo input (medium)
// - answerInput: Input para escribir respuesta
// - optionsMode: Contenedor del modo opciones (easy)
// - Option buttons: data-answer

// Action Buttons
// - skipBtn: Saltar pregunta
// - checkBtn: Verificar respuesta
// - nextBtn: Siguiente pregunta

// Stats
// - correctCount: Contador de respuestas correctas
// - incorrectCount: Contador de respuestas incorrectas
// - accuracyPercent: Porcentaje de precisión
// - bestTime: Mejor tiempo
// - tipText: Texto del consejo

    // Ejemplo: Cambiar entre modos de dificultad
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const inputMode = document.getElementById('inputMode');
    const optionsMode = document.getElementById('optionsMode');

    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            difficultyBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentDifficulty = this.dataset.difficulty || 'easy';
            if (currentDifficulty === 'easy') {
                if (inputMode) inputMode.style.display = 'none';
                if (optionsMode) optionsMode.style.display = 'grid';
            } else {
                if (inputMode) inputMode.style.display = 'flex';
                if (optionsMode) optionsMode.style.display = 'none';
            }
        });
    });

// Ejemplo: Seleccionar tabla
    const tableBtns = document.querySelectorAll('.table-btn');
    tableBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            tableBtns.forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            currentTable = parseInt(this.dataset.table) || 1;
        });
    });

// Funciones principales
    function startGame() {
    questionCount = 0;
    correctCount = 0;
    incorrectCount = 0;
    score = 0;
    startTimer();
    showQuestion();
    updateStats();
}

    function showQuestion() {
    if (questionCount >= totalQuestions) {
        endGame();
        return;
    }
    
    questionCount++;
    const question = generateQuestion();
    document.getElementById('firstNumber').textContent = question.firstNumber;
    document.getElementById('secondNumber').textContent = question.secondNumber;
    
        if (currentDifficulty === 'easy') {
            if (document.getElementById('optionsMode')) document.getElementById('optionsMode').style.display = 'grid';
            if (document.getElementById('inputMode')) document.getElementById('inputMode').style.display = 'none';
            const optionsContainer = document.getElementById('optionsMode');
            if (optionsContainer) {
                optionsContainer.innerHTML = '';
                question.options.forEach(option => {
                    const button = document.createElement('button');
                    button.className = 'answer-option';
                    button.textContent = option;
                    button.onclick = () => checkAnswer(option);
                    optionsContainer.appendChild(button);
                });
            }
        } else {
            if (document.getElementById('optionsMode')) document.getElementById('optionsMode').style.display = 'none';
            if (document.getElementById('inputMode')) document.getElementById('inputMode').style.display = 'flex';
            const answerInput = document.getElementById('answerInput');
            if (answerInput) { answerInput.value = ''; answerInput.focus(); }
        }
    
    updateProgress();
}

    function checkAnswer(userAnswer) {
    const firstNumber = parseInt(document.getElementById('firstNumber').textContent);
    const secondNumber = parseInt(document.getElementById('secondNumber').textContent);
    const correctAnswer = firstNumber * secondNumber;
    
    if (parseInt(userAnswer) === correctAnswer) {
        handleCorrectAnswer();
    } else {
        handleIncorrectAnswer();
    }
}

function handleCorrectAnswer() {
    correctCount++;
    score += calculatePoints();
    showFeedback(true);
    updateStats();
    setTimeout(showQuestion, 1000);
}

function handleIncorrectAnswer() {
    incorrectCount++;
    showFeedback(false);
    updateStats();
    if (currentDifficulty === 'hard') {
        endGame();
    } else {
        setTimeout(showQuestion, 1000);
    }
}

function calculatePoints() {
    const basePoints = 10;
    const difficultyMultiplier = {
        'easy': 1,
        'medium': 2,
        'hard': 3
    };
    return basePoints * difficultyMultiplier[currentDifficulty];
}

function showFeedback(isCorrect) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.textContent = isCorrect ? '¡Correcto! 🎉' : '¡Incorrecto! 😢';
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
}

function updateProgress() {
    const progress = (questionCount / totalQuestions) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('currentQuestion').textContent = questionCount;
    document.getElementById('totalQuestions').textContent = totalQuestions;
}

function updateStats() {
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('correctCount').textContent = correctCount;
    document.getElementById('incorrectCount').textContent = incorrectCount;
    document.getElementById('accuracyPercent').textContent = 
        `${Math.round((correctCount / (correctCount + incorrectCount)) * 100) || 0}%`;
}

function startTimer() {
    timerSeconds = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerSeconds++;
        const mins = Math.floor(timerSeconds / 60);
        const secs = timerSeconds % 60;
        document.getElementById('timerDisplay').textContent = 
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

function endGame() {
    clearInterval(timerInterval);
    
    // Actualizar mejor tiempo
    if (!bestTimes[currentTable] || timerSeconds < bestTimes[currentTable]) {
        bestTimes[currentTable] = timerSeconds;
        document.getElementById('bestTime').textContent = 
            `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`;
    }
    
    const gameArea = document.querySelector('.game-area');
    gameArea.innerHTML = `
        <div class="end-game">
            <h2>¡Juego terminado!</h2>
            <p>Puntuación final: ${score}</p>
            <p>Respuestas correctas: ${correctCount}</p>
            <p>Precisión: ${Math.round((correctCount / (correctCount + incorrectCount)) * 100)}%</p>
            <p>Tiempo: ${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}</p>
            <button onclick="location.reload()">Jugar de nuevo</button>
        </div>
    `;
}

// Event Listener para el input en modo medio/difícil
const answerInputEl = document.getElementById('answerInput');
if (answerInputEl) answerInputEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') checkAnswer(this.value);
});

    // Event listeners para botones estáticos de opciones (si existen en el HTML)
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.addEventListener('click', () => checkAnswer(btn.dataset.answer));
    });

    // Botones de acción
    document.getElementById('skipBtn')?.addEventListener('click', () => {
        // Tratar como incorrecta y avanzar
        handleIncorrectAnswer();
    });
    document.getElementById('checkBtn')?.addEventListener('click', () => {
        const answerInput = document.getElementById('answerInput');
        if (answerInput) checkAnswer(answerInput.value);
    });

    // Inicialización segura
    const table1 = document.querySelector('[data-table="1"]');
    if (table1) table1.click();
    const easyBtn = document.querySelector('[data-difficulty="easy"]');
    if (easyBtn) easyBtn.click();
});
