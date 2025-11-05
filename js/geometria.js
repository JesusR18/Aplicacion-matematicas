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

// Geometría: inicialización segura
document.addEventListener('DOMContentLoaded', () => {
    // Variables globales
    let currentMode = 'draw';
    let selectedShape = null;
    let selectedColor = '#000000';
    let shapes = [];
    let undoStack = [];
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };

    // Canvas setup
    const canvas = document.getElementById('geometryCanvas');
    if (!canvas) return; // No estamos en la página de geometría
    const ctx = canvas.getContext('2d');

    // Configuración de formas
    const shapeConfigs = {
    triangle: {
        sides: 3,
        angles: '60°',
        getPerimeter: size => size * 3,
        getArea: size => (Math.sqrt(3) / 4) * size * size,
        formula: 'A = (b × h) / 2'
    },
    square: {
        sides: 4,
        angles: '90°',
        getPerimeter: size => size * 4,
        getArea: size => size * size,
        formula: 'A = l²'
    },
    rectangle: {
        sides: 4,
        angles: '90°',
        getPerimeter: (width, height) => 2 * (width + height),
        getArea: (width, height) => width * height,
        formula: 'A = b × h'
    },
    circle: {
        sides: 'infinito',
        angles: '360°',
        getPerimeter: radius => 2 * Math.PI * radius,
        getArea: radius => Math.PI * radius * radius,
        formula: 'A = πr²'
    },
    pentagon: {
        sides: 5,
        angles: '108°',
        getPerimeter: size => size * 5,
        getArea: size => (5 * size * size * Math.tan(Math.PI/5)) / 4,
        formula: 'A = (5 × s² × tan(36°)) / 4'
    },
    hexagon: {
        sides: 6,
        angles: '120°',
        getPerimeter: size => size * 6,
        getArea: size => ((3 * Math.sqrt(3)) / 2) * size * size,
        formula: 'A = (3√3 × s²) / 2'
    }
    };

    // Funciones de dibujo
    function drawShape(shape, position, size, rotation = 0, color = selectedColor) {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
        const borderWidthEl = document.getElementById('borderWidth');
        ctx.lineWidth = borderWidthEl ? parseInt(borderWidthEl.value) : 2;

    switch(shape) {
        case 'triangle':
            drawTriangle(size);
            break;
        case 'square':
            drawSquare(size);
            break;
        case 'rectangle':
            drawRectangle(size, size * 0.75);
            break;
        case 'circle':
            drawCircle(size);
            break;
        case 'pentagon':
            drawPolygon(5, size);
            break;
        case 'hexagon':
            drawPolygon(6, size);
            break;
    }

    ctx.stroke();
    ctx.fill();
    ctx.restore();
}

function drawTriangle(size) {
    ctx.moveTo(0, -size/2);
    ctx.lineTo(-size/2, size/2);
    ctx.lineTo(size/2, size/2);
    ctx.closePath();
}

function drawSquare(size) {
    ctx.rect(-size/2, -size/2, size, size);
}

function drawRectangle(width, height) {
    ctx.rect(-width/2, -height/2, width, height);
}

function drawCircle(radius) {
    ctx.arc(0, 0, radius/2, 0, Math.PI * 2);
}

function drawPolygon(sides, size) {
    const angle = (Math.PI * 2) / sides;
    ctx.moveTo(size/2, 0);
    for (let i = 1; i < sides; i++) {
        ctx.lineTo(
            Math.cos(angle * i) * size/2,
            Math.sin(angle * i) * size/2
        );
    }
    ctx.closePath();
}

    function drawGrid() {
        const gridToggle = document.getElementById('gridToggle');
        if (!gridToggle || !gridToggle.checked) return;
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        for (let x = 0; x <= canvas.width; x += 20) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= canvas.height; y += 20) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

// Funciones de manipulación de canvas
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
}

function updateInfo(shape, size) {
    if (!shapeConfigs[shape]) return;
    
    const config = shapeConfigs[shape];
    document.getElementById('selectedShape').textContent = shape;
    document.getElementById('formulaDisplay').textContent = config.formula;
    document.getElementById('sidesValue').textContent = config.sides;
    document.getElementById('anglesValue').textContent = config.angles;
    
    if (shape === 'circle') {
        document.getElementById('perimeterValue').textContent = 
            config.getPerimeter(size/2).toFixed(2);
        document.getElementById('areaValue').textContent = 
            config.getArea(size/2).toFixed(2);
    } else if (shape === 'rectangle') {
        document.getElementById('perimeterValue').textContent = 
            config.getPerimeter(size, size * 0.75).toFixed(2);
        document.getElementById('areaValue').textContent = 
            config.getArea(size, size * 0.75).toFixed(2);
    } else {
        document.getElementById('perimeterValue').textContent = 
            config.getPerimeter(size).toFixed(2);
        document.getElementById('areaValue').textContent = 
            config.getArea(size).toFixed(2);
    }
}

// Event Listeners
    canvas.addEventListener('mousedown', (e) => {
        if (currentMode !== 'draw' || !selectedShape) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        isDragging = true;
        dragStart = { x, y };
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        clearCanvas();
        shapes.forEach(s => drawShape(s.shape, s.position, s.size, s.rotation, s.color));
        const sizeEl = document.getElementById('sizeSlider');
        const rotationEl = document.getElementById('rotationSlider');
        const size = sizeEl ? parseInt(sizeEl.value) : 50;
        const rotation = rotationEl ? parseInt(rotationEl.value) : 0;
        drawShape(selectedShape, { x, y }, size, rotation);
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const sizeEl = document.getElementById('sizeSlider');
        const rotationEl = document.getElementById('rotationSlider');
        const size = sizeEl ? parseInt(sizeEl.value) : 50;
        const rotation = rotationEl ? parseInt(rotationEl.value) : 0;
        shapes.push({
            shape: selectedShape,
            position: { x, y },
            size: size,
            rotation: rotation,
            color: selectedColor
        });
        updateInfo(selectedShape, size);
        isDragging = false;
    });

// Event Listeners para los controles
    document.querySelectorAll('[data-shape]').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedShape = btn.dataset.shape;
            document.querySelectorAll('[data-shape]').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const sizeEl = document.getElementById('sizeSlider');
            const size = sizeEl ? parseInt(sizeEl.value) : 50;
            updateInfo(selectedShape, size);
        });
    });

    document.querySelectorAll('[data-color]').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedColor = btn.dataset.color;
            document.querySelectorAll('[data-color]').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    document.getElementById('clearBtn')?.addEventListener('click', () => {
        undoStack.push([...shapes]);
        shapes = [];
        clearCanvas();
    });

    document.getElementById('undoBtn')?.addEventListener('click', () => {
        if (undoStack.length > 0) {
            shapes = undoStack.pop();
            clearCanvas();
            shapes.forEach(s => drawShape(s.shape, s.position, s.size, s.rotation, s.color));
        }
    });

    document.getElementById('saveBtn')?.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'mi-dibujo-geometrico.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    document.getElementById('gridToggle')?.addEventListener('change', () => {
        clearCanvas();
        shapes.forEach(s => drawShape(s.shape, s.position, s.size, s.rotation, s.color));
    });

// Modos de juego
    document.querySelectorAll('[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            document.querySelectorAll('[data-mode]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            switch (currentMode) {
                case 'draw':
                    break;
                case 'learn':
                    if (typeof startLearningMode === 'function') startLearningMode();
                    break;
                case 'quiz':
                    if (typeof startQuizMode === 'function') startQuizMode();
                    break;
            }
        });
    });

    // Inicialización
    clearCanvas();
});
