
// Variables globales
let currentQuestion = 0;
let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let startTime = Date.now();

// Preguntas de ejemplo
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

// Función para actualizar la visualización de fracciones
function updateFractionDisplay(question) {
    document.getElementById('numerator1').textContent = question.fraction1.numerator;
    document.getElementById('denominator1').textContent = question.fraction1.denominator;
    document.getElementById('numerator2').textContent = question.fraction2.numerator;
    document.getElementById('denominator2').textContent = question.fraction2.denominator;
    
    // Actualizar visualización de pizzas
    updatePizzaVisual('pizza1', question.fraction1);
    updatePizzaVisual('pizza2', question.fraction2);
}

// Función para actualizar la visualización de pizza
function updatePizzaVisual(pizzaId, fraction) {
    const pizza = document.getElementById(pizzaId);
    pizza.innerHTML = ''; // Limpiar pizza
    
    const totalSlices = fraction.denominator;
    const filledSlices = fraction.numerator;
    const sliceAngle = 360 / totalSlices;
    
    for (let i = 0; i < totalSlices; i++) {
        const slice = document.createElement('div');
        slice.className = 'pizza-slice';
        slice.style.transform = `rotate(${i * sliceAngle}deg)`;
        if (i < filledSlices) {
            slice.classList.add('filled');
        }
        pizza.appendChild(slice);
    }
}

// Función para mostrar la siguiente pregunta
function showQuestion() {
    if (currentQuestion >= questions.length) {
        endGame();
        return;
    }
    
    const question = questions[currentQuestion];
    document.getElementById('questionNum').textContent = `Pregunta ${currentQuestion + 1} de ${questions.length}`;
    document.getElementById('questionText').textContent = "¿Qué fracción es mayor?";
    updateFractionDisplay(question);
    
    // Actualizar barra de progreso
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Función para verificar respuesta
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

// Event listeners para los botones de respuesta
document.querySelectorAll('.answer-option').forEach(button => {
    button.addEventListener('click', () => {
        const isCorrect = checkAnswer(button.dataset.symbol);
        button.classList.add(isCorrect ? 'correct' : 'incorrect');
        
        setTimeout(() => {
            button.classList.remove('correct', 'incorrect');
            currentQuestion++;
            showQuestion();
        }, 1000);
    });
});

// Botón de pista
document.getElementById('hintBtn').addEventListener('click', () => {
    document.getElementById('questionText').textContent = questions[currentQuestion].hint;
});

// Función para actualizar estadísticas
function updateStats() {
    const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
    const accuracyRate = Math.round((correctAnswers / (correctAnswers + incorrectAnswers)) * 100) || 0;
    
    document.getElementById('score').textContent = score;
    document.getElementById('correctAnswers').textContent = correctAnswers;
    document.getElementById('incorrectAnswers').textContent = incorrectAnswers;
    document.getElementById('accuracyRate').textContent = `${accuracyRate}%`;
    document.getElementById('timeElapsed').textContent = `${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}`;
}

// Función para terminar el juego
function endGame() {
    const gameArea = document.querySelector('.game-area');
    gameArea.innerHTML = `
        <div class="end-game">
            <h2>¡Juego terminado!</h2>
            <p>Puntuación final: ${score}</p>
            <p>Respuestas correctas: ${correctAnswers}</p>
            <p>Precisión: ${Math.round((correctAnswers / questions.length) * 100)}%</p>
            <button onclick="location.reload()">Jugar de nuevo</button>
        </div>
    `;
}

// Iniciar juego
showQuestion();
