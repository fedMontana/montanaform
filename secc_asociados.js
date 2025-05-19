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

// Inicializar los selects para los asociados
const clubSelect = $("clubSelect"); // Combobox Clubes
const userSelect = $("userSelect"); // Comobox Asociados
const userDetails = $("userDetails"); // Ficha del asociado

// Se generan los checkboxes para las Disciplinas.
function generarCheckboxes() {
  const container = $('disciplinasInput');
  container.innerHTML = ''; // Limpia si ya existen

  disciplinas.forEach(actividad => {
    const etiqueta = document.createElement('label');
    //etiqueta.classList.add('checkbox-label'); // Añadimos clase para estilos
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
  // Cargamos los valores constantes de los combobox
  generarOpcionesSelect("generoInput", elGenero);
  generarOpcionesSelect("escolaridadInput", la_Escolaridad);
  generarOpcionesSelect("estadoInput", estados);
  generarOpcionesSelect("tipoSangreInput", tipoSangre);
  generarOpcionesSelect("funcionInput", funcion);
  generarCheckboxes();

  lbAsociados.innerHTML = "Asociados [" + asociados.length + "]:";
  // Select de clubes para cuando el usuario está en modo edición:
  generarOpcionesSelect("clubInput", losClubes);
  /* ¿Por qué no se usa 'generarOpcionesSelect' para rellenar los clubes en 'clubSelect'?
      Porque la primera opción REQUERIDA en el <select> es "Todos los asociados", pues cuando
      el usuario selecciona esta opción en el <select> vinculado llamado 'userSelect' se
      mostraran TODOS LOS ASOCIADOS recibidos. */
  losClubes.forEach(club => {
    const option = document.createElement("option");
    option.value = club;
    option.textContent = club;
    clubSelect.appendChild(option);
  });

  /* El comboBox 'userSelect' de los asociados se le ingresan dos valores:
      .value = curp  La CURP es única, con este valor diferenciamos al asociado seleccionado
      .textcontent = Nombre mas apellido del asociado.
    Ahora, a este comboBox se le actualizan estos valores en función
    del ComboBox de los clubes.
    Al momento de inicializar se rellenará este <select> con la información de
    TODOS LOS ASOCIADOS. */
  asociados.forEach(usuario => {
    const option = document.createElement("option");
    option.value = usuario.CURP;
    option.textContent = usuario.Nombre + " " + usuario["Apellido Paterno"];
    userSelect.appendChild(option);
  });
  losListenersAsociados();
  listenerDeCambiosAsociados();
}

/* ________________________________________________
     Se determinan los cambios realizados en el formulario para asociados.
     Si el cambio es un valor nuevo se deshabilitarán los cambios:  */
function listenerDeCambiosAsociados() {
  document.querySelectorAll('.edit-field-asociados').forEach(field => {
    field.addEventListener('input', (evento) => {
      /* Crítico -clave-:
       Se está escuchando a las entradas y todos estos controles tienen el sufijo 'Input' en su id
       así que se eliminará este sufijo para poder encontrar la clave en el objeto fieldMapping
       por ejemplo se recibe la escucha de 'apellidoPaternoInput' y al eliminar el sufijo tenemos
       'apellidoPaterno', y con esta clave se buscará en el objeto fieldMapping, el cual en el
       campo jsonKey contiene 'Apellido Paterno', siendo este valor el acceso al apellido paterno
       en el JSON recibido */
      const clave = field.id.toString().replace("Input", "");
      //console.log("El elemento HTML que el usuario modificó es: ", field.id);

      //console.log("Probando type: ", evento.target.type);
      switch (field.id) {
        case 'disciplinasInput':
          // Nuevas actividades
          let actividadesSeleccionadas = leeDisciplinas();
          // Actividades originales.
          const actOrig = initialData[fieldMapping["disciplinas"].jsonKey];
          //console.log("Los valores previooos: ", actOrig);
          // console.log("prueba salidaw: ", evento.target.value); (da como resultado el checkbox cliqueado)
          //console.log("Actividades clickeadas: ", actividadesSeleccionadas);

          if (comparaArrays(actividadesSeleccionadas, actOrig)) {
            // Son iguales                        
            objCambios["disciplinasInput"] = false;
          } else {
            objCambios["disciplinasInput"] = true;
          }
          //console.log("Los cambios... ", JSON.stringify(objCambios)); 
          return; // MXES10          
          break;
        case "fotoInput":
          objCambios["fotoInput"] = true;
          return;
          break;
        case 'funcionInput':
          //console.log("El valor recibido  para la función es: ", field.value);
          // Cuando se modifica este campo también se modifica subfuncionInput
          revisaSubfuncion(field.value, "");
          // regresar al string
          //objCambios["subfuncion"] = (field.value !== initialData["Subfunción"]);
          //console.log("Original: [", initialData["Subfunción"], "]  ingresado: [", field.value, "]", "  Resultado: ", (field.value !== initialData[valor]));
          break;
        default:
          console.log("El control del cambio fue: ", field.id, "  y el values es: ", field.value);
      }
      const valor = fieldMapping[clave].jsonKey;
      objCambios[field.id] = (field.value !== initialData[valor]);
      console.log("Original: [", initialData[valor], "]  ingresado: [", field.value, "]", "  Resultado: ", (field.value !== initialData[valor]));
      // condición ? expresiónSiVerdadero : expresiónSiFalso
      // Cuando hay diferencia entre lo almacenado y editado equivale a un TRUE y cambia a  #ff9800
      // por lo tanto si son iguales los valores, es FALSE y cambia a #ccc
      field.style.borderColor = objCambios[field.id] ? '#ff9800' : '#ccc';
      //console.log("Los cambios... ", JSON.stringify(objCambios));      
      // Verificar si hay cambios pendientes
      const hayCambios = Object.values(objCambios).some(estado => estado);
      console.log("Resultado de los cambios: ", hayCambios);
    });
  });
}

/* Comparamos los arrays de las disciplinas seleccionadas*/
function comparaArrays(arr1, arr2) {
  if (arr1.length !== arr2.length) return false;
  // Ordenamos y comparamos
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();

  return sorted1.every((val, index) => val === sorted2[index]);
}

function leeDisciplinas() {
  const checkboxes = document.querySelectorAll('input[name="actividad"]:checked');
  const actividadesSeleccionadas = [];
  checkboxes.forEach(checkbox => {
    // Agregamos las disciplinas seleccionadas a un array.
    actividadesSeleccionadas.push(checkbox.value);
    //console.log("->>  ---> ", checkbox.value);    
  });
  const lasDisciplinas = actividadesSeleccionadas.join(', ');
  //console.log("Las disciplinas seleccionadas: ", actividadesSeleccionadas);
  return lasDisciplinas;
}

function losListenersAsociados() {
  /* ________________________________________________
  El usuario selecciona un club id="clubSelect" ocurre lo siguiente:
   1. Revisa si ocurrieron cambios
     1.. Si ocurrieron cambios
  */
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
    //console.log("El club: ", clubSelect.value + "  Núm: ", contAso);   
    const msg = "Asociados [" + contAso + "]:";
    lbAsociados.innerHTML = msg;
  });

  /* ________________________________________________
    El usuario ha seleccionado un asociado. ¿Qué sigue?
      1. Revisa si tenemos cambios pendientes.
  */
  userSelect.addEventListener("change", () => {
    console.log("El click en el change es: ", userSelect.value);
    //console.log("Usuario anterior: ", usuarioAnterior);
    //console.log("El nuevo usuario: ", userSelect.value);
    if (posiblesCambiosPendientes(userSelect, usuarioAnterior)) {
      //userSelect.value = usuarioAnterior;
      console.log("Se ha cancelado, continúamos editando info del usuario ", userSelect.value);
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
      /* Agregamos la información a las "label" para visualizar */
      //laID.textContent = "Ficha del asociado  " + selectedUser.ID;
      //$("fichaID").textContent = "Ficha del asociado  " + selectedUser.ID;
    } else {
      // El usuario seleccionó en el <select> "Selecciona un asociado"
      // de un asociado, lo cual lo vamos a interpretar
      // como 
      // Cuando el usuario selecciona en el comboBox de asociados la opción 
      // se debe ocultar la ficha que está editando.
      // acá se revisa si hay cambios.     
      console.log("Ocultando ficha....");
      ocultarFichaAsociados();
    }
  });

  /* ________________________________________________
   Click Botón toggle Editar/Visualizar, cambia la perspectiva de span (lectura) a input y además
   se visualizarán estos botones:
    - Botón de Guardar
    - Botón Cancelar
    - Botón Eliminar
  */
  btEditVerAso.addEventListener("click", () => {
    if (posiblesCambiosPendientes2()) {
      //console.log("Seguimos en modo edición ya que hay cambios pendiente y el usuario quiere seguir editando.");
      return;
    }
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

    //editButton.textContent = editButton.textContent === 'Editar' ? 'Ver' : 'Editar';    
    // Estos botones solo visibles cuando haya edición de asociado
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
  });

  /* ________________________________________________ 
    Si es que se ha editado un campo, regresará los valores originales.
  */
  btRestValAso.addEventListener("click", () => {
    posiblesCambiosSeccionAso();
  });


  /*  ________________________________________________
 Clic Botón eliminar 
  Buscará la id del usuario a eliminar en el JSON
*/
  btEliminarAso.addEventListener("click", async () => {
    console.log("Eliminar usuario: " + idUsuario);
    const usuario = asociados.find(u => u.ID === idUsuario);
    const nombreCompleto = `${usuario.Nombre} ${usuario["Apellido Paterno"]}`;
    // Primero se pide confirmación.
    if (confirm(`¿Estás seguro de eliminar a ${nombreCompleto} (ID: ${idUsuario})?`)) {
      console.log("El usuario ha confirmado la eliminación.");
      limpiaObjeAso();
      idUsuarioEliminado = idUsuario;
      // JSON.stringify() toma un objeto de JavaScript y lo transforma en una cadena JSON.
      const destino = "EliminarAsociado";
      const val = JSON.stringify({ destino, elToken, elEstado, idUsuario, });
      btEliminarAso.innerHTML = "Espera un momento por favor...";
      deshabilitaBotonesAsociado();
      const resp = await enviarPOST(val);
      if (resp.success) {
        alert(resp.message);
        // Filtramos el usuario a eliminar        
        // Eliminamos solo al asociado en un array temporal
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

  /*  ________________________________________________ 
    Generar la credencial del asociado.
  */
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
          //console.log("Nombre: ", fieldId);          
          // Se obtiene el control de las entradas de datos:
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
        //console.log("Número de elementos: ", Object.keys(datos).length)
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
          console.log("Valor ingresado: ", resp.respuestaA);
          // Despuésde que el cambio se haya aceptado en GAS procedemos a modificar aquellos
          // campos en el JSON principal
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
        // Forzamos un cambio en el <select>        
        btGuardarAsociados.innerHTML = "Guardar";
        habilitaBotonesAsociado();
        clubSelect.value = "Todos los asociados";
        clubSelect.dispatchEvent(new Event('change'));
      }      
    }
    else {
      mostrarToast("Nada que guardar.");
    }
  });
}

// Ocultamos la ficha del asociado
function ocultarFichaAsociados() {
  //console.log("Ocultar fichas de asociados.");
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

/* Esta función hace la pregunta: ¿Hay cambios pendientes?
  Regresa:
    True -> Mantenerse en la página
    False -> Cambiar de club, de usuario o pestaña.
  Los parámetros
 */
function posiblesCambiosPendientes(control, valorAnterior) {
  const hayCambios = Object.values(objCambios).some(estado => estado);
  if (hayCambios) {
    // Mostrar cuadro de confirmación
    const confirmarCambio = confirm("¿Salir sin guardar?");
    if (!confirmarCambio) {
      // False .- significa que el usuario precionó "Cancelar"
      // Revertir el cambio si el usuario cancela
      console.log("El usuario quiere seguir editando sin salir.")
      control.value = valorAnterior; //      
      return true; // Salir sin cargar nuevo usuario
    } else {
      limpiaObjeAso();
      return false;
    }
  }
  //console.log("No ha habido cambios.");
  return false;
}

function posiblesCambiosPendientes2() {
  const hayCambios = Object.values(objCambios).some(estado => estado);
  if (hayCambios) {
    const confirmarCambio = confirm("¿Perder cambios?");
    if (!confirmarCambio) {
      // False .- significa que el usuario presionó "Cancelar"
      // o sea que quiere seguir editando.
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
      // False .- significa que el usuario presionó "Cancelar"
      // o sea que quiere seguir editando.
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


// $("fichaID").textContent = "Ficha del asociado  " + selectedUser.ID;
// fieldId - representa el nombre del arreglo, por ejemplo ID 'ID': {}
function populateForm(selectedUser) {
  Object.entries(fieldMapping).forEach(([fieldId, config]) => {
    // Campo de visualización (span)
    //console.log("El fieldID: ", fieldId); //<- el elemento span
    const viewField = $(fieldId);

    if (config.jsonKey === "ID") {
      viewField.textContent = "Asociado  [" + selectedUser[config.jsonKey] + "]";
    } else {
      //console.log("Esta es la llave: ", config.jsonKey);
      viewField.textContent = selectedUser[config.jsonKey] || '';
    }

    //console.log("La config.jsonkey: ", config.jsonKey)
    switch (config.jsonKey) {
      case 'Subfunción':
        revisaSubfuncion(selectedUser["Función"], selectedUser[config.jsonKey]);
        break;
      case 'Disciplinas':
        //const disciplinasUsuario = selectedUser[config.jsonKey];        
        //console.log("Las disciplinas seleccionadas", disciplinasSeleccionadas);
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
  // Por último la imagen
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
      // Eliminar iframe anterior si ya existe
      const anterior = contenedor.querySelector("iframe");
      if (anterior) contenedor.removeChild(anterior);
      // Eliminar img anterior si ya existe
      const otraAnterior = contenedor.querySelector("img");
      if (otraAnterior) contenedor.removeChild(otraAnterior);
      contenedor.appendChild(iframe);
    }
  }
}

/* Debido a que Función y Subfunción están relacionadas es necesario
  determinar si la opción elegida en Función tiene un submenú. Por lo
  que recibimos como parámetros la Función y el valor en Subfunción
*/
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
