"use strict";
//
let clubAnterior = "";
let usuarioAnterior = '';
let laCURP = "";


const btGuardarAsociados = $("btnGuardarAsociados");
const btGenCredencial = $("credencialButton");
const btRestValAso = $("restaurarValAsociadosBtn");
const btEliminarAso = $("eliminarAsociadoBtn");
const btEditVerAso = $("editButton");

const clubSelect = $("clubSelect"); // Combobox Clubes
const userSelect = $("userSelect"); // Comobox Asociados
const userDetails = $("userDetails"); // Ficha del asociado


function generarCheckboxes() {
  const container = $('disciplinasInput');
  container.innerHTML = ''; // Limpia si ya existen

  disciplinasArray.forEach(actividad => {
    const etiqueta = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'actividad';
    checkbox.value = actividad;

    etiqueta.appendChild(checkbox);
    etiqueta.appendChild(document.createTextNode(' ' + actividad));

    container.appendChild(etiqueta);
  });
}


/* 
*/
function inicializarValoresAsociados() {  
  generarOpcionesSelect("generoInput", elGenero);
  generarOpcionesSelect("escolaridadInput", la_Escolaridad);
  generarOpcionesSelect("estadoInput", estados);
  generarOpcionesSelect("tipoSangreInput", tipoSangre);
  generarOpcionesSelect("funcionInput", funcion);
  generarCheckboxes();
  

  lbAsociados.innerHTML = "Asociados [" + asociados.length + "]:";
  
  generarOpcionesSelect("clubInput", losClubes);
  
  losClubes.forEach(club => {
    const option = document.createElement("option");
    option.value = club;
    option.textContent = club;
    clubSelect.appendChild(option);
  });

  asociados.forEach(usuario => {
    const option = document.createElement("option");
    option.value = usuario.CURP;
    option.textContent = usuario.Nombre + " " + usuario["Apellido Paterno"];
    userSelect.appendChild(option);
  });
  losListenersAsociados();
  listenerDeCambiosAsociados();
  modoVisualizaci0n();
}

function listenerDeCambiosAsociados() {
  document.querySelectorAll('.edit-field-asociados').forEach(field => {
    field.addEventListener('input', (evento) => {
      
      const clave = field.id.toString().replace("Input", "");
      
      switch (field.id) {
        case 'disciplinasInput':          
          let actividadesSeleccionadas = leeDisciplinas();
          const actOrig = initialData[fieldMapping["disciplinas"].jsonKey];
          
          if (comparaArrays(actividadesSeleccionadas, actOrig)) {
            // Son iguales                        
            objCambios["disciplinasInput"] = false;
          } else {
            objCambios["disciplinasInput"] = true;
          }          
          return; // MXES10          
          break;
        case "fotoInput":
          objCambios["fotoInput"] = true;
          return;
          break;
        case 'funcionInput':
          
          revisaSubfuncion(field.value, "");
          break;
        default:
          console.log("El control del cambio fue: ", field.id, "  y el values es: ", field.value);
      }
      const valor = fieldMapping[clave].jsonKey;
      objCambios[field.id] = (field.value !== initialData[valor]);
      console.log("Original: [", initialData[valor], "]  ingresado: [", field.value, "]", "  Resultado: ", (field.value !== initialData[valor]));
      
      field.style.borderColor = objCambios[field.id] ? '#ff9800' : '#ccc';      
      const hayCambios = Object.values(objCambios).some(estado => estado);
      console.log("Resultado de los cambios: ", hayCambios);
    });
  });
}



function leeDisciplinas() {
  const checkboxes = document.querySelectorAll('input[name="actividad"]:checked');
  const actividadesSeleccionadas = [];
  checkboxes.forEach(checkbox => {
    
    actividadesSeleccionadas.push(checkbox.value);  
  });
  const lasDisciplinas = actividadesSeleccionadas.join(', ');
  
  return lasDisciplinas;
}

function losListenersAsociados() {
  
  clubSelect.addEventListener("change", () => {
    if (posiblesCambiosPendientes(clubSelect, clubAnterior)) {
      console.log("Se ha cancelado, continúamos editando info del club ", clubSelect.value);
      mostrarToast("Continúamos editando información del asociado ", userSelect.value);
      return;
    }
    ocultarFichaAsociados();
    const selectedClub = clubSelect.value;
    clubAnterior = selectedClub;
    userSelect.innerHTML = '<option value="">Selecciona un asociado</option>';
    const filteredUsers = selectedClub === "Todos los asociados"
      ? asociados
      : asociados.filter(user => user.Club === selectedClub);
    let contAso = 0;
    filteredUsers.forEach(user => {
      const option = document.createElement("option");
      option.value = user.CURP;
      option.textContent = user.Nombre + " " + user["Apellido Paterno"];
      userSelect.appendChild(option);
      contAso++;
    });

    const msg = "Asociados [" + contAso + "]:";
    lbAsociados.innerHTML = msg;
  });

  userSelect.addEventListener("change", () => {
    console.log("El click en el change es: ", userSelect.value);
    
    if (posiblesCambiosPendientes(userSelect, usuarioAnterior)) {    
      mostrarToast("Continúamos editando información del asociado ", userSelect.value);
      return;
    }
    usuarioAnterior = userSelect.value; // Guardar valor actual
    console.log("Usuario actual: ", usuarioAnterior);
    const selectedUser = asociados.find(user => user.CURP === userSelect.value);
    if (selectedUser) {
      initialData = JSON.parse(JSON.stringify(selectedUser)); // Copia profunda
      populateForm(selectedUser);
      userDetails.style.display = "block";
      idUsuario = selectedUser.ID; // Guardamos en global la ID
      laCURP = selectedUser.CURP;
    } else {
      
      console.log("Ocultando ficha....");
      ocultarFichaAsociados();
    }
  });

  btEditVerAso.addEventListener("click", () => {
    if (posiblesCambiosPendientes2()) {      
      return;
    }
    cambioDeVista();
  });

  btRestValAso.addEventListener("click", () => {
    posiblesCambiosSeccionAso();
  });

  
  btEliminarAso.addEventListener("click", async () => {
    console.log("Eliminar usuario: " + idUsuario);
    const usuario = asociados.find(u => u.ID === idUsuario);
    const nombreCompleto = `${usuario.Nombre} ${usuario["Apellido Paterno"]}`;
    // Primero se pide confirmación.
    if (confirm(`¿Estás seguro de eliminar a ${nombreCompleto} (ID: ${idUsuario})?`)) {
      console.log("El usuario ha confirmado la eliminación.");
      limpiaObjeAso();
      idUsuarioEliminado = idUsuario;
      
      const destino = "EliminarAsociado";
      const val = JSON.stringify({ destino, elToken, elEstado, idUsuario, });
      btEliminarAso.innerHTML = "Espera un momento por favor...";
      deshabilitaBotonesAsociado();
      const resp = await enviarPOST(val);
      if (resp.success) {
        alert(resp.message);
        
        const usuarioAEliminar = asociados.filter(elBuscado => elBuscado["ID"] !== idUsuario);
        asociados.length = 0; // Vaciamos el array original
        asociados.push(...usuarioAEliminar);
        // Forzamos un cambio en el <select>
        clubSelect.value = "Todos los asociados";
        clubSelect.dispatchEvent(new Event('change'));
      }
      btEliminarAso.innerHTML = "Eliminar ficha";
      habilitaBotonesAsociado();
      ocultarFichaAsociados();
    } else {
      console.log("Eliminación cancelada.");
    }
  });

  btGenCredencial.addEventListener("click", async () => {
    // Primero se pide confirmación.
    const usuario = asociados.find(u => u.ID === idUsuario);
    const nombreCompleto = `${usuario.Nombre} ${usuario["Apellido Paterno"]}`;
    if (confirm(`¿Generar credencial para ${nombreCompleto} (ID: ${idUsuario})?`)) {
      const destino = "Credencial";
      let datos = {};
      datos["ID"] = idUsuario;
      datos["CURP"] = usuario["CURP"];
      datos["Nombre"] = usuario.Nombre;
      datos["Apellido Paterno"] = usuario["Apellido Paterno"];
      datos["Apellido Materno"] = usuario["Apellido Materno"];
      datos["Alergias"] = usuario["Alergias"];
      datos["Enfermedades"] = usuario["Enfermedades"];
      datos["Tipo de sangre"] = usuario["Tipo de sangre"];
      datos["Foto"] = usuario["Foto"];
      datos["EstadoAsociacion"] = elEstado;
      datos["correo"] = elCorreo;
      datos["club"] = usuario["Club"];
      console.log(datos);
      const val = JSON.stringify({ destino, datos });
      console.log(val);
      btGenCredencial.innerHTML = "Espera un momento...";
      deshabilitaBotonesAsociado();
      const resp = await enviarPOST(val);
      if (resp.success) {
        alert(resp.message);
      }
      habilitaBotonesAsociado();
      btGenCredencial.innerHTML = "Generar credencial";
    }
  });

  /* 
   */
  btGuardarAsociados.addEventListener("click", async () => {
    const hayCambios = Object.values(objCambios).some(estado => estado);
    if (hayCambios !== 0) {
      console.log("Guardamos la información que se editó de los asociados.");
      const usuario = asociados.find(u => u.ID === idUsuario);
      const nombreCompleto = `${usuario.Nombre} ${usuario["Apellido Paterno"]}`;
      const datos = {};
      if (confirm(`¿Modificar información de ${nombreCompleto} (ID: ${idUsuario})?`)) {
        Object.entries(fieldMapping).forEach(([fieldId, config]) => {
          
          switch (fieldId) {
            case 'fichaID':
              datos["ID"] = idUsuario;
              break;
            case "disciplinas":
              datos["Disciplinas"] = leeDisciplinas();
              break;
            default:
              const editField = $(`${fieldId}Input`);
              Object.assign(datos, {
                [config.jsonKey]: editField.value || ''
              });
          }
        });
        
        if (imagenProcesadaOK)
          datos["fotoModificada"] = base64Comprobante;
        const destino = "EditarAsociado";
        const val = JSON.stringify({ destino, elToken, elEstado, datos });
        console.log(val);
        btGuardarAsociados.innerHTML = "Espera un momento por favor...";
        deshabilitaBotonesAsociado();
        const resp = await enviarPOST(val);
        if (resp.success) {
          alert(resp.message);          
          const selectedUser = asociados.find(user => user.CURP === usuarioAnterior);
          if (selectedUser) {
            console.log("Cambiar los valores en el JSON");
            for (let key in datos) {
              console.log(key, " --- ", datos[key]);
              if (datos.hasOwnProperty(key)) {
                selectedUser[key] = datos[key];
              }
            }
            if (imagenProcesadaOK) {
              console.log("La nueva URL de la imagen es: ", resp.nuevaURL);
              selectedUser["Foto"] = resp.nuevaURL;
            }
          }
          limpiaObjeAso();
        }        
        btGuardarAsociados.innerHTML = "Guardar";
        habilitaBotonesAsociado();
        clubSelect.value = "Todos los asociados";
        clubSelect.dispatchEvent(new Event('change'));
        modoVisualizaci0n();
      }
    }
    else {
      mostrarToast("Nada que guardar.");
    }
  });
}

function ocultarFichaAsociados() {  
  initialData = {};
  objCambios = {};
  userDetails.style.display = "none"; // 
  imagenProcesadaOK = false;
  base64Comprobante = null;

  document.querySelectorAll("#userDetails span").forEach(el => el.style.display = "block");
  document.querySelectorAll("#userDetails input").forEach(el => el.style.display = "none");
  document.querySelectorAll("#userDetails select").forEach(el => el.style.display = "none");
  document.querySelectorAll("#userDetails fieldset").forEach(el => el.style.display = "none");
  btEditVerAso.style.display = "block";
  btEditVerAso.textContent = "Editar";
  btEliminarAso.style.display = "block";
  btGuardarAsociados.style.display = "none";
  btRestValAso.style.display = "none";
}

function deshabilitaBotonesAsociado() {
  btEditVerAso.disabled = true;
  btGuardarAsociados.disabled = true;
  btRestValAso.disabled = true;
  btEliminarAso.disabled = true;
}

function habilitaBotonesAsociado() {
  btEditVerAso.disabled = false;
  btGuardarAsociados.disabled = false;
  btRestValAso.disabled = false;
  btEliminarAso.disabled = false;
}

function posiblesCambiosPendientes(control, valorAnterior) {
  const hayCambios = Object.values(objCambios).some(estado => estado);
  if (hayCambios) {
    // Mostrar cuadro de confirmación
    const confirmarCambio = confirm("¿Salir sin guardar?");
    if (!confirmarCambio) {
      
      console.log("El usuario quiere seguir editando sin salir.")
      control.value = valorAnterior; //      
      return true; // Salir sin cargar nuevo usuario
    } else {
      limpiaObjeAso();
      return false;
    }
  }
  
  return false;
}

function posiblesCambiosPendientes2() {
  const hayCambios = Object.values(objCambios).some(estado => estado);
  if (hayCambios) {
    const confirmarCambio = confirm("¿Perder cambios?");
    if (!confirmarCambio) {
      
      return true;
    } else {
      console.log("Limpiando...");
      limpiaObjeAso();
      return false;
    }
  }
  return false;
}


function posiblesCambiosSeccionAso() {
  const hayCambios = Object.values(objCambios).some(estado => estado);
  if (hayCambios) {
    const confirmarCambio = confirm("¿Perder cambios?");
    if (!confirmarCambio) {
      
      return true;
    } else {
      limpiaObjeAso();
      // Se restaura la información del asociado.
      const selecteAsociado = asociados.find(user => user.CURP === laCURP);
      populateForm(selecteAsociado);
    }
  }
  return false;
}

function limpiaObjeAso() {
  console.log("Restaurando....");
  document.querySelectorAll('.edit-field-asociados').forEach(field => {
    field.style.borderColor = "#ccc";
  });
  objCambios = {};
  document.getElementById("fotoInput").value = "";
  imagenProcesadaOK = false;
  base64Comprobante = null;
}


function populateForm(selectedUser) {
  Object.entries(fieldMapping).forEach(([fieldId, config]) => {
    const viewField = $(fieldId);

    if (config.jsonKey === "ID") {
      viewField.textContent = "Asociado  [" + selectedUser[config.jsonKey] + "]";
    } else {
      viewField.textContent = selectedUser[config.jsonKey] || '';
    }
    
    switch (config.jsonKey) {
      case 'Subfunción':
        revisaSubfuncion(selectedUser["Función"], selectedUser[config.jsonKey]);
        break;
      case 'Disciplinas':
        
        const disciplinasSeleccionadas = selectedUser[config.jsonKey].split(',').map(d => d.trim());
        const checkboxes = document.querySelectorAll('#disciplinasInput input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
          // Primero limpiamos todo
          checkbox.checked = false;
          if (disciplinasSeleccionadas.includes(checkbox.value)) {
            checkbox.checked = true;
          }
        });
        break;
      case "ID":
        console.log("Heee la ID....");
        break;
      default:
        const editField = $(`${fieldId}Input`);
        editField.value = selectedUser[config.jsonKey] || '';
    }
  });
  
  if (selectedUser["Foto"]) {
    const match = selectedUser["Foto"].match(/\/d\/([a-zA-Z0-9_-]+)\//);
    if (match && match[1]) {
      const fileId = match[1];
      const iframe = document.createElement('iframe');
      iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
      iframe.width = "150";
      iframe.height = "150";
      iframe.style.border = "none";

      const contenedor = $('previewImgAsociado');
      
      const anterior = contenedor.querySelector("iframe");
      if (anterior) contenedor.removeChild(anterior);
      
      const otraAnterior = contenedor.querySelector("img");
      if (otraAnterior) contenedor.removeChild(otraAnterior);
      contenedor.appendChild(iframe);
    }
  }
}

function revisaSubfuncion(funcion, valorSub) {
  //console.log("Función recibida: ", funcion, "  Subfunción: ", valorSub);
  const sub = $('subfuncionInput');
  sub.innerHTML = "";
  sub.disabled = false;
  let subMenu;
  switch (funcion) {
    case 'Personal técnico':
      subMenu = funcion_personalTec;
      break;
    case 'Consejo directivo':
      subMenu = funcion_consejo;
      break;
    case 'Servicio médico':
      subMenu = funcion_serMed;
      break;
    default:
      sub.disabled = true;
      return;
  }  
  generarOpcionesSelect("subfuncionInput", subMenu);
  if (valorSub !== "")
    sub.value = valorSub;
}

function cambioDeVista() {
  console.log("Cambio de vista.");
  // Se oculta el control span, que es "label" donde se visualiza la información del formulario:
  document.querySelectorAll("#userDetails span").forEach(el => {
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
  });
  // Y se muestran los controles de entrada:
  document.querySelectorAll("#userDetails input").forEach(el => {
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
  });
  document.querySelectorAll("#userDetails select").forEach(el => {
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
  });
  document.querySelectorAll("#userDetails fieldset").forEach(el => {
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
  });

  if (btEditVerAso.textContent === "Editar") {
    btEditVerAso.textContent = "Ver";
    btGuardarAsociados.style.display = "block";
    btRestValAso.style.display = "block";
    btGenCredencial.style.display = "none";
  } else {
    btEditVerAso.textContent = "Editar";
    btGuardarAsociados.style.display = "none";
    btRestValAso.style.display = "none";
    btGenCredencial.style.display = "block";
  }
}

function modoVisualizaci0n() {
  document.querySelectorAll("#userDetails span").forEach(el => {
    el.style.display = 'block';
  });
  // Y se muestran los controles de entrada:
  document.querySelectorAll("#userDetails input").forEach(el => {
    el.style.display = 'none';
  });
  document.querySelectorAll("#userDetails select").forEach(el => {
    el.style.display = 'none';
  });
  document.querySelectorAll("#userDetails fieldset").forEach(el => {
    el.style.display = 'none';
  });

  btEditVerAso.textContent = "Editar";
  btGuardarAsociados.style.display = "none";  // Botón guardar
  btRestValAso.style.display = "none";  // Botón restaurar
  btGenCredencial.style.display = "block";
}

