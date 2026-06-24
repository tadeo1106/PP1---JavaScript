const API_URL = 'http://127.0.0.1:8081/turnos';
const contenedor = document.getElementById('contenedor-turnos');
const btnBuscar = document.getElementById('buscador-btn');
const btnVerTodos = document.getElementById('ver-todos-btn');
const formulario = document.getElementById('form-nuevo-turno');
const btnDestacados = document.getElementById('btn-destacados');

let turnosEnMemoria = []; 
let turnoEditandoId = null; 

async function cargarTurnos() {
    try {
        const turnos = await busquedaApi(API_URL);
        turnosEnMemoria = turnos; 

        const turnosPorDia = {};
        turnos.forEach(turno => {
            if (!turnosPorDia[turno.dia]) turnosPorDia[turno.dia] = [];
            turnosPorDia[turno.dia].push(turno);
        });

        contenedor.innerHTML = '';

        for (const dia in turnosPorDia) {
            const listaDeTurnos = turnosPorDia[dia];
            let tarjetasHTML = '';
            listaDeTurnos.forEach(turno => {
                tarjetasHTML += crearTarjetaTurno(turno);
            });
            const diaAcordeon = crearAcordeonDia(dia, tarjetasHTML, listaDeTurnos.length);
            contenedor.innerHTML += diaAcordeon;
        }
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<p class="text-center font-mono text-red-800 mt-4">Error de conexión.</p>';
    }
}

function crearTarjetaTurno(turno) {
    const favoritos = obtenerFavoritos();
    const esFavorito = favoritos.includes(turno.id);
    const textoFavorito = esFavorito ? 'Quitar Destacado ⭐' : 'Destacar ☆';
    const colorFavorito = esFavorito ? 'bg-yellow-500 hover:bg-yellow-600 text-yellow-900' : 'bg-slate-300 hover:bg-slate-400 text-slate-700';

    return `
        <div class="bg-white p-3 rounded shadow-sm border border-slate-200 mb-2 last:mb-0">
            <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-slate-800 text-lg">${turno.horario}</span>
                <span class="text-xs bg-slate-800 text-white px-2 py-0.5 rounded">ID: ${turno.id}</span>
            </div>
            <p class="text-sm text-slate-600"><strong>DNI:</strong> <span class="capitalize">${turno.documento}</span></p>
            <p class="text-sm text-slate-600"><strong>Cliente:</strong> <span class="capitalize">${turno.cliente}</span></p>
            <p class="text-sm text-slate-600"><strong>Servicio:</strong> <span class="capitalize">${turno.servicio.join(', ')}</span></p>
            
            <button onclick="toggleFavorito(${turno.id})" class="mt-2 w-full text-xs font-bold py-1 px-2 rounded transition-colors ${colorFavorito}">
                ${textoFavorito}
            </button>

            <div class="mt-2 flex gap-2">
                <button onclick="prepararEdicion(${turno.id})" class="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded transition-colors">
                    Editar
                </button>   
                <button onclick="eliminarTurno(${turno.id})" class="w-full text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-2 rounded transition-colors">
                    Eliminar
                </button>
            </div>
        </div>        
    `;
}

function crearAcordeonDia(dia, tarjetasHTML, cantidad) {
    return `
        <details class="group bg-slate-300 rounded shadow-sm mb-3">
            <summary class="font-mono p-4 cursor-pointer flex justify-between items-center hover:bg-slate-200 transition-colors list-none">
                <span class="font-bold uppercase text-lg">${dia}</span>
                <span class="text-xs font-bold bg-slate-500 text-white px-2 py-1 rounded-full">
                    ${cantidad} turno(s)
                </span>
            </summary>
            <div class="p-3 bg-slate-100 border-t border-slate-400 font-mono space-y-2">
                ${tarjetasHTML}
            </div>
        </details>
    `;
}

async function eliminarTurno(id) {
    if (!confirm("¿Estás seguro de eliminar este turno?")) return;
    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (respuesta.ok) {
            cargarTurnos();
        } else {
            alert('Error al eliminar el turno');
        }
    } catch (error) {
        console.error(error);
    }
}

function buscar() {
    const input = document.getElementById('input-buscar').value;
    if (!input) {
        cargarTurnos();
        return;
    } else { 
        if (input.length >= 6) {
            buscarByDni(input);
        } else {
            buscarById(input);
        }
    }
}

function limpiarBuscador() {
    document.getElementById('input-buscar-id').value = '';
    cargarTurnos();
}

function crearContenidoBusqueda(turno) {
    contenedor.innerHTML = `
        <div class="mb-2 text-center">
            <span class="text-xs font-bold text-slate-800 bg-slate-300 px-2 py-1 rounded">
                RESULTADO DE BÚSQUEDA
            </span>
        </div>
        ${crearTarjetaTurno(turno)}
    `;
}

async function buscarById(id) {
    try {
        const turno = await busquedaApi(`${API_URL}/id/${id}`);
        contenedor.innerHTML = '';
        if (turno) {
            crearContenidoBusqueda(turno);
        } else {
            contenedor.innerHTML = `
                <p class="text-center font-mono text-red-800 bg-red-200 p-2 rounded">
                    No existe ningún turno con el ID ${id}.
                </p>
            `; 
        }
    } catch (error) {
        console.error(error);
    }
}

async function buscarByDni(dni) {
    try {
        const turno = await busquedaApi(`${API_URL}/dni/${dni}`);
        contenedor.innerHTML = '';
        if (turno) {
            crearContenidoBusqueda(turno);
        } else {
            contenedor.innerHTML = `
                <p class="text-center font-mono text-red-800 bg-red-200 p-2 rounded">
                    No existe ningún turno con el DNI: ${dni}.
                </p>
            `; 
        }
    } catch (error) {
        console.error(error);
    }
}

async function busquedaApi(url) {
    try {
        const resultado = await fetch(url);
        if (resultado.ok) {
            return await resultado.json();
        }
        return null;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function prepararEdicion(id) {
    const turnoAEditar = turnosEnMemoria.find(turno => turno.id === id);
    if (!turnoAEditar) return;

    turnoEditandoId = id;
    llenarFormulario(turnoAEditar);

    document.getElementById('titulo-form').textContent = 'EDITAR TURNO';
    document.getElementById('contenedor-form').classList.replace('bg-white', 'bg-yellow-200');
    
    document.getElementById('botones-form').innerHTML = `
        <button type="submit" class="w-1/2 bg-slate-800 text-white font-bold py-2 rounded hover:bg-slate-700 transition-colors">  
            CONFIRMAR 
        </button>
        <button type="button" onclick="cancelarEdicion()" class="w-1/2 bg-red-800 text-white font-bold py-2 rounded hover:bg-red-700 transition-colors">  
            CANCELAR 
        </button>
    `;
}

function cancelarEdicion() {
    turnoEditandoId = null;
    formulario.reset(); 

    document.getElementById('titulo-form').textContent = 'NUEVO TURNO'; 
    document.getElementById('contenedor-form').classList.replace('bg-yellow-200', 'bg-white');
    
    document.getElementById('botones-form').innerHTML = `
        <button type="submit" class="w-full bg-slate-800 text-white font-bold py-2 rounded hover:bg-slate-700 transition-colors">
            GUARDAR TURNO
        </button>
    `;
}

function llenarFormulario(turno) {
    document.getElementById('input-dni').value = turno.documento;
    document.getElementById('input-cliente').value = turno.cliente;
    document.getElementById('input-dia').value = turno.dia;
    document.getElementById('input-horario').value = turno.horario;

    const checkboxes = document.querySelectorAll('input[name="servicio"]');
    checkboxes.forEach(cb => {
        cb.checked = turno.servicio.includes(cb.value); 
    });
}

function obtenerDatosFormulario() {
    const checkboxes = document.querySelectorAll('input[name="servicio"]:checked');
    const serviciosSeleccionados = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (serviciosSeleccionados.length === 0) {
        alert("Por favor, selecciona al menos un servicio.");
        return null; 
    }

    return {
        documento: document.getElementById('input-dni').value,
        cliente: document.getElementById('input-cliente').value,
        dia: document.getElementById('input-dia').value,
        horario: document.getElementById('input-horario').value,
        servicio: serviciosSeleccionados
    };
}

async function guardarNuevoTurno(datosTurno) {
    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTurno)
        });

        if (respuesta.ok) {
            formulario.reset();
            cargarTurnos();
        } else {
            alert("No se pudo guardar el turno.");
        }
    } catch (error) {
        console.error(error);
    }
}

async function actualizarTurnoEnApi(id, datosTurno) {
    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosTurno)
        });

        if (respuesta.ok) {
            cancelarEdicion(); 
            cargarTurnos();    
        } else {
            alert("Error al actualizar el turno.");
        }
    } catch (error) {
        console.error(error);
    }
}

function obtenerFavoritos() {
    const guardados = localStorage.getItem('turnosFavoritos');
    return guardados ? JSON.parse(guardados) : [];
}

function toggleFavorito(id) {
    let favoritos = obtenerFavoritos();
    const index = favoritos.indexOf(id);

    if (index === -1) {
        favoritos.push(id);
    } else {
        favoritos.splice(index, 1);
    }

    localStorage.setItem('turnosFavoritos', JSON.stringify(favoritos));
    cargarTurnos(); 
}

function mostrarFavoritos() {
    const favoritos = obtenerFavoritos();
    contenedor.innerHTML = ''; 

    if (favoritos.length === 0) {
        contenedor.innerHTML = '<p class="text-center font-mono text-slate-600 mt-4 bg-slate-200 p-2 rounded">No tienes turnos destacados.</p>';
        return;
    }

    const turnosDestacados = turnosEnMemoria.filter(turno => favoritos.includes(turno.id));

    contenedor.innerHTML = `
        <div class="mb-3 text-center">
            <span class="text-xs font-bold text-yellow-900 bg-yellow-400 px-3 py-1 rounded shadow-sm">
                ⭐ TURNOS DESTACADOS
            </span>
        </div>
    `;

    turnosDestacados.forEach(turno => {
        contenedor.innerHTML += crearTarjetaTurno(turno);
    });
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const datosTurno = obtenerDatosFormulario();
    if (!datosTurno) return; 

    if (turnoEditandoId) {
        await actualizarTurnoEnApi(turnoEditandoId, datosTurno);
    } else {
        await guardarNuevoTurno(datosTurno);
    }
});

btnBuscar.addEventListener('click', buscar);
btnVerTodos.addEventListener('click', cargarTurnos);

btnDestacados.addEventListener('click', mostrarFavoritos);

cargarTurnos();