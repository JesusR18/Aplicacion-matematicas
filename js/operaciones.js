
// Variables globales
let currentOperation = 'addition';
let gameMode = 'practice';
let numberRange = 10;
let score = 0;
let lives = 3;
let currentQuestionNumber = 0;
let totalQuestions = 10;
let timerSeconds = 0;
let timerInterval;
let streak = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
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
    
    switch(currentOperation) {
        case 'addition':
        case 'multiplication':
            num1 = Math.floor(Math.random() * numberRange) + 1;
            num2 = Math.floor(Math.random() * numberRange) + 1;
            break;
        case 'subtraction':
            num1 = Math.floor(Math.random() * numberRange) + 1;
            num2 = Math.floor(Math.random() * num1) + 1;
            break;
        case 'division':
            num2 = Math.floor(Math.random() * (numberRange/2)) + 1;
            num1 = num2 * (Math.floor(Math.random() * numberRange/2) + 1);
            break;
    }
    
    return {
        num1: num1,
        num2: num2,
        answer: operations[currentOperation].calculate(num1, num2)
    };
}

// Función para iniciar juego
function startGame() {
    score = 0;
    lives = 3;
    currentQuestionNumber = 0;
    streak = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    startTime = Date.now();
    
    updateLives();
    updateScore();
    if (gameMode === 'timed') {
        startTimer();
    }
    
    showNextQuestion();
    document.getElementById('startGameBtn').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
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

// Ejemplo: Actualizar rango de números
const rangeSlider = document.getElementById('rangeSlider');
const rangeValue = document.getElementById('rangeValue');

rangeSlider.addEventListener('input', function() {
    rangeValue.textContent = this.value;
});

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

// Ejemplo: Sistema de vidas
function loseLife() {
    const hearts = document.querySelectorAll('.life-heart');
    for (let i = hearts.length - 1; i >= 0; i--) {
        if (!hearts[i].classList.contains('lost')) {
            hearts[i].classList.add('lost');
            break;
        }
    }
}

// Ejemplo: Actualizar progreso
function updateProgress(current, total) {
    const percentage = (current / total) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// Ejemplo: Verificar respuesta
document.getElementById('checkAnswerBtn').addEventListener('click', function() {
    const answerField = document.getElementById('answerField');
    const answerBox = document.getElementById('answerBox');
    const userAnswer = parseInt(answerField.value);
    
    // Aquí compararías con la respuesta correcta
    const correctAnswer = 13; // Ejemplo
    
    if (userAnswer === correctAnswer) {
        answerBox.classList.add('correct');
        setTimeout(() => answerBox.classList.remove('correct'), 1000);
        console.log('¡Respuesta correcta!');
    } else {
        answerBox.classList.add('incorrect');
        setTimeout(() => answerBox.classList.remove('incorrect'), 1000);
        console.log('Respuesta incorrecta');
        // loseLife(); // Descomentar para perder vida
    }
});

// Ejemplo: Timer básico
let seconds = 0;
let timerInterval;

function startTimer() {
    timerInterval = setInterval(() => {
        seconds++;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        document.getElementById('timerBadge').textContent = 
            `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }, 1000);
}

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
