// Redirección a login si no está logueado
if (!localStorage.getItem('loggedUser')) {
	if (!window.location.pathname.endsWith('login.html')) {
		window.location.href = 'login.html';
	}
}
// Menú clásico: solo navegación básica
function openActivity(activityName) {
	switch (activityName) {
		case 'fracciones': window.location.href = 'fracciones.html'; break;
		case 'geometria': window.location.href = 'geometria.html'; break;
		case 'calculadora': window.location.href = 'calculadora.html'; break;
		case 'tablas': window.location.href = 'tablas.html'; break;
		case 'operaciones': window.location.href = 'operaciones.html'; break;
		default: alert('Actividad no encontrada');
	}
}
