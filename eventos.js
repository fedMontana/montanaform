
window.addEventListener('DOMContentLoaded', () => {
  fetchDatosEventosYCompetencias();
  document.getElementById("comprobanteSeguro").value = "";
  //document.getElementById("comprobante").value = "";

  validarArchivoImagen("comprobanteSeguro", "previewSeguro");  
});

let base64Comprobante = null;
let imagenProcesadaOK = false;

async function fetchDatosEventosYCompetencias() {
  try {
    const res = await fetch(URL_ACTIVA);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("Datos recibidos:", data);

    if (data.success) {
      cargarFichas("eventos", data.eventos);
      cargarFichas("competencias", data.competencias);
      // ¡Oculta el loader!
      document.getElementById("loader").style.display = "none";
    } else {
      console.error("Error del servidor:", data.message || "Sin mensaje");
    }
  } catch (err) {
    console.error("Error al obtener datos:", err);
  }
}

function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const [anio, mes, dia] = fechaStr.split("-");
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  const nombreMes = meses[parseInt(mes, 10) - 1];
  return `${parseInt(dia, 10)} de ${nombreMes} de ${anio}`;
}

function formatearMoneda(valor) {
  if (isNaN(valor)) return valor; // si ya viene formateado
  return Number(valor).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  });
}

function cargarFichas(idContenedor, lista) {
  const contenedor = $(idContenedor);
  contenedor.innerHTML = '';

  lista.forEach((item, idx) => {
    //console.log("Revisando la imagen a ver qué onda");
    const esCompetencia = idContenedor === 'competencias';
    console.log("Revisando para dónde va ", esCompetencia);
    /* ----  Cartel  (base64 o enlace Drive) ---- */
    let cartelHTML = '';
    if (item.Imagen) {
      cartelHTML = item.Imagen.startsWith('data:image')
        ? `<img src="${item.Imagen}" alt="Cartel">`
        : `<iframe src="${adaptarLinkDrive(item.Imagen)}"
                   width="100%" height="220" frameborder="0" loading="lazy"></iframe>`;
    }

    /* ➜  Clave única para evitar colisiones */
    const key = `${idContenedor}-${idx}`;
    console.log("A ver la famosa key ", key);
    /* ----  Tarjeta  ---- */
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h2>${item.Nombre}</h2>
      ${item.Fecha ? `<p><strong>Fecha:</strong> ${formatearFecha(item.Fecha)}</p>` : ''}
      ${item.FechaIni && item.FechaFin
        ? `<p><strong>Fechas:</strong> ${formatearFecha(item.FechaIni)} – ${formatearFecha(item.FechaFin)}</p>` : ''}
      ${item.Duracion ? `<p><strong>Duración:</strong> ${item.Duracion}</p>` : ''}
      ${item.Lugar ? `<p><strong>Lugar:</strong> ${item.Lugar}</p>` : ''}
      ${item.Cuota ? `<p><strong>Cuota:</strong> ${formatearMoneda(item.Cuota)}</p>` : ''}
      ${item.Costo ? `<p><strong>Costo:</strong> ${formatearMoneda(item.Costo)}</p>` : ''}
      ${item.Categoria ? `<p><strong>Categoría:</strong> ${item.Categoria}</p>` : ''}
      ${item.Subcategoria ? `<p><strong>Subcategoría:</strong> ${item.Subcategoria}</p>` : ''}
      ${item.Rama ? `<p><strong>Rama:</strong> ${item.Rama}</p>` : ''}
      ${item.FechaLimite ? `<p><strong>Inscripción hasta:</strong> ${item.FechaLimite}</p>` : ''}
      ${item.DatosPago ? `<p><strong>Datos de pago:</strong> ${item.DatosPago}</p>` : ''}
      ${cartelHTML}

      <button class="btn-registrar"
              onclick="mostrarFormulario('${key}')">Registrarme</button>

      <!-- FORMULARIO INLINE OCULTO -->
      <div id="formContainer-${key}" class="form-inline" style="display:none;">
        <form id="formRegistro-${key}" data-key="${key}" data-tipo="${esCompetencia ? 'competencia' : 'evento'}">
          <label>Nombre completo:<input type="text" name="nombre" required></label>
          <label>ID o CURP:<input type="text" name="id" required></label>
          <label>E-mail:<input type="email" name="email" required></label>

          <label>Comprobante de pago:
            <input type="file" name="comprobante"
                   id="comp-${key}" accept="image/jpeg,image/png" required>
          </label>
          <div id="prev-${key}"></div>

          <!-- Campos extra SOLO para competencias -->
          <div class="extraComp" ${esCompetencia ? '' : 'style="display:none;"'}>
            <label>Estatura (cm):<input type="text" name="estatura" ${esCompetencia ? 'required' : ''}></label>
            <label>Talla de playera:
              <select name="talla" ${esCompetencia ? 'required' : ''}>
                <option value="">Selecciona</option>
                <option value="Chica">Chica</option>
                <option value="Mediana">Mediana</option>
                <option value="Grande">Grande</option>
                <option value="Extragrande">Extragrande</option>
              </select>
            </label>
          </div>

          <button type="submit">Enviar registro</button>
        </form>
      </div>

      <div class="contacto">
        ${item.AsociacionOrg ? `<p><strong>Asociación:</strong> ${item.AsociacionOrg}</p>` : ''}
        ${item.Telefono ? `<p><strong>Tel.:</strong> ${item.Telefono}</p>` : ''}
        ${item.Correo ? `<p><strong>Email:</strong> <a href="mailto:${item.Correo}">${item.Correo}</a></p>` : ''}
        ${item.WebPage ? `<p><strong>Web:</strong> <a href="${item.WebPage}" target="_blank">${item.WebPage}</a></p>` : ''}
      </div>
    `;

    /* Guardamos algunos metadatos en dataset para el envío */
    card.dataset.nombreEvento = item.Nombre;
    card.dataset.correoOrg = item.CorreoOrg || item.Correo || '';
    card.dataset.asociacionOrg = item.AsociacionOrg || '';

    contenedor.appendChild(card);

    /* === Activamos validación de la imagen para este formulario === */
    validarArchivoImagen(`comp-${key}`, `prev-${key}`);
    /* === Listener de envío de este formulario específico === */
    document.getElementById(`formRegistro-${key}`).addEventListener('submit', e => enviarRegistroInline(e, card));

  });
}

/* ============  Mostrar / ocultar el form de una ficha  ============ */
function mostrarFormulario(key) {
  console.log("Nombre del formulario: ", key);
  const div = document.getElementById(`formContainer-${key}`);
  div.style.display = div.style.display === 'none' ? 'block' : 'none';
  setTimeout(() => {
    div.querySelector('button[type="submit"]')
      .scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
}

let tipoActual = "evento"; // o "competencia", lo definimos al abrirModal()
let nombreCompEvento = "";
let correoOrganizador = "";
let asociacionOrganizador = "";

/* ============  Envío AJAX del formulario inline  ============ */
async function enviarRegistroInline(event, card) {
  event.preventDefault();
  const form = event.target;
  const key  = form.dataset.key;            // ← “eventos-2” ó “competencias-0”

  const tipo = form.dataset.tipo;               // evento | competencia
  const datos = new FormData(form);
  /* Validamos imagen procesada */
  if (!imagenProcesadaOK || !base64Comprobante) {
    mostrarToast('Selecciona una imagen válida antes de enviar.');
    return;
  }
  /* Construimos payload */
  const payload = {
    destino: tipo === 'evento' ? 'registroEvento' : 'registroCompetencia',
    nombreCompEvento: card.dataset.nombreEvento,
    correoOrganizador: card.dataset.correoOrg,
    asociacionOrg: card.dataset.asociacionOrg,

    nombre: datos.get('nombre'),
    emailUsuario: datos.get('email'),
    idParticipante: datos.get('id'),
    talla: tipo === 'competencia' ? datos.get('talla') : null,
    estatura: tipo === 'competencia' ? datos.get('estatura') : null,
    comprobante: base64Comprobante
  };
  /* Spinner simple */
  form.querySelector('button').textContent = 'Enviando...';
  form.querySelector('button').disabled = true;
  //console.log(JSON.stringify(payload));
  try {
    const res = await fetch(URL_ACTIVA0, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const resp = await res.json();
    console.log("Los datos recibidos: ", resp);
    if (resp.success) {
      console.log("Respuesta exitosa");
      mostrarToast('¡Registro enviado correctamente!');
      form.reset();
      //document.getElementById(`prev-${form.id.split('-')[1]}`).innerHTML = '';
      document.getElementById(`prev-${key}`).innerHTML = '';
      base64Comprobante = null;  // limpiar globals
      imagenProcesadaOK = false;
      form.parentElement.style.display = 'none'; // ocultar nuevamente
    } else {
      alert('Error: ' + (resp.message || 'sin detalle'));
    }
  } catch (err) {
    console.error(err);
    alert('Ocurrió un error al enviar el registro.');
  }

  form.querySelector('button').textContent = 'Enviar registro';
  form.querySelector('button').disabled = false;
}

function adaptarLinkDrive(link) {
  const match = link.match(/[-\w]{25,}/);
  return match ? `https://drive.google.com/file/d/${match[0]}/preview` : '';
}

// Oculta spinner y reactiva botón
function resetearFormulario() {
  document.getElementById("spinnerEnvio").style.display = "none";
  const btn = document.getElementById("enviarRegistro");
  btn.disabled = false;
  btn.textContent = "Enviar registro";
}


document.getElementById("formularioSeguro").addEventListener("submit", async e => {
  e.preventDefault();

  const btn = $("enviarSeguro");
  const spinner = $("spinnerSeguro");
  btn.disabled = true;
  btn.textContent = "Enviando...";
  spinner.style.display = "block";

  const nombre = $("nombreSeguro").value.trim();
  const id = $("idSeguro").value.trim();
  const email = $("emailSeguro").value.trim();

  if (!imagenProcesadaOK || !base64Comprobante) {
    console.log("Por favor selecciona una imagen válida antes de enviar.");
    mostrarToast("Por favor selecciona una imagen válida antes de enviar.");
    resetearSeguro();
    return;
  }
  if (!nombre || !id || !email) {
    alert("Por favor completa todos los campos.");
    resetearSeguro();
    return;
  }

  try {
    const payload = {
      destino: "pagoSeguroMed",
      nombre,
      idParticipante: id,
      emailUsuario: email,
      comprobante: base64Comprobante
    };

    const res = await fetch(URL_ACTIVA0, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      const info = "El recibo de pago ha sido enviado correctamente. " + data.message;
      console.log(info);
      mostrarToast(info);
      $("formularioSeguro").reset();
    } else {
      alert("Error al enviar: " + (data.message || "sin detalle"));
    }
  } catch (err) {
    console.error(err);
    alert("Ocurrió un error inesperado.");
  }
  $('enviarSeguro').textContent = "Comprobante enviado";
  $("enviarSeguro").disabled = true;
  document.getElementById("comprobanteSeguro").value = "";
  resetearSeguro();
});

function resetearSeguro() {
  $("enviarSeguro").disabled = false;
  $("enviarSeguro").textContent = "Enviar comprobante";
  $("spinnerSeguro").style.display = "none";
}
