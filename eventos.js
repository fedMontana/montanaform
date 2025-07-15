
window.addEventListener('DOMContentLoaded', () => {
  fetchDatosEventosYCompetencias();
  
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
    
    const esCompetencia = idContenedor === 'competencias';
        
    let cartelHTML = '';
    if (item.Imagen) {
      cartelHTML = item.Imagen.startsWith('data:image')
        ? `<img src="${item.Imagen}" alt="Cartel">`
        : `<iframe src="${adaptarLinkDrive(item.Imagen)}"
                   width="100%" height="220" frameborder="0" loading="lazy"></iframe>`;
    }
    
    const key = `${idContenedor}-${idx}`;
        

    let opcionesPlayera = '<option value="">Selecciona</option>';
    if (esCompetencia && item.Playeras) {
      const tallas = item.Playeras.split(',').map(t => t.trim());
      opcionesPlayera += tallas.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    let opcionesCategoria = '<option value="">Selecciona</option>';
    if (esCompetencia && item.Categoria) {
      const laCategoria = item.Categoria.split(',').map(t => t.trim());
      opcionesCategoria += laCategoria.map(t => `<option value="${t}">${t}</option>`).join('');
    }
    let opcionesRama = '<option value="">Selecciona</option>';
    if (esCompetencia && item.Rama) {
      const laRama = item.Rama.split(',').map(t => t.trim());
      opcionesRama += laRama.map(t => `<option value="${t}">${t}</option>`).join('');
    }

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
          <label>Nombre:<input type="text" name="nombre" placeholder="Tu nombre" required></label>
          <label>Apellido paterno:<input type="text" name="apellidoPaterno" placeholder="Tu apellido paterno" required></label>
          <label>Apellido materno:<input type="text" name="apellidoMaterno" placeholder="Tu apellido materno" required></label>
          <label>ID o CURP:<input type="text" name="id" required></label>
          <label>E-mail:<input type="email" name="email" required></label>
          <label>Teléfono:<input type="text" name="rtelefono" placeholder="Teléfono a 10 dígitos" required maxlength="10"></label>

          <label>Comprobante de pago:
            <input type="file" name="comprobante"
                   id="comp-${key}" accept="image/jpeg,image/png" required>
          </label>
          <div id="prev-${key}"></div>

          <!-- Campos extra SOLO para competencias -->
          <div class="extraComp" ${esCompetencia ? '' : 'style="display:none;"'}>
            <label>Estatura (cm):<input type="text" name="estatura" ${esCompetencia ? 'required' : ''}></label>
            <label>Rama:
              <select name="larama" ${esCompetencia ? 'required' : ''}>
                ${opcionesRama}
              </select>
            </label>
            <label>Categoría:
              <select name="catego" ${esCompetencia ? 'required' : ''}>
                ${opcionesCategoria}
              </select>
            </label>
            <label>Talla de playera:
              <select name="talla" ${esCompetencia ? 'required' : ''}>
                ${opcionesPlayera}
              </select>
            </label>            
          </div>
          <br>
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

    card.dataset.nombreEvento = item.Nombre;
    card.dataset.correoOrg = item.CorreoOrg || item.Correo || '';
    card.dataset.asociacionOrg = item.AsociacionOrg || '';

    contenedor.appendChild(card);
    
    validarArchivoImagen(`comp-${key}`, `prev-${key}`);
    
    document.getElementById(`formRegistro-${key}`).addEventListener('submit', e => enviarRegistroInline(e, card));

  });
}

function mostrarFormulario(key) {
  console.log("Nombre del formulario: ", key);
  const div = document.getElementById(`formContainer-${key}`);
  div.style.display = div.style.display === 'none' ? 'block' : 'none';
  setTimeout(() => {
    div.querySelector('button[type="submit"]')
      .scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, 100);
}

let tipoActual = "evento";
let nombreCompEvento = "";
let correoOrganizador = "";
let asociacionOrganizador = "";

async function enviarRegistroInline(event, card) {
  event.preventDefault();
  const form = event.target;
  const key = form.dataset.key;

  const tipo = form.dataset.tipo;
  const datos = new FormData(form);
  
  if (!imagenProcesadaOK || !base64Comprobante) {
    mostrarToast('Selecciona una imagen válida antes de enviar.');
    return;
  }
  const nombreCompleto = datos.get('nombre') + " " + datos.get('apellidoPaterno') + " " + datos.get('apellidoMaterno');
  const payload = {
    destino: tipo === 'evento' ? 'registroEvento' : 'registroCompetencia',
    nombreCompEvento: card.dataset.nombreEvento,
    correoOrganizador: card.dataset.correoOrg,
    asociacionOrg: card.dataset.asociacionOrg,

    nombre: nombreCompleto,
    emailUsuario: datos.get('email'),
    telefonoUsuario: datos.get('rtelefono'),
    idParticipante: datos.get('id'),
    talla: tipo === 'competencia' ? datos.get('talla') : null,
    categoria: tipo === 'competencia' ? datos.get('catego') : null,
    rama: tipo === 'competencia' ? datos.get('larama') : null,
    estatura: tipo === 'competencia' ? datos.get('estatura') : null,
    comprobante: base64Comprobante
  };

  form.querySelector('button').textContent = 'Enviando...';
  form.querySelector('button').disabled = true;

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

function resetearFormulario() {
  document.getElementById("spinnerEnvio").style.display = "none";
  const btn = document.getElementById("enviarRegistro");
  btn.disabled = false;
  btn.textContent = "Enviar registro";
}
