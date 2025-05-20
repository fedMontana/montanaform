"use strict";

let initialData = {};
let objCambios = {};

var idUsuario = "";
let idUsuarioEliminado = "";

let token = "";

let base64Comprobante = null;
let imagenProcesadaOK = false;

const bAsociados = $("btnAsociados");
const bClubes = $("btnClubes");
const bEventos = $("btnEventos");
const bCompetencias = $("btnCompetencia");

const lbAsociados = $('indicadorAsociados');

let asociados;
let eventos;
let losClubes;
let laAsociacion = [];
let elToken = "";
let elCorreo = "";
let elEstado = "";
let nombreAsociacion;
let competencias;

let laSecci0nPrevia = "";

window.addEventListener('DOMContentLoaded', () => {  
  asociados = JSON.parse(sessionStorage.getItem('asociados'));
  eventos = JSON.parse(sessionStorage.getItem('losEventos'));
  competencias = JSON.parse(sessionStorage.getItem('lasCompetencias'));

  losClubes = JSON.parse(sessionStorage.getItem('listaClubes'));
  laAsociacion[0] = JSON.parse(sessionStorage.getItem('listaClubes'));
  elToken = JSON.parse(sessionStorage.getItem('sessionToken'));
  elCorreo = sessionStorage.getItem('elCorreo');
  elEstado = sessionStorage.getItem('elEstado');
  nombreAsociacion = sessionStorage.getItem('laAsociacion');

  elEstado = elEstado.replace(/^"|"$/g, '');
  elCorreo = elCorreo.replace(/^"|"$/g, '');
  
  inicializarValoresAsociados();

  document.getElementById("fotoInput").value = "";
  //   
  inicializarEventos();
  inicializarCompetencias();
  inicializarClubes();
  //
  _validarArchivoImagen("fotoInput", "previewImgAsociado");
});

function _validarArchivoImagen(inputID, previewID) {
  const input = document.getElementById(inputID);
  const preview = document.getElementById(previewID);

  input.addEventListener("change", async e => {
    console.log("Procesando imagen....");
    const archivo = e.target.files[0];
    base64Comprobante = null;
    imagenProcesadaOK = false;

    if (!archivo) return;

    if (archivo.type === "image/bmp") {
      mostrarToast("Formato .bmp no permitido. Usa JPG o PNG");
      input.value = ""; // limpia el campo
      return;
    }

    try {
      base64Comprobante = await convertirArchivoABase64(archivo);
      imagenProcesadaOK = true;
      preview.innerHTML = "";
      
      const contenedor = $('previewImgAsociado');
      const anterior = contenedor.querySelector("iframe");
      if (anterior) contenedor.removeChild(anterior);

      const img = document.createElement("img");
      img.src = URL.createObjectURL(archivo);
      img.width = "150";
      img.height = "150";
      img.style.border = "none";
      preview.appendChild(img);
    } catch (err) {
      console.log("No se pudo procesar la imagen...");
      mostrarToast("No se pudo procesar la imagen seleccionada.");
    }
  });
}

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

function showContent(sectionId) {
  const clk = $(sectionId);  
  if (!clk.matches('.active')) {    
    switch (laSecci0nPrevia) {
      case 'usuarios':
        if (posiblesCambiosSeccionAso()) {
          console.log("Seguir en la sección 'usuarios'.");
          return;
        }
        break;
    }    
    laSecci0nPrevia = sectionId;    
    document.querySelectorAll(".content").forEach(section => {
      section.classList.remove("active");
    });    
    document.getElementById(sectionId).classList.add("active");
  } else {    
    console.log("El usuario presionó el botón de la sección actual.");
  }
}

function enviarDatos(jsonData) {

  fetch(URL_ACTIVA,
    {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: jsonData
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      return response.json();
    })
    .then(data => {
      console.log("Datos recibidos: ", data);
    })
    .catch(error => {
      console.error('Error al enviar el correo:', error);
      alert("Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.");
    });
}

async function enviarPOST(jsonData) {
  try {
    const response = await fetch(URL_ACTIVA, {
      method: 'POST',
      body: jsonData,
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    });
    const result = await response.json();
    console.log(JSON.stringify(result));
    if (!result.success) {
      console.log("Respuesta de error recibida del servidor: ", result.message);
      alert(result.message);
    } 
    // 
    return result;
  } catch (error) {
    console.log("Error en la conexión al servidor...");
    console.error('Error:', error);
  }
}

function leeCheckBoxes(nombreGrupo) {
  return Array.from(document.querySelectorAll(`input[name="${nombreGrupo}"]:checked`))
    .map(checkbox => checkbox.value)
    .join(', ');
}

function comparaArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  // Ordenamos y comparamos
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((val, index) => val === sorted2[index]);
}

function creaObjetoVacio(fieldMapping) {
  let objVacio = {};
  Object.entries(fieldMapping).forEach(([fieldId, config]) => {
    objVacio[config] = "";
  });
  return objVacio;
}

function camposHtmlAObjeto(fieldMapping) {
  const datos = {};  

  Object.entries(fieldMapping).forEach(([idCampo, nombreHeader]) => {    
    const valor = document.getElementById(idCampo)?.value || "";
    datos[nombreHeader] = valor;
  });  
  datos["Usuario Organizador"] = elCorreo;
  datos["Asociación Organizador"] = nombreAsociacion;

  return datos;
}

function eliminarEventoCompe(arrayTarget) {
  const keys = Object.keys(arrayTarget[0]);
  let claveNombre = null;

  if (keys.includes("Nombre del evento")) {
    claveNombre = "Nombre del evento";
  } else if (keys.includes("Nombre competencia")) {
    claveNombre = "Nombre competencia";
  } else {
    console.log("No se encontró una clave válida");
    return;
  }

  const arrayActualizado = arrayTarget.filter(loBuscado => loBuscado[claveNombre] !== nombreOriginal);
  arrayTarget.length = 0;  // Se vacía el array original
  arrayTarget.push(...arrayActualizado); // Se rellena con el nuevo contenido
  console.log("Se ha eliminado el array satisfactoriamente.");
}

function cargaDatosSelectEV(arrayTarget) {
  let valSelect = [];
  const keys = Object.keys(arrayTarget[0]);
  let claveNombre = "Nombre competencia";
  valSelect[0] = "Nueva competencia"; // presuponemos
  let idControl = "competenciasSelect";
  if (keys.includes("Nombre del evento")) {
    claveNombre = "Nombre del evento";
    valSelect[0] = "Nuevo evento";
    idControl = "eventosSelect";
  }
  // Empieza el relleno del <select>
  arrayTarget.forEach(nombre => {
    valSelect.push(nombre[claveNombre]);
  });
  generarOpcionesSelect(idControl, valSelect);
}
