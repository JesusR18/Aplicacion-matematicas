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

// Variables globales
let gameState = {
    currentOperation: 'addition',
    gameMode: 'practice',
    numberRange: 10,
    score: 0,
    lives: 3,
    currentQuestionNumber: 0,
    totalQuestions: 10,
    timerSeconds: 0,
    streak: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    gameStarted: false
};

// Event Listeners para botones de operaciones
document.querySelectorAll('[data-operation]').forEach(button => {
    button.addEventListener('click', () => {
        gameState.currentOperation = button.dataset.operation;
        document.querySelectorAll('[data-operation]').forEach(b => b.classList.remove('selected'));
        button.classList.add('selected');
        
        // Actualizar el símbolo de operación
        const operatorSymbol = document.getElementById('operatorSymbol');
        if (operatorSymbol) {
            operatorSymbol.textContent = operations[gameState.currentOperation].symbol;
        }
    });
});

// Event Listeners para modos de juego
document.querySelectorAll('[data-mode]').forEach(button => {
    button.addEventListener('click', () => {
        gameState.gameMode = button.dataset.mode;
        document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        
        const timerBadge = document.getElementById('timerBadge');
        if (timerBadge) {
            timerBadge.style.display = gameState.gameMode === 'timed' ? 'flex' : 'none';
        }
    });
});
let startTime;

// Configuración del juego
const operations = {
    addition: {
        symbol: '+',
        calculate: (a, b) => a + b,
        name: 'Suma'
    },
    subtraction: {
        symbol: '−',
        calculate: (a, b) => a - b,
        name: 'Resta'
    },
    multiplication: {
        symbol: '×',
        calculate: (a, b) => a * b,
        name: 'Multiplicación'
    },
    division: {
        symbol: '÷',
        calculate: (a, b) => a / b,
        name: 'División'
    }
};

// Función para generar problema
function generateProblem() {
    let num1, num2;
    
    switch(gameState.currentOperation) {
        case 'addition':
        case 'multiplication':
            num1 = Math.floor(Math.random() * gameState.numberRange) + 1;
            num2 = Math.floor(Math.random() * gameState.numberRange) + 1;
            break;
        case 'subtraction':
            num1 = Math.floor(Math.random() * gameState.numberRange) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            break;
        case 'division':
            num2 = Math.floor(Math.random() * (gameState.numberRange/2)) + 1;
            num1 = num2 * (Math.floor(Math.random() * gameState.numberRange/2) + 1);
            break;
    }
    
    return {
        num1: num1,
        num2: num2,
        answer: operations[gameState.currentOperation].calculate(num1, num2)
    };
}

// Función para iniciar juego
function startGame() {
    // Reiniciar estado del juego
    gameState.score = 0;
    gameState.lives = 3;
    gameState.currentQuestionNumber = 0;
    gameState.streak = 0;
    gameState.correctAnswers = 0;
    gameState.incorrectAnswers = 0;
    gameState.gameStarted = true;
    startTime = Date.now();
    
    // Actualizar interfaz
    updateLives();
    updateScore();
    updateProgress(0, gameState.totalQuestions);
    
    // Iniciar timer si es modo contrarreloj
    if (gameState.gameMode === 'timed') {
        startTimer();
    }
    
    // Mostrar área de juego
    const startButton = document.getElementById('startGameBtn');
    const gameArea = document.getElementById('gameArea');
    
    if (startButton && gameArea) {
        startButton.style.display = 'none';
        gameArea.style.display = 'block';
        showNextQuestion();
    }
}

// Game Area
// - currentQuestion: Número de pregunta actual
// - totalQuestions: Total de preguntas
// - progressFill: Barra de progreso
// - timerBadge: Display del cronómetro
// - firstNumber: Primer número de la operación
// - operatorSymbol: Símbolo de operación
// - secondNumber: Segundo número
// - answerBox: Contenedor de la respuesta
// - answerField: Campo de entrada de respuesta
// - answerOptions: Contenedor de opciones múltiples
// - skipBtn: Saltar pregunta
// - checkAnswerBtn: Verificar respuesta
// - nextBtn: Siguiente pregunta

// Stats Panel
// - correctAnswers: Respuestas correctas
// - incorrectAnswers: Respuestas incorrectas
// - accuracyRate: Tasa de precisión
// - streakCount: Contador de racha
// - speedFill: Barra de velocidad
// - speedText: Texto de velocidad
// - recentAnswers: Lista de respuestas recientes

// Ejemplo: Seleccionar operación
const operationBtns = document.querySelectorAll('.operation-btn');
const operatorSymbol = document.getElementById('operatorSymbol');

operationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        operationBtns.forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        
        const operation = this.dataset.operation;
        const symbols = {
            'addition': '+',
            'subtraction': '−',
            'multiplication': '×',
            'division': '÷'
        };
        
        operatorSymbol.textContent = symbols[operation];
        console.log('Operación seleccionada:', operation);
    });
});

// Configuración del rango de números
const rangeSlider = document.getElementById('rangeSlider');
const rangeValue = document.getElementById('rangeValue');

if (rangeSlider && rangeValue) {
    // Establecer valor inicial
    rangeValue.textContent = gameState.numberRange;
    rangeSlider.value = gameState.numberRange;
    
    // Actualizar al cambiar
    rangeSlider.addEventListener('input', function() {
        const newRange = parseInt(this.value);
        gameState.numberRange = newRange;
        rangeValue.textContent = newRange;
    });
}

// Ejemplo: Seleccionar modo de juego
const gameModeBtns = document.querySelectorAll('.game-mode-btn');

gameModeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        gameModeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const mode = this.dataset.mode;
        console.log('Modo de juego:', mode);
        
        // Mostrar/ocultar timer según el modo
        const timerBadge = document.getElementById('timerBadge');
        if (mode === 'practice') {
            timerBadge.style.display = 'none';
        } else {
            timerBadge.style.display = 'flex';
        }
    });
});

// Sistema de vidas y puntuación
function updateLives() {
    const heartsContainer = document.getElementById('lives');
    if (heartsContainer) {
        heartsContainer.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.className = `life-heart ${i >= gameState.lives ? 'lost' : ''}`;
            heart.innerHTML = '❤️';
            heartsContainer.appendChild(heart);
        }
    }
}

function loseLife() {
    if (gameState.lives > 0) {
        gameState.lives--;
        updateLives();
        
        if (gameState.lives === 0) {
            endGame();
        }
    }
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
        scoreElement.textContent = gameState.score;
    }
    
    // Actualizar racha
    const streakElement = document.getElementById('streakCount');
    if (streakElement) {
        streakElement.textContent = gameState.streak;
    }
    
    // Actualizar estadísticas
    updateStats();
}

function updateStats() {
    const total = gameState.correctAnswers + gameState.incorrectAnswers;
    const accuracy = total > 0 ? Math.round((gameState.correctAnswers / total) * 100) : 0;
    
    const correctElement = document.getElementById('correctAnswers');
    const incorrectElement = document.getElementById('incorrectAnswers');
    const accuracyElement = document.getElementById('accuracyRate');
    
    if (correctElement) correctElement.textContent = gameState.correctAnswers;
    if (incorrectElement) incorrectElement.textContent = gameState.incorrectAnswers;
    if (accuracyElement) accuracyElement.textContent = accuracy + '%';
}

// Ejemplo: Actualizar progreso
function updateProgress(current, total) {
    const percentage = (current / total) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
}

let currentProblem;

function showNextQuestion() {
    if (gameState.currentQuestionNumber >= gameState.totalQuestions) {
        endGame();
        return;
    }

    currentProblem = generateProblem();
    gameState.currentQuestionNumber++;
    
    const firstNumber = document.getElementById('firstNumber');
    const secondNumber = document.getElementById('secondNumber');
    const operatorSymbol = document.getElementById('operatorSymbol');
    const answerField = document.getElementById('answerField');
    
    if (firstNumber) firstNumber.textContent = currentProblem.num1;
    if (secondNumber) secondNumber.textContent = currentProblem.num2;
    if (operatorSymbol) operatorSymbol.textContent = operations[gameState.currentOperation].symbol;
    if (answerField) {
        answerField.value = '';
        answerField.focus();
    }
    
    updateProgress(gameState.currentQuestionNumber, gameState.totalQuestions);
}

function checkAnswer() {
    if (!currentProblem || !gameState.gameStarted) return;
    
    const answerField = document.getElementById('answerField');
    const answerBox = document.getElementById('answerBox');
    
    if (!answerField || !answerBox) return;
    
    const userAnswer = parseInt(answerField.value);
    
    if (isNaN(userAnswer)) {
        answerBox.classList.add('incorrect');
        setTimeout(() => answerBox.classList.remove('incorrect'), 1000);
        return;
    }
    
    const timeTaken = (Date.now() - startTime) / 1000;
    const isCorrect = userAnswer === currentProblem.answer;
    
    if (isCorrect) {
        answerBox.classList.add('correct');
        setTimeout(() => answerBox.classList.remove('correct'), 1000);
        
        gameState.score += calculatePoints(timeTaken);
        gameState.correctAnswers++;
        gameState.streak++;
        
        updateSpeed(timeTaken);
        updateScore();
        
        // Añadir respuesta reciente
        addRecentAnswer(true, currentProblem, userAnswer);
    } else {
        answerBox.classList.add('incorrect');
        setTimeout(() => answerBox.classList.remove('incorrect'), 1000);
        
        gameState.incorrectAnswers++;
        gameState.streak = 0;
        loseLife();
        
        // Añadir respuesta incorrecta
        addRecentAnswer(false, currentProblem, userAnswer);
    }
    
    startTime = Date.now();
    showNextQuestion();
}

function calculatePoints(timeTaken) {
    // Base points
    let points = 100;
    
    // Time bonus/penalty
    if (timeTaken < 3) {
        points += 50; // Super rápido
    } else if (timeTaken < 7) {
        points += 25; // Rápido
    } else if (timeTaken > 12) {
        points -= 25; // Lento
    }
    
    // Streak bonus
    if (gameState.streak >= 5) {
        points *= 1.5;
    } else if (gameState.streak >= 3) {
        points *= 1.25;
    }
    
    return Math.round(points);
}

function addRecentAnswer(correct, problem, userAnswer) {
    const recentAnswers = document.getElementById('recentAnswers');
    if (!recentAnswers) return;
    
    const answerItem = document.createElement('div');
    answerItem.className = `recent-answer ${correct ? 'correct' : 'incorrect'}`;
    
    const expression = `${problem.num1} ${operations[gameState.currentOperation].symbol} ${problem.num2} = ${userAnswer}`;
    answerItem.textContent = expression;
    
    // Insertar al principio
    if (recentAnswers.firstChild) {
        recentAnswers.insertBefore(answerItem, recentAnswers.firstChild);
    } else {
        recentAnswers.appendChild(answerItem);
    }
    
    // Mantener solo las últimas 5 respuestas
    while (recentAnswers.children.length > 5) {
        recentAnswers.removeChild(recentAnswers.lastChild);
    }
}

// Event listener para el botón de verificar
document.getElementById('checkAnswerBtn')?.addEventListener('click', checkAnswer);

// Event listener para el campo de respuesta (Enter)
document.getElementById('answerField')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

// Timer y manejo del fin del juego
let timerInterval;

function startTimer() {
    gameState.timerSeconds = 0;
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        gameState.timerSeconds++;
        const mins = Math.floor(gameState.timerSeconds / 60);
        const secs = gameState.timerSeconds % 60;
        
        const timerBadge = document.getElementById('timerBadge');
        if (timerBadge) {
            timerBadge.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        
        // En modo contrarreloj, terminar después de 2 minutos
        if (gameState.gameMode === 'timed' && gameState.timerSeconds >= 120) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameState.gameStarted = false;
    clearInterval(timerInterval);
    
    // Calcular estadísticas finales
    const total = gameState.correctAnswers + gameState.incorrectAnswers;
    const accuracy = total > 0 ? Math.round((gameState.correctAnswers / total) * 100) : 0;
    const timePerQuestion = total > 0 ? Math.round(gameState.timerSeconds / total) : 0;
    
    // Crear mensaje de resultados
    const message = `
        ¡Juego terminado!
        Puntuación final: ${gameState.score}
        Respuestas correctas: ${gameState.correctAnswers}
        Precisión: ${accuracy}%
        Tiempo por pregunta: ${timePerQuestion} segundos
        Racha más larga: ${gameState.streak}
    `;
    
    // Mostrar resultados
    alert(message);
    
    // Reiniciar interfaz
    const startButton = document.getElementById('startGameBtn');
    const gameArea = document.getElementById('gameArea');
    
    if (startButton && gameArea) {
        startButton.style.display = 'block';
        gameArea.style.display = 'none';
    }
}

// Event listener para el botón de saltar
document.getElementById('skipBtn')?.addEventListener('click', () => {
    if (gameState.gameStarted) {
        gameState.incorrectAnswers++;
        loseLife();
        showNextQuestion();
    }
});

// Ejemplo: Actualizar velocidad de respuesta
function updateSpeed(timeInSeconds) {
    const speedFill = document.getElementById('speedFill');
    const speedText = document.getElementById('speedText');
    
    if (timeInSeconds < 3) {
        speedFill.style.width = '100%';
        speedText.textContent = 'Súper Rápido 🚀';
        speedFill.style.background = 'linear-gradient(90deg, #55efc4, #00b894)';
    } else if (timeInSeconds < 7) {
        speedFill.style.width = '75%';
        speedText.textContent = 'Rápido ⚡';
        speedFill.style.background = 'linear-gradient(90deg, #74b9ff, #0984e3)';
    } else if (timeInSeconds < 12) {
        speedFill.style.width = '50%';
        speedText.textContent = 'Normal 👍';
        speedFill.style.background = 'linear-gradient(90kg, #fdcb6e, #f39c12)';
    } else {
        speedFill.style.width = '25%';
        speedText.textContent = 'Despacio 🐢';
        speedFill.style.background = 'linear-gradient(90deg, #ff7675, #d63031)';
    }
}

// Inicialización
document.getElementById('startGameBtn').addEventListener('click', function() {
    console.log('¡Juego iniciado!');
    // startTimer(); // Descomentar para iniciar timer
    updateProgress(1, 10);
});
