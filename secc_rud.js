"use strict";

const btDescargar = $('descargarCSV');
const containerRUD = $('chkDivRUD');

function generarCheckboxesRUD() {

  containerRUD.innerHTML = ''; // Limpia si ya existen

  HEADER_ORDER.forEach(hdr => {
    const etiqueta = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = 'headersRUD';
    checkbox.value = hdr;
    checkbox.checked = HEADER_DEFAULTS.hasOwnProperty(hdr)
      ? HEADER_DEFAULTS[hdr]
      : true;
    etiqueta.appendChild(checkbox);
    etiqueta.appendChild(document.createTextNode(' ' + hdr));

    containerRUD.appendChild(etiqueta);
  });
}

btDescargar.addEventListener("click", () => {
  console.log("Visualizar descargas");
  // asociados
  const checkboxes = document.querySelectorAll('input[name="headersRUD"]:checked');
  //
  const headersRequeridos = [];
  checkboxes.forEach(checkbox => {        
    headersRequeridos.push(checkbox.value);
  });  
  const nombreArchivo = "asociados_" + elEstado;
  exportarCSV(headersRequeridos, nombreArchivo);
});


function exportarCSV(headersRequeridos, nombreArchivo) {  
  const headers = HEADER_ORDER.filter(h => headersRequeridos.includes(h));
  const filas = [headers];
  asociados.forEach(obj => {    
    const fila = headers.map(key => {      
      const val = obj[key] != null ? obj[key] : '';      
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    filas.push(fila);
  });
  
  const csvTexto = filas.map(f => f.join(',')).join('\r\n');
  
  const bom = '\uFEFF'; // para acentos en Excel
  const blob = new Blob([bom + csvTexto], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
