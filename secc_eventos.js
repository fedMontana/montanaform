"use strict";


let nombreOriginal = "";  // Nombre original del evento o competencia
let modoEdicion = false;  // Modo edición del evento o competencia
let opcEventos = [];

const beliminarEvento = $("eliminarEvento");
const bsalvarEvento = $("salvarEvento");

const eventosSelect = $("eventosSelect");
const detallesEventos = $("eventosDetails");

//const contenedor = $('previewCompEvento');

/* 
*/
function inicializarEventos() {
  cargaDatosSelectEV(eventos);  
  document.getElementById("fotoEventoInput").value = "";
  validarArchivoImagen("fotoEventoInput", "previewCompEvento");
  $('previewCompEvento').innerHTML = "";
  // ComboBox para la selección del evento
  eventosSelect.addEventListener("change", () => {
    const seleccionEvento = eventosSelect.value;
    console.log("Selección de evento (value): ", seleccionEvento);
    switch (seleccionEvento) {
      case "":
        console.log("A ocultar la ficha de eventos...");
        detallesEventos.style.display = "none";
        break;
      case "Nuevo evento":
        console.log("Nuevo evento...");
        //const eventoSinDatos = creaEventoVacIo();
        const eventoSinDatos = creaObjetoVacio(fieldMappingEventos);
        populateFormEventos(eventoSinDatos);
        detallesEventos.style.display = "block";
        modoEdicion = false;
        beliminarEvento.style.display = "none";
        break;
      default:
        // Si estamos acá se editará la información de los eventos.         
        console.log("Acá se leerá y pondrá la información de los eventos ya registrados");
        //const selectedEvento = eventos.find(evento => evento[fieldMappingEventos.eventName] === eventosSelect.value);
        const selectedEvento = eventos.find(evento => evento["Nombre del evento"] === eventosSelect.value);
        populateFormEventos(selectedEvento);
        nombreOriginal = selectedEvento["Nombre del evento"];
        detallesEventos.style.display = "block"; //
        modoEdicion = true;
        beliminarEvento.style.display = "block";
    }
    // Restauramos valores:
    objCambios = {};
  });

  bsalvarEvento.addEventListener("click", async () => {
    if (!modoEdicion && !imagenProcesadaOK) {
      //console.log("Si estamos en modo Nuevo evento y no hay imagen disponible");
      mostrarToast("Por favor selecciona una imagen");
      return;
    }

    // Primero revisar si hay algo para enviar    
    if (confirm(`¿Enviar la información?`)) {
      deshabilitaBotonesPArteEvento();
      const datos = camposHtmlAObjeto(fieldMappingEventos);
      //                condición ? expresiónSiVerdadero : expresiónSiFalso     
      datos["Imagen"] = imagenProcesadaOK ? base64Comprobante : "";

      let destino = "NuevoEvento"; // presuponemos
      if (modoEdicion) {
        // Estamos en modo edición, en este modo se puede enviar o no una nueva imagen
        // Es necesario enviar el nombre original del evento
        destino = "EditarEvento";
        datos["nombreOriginal"] = nombreOriginal;
      }
      const val = JSON.stringify({ destino, datos });
      console.log(val);
      const resp = await enviarPOST(val);
      alert(resp.message);
      modificarArr(resp.nuevaURLImg);
      habilitaBotonesPArteEvento();
      return;
    }
  });

  beliminarEvento.addEventListener("click", async () => {
    if (confirm(`¿Eliminar la información de este evento?`)) {
      deshabilitaBotonesPArteEvento();
      console.log("Sí, se quiere eliminar");
      const destino = "EliminarEvento";
      const objetivo = nombreOriginal;
      const val = JSON.stringify({ destino, objetivo });
      console.log(val);
      const resp = await enviarPOST(val);
      alert(resp.message);
      if (resp.success) {
        // Se eliminará la información del evento del array principal        
        eliminarEventoCompe(eventos);
        cargaDatosSelectEV(eventos);
      }
      habilitaBotonesPArteEvento();
    }
  });


  document.querySelectorAll('.edit-field-evento').forEach(field => {
    field.addEventListener('input', () => {
      // Obtenemos la ID del control para poder configurar el nombre del valor en el JSON
      //let nmb = field.id.toString().replace("Input", "");
      //nmb = nmb[0].toUpperCase() + nmb.slice(1);
      //console.log("El control del cambio fue: ", field.name);
      // Se comparan valores, 
      // El valor constante para identificar dónde está ocurriendo la modificación es por
      // medio del comboBox de selección de eventos, ya que tiene la opción de "Nuevo evento"
      // y los eventos descargados.
      console.log("Selección hecha por el usuario: ", eventosSelect.value);
      if (eventosSelect.value === "Nuevo evento") {
        if (field.value === "") {

        } else {

        }


      } else {
        // Comparamos los valores ingresados        
      }
      /*if (initialData[nmb] !== field.value) {
        // El usuario modificó un campo, se resalta cambiando el color del borde.
        field.style.borderColor = "#ff9800";
        contCambios++;
        if (contCambios === 1) {
          // Ocurrió la primera modificación, cuando esto sucede se deshabilitan
          // los botones...
        }
      } else {
        // El usuario regresó al valor previo del cambio en el campo
        field.style.borderColor = "#ccc";
        contCambios--;
      }*/
    });
  });
}

// Cuando el usuario modificó la información del evento se actualizará
// el objeto "eventos" que es donde está almacenada a información.
function modificarArr(nuevaImg) {
  // Buscar el objeto evento en el array
  const evento = eventos.find(e => e["Nombre del evento"] === nombreOriginal);
  if (evento) {
    // Como sí se encontró el objeto entonces vamos a modificar los valores.
    Object.entries(fieldMappingEventos).forEach(([fieldId, config]) => {
      if (fieldId === "eventPoster") {
        if (nuevaImg !== "")
          evento["Imagen"] = nuevaImg;
      } else {
        const viewField = $(fieldId); // fieldId corresponde al nombre de los controles html
        //console.log("Valor nuevo: ", viewField.value, "  Valor actual: ", evento[config]);
        // Actualizamos el campo en el objeto
        evento[config] = viewField.value;
      }
    });
    //     
  } else {
    // Se agregará un nuevo evento
    const datos = camposHtmlAObjeto(fieldMappingEventos);
    datos["Imagen"] = (nuevaImg !== "") ? nuevaImg : "";
    eventos.push(datos);
  }
  cargaDatosSelectEV(eventos);
}


function revisaCamposEventos() {
  const fichaActiva = document.querySelector(".content.active");
  const requeridos = fichaActiva.querySelectorAll("[required]");
}

function deshabilitaBotonesPArteEvento() {
  bsalvarEvento.innerText = "Espera un momento por favor";
  bsalvarEvento.disabled = true;
  beliminarEvento.disabled = true;
  //
  bAsociados.disabled = true;
  bClubes.disabled = true;
  bEventos.disabled = true;
  bCompetencias.disabled = true;
}

function habilitaBotonesPArteEvento() {
  bsalvarEvento.innerText = "Guardar";
  bsalvarEvento.disabled = false;
  beliminarEvento.disabled = false;

  bAsociados.disabled = false;
  bClubes.disabled = false;
  bEventos.disabled = false;
  bCompetencias.disabled = false;
  // Forzamos un cambio en el <select>
  eventosSelect.value = "Nuevo evento";
  eventosSelect.dispatchEvent(new Event('change'));
}

function populateFormEventos(selectedEvento) {
  //console.log("Examinando estructura evento: ", selectedEvento);  
  Object.entries(fieldMappingEventos).forEach(([fieldId, config]) => {
    const viewField = $(fieldId); // fieldId corresponde al nombre de los controles html
    //console.log("fieldId: ", fieldId, "   config: ", config);
    switch (fieldId) {
      case "eventPoster":
        //console.log("Sí, acá va el poster: ", selectedEvento[config]);
        imagenContenedor('previewCompEvento', "fotoEventoInput", selectedEvento[config]);
        break;
      case "eventDuration":
        viewField.value = selectedEvento[config];
        break;
      default:
        viewField.value = selectedEvento[config] || '';
    }
    nombreOriginal = "";
  });
}

/* Esta función compartida permite visualizar una imagen con iframe tomando la url proporcionada por GAS  
*/
function imagenContenedor(elContenedor, elInput, urlImg) {
  const contenedor = $(elContenedor);
  const laInput = $(elInput);
  if (urlImg !== "") {
    const match = urlImg.match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match && match[1]) {
      const fileId = match[1];
      const iframe = document.createElement('iframe');
      iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
      iframe.style.border = "none";

      // Eliminar iframe anterior si ya existe
      const anterior = contenedor.querySelector("iframe");
      if (anterior) contenedor.removeChild(anterior);
      // Eliminar img anterior si ya existe
      const otraAnterior = contenedor.querySelector("img");
      if (otraAnterior) contenedor.removeChild(otraAnterior);
      contenedor.appendChild(iframe);
    }
  }
  else {
    // Se tiene que limpiar la posible imagen previa
    contenedor.innerHTML = "";
    laInput.value = "";
  }
  base64Comprobante = null;
  imagenProcesadaOK = false;
}

/* Función compartida
*/
function creaObjetoVacio(fieldMapping) {
  let objVacio = {};
  Object.entries(fieldMapping).forEach(([fieldId, config]) => {
    objVacio[config] = "";
  });
  return objVacio;
}


/* ¿Qué hace esta función
  Recibe como parámetro un fieldMapping el cual contiene la relación entre los nombres
  de los controles html con el valor correspondiente. Por ejemplo para eventos y competencias:
  {'eventName': 'Nombre del evento', }   {"competenciaName": "Nombre competencia",}
?*/
function camposHtmlAObjeto(fieldMapping) {
  const datos = {};
  // Recorremos el fieldMappingEventos.
  // idCampo es el nombre del control html  ||| nombreHeader es el valor del campo recibido en el JSON
  Object.entries(fieldMapping).forEach(([idCampo, nombreHeader]) => {
    //            condición ? expresiónSiVerdadero : expresiónSiFalso
    const valor = document.getElementById(idCampo)?.value || "";
    datos[nombreHeader] = valor;
  });
  // Campos extra fuera del mapping
  datos["Usuario Organizador"] = elCorreo;
  datos["Asociación Organizador"] = nombreAsociacion;

  return datos;
}

function eliminarEventoCompe(arrayTarget) {
  const keys = Object.keys(arrayTarget[0]);
  // let claveNombre = keys.includes("Nombre del evento") ? "Nombre del evento" : "Nombre competencia";
  let claveNombre = null;

  if (keys.includes("Nombre del evento")) {
    claveNombre = "Nombre del evento";
  } else if (keys.includes("Nombre competencia")) {
    claveNombre = "Nombre competencia";
  } else {
    console.log("No se encontró una clave válida");
    return;
  }

  // Con .filter() se recorre todo el array
  const arrayActualizado = arrayTarget.filter(loBuscado => loBuscado[claveNombre] !== nombreOriginal);
  arrayTarget.length = 0;  // Se vacía el array original
  arrayTarget.push(...arrayActualizado); // Se rellena con el nuevo contenido
  console.log("Se ha eliminado el array satisfactoriamente.");
}

/* Recibe como parámetro la referencia del array (puede ser eventos o competencias)
  Para generar las opciones en el select donde el usuario selecciona un evneto
  o competencia para visualizar o editar
*/
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


function revisaModificaciones(fieldMapping) {
  //objCambios
}