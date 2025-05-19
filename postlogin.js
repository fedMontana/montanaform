
"use strict";
/* Variables globales */
let initialData = {}; // Almacena los datos originales, para asociados, eventos y competencias
let objCambios = {};   // Objeto para rastrear cambios

var idUsuario = "";
let idUsuarioEliminado = "";

let token = "";
//let nuevoEvento = {};

// La estructura de los datos recibidos cuenta con dos listas
// Para asociados y para eventos. El evento tiene un subgrupo que incluye
//  celular, correo y página web

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


// Al cargar la página, generamos las opciones de los selects
window.addEventListener('DOMContentLoaded', () => {
  // Convierte el string a objeto para ser procesado
  asociados = JSON.parse(sessionStorage.getItem('asociados'));
  eventos = JSON.parse(sessionStorage.getItem('losEventos'));
  competencias = JSON.parse(sessionStorage.getItem('lasCompetencias'));

  losClubes = JSON.parse(sessionStorage.getItem('listaClubes'));
  laAsociacion[0] = JSON.parse(sessionStorage.getItem('listaClubes'));
  elToken = JSON.parse(sessionStorage.getItem('sessionToken'));
  elCorreo = sessionStorage.getItem('elCorreo');
  elEstado = sessionStorage.getItem('elEstado');
  nombreAsociacion = sessionStorage.getItem('laAsociacion');
  
  //  

  console.log("Asociados recibidos: ", asociados);
  // console.log("Número de asociados recibidos: ", asociados.length);
  console.log("Clubes de la asociación: ", losClubes);
  elEstado = elEstado.replace(/^"|"$/g, '');
  elCorreo = elCorreo.replace(/^"|"$/g, '');
  console.log("El estado es: ", elEstado);
  console.log("La asociación: ", nombreAsociacion);
  //console.log("El token de sesión es: ", elToken);
  //console.log("El correo es: ", elCorreo);  
  //console.log("El número de elementos en el mapa es: ", Object.keys(fieldMapping).length);
  console.log("Los eventos: ", eventos);
  console.log("Las competencias", competencias);
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
      // Eliminar iframe de la imagen previa de Drive si existe
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

// Función para generar las opciones de un select a partir de un array
function generarOpcionesSelect(selectId, opciones) {
  const selectElement = $(selectId);
  selectElement.innerHTML = "";
  // Añadir una opción inicial vacía
  const opcionVacia = document.createElement("option");
  opcionVacia.value = "";
  opcionVacia.textContent = "Selecciona una opción";
  selectElement.appendChild(opcionVacia);

  // Generar las opciones del menú
  opciones.forEach(opcion => {
    const optionElement = document.createElement("option");
    optionElement.value = opcion;
    optionElement.textContent = opcion;
    selectElement.appendChild(optionElement);
  });
}


/* Con esta función se visualiza la section solicitada por el usuario
*/
function showContent(sectionId) {
  const clk = $(sectionId);
  //console.log("Se presionó el botón para ", sectionId);
  //console.log("La sección previa es: ", laSecci0nPrevia);
  // Primero se busca si tiene la clase "active".
  if (!clk.matches('.active')) {
    // Si no tiene la clase .active quiere decir que el usuario está
    // solicitando cambiar de section. Pero antes verificamos si hay un
    // cambio pendiente.
    switch (laSecci0nPrevia) {
      case 'usuarios':
        if (posiblesCambiosSeccionAso()) {
          console.log("Seguir en la sección 'usuarios'.");
          return;
        }
        break;
    }
    //console.log("La clase .active NO está activa");
    console.log("Cambiar de sección, se activará: ", sectionId);
    // Almacenamos la sección actual.
    laSecci0nPrevia = sectionId;
    // Cada 'section' tiene la class ".content" y este loop elimina
    // la class "active" la cual en CSS está declarada para permitir
    // la visualización de esa section.
    document.querySelectorAll(".content").forEach(section => {
      section.classList.remove("active");
    });
    // Una vez ocultas todas las section, se activa la que se solicitó
    document.getElementById(sectionId).classList.add("active");
  } else {
    // El usuario presionó el botón de la sección actual.
    console.log("El usuario presionó el botón de la sección actual.");
  }
}


// body: JSON.stringify({destino: 'EliminarAsociado'})
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
      return response.json(); // Convertir la respuesta a JSON
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
    if (result.success) {
      return result;

      // switch (result.message2) {
      //   case 'EliminarAsociado':
      //     // Respuesta exitosa, se procede a eliminar referencias al usuario eliminado
      //     // También regresará           
      //     eliminnaPrueba01();

      //     break;
      // }
    } else {
      console.log("Respuesta de error recibida del servidor: ", result.message);
      alert(result.message);
    }
  } catch (error) {
    console.log("Error en la conexión al servidor...");
    console.error('Error:', error);
  }
}


function eliminnaPrueba01() {
  // Procedemos a eliminar del JSON el usuario
  asociados = asociados.filter(u => u.ID !== idUsuarioEliminado); // 263
  // Ahora se eliminará del <select> de 'userSelect'
  const v = $('userSelect');
  Array.from(userSelect.options).forEach(option => {
    if (option.value === idUsuarioEliminado) {
      console.log("Se ha encontrado el asociado a eliminar en el <select>");
      option.remove();
    }
  })
  console.log("Los ", asociados);
  console.log(`Usuario ${idUsuarioEliminado} eliminado.`);
  const bt4 = $('eliminarAsociadoBtn');
  bt4.innerHTML = "Eliminar ficha";
  habilitaBotonesAsociado();
  ocultarFichaAsociados();
  // falta regresar el <select> a su estado original
}
