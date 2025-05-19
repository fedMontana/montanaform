
"use strict";

const detallesCompetencias = $("competenciasDetails");
const beliminarCompetencia = $("eliminarCompetencia");
const bsalvarCompetencia = $("salvarCompetencia");

const competenciasSelect = $("competenciasSelect");

function inicializarCompetencias() {  
  cargaDatosSelectEV(competencias);
  validarArchivoImagen("fotoCompetenciaInput", "previewCompetencia");
  $("previewCompetencia").innerHTML = "";
  document.getElementById("fotoCompetenciaInput").value = "";
  //
  competenciasSelect.addEventListener("change", () => {
    const seleccionComp = competenciasSelect.value;
    console.log("Selección de competencia (value): ", seleccionComp);
    switch (seleccionComp) {
      case "":
        console.log("Ocultar la ficha de competencias...");
        detallesCompetencias.style.display = "none";
        break;
      case "Nueva competencia":
        console.log("Nueva competencia...");
        const competenciaSinDatos = creaObjetoVacio(fieldMappingCompetencia);
        populateFormCompetencias(competenciaSinDatos);
        detallesCompetencias.style.display = "block";
        modoEdicion = false;
        beliminarCompetencia.style.display = "none";
        break;
      default:
        // Si estamos acá se editará la información de los eventos.         
        console.log("Acá se leerá y pondrá la información de los eventos ya registrados");
        const selectedCompetencia = competencias.find(competencia => competencia["Nombre competencia"] === competenciasSelect.value);
        populateFormCompetencias(selectedCompetencia);
        nombreOriginal = selectedCompetencia["Nombre competencia"];
        detallesCompetencias.style.display = "block"; //
        modoEdicion = true;
        beliminarCompetencia.style.display = "block";
    }
    // Restauramos valores:
    objCambios = {};
  });

  bsalvarCompetencia.addEventListener("click", async () => {
    if (!modoEdicion && !imagenProcesadaOK) {
      //console.log("Si estamos en modo Nuevo evento y no hay imagen disponible");
      mostrarToast("Por favor selecciona una imagen");
      return;
    }

    // Primero revisar si hay algo para enviar    
    if (confirm(`¿Enviar la información?`)) {
      deshabilitaBotonesPArteCompetencia();
      const datos = camposHtmlAObjeto(fieldMappingCompetencia);
      // condición ? expresiónSiVerdadero : expresiónSiFalso
      datos["Imagen"] = imagenProcesadaOK ? base64Comprobante : "";

      let destino = "NuevaCompetencia"; // presuponemos
      if (modoEdicion) {
        // Estamos en modo edición, en este modo se puede enviar o no una nueva imagen
        destino = "EditarCompetencia";
        // Es necesario enviar el nombre original de la competencia
        datos["nombreOriginal"] = nombreOriginal;
      }
      const val = JSON.stringify({ destino, datos });
      console.log(val);
      const resp = await enviarPOST(val);
      alert(resp.message);
      modificarArrComp(resp.nuevaURLImg);
      habilitaBotonesPArteCompet();
      return;
    }
  });

  beliminarCompetencia.addEventListener("click", async () => {
    if (confirm(`¿Eliminar la información de esta competencia?`)) {
      deshabilitaBotonesPArteCompetencia();
      console.log("Sí, se quiere eliminar");
      const destino = "EliminarCompetencia";
      const objetivo = nombreOriginal;
      const val = JSON.stringify({ destino, objetivo });
      console.log(val);
      const resp = await enviarPOST(val);
      alert(resp.message);
      if (resp.success) {
        // Se eliminará la información de la competencia en el array principal
        eliminarEventoCompe(competencias);
        cargaDatosSelectEV(competencias);
      }
      habilitaBotonesPArteCompet();
    }
  });
}

function deshabilitaBotonesPArteCompetencia() {
  bsalvarCompetencia.innerText = "Espera un momento por favor";
  bsalvarCompetencia.disabled = true;
  beliminarCompetencia.disabled = true;
  //
  bAsociados.disabled = true;
  bClubes.disabled = true;
  bEventos.disabled = true;
  bCompetencias.disabled = true;
}

// Cuando el usuario modificó la información de la competencia se actualizará
// el objeto "competencias" que es donde está almacenada a información.
function modificarArrComp(nuevaImg) {
  // Buscar el objeto nombreOriginal en el array competen
  const competen = competencias.find(e => e["Nombre competencia"] === nombreOriginal);
  if (competen) {
    // competen[campo] = nuevoValor;
    Object.entries(fieldMappingCompetencia).forEach(([fieldId, config]) => {
      if (fieldId === "competenciaImg") {
        if (nuevaImg !== "")
          competen["Imagen"] = nuevaImg;
      } else {
        const viewField = $(fieldId); // fieldId corresponde al nombre de los controles html
        //console.log("Valor nuevo: ", viewField.value, "  Valor actual: ", competen[config]);
        // Actualizamos el campo en el objeto
        competen[config] = viewField.value;
      }
    });
  } else {
    // Se ha agregado una nueva competencia, se actualizará el array
    // así como el <select>
    const datos = camposHtmlAObjeto(fieldMappingCompetencia);
    datos["Imagen"] = (nuevaImg !== "") ? nuevaImg : "";
    competencias.push(datos);
  }
  cargaDatosSelectEV(competencias);
}


function habilitaBotonesPArteCompet() {
  bsalvarCompetencia.innerText = "Guardar";
  bsalvarCompetencia.disabled = false;
  beliminarCompetencia.disabled = false;

  bAsociados.disabled = false;
  bClubes.disabled = false;
  bEventos.disabled = false;
  bCompetencias.disabled = false;
  // Forzamos un cambio en el <select>
  competenciasSelect.value = "Nueva competencia";
  competenciasSelect.dispatchEvent(new Event('change'));
}



function populateFormCompetencias(selectedCompetencia) {
  //console.log("Examinando estructura evento: ", selectedCompetencia);  
  Object.entries(fieldMappingCompetencia).forEach(([fieldId, config]) => {
    const viewField = $(fieldId); // fieldId corresponde al nombre de los controles html
    //console.log("fieldId: ", fieldId, "   config: ", config);
    switch (fieldId) {
      case "competenciaImg":
        //console.log("Sí, acá va el poster: ", selectedCompetencia[config]);
        imagenContenedor('previewCompetencia', "fotoCompetenciaInput", selectedCompetencia[config]);
        break;
      case "eventDuration":
        viewField.value = selectedCompetencia[config];
        break;
      default:
        //console.log("V: ", selectedCompetencia[config]);
        viewField.value = selectedCompetencia[config] || '';
    }
    nombreOriginal = "";
  });
}




// function cargaDatosSlctEventos() {
//   opcEventos = [];
//   opcEventos[0] = "Nuevo evento"; //  
//   eventos.forEach(nombre => {
//     // fieldMappingEventos.eventName es lo mismo que 'Nombre del evento'
//     opcEventos.push(nombre[fieldMappingEventos.eventName]);
//   });
//   generarOpcionesSelect("eventosSelect", opcEventos);
// }