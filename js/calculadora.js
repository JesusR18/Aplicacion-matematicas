// Verificar login
if (!localStorage.getItem('loggedUser')) {
    window.location.href = 'login.html';
}

// Variables simples para la calculadora
let displayValue = '0';
let firstNumber = null;
let operator = null;
let resetScreen = false;

// Elemento principal de la pantalla
const display = document.getElementById('displayMain');

// Actualizar la pantalla
function updateDisplay() {
    display.textContent = displayValue;
}

// Inicializar la pantalla
updateDisplay();

// Event listeners para n�meros
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        if (resetScreen) {
            displayValue = button.dataset.number;
            resetScreen = false;
        } else {
            displayValue = displayValue === '0' ? 
                button.dataset.number : 
                displayValue + button.dataset.number;
        }
        updateDisplay();
    });
});

// Event listeners para operadores
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        const currentValue = parseFloat(displayValue);
        
        if (firstNumber === null) {
            firstNumber = currentValue;
        } else if (operator) {
            const result = calculate();
            firstNumber = result;
            displayValue = result.toString();
            updateDisplay();
        }

        operator = button.dataset.operator;
        resetScreen = true;
    });
});

// Bot�n igual
document.getElementById('equalsBtn').addEventListener('click', () => {
    if (firstNumber !== null && operator) {
        const result = calculate();
        displayValue = result.toString();
        firstNumber = null;
        operator = null;
        updateDisplay();
    }
});

// Funci�n calcular
function calculate() {
    const secondNumber = parseFloat(displayValue);
    let result = 0;

    switch (operator) {
        case '+':
            result = firstNumber + secondNumber;
            break;
        case '-':
            result = firstNumber - secondNumber;
            break;
        case '*':
            result = firstNumber * secondNumber;
            break;
        case '/':
            if (secondNumber === 0) {
                alert('No se puede dividir por cero');
                return firstNumber;
            }
            result = firstNumber / secondNumber;
            break;
    }

    return result;
}

// Bot�n AC (Clear)
document.getElementById('clearBtn').addEventListener('click', () => {
    displayValue = '0';
    firstNumber = null;
    operator = null;
    resetScreen = false;
    updateDisplay();
});

// Bot�n DEL (Delete)
document.getElementById('deleteBtn').addEventListener('click', () => {
    if (displayValue.length > 1) {
        displayValue = displayValue.slice(0, -1);
    } else {
        displayValue = '0';
    }
    updateDisplay();
});

// Bot�n punto decimal
document.querySelector('[data-number="."]').addEventListener('click', () => {
    if (!displayValue.includes('.')) {
        displayValue += '.';
        updateDisplay();
    }
});

// Bot�n porcentaje
document.getElementById('percentBtn').addEventListener('click', () => {
    const value = parseFloat(displayValue);
    if (!isNaN(value)) {
        displayValue = (value / 100).toString();
        updateDisplay();
    }
});

// Volver al men�
document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'menu.html';
});
