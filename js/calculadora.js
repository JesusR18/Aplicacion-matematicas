
// Estado de la calculadora
const calculatorState = {
    currentInput: '',
    previousInput: '',
    currentOperation: null,
    shouldResetScreen: false,
    memoryValue: parseFloat(localStorage.getItem('calculatorMemory')) || 0,
    history: JSON.parse(localStorage.getItem('calculatorHistory')) || [],
    mode: 'basic', // 'basic' o 'scientific'
    lastResult: null,
    errorState: false
};

// Elementos del DOM
const elements = {
    displayMain: document.getElementById('displayMain'),
    displayHistory: document.getElementById('displayHistory'),
    historyList: document.getElementById('historyList'),
    memoryDisplay: document.getElementById('memoryValue'),
    scientificPanel: document.getElementById('scientificPanel'),
    formulaCards: document.querySelectorAll('.formula-card')
};

// Funciones de utilidad
const utils = {
    formatNumber: (num) => {
        if (isNaN(num)) return 'Error';
        const maxDecimals = 8;
        const formatted = parseFloat(num).toPrecision(maxDecimals);
        return parseFloat(formatted).toString();
    },
    
    validateInput: (input) => {
        if (input.length > 15) return false; // Límite de longitud
        if (input.includes('.') && input.split('.')[1]?.length > 8) return false; // Límite de decimales
        return true;
    }
};

// Funciones de display
function updateDisplay(forceValue = null) {
    if (calculatorState.errorState) {
        elements.displayMain.textContent = 'Error';
        return;
    }
    
    const displayValue = forceValue !== null ? forceValue : 
                        calculatorState.currentInput || '0';
    elements.displayMain.textContent = displayValue;
}

function showTemporaryMessage(message, duration = 1500) {
    const currentDisplay = elements.displayMain.textContent;
    elements.displayMain.textContent = message;
    setTimeout(() => updateDisplay(currentDisplay), duration);
}

// Manejador de números
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        // Reset si es necesario
        if (calculatorState.shouldResetScreen) {
            calculatorState.currentInput = '';
            calculatorState.shouldResetScreen = false;
        }
        
        // Validar entrada de punto decimal
        if (button.dataset.number === '.' && calculatorState.currentInput.includes('.')) {
            return;
        }
        
        // Validar longitud máxima
        const newInput = calculatorState.currentInput + button.dataset.number;
        if (!utils.validateInput(newInput)) {
            showTemporaryMessage('Máx. alcanzado');
            return;
        }
        
        calculatorState.currentInput = newInput;
        updateDisplay();
    });
});

// Operaciones matemáticas
const operations = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => b !== 0 ? a / b : null,
    '%': (a) => a / 100,
    'sqrt': (a) => a >= 0 ? Math.sqrt(a) : null,
    'pow2': (a) => Math.pow(a, 2),
    'sin': (a) => Math.sin(a * Math.PI / 180), // Grados
    'cos': (a) => Math.cos(a * Math.PI / 180),
    'tan': (a) => Math.tan(a * Math.PI / 180),
    'log': (a) => a > 0 ? Math.log10(a) : null,
    'ln': (a) => a > 0 ? Math.log(a) : null
};

// Manejador de operadores
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        if (calculatorState.errorState) {
            clearCalculator();
            return;
        }

        if (calculatorState.currentInput !== '') {
            if (calculatorState.previousInput !== '') {
                calculate();
            }
            calculatorState.previousInput = calculatorState.currentInput;
            calculatorState.currentOperation = button.dataset.operator;
            calculatorState.shouldResetScreen = true;
            addToHistory(`${calculatorState.previousInput} ${button.textContent}`);
        } else if (calculatorState.lastResult !== null) {
            // Usar el último resultado para la siguiente operación
            calculatorState.previousInput = calculatorState.lastResult.toString();
            calculatorState.currentOperation = button.dataset.operator;
            calculatorState.shouldResetScreen = true;
            addToHistory(`${calculatorState.previousInput} ${button.textContent}`);
        }
    });
});

// Función de cálculo
function calculate() {
    if (calculatorState.errorState ||
        (calculatorState.previousInput === '' && calculatorState.currentInput === '')) {
        return;
    }
    
    try {
        const prev = parseFloat(calculatorState.previousInput);
        const current = parseFloat(calculatorState.currentInput);
        
        // Validar operandos
        if (isNaN(prev) || isNaN(current)) {
            throw new Error('Operandos inválidos');
        }
        
        // Ejecutar operación
        const operation = operations[calculatorState.currentOperation];
        if (!operation) {
            throw new Error('Operación inválida');
        }
        
        const result = operation(prev, current);
        
        // Validar resultado
        if (result === null || isNaN(result) || !isFinite(result)) {
            throw new Error('Resultado inválido');
        }
        
        // Formatear y guardar resultado
        const formattedResult = utils.formatNumber(result);
        calculatorState.currentInput = formattedResult;
        calculatorState.lastResult = result;
        calculatorState.previousInput = '';
        calculatorState.currentOperation = null;
        
        // Actualizar historial y display
        addToHistory(`${prev} ${calculatorState.currentOperation} ${current} = ${formattedResult}`);
        updateDisplay();
        
    } catch (error) {
        calculatorState.errorState = true;
        showTemporaryMessage('Error', 2000);
        clearCalculator();
    }
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
        if (calculatorState.errorState) {
            clearCalculator();
            return;
        }

        const num = parseFloat(calculatorState.currentInput);
        if (isNaN(num)) {
            showTemporaryMessage('Entrada inválida');
            return;
        }

        try {
            const operation = operations[button.dataset.function];
            if (!operation) {
                throw new Error('Función no implementada');
            }

            const result = operation(num);
            if (result === null || isNaN(result) || !isFinite(result)) {
                throw new Error('Resultado inválido');
            }

            const formattedResult = utils.formatNumber(result);
            calculatorState.currentInput = formattedResult;
            calculatorState.lastResult = result;
            
            addToHistory(`${button.textContent}(${num}) = ${formattedResult}`);
            updateDisplay();

        } catch (error) {
            calculatorState.errorState = true;
            showTemporaryMessage('Error');
            clearCalculator();
        }
    });
});

// Funciones de memoria
const memoryOperations = {
    add: () => {
        const value = parseFloat(calculatorState.currentInput || '0');
        if (!isNaN(value)) {
            calculatorState.memoryValue += value;
            localStorage.setItem('calculatorMemory', calculatorState.memoryValue);
            updateMemoryDisplay();
            calculatorState.shouldResetScreen = true;
        }
    },
    
    subtract: () => {
        const value = parseFloat(calculatorState.currentInput || '0');
        if (!isNaN(value)) {
            calculatorState.memoryValue -= value;
            localStorage.setItem('calculatorMemory', calculatorState.memoryValue);
            updateMemoryDisplay();
            calculatorState.shouldResetScreen = true;
        }
    },
    
    recall: () => {
        calculatorState.currentInput = calculatorState.memoryValue.toString();
        updateDisplay();
    },
    
    clear: () => {
        calculatorState.memoryValue = 0;
        localStorage.setItem('calculatorMemory', 0);
        updateMemoryDisplay();
    }
};

// Manejo del historial
function addToHistory(operation) {
    calculatorState.history.unshift(operation);
    if (calculatorState.history.length > 10) {
        calculatorState.history.pop();
    }
    
    localStorage.setItem('calculatorHistory', JSON.stringify(calculatorState.history));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (!elements.historyList) return;
    
    elements.historyList.innerHTML = '';
    if (calculatorState.history.length === 0) {
        elements.historyList.innerHTML = '<div class="history-empty">No hay cálculos recientes</div>';
        return;
    }
    
    calculatorState.history.forEach(operation => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = operation;
        
        // Permitir reusar resultados del historial
        historyItem.addEventListener('click', () => {
            const match = operation.match(/= ([-\d.]+)$/);
            if (match) {
                calculatorState.currentInput = match[1];
                updateDisplay();
            }
        });
        
        elements.historyList.appendChild(historyItem);
    });
    
    if (elements.displayHistory) {
        elements.displayHistory.scrollTop = elements.displayHistory.scrollHeight;
    }
}

// Actualizar display de memoria (compatibilidad con distintos bloques del script)
function updateMemoryDisplay() {
    const memEl = document.getElementById('memoryValue') || elements.memoryDisplay;
    const value = calculatorState.memoryValue ?? (typeof memoryValue !== 'undefined' ? memoryValue : 0);
    if (memEl) memEl.textContent = value;
}

// Modo científico
// Variables globales
let currentInput = '';
let previousInput = '';
let currentOperation = null;
let shouldResetScreen = false;
let memoryValue = parseFloat(localStorage.getItem('calculatorMemory')) || 0;
let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

// Inicialización de elementos DOM
const displayMain = document.getElementById('displayMain');
const displayHistory = document.getElementById('displayHistory');
const memoryDisplay = document.getElementById('memoryValue');
const historyList = document.getElementById('historyList');
const scientificPanel = document.getElementById('scientificPanel');

// Configuración de modos
const modeBtns = document.querySelectorAll('.mode-btn');
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

// Función para actualizar el display
function updateDisplay(value = currentInput) {
    displayMain.textContent = value || '0';
}

// Función para actualizar el historial visual
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No hay cálculos recientes</div>';
        return;
    }
    history.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.textContent = item;
        historyList.appendChild(historyItem);
    });
}

// Función para agregar al historial
function addToHistory(operation) {
    history.unshift(operation);
    if (history.length > 10) history.pop();
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

// Event listeners para números
document.querySelectorAll('[data-number]').forEach(button => {
    button.addEventListener('click', () => {
        if (shouldResetScreen) {
            currentInput = '';
            shouldResetScreen = false;
        }
        if (button.dataset.number === '.' && currentInput.includes('.')) return;
        currentInput += button.dataset.number;
        updateDisplay();
    });
});

// Event listeners para operadores
document.querySelectorAll('[data-operator]').forEach(button => {
    button.addEventListener('click', () => {
        if (currentInput === '') return;
        if (previousInput !== '') {
            calculate();
        }
        previousInput = currentInput;
        currentOperation = button.dataset.operator;
        shouldResetScreen = true;
        addToHistory(`${previousInput} ${button.textContent}`);
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
    addToHistory(`${prev} ${currentOperation} ${current} = ${result}`);
    previousInput = '';
    currentOperation = null;
    updateDisplay();
}

// Event listeners para funciones científicas
document.querySelectorAll('[data-function]').forEach(button => {
    button.addEventListener('click', () => {
        const num = parseFloat(currentInput);
        if (isNaN(num)) return;
        
        let result;
        switch(button.dataset.function) {
            case 'sin':
                result = Math.sin(num);
                break;
            case 'cos':
                result = Math.cos(num);
                break;
            case 'tan':
                result = Math.tan(num);
                break;
            case 'log':
                result = Math.log10(num);
                break;
            case 'ln':
                result = Math.log(num);
                break;
            case 'sqrt':
                result = Math.sqrt(num);
                break;
            case 'pow':
                result = Math.pow(num, 2);
                break;
            case 'pi':
                result = Math.PI;
                break;
        }
        
        currentInput = result.toString();
        addToHistory(`${button.textContent}(${num}) = ${result}`);
        updateDisplay();
    });
});

// Funciones de memoria
document.getElementById('memoryAddBtn').addEventListener('click', () => {
    memoryValue += parseFloat(currentInput || '0');
    memoryDisplay.textContent = memoryValue;
    localStorage.setItem('calculatorMemory', memoryValue);
    shouldResetScreen = true;
});

document.getElementById('memorySubtractBtn').addEventListener('click', () => {
    memoryValue -= parseFloat(currentInput || '0');
    memoryDisplay.textContent = memoryValue;
    localStorage.setItem('calculatorMemory', memoryValue);
    shouldResetScreen = true;
});

document.getElementById('memoryRecallBtn').addEventListener('click', () => {
    currentInput = memoryValue.toString();
    updateDisplay();
});

document.getElementById('memoryClearBtn').addEventListener('click', () => {
    memoryValue = 0;
    memoryDisplay.textContent = '0';
    localStorage.setItem('calculatorMemory', memoryValue);
});

// Funciones de control
function clearCalculator() {
    calculatorState.currentInput = '';
    calculatorState.previousInput = '';
    calculatorState.currentOperation = null;
    calculatorState.shouldResetScreen = false;
    calculatorState.errorState = false;
    calculatorState.lastResult = null;
    updateDisplay();
}

function deleteLastCharacter() {
    if (calculatorState.currentInput) {
        calculatorState.currentInput = calculatorState.currentInput.slice(0, -1);
        updateDisplay();
    }
}

function calculatePercentage() {
    if (calculatorState.currentInput === '') return;
    
    try {
        const value = parseFloat(calculatorState.currentInput);
        if (isNaN(value)) throw new Error('Entrada inválida');
        
        const result = operations['%'](value);
        if (result === null || isNaN(result)) throw new Error('Resultado inválido');
        
        calculatorState.currentInput = utils.formatNumber(result);
        calculatorState.lastResult = result;
        updateDisplay();
        addToHistory(`${value} % = ${calculatorState.currentInput}`);
        
    } catch (error) {
        showTemporaryMessage('Error');
    }
}

// Event Listeners para botones de control
document.getElementById('clearBtn')?.addEventListener('click', clearCalculator);
document.getElementById('deleteBtn')?.addEventListener('click', deleteLastCharacter);
document.getElementById('percentBtn')?.addEventListener('click', calculatePercentage);
document.getElementById('equalsBtn')?.addEventListener('click', calculate);

// Soporte para teclado
document.addEventListener('keydown', (event) => {
    // Prevenir comportamiento por defecto
    if (event.key === 'Enter') {
        event.preventDefault();
    }
    
    // Números y punto decimal
    if (/[\d.]/.test(event.key)) {
        const button = document.querySelector(`[data-number="${event.key}"]`);
        button?.click();
    }
    
    // Operadores
    const operatorMap = {
        '+': '+',
        '-': '-',
        '*': '*',
        '/': '/',
        'Enter': '=',
        'Escape': 'clear',
        'Backspace': 'delete',
        '%': '%'
    };
    
    if (event.key in operatorMap) {
        const key = operatorMap[event.key];
        if (key === '=') {
            document.getElementById('equalsBtn')?.click();
        } else if (key === 'clear') {
            document.getElementById('clearBtn')?.click();
        } else if (key === 'delete') {
            document.getElementById('deleteBtn')?.click();
        } else {
            const button = document.querySelector(`[data-operator="${key}"]`);
            button?.click();
        }
    }
});

// Funciones de navegación
document.getElementById('backBtn')?.addEventListener('click', () => {
    // Guardar estado antes de salir
    localStorage.setItem('calculatorMemory', calculatorState.memoryValue);
    localStorage.setItem('calculatorHistory', JSON.stringify(calculatorState.history));
    window.location.href = 'menu.html';
});

// Fórmulas rápidas
const formulas = {
    'area-square': {
        name: 'Área del cuadrado',
        template: 'lado × lado',
        calculate: (lado) => lado * lado,
        inputs: ['Lado']
    },
    'area-circle': {
        name: 'Área del círculo',
        template: 'π × radio²',
        calculate: (radio) => Math.PI * radio * radio,
        inputs: ['Radio']
    },
    'area-triangle': {
        name: 'Área del triángulo',
        template: '(base × altura) ÷ 2',
        calculate: (base, altura) => (base * altura) / 2,
        inputs: ['Base', 'Altura']
    },
    'pythagoras': {
        name: 'Teorema de Pitágoras',
        template: 'a² + b² = c²',
        calculate: (a, b) => Math.sqrt(a * a + b * b),
        inputs: ['Cateto a', 'Cateto b']
    }
};

// Event listeners para fórmulas rápidas
elements.formulaCards?.forEach(card => {
    card.addEventListener('click', () => {
        const formula = formulas[card.dataset.formula];
        if (!formula) return;
        
        // Mostrar modal para inputs
        showFormulaInputs(formula).then(inputs => {
            if (!inputs) return; // Usuario canceló
            
            try {
                const result = formula.calculate(...inputs);
                if (isNaN(result) || !isFinite(result)) {
                    throw new Error('Resultado inválido');
                }
                
                calculatorState.currentInput = utils.formatNumber(result);
                calculatorState.lastResult = result;
                
                // Crear string de operación para el historial
                const inputStr = inputs.join(', ');
                addToHistory(`${formula.name}(${inputStr}) = ${calculatorState.currentInput}`);
                updateDisplay();
                
            } catch (error) {
                showTemporaryMessage('Error en cálculo');
            }
        });
    });
});

function showFormulaInputs(formula) {
    return new Promise((resolve) => {
        // Crear modal
        const modal = document.createElement('div');
        modal.className = 'formula-modal';
        modal.innerHTML = `
            <div class="formula-modal-content">
                <h3>${formula.name}</h3>
                <p class="formula-template">${formula.template}</p>
                <div class="formula-inputs">
                    ${formula.inputs.map(input => `
                        <div class="input-group">
                            <label>${input}:</label>
                            <input type="number" step="any" placeholder="${input}">
                        </div>
                    `).join('')}
                </div>
                <div class="formula-buttons">
                    <button class="cancel-btn">Cancelar</button>
                    <button class="calculate-btn">Calcular</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Event listeners
        const inputs = modal.querySelectorAll('input');
        inputs[0]?.focus();
        
        modal.querySelector('.cancel-btn').addEventListener('click', () => {
            modal.remove();
            resolve(null);
        });
        
        modal.querySelector('.calculate-btn').addEventListener('click', () => {
            const values = Array.from(inputs).map(input => parseFloat(input.value));
            if (values.some(v => isNaN(v))) {
                showTemporaryMessage('Valores inválidos');
                return;
            }
            modal.remove();
            resolve(values);
        });
        
        // Permitir cerrar con Escape
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                resolve(null);
            }
            if (e.key === 'Enter') {
                modal.querySelector('.calculate-btn').click();
            }
        });
    });
}

// Inicialización
function initCalculator() {
    // Mostrar valores iniciales
    updateDisplay();
    updateHistoryDisplay();
    updateMemoryDisplay();
    
    // Configurar modo inicial
    if (elements.scientificPanel) {
        elements.scientificPanel.style.display = 
            calculatorState.mode === 'scientific' ? 'block' : 'none';
    }
    
    // Event listeners para memoria
    document.getElementById('memoryAddBtn')?.addEventListener('click', memoryOperations.add);
    document.getElementById('memorySubtractBtn')?.addEventListener('click', memoryOperations.subtract);
    document.getElementById('memoryRecallBtn')?.addEventListener('click', memoryOperations.recall);
    document.getElementById('memoryClearBtn')?.addEventListener('click', memoryOperations.clear);
}

// Iniciar calculadora cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initCalculator);

// Inicialización
updateHistoryDisplay();
memoryDisplay.textContent = memoryValue;
