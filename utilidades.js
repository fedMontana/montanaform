
/* GAS - Acceso-Login [Nombre del archivo: Acceso]
   (doPOST)
   - Envío de credenciales para acceso y si es exitoso devuelve los
     datos de los asociados.
   (doGet)
  - Recupera la información de los eventos y competencias
 */
const URL_ACTIVA = "https://script.google.com/macros/s/AKfycbyyWMRoakKorwGZIrOpRTl3x4F-YxJrzmS25cXbT6Bf3-pcSMEoMzekDY9mrOvAZGmY5A/exec"; //prueba33


// GAS - (doGet) Acceso-Login. [Nombre de archivo: Acceso]
//?????
//const URL_DATOS = 'https://script.google.com/macros/s/AKfycby2ncpiLXY6vWg2hOQ4XGYCLcvcJnesYaYY6037eXDlxiKl3UT8o8BkbsZd4fAD59YZsA/exec';

/* GAS - Ingreso-Datos. [Nombre de archivo: Asociados]
  (doPOST)
    - Envío de formulario
    - Envío de contratación de seguro médico, eventos o de competencias
  (doGET)
    - Solicita el nombre de las asociaciones y sus respectivos clubes.
*/
const URL_ACTIVA0 = 'https://script.google.com/macros/s/AKfycbw7TX3aK6ddk7q8qqML4VF9DkDWoRebNIOY6bzQOVmAsb1gvsgljHyp08LkZQVOtTP-/exec'

//
function $(id) {
  return document.getElementById(id);
}

// Get value
function GV(id) {
  const x = document.getElementById(id);
  return x.value;
}

// Limpia la entrada
function CLi(id) {
  const x = $(id);
  x.value = '';
}

// Regresamos el value de los elementos
function VL(id) {
  const x = $(id).value;
  return x;
}

//
const estados = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México (Edo.)",
  "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
  "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora",
  "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"
];

const disciplinasArray = [
  "Alta Montaña",
  "Barranquismo",
  "Escalada Deportiva",
  "Escalada en roca",
  "Espeleología",
  "Senderismo",
  "Vía Ferrata",
  "Escalada en hielo"
];

const ramaArray = [
  "Varonil",
  "Femenil",
  "Mixto"
];

const categoriaArray = [
  "Master",
  "Absoluta",
  "U21: Junior",
  "U19: Youth A (YA) Juvenil A",
  "U17: Youth B (YB) Juvenil B",
  "U15: Youth C (YC) Juvenil C",
  "U13: Youth D (YD)	Juvenil D",
  "Infantil A",
  "Infantil B",
  "Infantil C"
];

const playeraArray = [
  "Chica",
  "Mediana",
  "Grande",
  "Extragrande"
];

const tipoSangre = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

const elGenero = ["Masculino", "Femenino"];

const la_Escolaridad = [
  "Primaria", "Secundaria", "Media superior", "Superior"
];

const funcion = [
  "Deportista", "Entrenador", "Fisiatra", "Juez/Árbitro", "Personal administrativo", "Prensa",
  "Voluntariado", "Personal técnico", "Consejo directivo", "Servicio médico"
];

const funcion_personalTec = [
  "Equipador de rutas", "Equipador de barrancos", "Registro de senderos", "Medio ambiente", "Acceso", "Seguridad", "Armador de bloques"
];
const funcion_consejo = [
  "Presidente club", "Vicepresidente club", "Secretario club", "Presidente asociación", "Vicepresidente asociación",
  "Tesorero asociación", "Secretario asociación", "Vocal directivo asociación", "Vocal deportivo asociacón", "Comisario asociación", "Representante jurídico asociación"
];

const funcion_serMed = [
  "Médico", "Psicólogo", "Nutriólogo"
];


const fieldMapping = {
  'fichaID': {
    jsonKey: 'ID',
    editType: 'text'
  },
  'nombre': {
    jsonKey: 'Nombre',  // Nombre del par clave en el JSON recibido
    editType: 'text' // input type="text"
  },
  'apellidoPaterno': {
    jsonKey: 'Apellido Paterno',
    editType: 'text'
  },
  'apellidoMaterno': {
    jsonKey: 'Apellido Materno',
    editType: 'text'
  },
  'fechaNacimiento': {
    jsonKey: 'Fecha de nacimiento',
    editType: 'date'
  },
  'telefono': {
    jsonKey: 'Teléfono',
    editType: 'text'
  },
  'email': {
    jsonKey: 'Correo',
    editType: 'email'
  },
  'curp': {
    jsonKey: 'CURP',
    editType: 'text'
  },
  'genero': {
    jsonKey: 'Género',
    editType: 'select'
  },
  'escolaridad': {
    jsonKey: 'Escolaridad',
    editType: 'select'
  },
  'estado': {
    jsonKey: 'Estado',
    editType: 'select'
  },
  'municipio': {
    jsonKey: 'Municipio',
    editType: 'text'
  },
  'colonia': {
    jsonKey: 'Colonia',
    editType: 'text'
  },
  'calleNum': {
    jsonKey: 'Calle y número',
    editType: 'text'
  },
  'zip': {
    jsonKey: 'C.P.',
    editType: 'text'
  },
  'contEmergencia': {
    jsonKey: 'Contacto emergencia',
    editType: 'text'
  },
  'telEmergencia': {
    jsonKey: 'Teléfono emergencia',
    editType: 'text'
  },
  'enfermedades': {
    jsonKey: 'Enfermedades',
    editType: 'text'
  },
  'alergias': {
    jsonKey: 'Alergias',
    editType: 'text'
  },
  'tipoSangre': {
    jsonKey: 'Tipo de sangre',
    editType: 'select'
  },
  'club': {
    jsonKey: 'Club',
    editType: 'select'
  },
  'disciplinas': {
    jsonKey: 'Disciplinas',
    editType: 'text'
  },
  'funcion': {
    jsonKey: 'Función',
    editType: 'select'
  },
  'subfuncion': {
    jsonKey: 'Subfunción',
    editType: 'select'
  }
};

/* A la izquierda van los nombres de los controles usados en el formulario
y a la derecha el nombre del valor recibido del JSON.*/
const fieldMappingEventos = {
  'eventName': 'Nombre del evento',
  'eventStart': 'Fecha Inicial',
  'eventEnd': 'Fecha Final',
  'eventDuration': 'Duración',
  'eventLocation': 'Lugar del evento',
  'eventFee': 'Cuota de recuperación',
  'registrationDeadline': 'Fecha límite inscripción',
  'depositInfo': 'Datos depósito',
  'eventPoster': 'Imagen',
  'contactPhone': 'Informes Teléfono',
  'contactEmail': 'Informes correo',
  'contactLink': 'Informes link página',
};
// 'organizador': 'Usuario Organizador'
// Falta la asociación y la foto


const fieldMappingCompetencia = {
  "competenciaName": "Nombre competencia",
  "competenciStart": "Fecha Competencia",
  "competenciaLugar": "Lugar",
  "competenciaRama": "Rama",
  "competenciaCategoria": "Categoría",
  "competenciaSubcategoria": "Sub-categoría",
  "competenciaCosto": "Costo",
  "competenciaDDeposito": "Datos depósito",
  "competenciaImg":"Imagen",
  "competenciaCelular": "Celular",
  "competenciaCorreo": "Correo",
  "competenciaWeb": "Página web",  
};
// Falta cartel




/* Al momento de cargar una imagen se visualizará un preview
   en <div id="imagePreview"></div> 
Parámetros:
  inputID  --> Control input, por ejemplo: <input type="file" id="fileInput" accept="image/jpeg,image/png">
  previewID -> Control a previsualizar la image, ejemplo: <div id="imagePreview"></div>
  --------
Esta función además usa dos variables globales que deben ser declaradas:
    base64Comprobante e imagenProcesadaOK
*/
function validarArchivoImagen(inputID, previewID) {
  const input = document.getElementById(inputID);
  const preview = document.getElementById(previewID);

  // Acá agregamos el listener para que cuando el usuario cargue una imagen se analice.
  input.addEventListener("change", async e => {
    console.log("Procesando imagen....");
    const archivo = e.target.files[0];
    preview.innerHTML = "";
    // Variables globales
    base64Comprobante = null;
    imagenProcesadaOK = false;

    if (!archivo) return;

    if (archivo.type === "image/bmp") {
      mostrarToast("Formato .bmp no permitido. Usa JPG o PNG");
      input.value = ""; // limpia el campo
      return;
    }    
    try {
      /* Pedimos salida con peso incluido */
      const { base64, kb } = await convertirArchivoABase64(archivo, true);
      console.log(` Conversión final (${archivo.name}): ${kb} KB`);
      base64Comprobante = base64;
      imagenProcesadaOK = true;

      const img = document.createElement('img');
      img.src = URL.createObjectURL(archivo);
      img.style.maxWidth = '100%';
      img.style.marginTop = '10px';
      preview.appendChild(img);

    } catch (err) {
      mostrarToast(err);      // mensaje claro al usuario
      console.warn(err);
      input.value = '';       // reseteamos selección
    }
  });
}

/*
 * convertirArchivoABase64(archivo,  debug = false)
 *  – Admite JPG / PNG  (los PNG se convierten a JPG dentro del canvas)
 *  – Devuelve {base64, kb}  si debug === true
 *  – Devuelve solo base64     si debug === false
 */
function convertirArchivoABase64(archivo, debug) {
  const LIMITE_KB = 250;            // cambia a tu gusto
  return new Promise((resolve, reject) => {
    const intentar = (calidad) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          /* Creamos canvas y redimensionamos */
          const MAX_W = 800;
          const esc = Math.min(1, MAX_W / img.width);
          const w = img.width * esc;
          const h = img.height * esc;

          const cv = document.createElement('canvas');
          cv.width = w;
          cv.height = h;
          const ctx = cv.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          /* 🔍  Elegimos formato de salida:
                 – Si era PNG ⇒ lo convertimos a JPEG para comprimir
                 – Si era JPEG, sigue igual
          */
          const mimeSalida = 'image/jpeg';
          const base64 = cv.toDataURL(mimeSalida, calidad);   // calidad 0.4–0.9
          const kb = Math.round((base64.length * 3) / 4 / 1024);

          if (kb > LIMITE_KB && calidad > 0.4) {
            // nuevo intento con calidad más baja
            console.log("Intento último");
            return intentar(0.4);
          }
          if (kb > LIMITE_KB) {
            console.log("Imagen muy grande");
            return reject(`Imagen demasiado grande (${kb} KB)`);
          }
          // Éxito
          if (debug) {
            console.log("Éxito dice...");
            return resolve({ base64, kb });
          }
          resolve(base64);
        };
        img.onerror = () => reject('Error al cargar imagen');
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    };

    if (!/^image\/(jpeg|png)$/i.test(archivo.type)) {
      return reject('Formato no soportado (solo JPG / PNG)');
    }
    intentar(0.7);    // primer intento con calidad 0.7
  });
}

/* PREVIO
try {      
      base64Comprobante = await convertirArchivoABase64(archivo);
      imagenProcesadaOK = true;
      //
      const img = document.createElement("img");
      img.src = URL.createObjectURL(archivo);
      img.style.maxWidth = "100%";
      img.style.border = "1px solid #666";
      img.style.borderRadius = "6px";
      img.style.marginTop = "10px";
      preview.appendChild(img);

    } catch (err) {
      console.log("No se pudo procesar la imagen...");
      mostrarToast("No se pudo procesar la imagen seleccionada.");
    }

*/

/* archivo contiene:
{ name: "4e5ad46ab811e06e767519a28276025f.jpg", 
 lastModified: 1640195345377, 
 webkitRelativePath: "", 
 size: 19981, 
 type: "image/jpeg" }
*/
function _convertirArchivoABase64(archivo) {
  console.log("Convirtiendo archivo");
  return new Promise((resolve, reject) => {
    const intentarCompresion = (calidad) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = e => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxAncho = 800;
          const escala = maxAncho / img.width;
          canvas.width = Math.min(maxAncho, img.width);
          canvas.height = img.height * escala;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const base64 = canvas.toDataURL('image/jpeg', calidad);
          const tamañoKB = Math.round((base64.length * 3) / 4 / 1024);

          if (tamañoKB > 500 && calidad > 0.4) {
            mostrarToast(`La imagen es grande (${tamañoKB} KB). Intentando más compresión...`);
            return intentarCompresion(0.4); // intento final
          }

          if (tamañoKB > 500) {
            mostrarToast(`La imagen sigue siendo muy pesada (${tamañoKB} KB). Usa otra más ligera.`);
            return reject("Imagen demasiado grande después de dos intentos");
          }

          resolve(base64);
        };

        img.onerror = () => reject("Error al cargar imagen");
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    };

    if (archivo.type === "image/bmp") {
      mostrarToast("Formato .bmp no permitido. Usa JPG o PNG");
      return reject("Formato no soportado");
    }

    if (archivo.size <= 220 * 1024) {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(archivo);
    } else {
      intentarCompresion(0.6);
    }
  });
}


function mostrarToast(mensaje, duracion = 3000) {
  const toast = $("toast");
  toast.textContent = mensaje;
  toast.className = "toast show";
  setTimeout(() => {
    toast.className = "toast"; // quita la clase .show
  }, duracion);
}
