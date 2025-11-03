
// Variables globales
let currentInput = '';
let previousInput = '';
let currentOperation = null;
let shouldResetScreen = false;
let memoryValue = 0;
let history = [];

// Elementos del DOM
const displayMain = document.getElementById('displayMain');
const displayHistory = document.getElementById('displayHistory');
const historyList = document.getElementById('historyList');
const memoryDisplay = document.getElementById('memoryValue');

// Función para actualizar el display
function updateDisplay() {
    displayMain.textContent = currentInput || '0';
}

// Manejador de números
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        if (shouldResetScreen) {
            currentInput = '';
            shouldResetScreen = false;
        }
        currentInput += button.dataset.number;
        updateDisplay();
    });
});

// Manejador de operadores
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        if (currentInput !== '') {
            if (previousInput !== '') {
                calculate();
            }
            previousInput = currentInput;
            currentOperation = button.dataset.operator;
            shouldResetScreen = true;
            addToHistory(`${previousInput} ${currentOperation}`);
        }
    });
});

// Función de cálculo
function calculate() {
    if (previousInput === '' || currentInput === '') return;
    
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    switch(currentOperation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            result = prev / current;
            break;
    }
    
    currentInput = result.toString();
    previousInput = '';
    currentOperation = null;
    updateDisplay();
    addToHistory(`${prev} ${currentOperation} ${current} = ${result}`);
}

// Botón igual
document.getElementById('equalsBtn').addEventListener('click', calculate);

// Botón limpiar
document.getElementById('clearBtn').addEventListener('click', () => {
    currentInput = '';
    previousInput = '';
    currentOperation = null;
    updateDisplay();
});

// Botón borrar último
document.getElementById('deleteBtn').addEventListener('click', () => {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
});

// Botón porcentaje
document.getElementById('percentBtn').addEventListener('click', () => {
    if (currentInput !== '') {
        currentInput = (parseFloat(currentInput) / 100).toString();
        updateDisplay();
    }
});

// Funciones de memoria
document.getElementById('memoryAddBtn').addEventListener('click', () => {
    memoryValue += parseFloat(currentInput || '0');
    memoryDisplay.textContent = memoryValue;
});

document.getElementById('memorySubtractBtn').addEventListener('click', () => {
    memoryValue -= parseFloat(currentInput || '0');
    memoryDisplay.textContent = memoryValue;
});

document.getElementById('memoryRecallBtn').addEventListener('click', () => {
    currentInput = memoryValue.toString();
    updateDisplay();
});

document.getElementById('memoryClearBtn').addEventListener('click', () => {
    memoryValue = 0;
    memoryDisplay.textContent = '0';
});

// Funciones científicas
document.querySelectorAll('[data-function]').forEach(button => {
    button.addEventListener('click', () => {
        const num = parseFloat(currentInput);
        switch(button.dataset.function) {
            case 'sin':
                currentInput = Math.sin(num).toString();
                break;
            case 'cos':
                currentInput = Math.cos(num).toString();
                break;
            case 'tan':
                currentInput = Math.tan(num).toString();
                break;
            case 'sqrt':
                currentInput = Math.sqrt(num).toString();
                break;
            case 'pow2':
                currentInput = Math.pow(num, 2).toString();
                break;
            case 'log':
                currentInput = Math.log10(num).toString();
                break;
        }
        updateDisplay();
    });
});

// Función para agregar al historial
function addToHistory(operation) {
    history.push(operation);
    const li = document.createElement('li');
    li.textContent = operation;
    historyList.appendChild(li);
    displayHistory.scrollTop = displayHistory.scrollHeight;
}

// Modo científico
const modeBtns = document.querySelectorAll('.mode-btn');
const scientificPanel = document.getElementById('scientificPanel');

modeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        modeBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        if (this.dataset.mode === 'scientific') {
            scientificPanel.classList.add('active');
        } else {
            scientificPanel.classList.remove('active');
        }
    });
});
