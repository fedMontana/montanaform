
// fmdmye@gmail.com   -- MontaNismo2025  -- fedMontana

/* Variables GLOBALES */
let laFuncion = "";
let laSubFuncion = "";

let lasDisciplinas = "";
let asociacionSelec = "";
let clubSelec = "";

let base64Comprobante = null;
let imagenProcesadaOK = false;

let estadosDisponibles = [];
const estadosSet = new Set(estados); // convierte array a conjunto para comparación rápida
/* Fin de variables GLOBALES*/

// Al cargar la página, generamos las opciones de los selects
window.addEventListener('DOMContentLoaded', () => {
  fetchData();
  validarArchivoImagen("fileInput", "imagePreview");
  generarOpcionesSelect("genero", elGenero);
  generarOpcionesSelect("escolaridad", la_Escolaridad);
  //generarOpcionesSelect("estado", estados);
  generarCheckboxes();
  generarOpcionesSelect("tipoSangre", tipoSangre);
  generarOpcionesSelect("funcion", funcion);
  //   
  // console.log(estadosSet);
});

// Función para enviar una solicitud GET
async function fetchData() {
  try {
    const respuesta = await fetch(URL_ACTIVA0);
    if (!respuesta.ok) {
      throw new Error(`Error en la solicitud: ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    console.log("Datos recibidos:", datos);
    //console.log("Los datos recibidos: ", JSON.stringify(datos));
    mostrarToast("Datos recibidos.");
    llenarSelectAsociaciones(datos);
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

function llenarSelectAsociaciones(losDatos) {
  estadosDisponibles = estados;
  let selectAsociaciones = $("asociacion");
  selectAsociaciones.innerHTML = '<option value="">Seleccione una asociación</option>';
  for (let estado in losDatos) {
    let option = document.createElement("option");
    option.value = estado; // Usamos el nombre del estado como valor    
    if (estadosSet.has(estado)) {
      // Si está el estado de esta asociación en el array de estados
      // entonces lo removemos del array copia de estados.
      const indice = estadosDisponibles.indexOf(estado);
      estadosDisponibles.splice(indice, 1);
    }
    option.textContent = `${estado} - ${losDatos[estado].asociacion}`;
    selectAsociaciones.appendChild(option);
  }

  let selectClubes = $("clubes");
  //console.log("El resultado del filtro es: ", estadosDisponibles);
  // Escuchar cambios en el select de asociaciones
  selectAsociaciones.addEventListener("change", function () {
    const seleccion = $("asociacion").value.trim().split(" - ")[0]; // extrae el nombre del estado
    const direccionFieldset = $("direccionINE");
    const selectEstado = $("estado");
    //console.log("El estado de la asociación es: [", seleccion, "]");
    if (!seleccion) {      
      // Se tiene que borrar los campos de clubes      
      selectClubes.innerHTML = '<option value=""></option>';
      asociacionSelec = "";
      clubSelec = "";
      // Borrar los estados del select <estados>      
      selectEstado.disabled = false;
      selectEstado.innerHTML = '<option value=""></option>';
      //
      direccionFieldset.style.display = "none";
      return;
    }
    // Sí se ha seleccionado un estado válido, acá hay dos caminos:
    //  1) Que el estado sí tenga una asociación registrada.
    //  2) Que seleccione una asociación con un estado no especifico como UNAM, POLI 
    //     o sin asociación, entonces ahí se habilitarán en id="estado" los estados que
    //     no no tienen asociación.
    // Se hará visible el fieldset para dirección, pero antes limpiamos campos
    CLi('municipio');
    CLi('codigo_postal');
    direccionFieldset.style.display = "block";    
    asociacionSelec = losDatos[seleccion].asociacion;
    const dire = $('laDirec');    
    //console.log("Probando la aso->; ", losDatos[seleccion].asociacion);
    if (estadosSet.has(seleccion)) {
      // Corresponde a un estado, bloquear y fijar estado      
      selectEstado.innerHTML = `<option value="${seleccion}">${seleccion}</option>`;
      selectEstado.value = seleccion;
      selectEstado.disabled = true;
      dire.innerText = "Dirección INE " + seleccion;
      // De acuerdo al estado se filtran los clubes.
      llenarSelectClubes(losDatos, seleccion);
    } else {
      selectClubes.innerHTML = "";
      selectClubes.innerHTML = '<option value="Sin club">Sin club</option>';
      clubSelec = "Sin clubes";
      // Si NO corresponde a un estado, permitir seleccionar entre los estados faltantes
      //const estadosDisponibles = estados.filter(e => !$("asociacion").optionsNamed?.includes?.(e) && !seleccion.includes(e));
      selectEstado.disabled = false;
      dire.innerText = "Dirección de tu INE";
      generarOpcionesSelect("estado", estadosDisponibles);
    }
  });
}

// Función para llenar el select de clubes
function llenarSelectClubes(losDatos, estado) {
  //asociacionSelec = losDatos[estado].asociacion; // guardamos la Asociación
  //console.log("Asociación seleccionada: ", asociacionSelec);  
  let selectClubes = $("clubes");
  selectClubes.innerHTML = '<option value="">Seleccione un club</option>'; // Limpiar antes de llenar    
  if (estado && losDatos[estado]) {
    losDatos[estado].clubes.forEach(club => {
      let option = document.createElement("option");
      option.value = club;
      option.textContent = club;
      selectClubes.appendChild(option);
    });
  }
  // Acá escuchamos cuando el usuario seleccione un club
  selectClubes.addEventListener("change", function () {
    clubSelec = this.value;
    console.log("Club seleccionado: ", clubSelec);
  });

}

// Función para generar las opciones de un select a partir de un array
function generarOpcionesSelect(selectId, opciones) {
  const selectElement = $(selectId);
  selectElement.innerHTML = "";
  // Añadir una opción inicial vacía
  const opcionVacia = document.createElement("option");
  opcionVacia.value = "";
  opcionVacia.textContent = "Selecciona una opción";
  selectElement.appendChild(opcionVacia);

  // Generar las opciones
  opciones.forEach(opcion => {
    const optionElement = document.createElement("option");
    optionElement.value = opcion;
    optionElement.textContent = opcion;
    selectElement.appendChild(optionElement);
  });
}

// Función para generar los checkboxes para las Disciplinas
function generarCheckboxes() {
  const container = $('checkboxesContainer');
  disciplinas.forEach(actividad => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'actividad';
    checkbox.value = actividad;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + actividad));
    container.appendChild(label);
  });
}

document.getElementById('funcion').addEventListener('change', function () {
  const funcionSeleccionada = GV('funcion');
  laFuncion = funcionSeleccionada;
  const sub = $('subfuncion');
  sub.innerHTML = "";
  laSubFuncion = ""; // Limpiamos
  let prueba;
  switch (funcionSeleccionada) {
    case 'Personal técnico':
      prueba = funcion_personalTec;
      break;
    case 'Consejo directivo':
      prueba = funcion_consejo;
      break;
    case 'Servicio médico':
      prueba = funcion_serMed;
      break;
    default:
      document.getElementById('subfuncion').classList.remove('error');
      sub.disabled = true;
      return;
  }
  sub.disabled = false;
  generarOpcionesSelect("subfuncion", prueba);
  sub.classList.add('error');
});

function checaCampos(campo) {
  if (!campo.value.trim() || !campo.checkValidity()) {
    campo.classList.add('error');
    todosCompletos = false;
  }
}

function regresaDatosform() {
  let _enfermedades = GV('enfermedades');
  if (_enfermedades === "") {
    _enfermedades = "No registradas";
  }
  let _alergias = GV('alergias');
  if (_alergias === "") {
    _alergias = "No registradas";
  }
  const formData = {
    destino: "formulario",
    nombre: GV('nombre'),
    apellidoPaterno: GV('apellidoPaterno'),
    apellidoMaterno: GV('apellidoMaterno'),
    fechaNacimiento: GV('fechaNacimiento'),
    telefono: GV('numTelefono'),
    email: GV('email'),
    curp: GV('curp'),
    genero: GV('genero'),
    escolaridad: GV('escolaridad'),
    estado: GV('estado'),
    municipio: GV('municipio'),
    colonia: GV('colonia'),
    calleNumero: GV('calle_numero'),
    zip: GV('codigo_postal'),
    contactoEmergencia: GV('contanto_emergencia'),
    telefonoEmergencia: GV('telefono_emergencia'),
    enfermedades: _enfermedades,
    alergias: _alergias,
    tipoSangre: GV('tipoSangre'),
    asociacion: asociacionSelec,
    club: clubSelec,
    disciplina: lasDisciplinas,
    funcion: laFuncion,
    subfuncion: laSubFuncion,
    imagenBase64: base64Comprobante
  };
  // Convertir a JSON
  const jsonData = JSON.stringify(formData);
  console.log('Datos en formato JSON:', jsonData);
  return jsonData;
}

function enviarPost(jsonData) {
  //contentTypeHeader = 'application/json; charset=utf-8';  // parece que este no
  //contentTypeHeader = 'text/plain;charset=utf-8'; // este parece que sí
  //contentTypeHeader = 'application/json'; este no

  // Configurar el objeto de headers usando el tipo de contenido
  fetch(URL_ACTIVA0, {
    method: 'POST',
    body: jsonData,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      return response.json(); // Convertir la respuesta a JSON
    })
    .then(data => {
      console.log("Datos recibidos: ", data);
      // Filtrar y procesar la respuesta
      if (data.success) {
        console.log("Éxito:", data.message);
        let _bt = $('btn-enviar');
        _bt.textContent = "Registro recibido.";
        // Mostrar un mensaje al usuario        
        alert("Este es tu número de registro " + data.id + " enviado exitosamente.")
      } else {
        console.error("Error:", data.message);
        mostrarToast("Error: " + data.message); // Mostrar un mensaje de error al usuario
      }
    })
    .catch(error => {
      console.error('Error al enviar el correo:', error);
      mostrarToast("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.");
    });
}

// Función para verificar si todos los campos están completos
function verificarCampos() {
  console.log("Verificando campos");
  guardarDisciplina();
  // Limpiamos errores previos
  document.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error');
  });

  let todosCompletos = true;
  // 1) Validación de disciplinas
  if (lasDisciplinas === "") {
    // Resaltamos el fieldset
    //document.querySelector('fieldset').classList.add('error');
    $('lasDisciplinas').classList.add('error');
    todosCompletos = false;
  }
  const frm = $('registroForm');  // Obtener referencias al formulario y al botón de envío
  const requeridos = frm.querySelectorAll("[required]");

  requeridos.forEach(campo => {
    // Si es el teléfono, chequeamos 10 dígitos explícitamente
    if (campo.id === 'numTelefono' || campo.id === 'telefono_emergencia') {
      console.log("Revisando teléfonos....")
      const soloDigitos = campo.value.replace(/\D/g, '');
      if (!/^\d{10}$/.test(soloDigitos)) {
        campo.classList.add('error');
        todosCompletos = false;
      }
    }
    else if (campo.id === "clubes") {
      // Cuando se llegue a clubes se debe verificar la asociación
      const cAs = GV('asociacion');
      if (cAs !== "-") {
        // Si el valor seleccionado es diferente a "No asociación"
        // entonces sí se debe verificar el campo "clubes"
        if (!campo.value.trim() || !campo.checkValidity()) {
          campo.classList.add('error');
          todosCompletos = false;
        }
      }
    }
    else if (campo.id === "subfuncion") {
      // Al igual que clubes, está ligado estrechamente con otro control
      const fn = GV('funcion');
      if (fn === 'Personal técnico' || fn === 'Consejo directivo' || fn === 'Servicio médico') {
        // Si función tiene el valor de estos campos entonces sí es necesario que
        // en subfunción tenga un valor.
        if (!campo.value.trim() || !campo.checkValidity()) {
          campo.classList.add('error');
          todosCompletos = false;
        }
      }
    }
    // Si está vacío o inválido
    else if (!campo.value.trim() || !campo.checkValidity()) {
      campo.classList.add('error');
      todosCompletos = false;
      //alert("Por favor verifica los datos ingresados.");
    }
  });
  if (!todosCompletos) {
    if (!todosCompletos) {
      mostrarToast("Por favor verifica los datos ingresados (marcados en rojo).");
      return false;
    }
    if (!imagenProcesadaOK || !base64Comprobante) {
      console.log("Por favor selecciona una imagen válida para el evento o competencia antes de enviar.");
      mostrarToast("Por favor selecciona una imagen válida antes de enviar.");
      //resetearSeguro();
      return;
    }
  }
  return todosCompletos;
}

function guardarDisciplina() {
  const checkboxes = document.querySelectorAll('input[name="actividad"]:checked');
  const actividadesSeleccionadas = [];
  checkboxes.forEach(checkbox => {
    actividadesSeleccionadas.push(checkbox.value);
  });
  lasDisciplinas = actividadesSeleccionadas.join(', ');
  //console.log("Las disciplinas seleccionadas: ", lasDisciplinas);
}

// Para todos los inputs y selects
document.querySelectorAll('#registroForm input, #registroForm select').forEach(el => {
  //console.log("??????????????");
  el.addEventListener('input', () => {
    if (el.id === 'subfuncion') {
      laSubFuncion = el.value;
      console.log(laFuncion + " -> " + laSubFuncion);
    }
    el.classList.remove('error');
  });
});

// Para los checkboxes (disciplinas), al hacer clic quitamos el error del fieldset
document.querySelectorAll('input[type="checkbox"][name="actividad"]').forEach(cb => {
  console.log("!!!!!!!!!!!");
  cb.addEventListener('change', () => {
    document.querySelector('fieldset').classList.remove('error');
  });
});

function enviarFormulario() {
  const v1 = $('asociacion');
  const elValue = v1.value;
  const elTexto2 = v1.options[v1.selectedIndex].text;
  console.log("value: ", elValue);
  console.log("innerText: ", elTexto2);
  if (verificarCampos()) {
    console.log("Desactivamos el botón");
    let _bt = $('btn-enviar');
    _bt.textContent = "Espera unos segundos por favor...";
    _bt.disabled = true; // Deshabilitar el botón
    const jsonData = regresaDatosform();
    enviarPost(jsonData);
  } else {
    console.log("Datos incompletos");
  }
}
