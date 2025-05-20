let laFuncion = "";
let laSubFuncion = "";

let lasDisciplinas = "";
let asociacionSelec = "";
let clubSelec = "";

let base64Comprobante = null;
let imagenProcesadaOK = false;

let estadosDisponibles = [];
const estadosSet = new Set(estados); // convierte array a conjunto para comparación rápida

window.addEventListener('DOMContentLoaded', () => {
  fetchData();
  validarArchivoImagen("fileInput", "imagePreview");
  generarOpcionesSelect("genero", elGenero);
  generarOpcionesSelect("escolaridad", la_Escolaridad);

  generarCheckboxes();
  generarOpcionesSelect("tipoSangre", tipoSangre);
  generarOpcionesSelect("funcion", funcion);

});


async function fetchData() {
  try {
    const respuesta = await fetch(URL_ACTIVA0);
    if (!respuesta.ok) {
      throw new Error(`Error en la solicitud: ${respuesta.status}`);
    }
    const datos = await respuesta.json();
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

      const indice = estadosDisponibles.indexOf(estado);
      estadosDisponibles.splice(indice, 1);
    }
    option.textContent = `${estado} - ${losDatos[estado].asociacion}`;
    selectAsociaciones.appendChild(option);
  }

  let selectClubes = $("clubes");
 
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
 
    CLi('municipio');
    CLi('codigo_postal');
    direccionFieldset.style.display = "block";    
    asociacionSelec = losDatos[seleccion].asociacion;
    const dire = $('laDirec');    
  
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
      selectEstado.disabled = false;
      dire.innerText = "Dirección de tu INE";
      generarOpcionesSelect("estado", estadosDisponibles);
    }
  });
}

function llenarSelectClubes(losDatos, estado) {
  
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
  
  selectClubes.addEventListener("change", function () {
    clubSelec = this.value;
    console.log("Club seleccionado: ", clubSelec);
  });

}

// Función para generar las opciones de un select a partir de un array
function generarOpcionesSelect(selectId, opciones) {
  const selectElement = $(selectId);
  selectElement.innerHTML = "";
  
  const opcionVacia = document.createElement("option");
  opcionVacia.value = "";
  opcionVacia.textContent = "Selecciona una opción";
  selectElement.appendChild(opcionVacia);
  
  opciones.forEach(opcion => {
    const optionElement = document.createElement("option");
    optionElement.value = opcion;
    optionElement.textContent = opcion;
    selectElement.appendChild(optionElement);
  });
}

function generarCheckboxes() {
  const container = $('checkboxesContainer');
  disciplinasArray.forEach(actividad => {
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
  fetch(URL_ACTIVA0, {
    method: 'POST',
    body: jsonData,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos recibidos: ", data);

      if (data.success) {
        console.log("Éxito:", data.message);
        let _bt = $('btn-enviar');
        _bt.textContent = "Registro recibido.";

        alert("Este es tu número de registro " + data.id + " enviado exitosamente.")
      } else {
        console.error("Error:", data.message);
        mostrarToast("Error: " + data.message);
      }
    })
    .catch(error => {
      console.error('Error al enviar el correo:', error);
      mostrarToast("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.");
    });
}

function verificarCampos() {
  console.log("Verificando campos");
  guardarDisciplina();

  document.querySelectorAll('.error').forEach(el => {
    el.classList.remove('error');
  });

  let todosCompletos = true;
  
  if (lasDisciplinas === "") {
  
    $('lasDisciplinas').classList.add('error');
    todosCompletos = false;
  }
  const frm = $('registroForm');
  const requeridos = frm.querySelectorAll("[required]");

  requeridos.forEach(campo => {
    
    if (campo.id === 'numTelefono' || campo.id === 'telefono_emergencia') {
      console.log("Revisando teléfonos....")
      const soloDigitos = campo.value.replace(/\D/g, '');
      if (!/^\d{10}$/.test(soloDigitos)) {
        campo.classList.add('error');
        todosCompletos = false;
      }
    }
    else if (campo.id === "clubes") {
    
      const cAs = GV('asociacion');
      if (cAs !== "-") {
    
        if (!campo.value.trim() || !campo.checkValidity()) {
          campo.classList.add('error');
          todosCompletos = false;
        }
      }
    }
    else if (campo.id === "subfuncion") {
    
      const fn = GV('funcion');
      if (fn === 'Personal técnico' || fn === 'Consejo directivo' || fn === 'Servicio médico') {
      
        if (!campo.value.trim() || !campo.checkValidity()) {
          campo.classList.add('error');
          todosCompletos = false;
        }
      }
    }
    
    else if (!campo.value.trim() || !campo.checkValidity()) {
      campo.classList.add('error');
      todosCompletos = false;
    
    }
  });
  if (!todosCompletos) {
    if (!todosCompletos) {
      mostrarToast("Por favor verifica los datos ingresados (marcados en rojo).");
      return false;
    }
    if (!imagenProcesadaOK || !base64Comprobante) {
      
      mostrarToast("Por favor selecciona una imagen válida antes de enviar.");
    
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
  
}

document.querySelectorAll('#registroForm input, #registroForm select').forEach(el => {

  el.addEventListener('input', () => {
    if (el.id === 'subfuncion') {
      laSubFuncion = el.value;
      console.log(laFuncion + " -> " + laSubFuncion);
    }
    el.classList.remove('error');
  });
});


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
