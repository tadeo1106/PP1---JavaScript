const API_URL = 'http://127.0.0.1:8000/turnos';
const contenedor = document.getElementById('contenedor-turnos');


async function cargarTurnos() {
    try {
        const turnos = await busquedaApi(API_URL)
        
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
        console.error("Error al conectar con la API:", error);
        contenedor.innerHTML = '<p class="text-center font-mono text-red-800 mt-4">Error de conexión.</p>';
    }
}




function crearTarjetaTurno(turno) {
    return `
        <div class="bg-white p-3 rounded shadow-sm border border-slate-200 mb-2 last:mb-0">
            <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-slate-800 text-lg">${turno.horario}</span>
                <span class="text-xs bg-slate-800 text-white px-2 py-0.5 rounded">ID: ${turno.id}</span>
            </div>
            <p class="text-sm text-slate-600"><strong>DNI:</strong> <span class="capitalize">${turno.documento}</span></p>
            <p class="text-sm text-slate-600"><strong>Cliente:</strong> <span class="capitalize">${turno.cliente}</span></p>
            <p class="text-sm text-slate-600"><strong>Servicio:</strong> <span class="capitalize">${turno.servicio.join(', ')}</span></p>
            <div class="mt-3 flex gap-2">
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


cargarTurnos()


const formulario = document.getElementById('form-nuevo-turno');

formulario.addEventListener('submit', async (evento) => {

    evento.preventDefault();


    const checkboxes = document.querySelectorAll('input[name="servicio"]:checked');
    const serviciosSeleccionados = Array.from(checkboxes).map(checkbox => checkbox.value);


    if (serviciosSeleccionados.length === 0) {
        alert("Por favor, selecciona al menos un servicio.");
        return;
    }

    const nuevoTurno = {
        documento:document.getElementById(`input-dni`).value,
        cliente: document.getElementById('input-cliente').value,
        dia: document.getElementById('input-dia').value,
        horario: document.getElementById('input-horario').value,
        servicio: serviciosSeleccionados
    };

    try {
        const respuesta = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoTurno)
        });

        if (respuesta.ok) {

            formulario.reset();
            
            cargarTurnos();
        } else {

            const error = await respuesta.json();
            console.error("Error del servidor:", error);
            alert("No se pudo guardar el turno. Revisa la consola.");
        }

    } catch (error) {
        console.error("Error al hacer el POST:", error);
    }
});



async function eliminarTurno(id) {
    if (!confirm("¿Estás seguro de eliminar este turno?")) return;
        try{
            const respuesta = await fetch(`${API_URL}/${id}`,{
                method:`DELETE`
            })
        if(respuesta.ok){
            cargarTurnos();
        }
        else{
            alert(`error al elimnar el turno`);
        }
        } catch(error){
            console.error("Error",error);
        }
    }


function buscar() {

    const input = document.getElementById('input-buscar-id').value;

    if (!input) {
        cargarTurnos();
        return;
    }
    else 
        { 
        if (input.length>=6){
            buscarByDni(input)
            }
        else{buscarById(input)}
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
                `
                }



async function buscarById(id) {
    try {

        const turno = await busquedaApi(`${API_URL}/id/${id}`);
        contenedor.innerHTML = '';
        
        if (turno) {
            crearContenidoBusqueda(turno)
        }
        else {
            contenedor.innerHTML =`
                <p class="text-center font-mono text-red-800 bg-red-200 p-2 rounded">
                    No existe ningún turno con el ID ${id}.
                </p>
            `; }
        }
        catch(error){
            console.log("Error al buscar por ID:", error)
        }
    }


async function buscarByDni(dni) {
    try{
        const turno = await busquedaApi(`${API_URL}/dni/${dni}`);

        contenedor.innerHTML=``;

        if(turno){

            crearContenidoBusqueda(turno);
        }
        else{
            contenedor.innerHTML =`
                <p class="text-center font-mono text-red-800 bg-red-200 p-2 rounded">
                    No existe ningún turno con el DNI: ${dni}.
                </p>
            `; }
        }catch(error){
            console.log("Error al buscar por DNI:", error);
        }
    }



async function busquedaApi(url) {
    try{
        const resultado = await fetch(url);
        if(resultado.ok){
            const turno = await resultado.json();

            return turno;
            }
        }
    catch(error){
        console.log("error en la api",error);
        return null;
        }
    }

