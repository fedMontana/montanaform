"use strict";


const selectClubes = $("clubesSelect");
const inputClub = $("clubNombreInput");
const form = $("clubForm");

function inicializarClubes() {
  // Llenar selector
  selectClubes.innerHTML = "";
  selectClubes.innerHTML = '<option value="">Selecciona un club</option>';
  losClubes.forEach(club => {
    const op = document.createElement("option");
    op.value = club;
    op.textContent = club;
    selectClubes.appendChild(op);
  });

  // Mostrar datos al seleccionar
  selectClubes.addEventListener("change", () => {
    if (selectClubes.value) {
      inputClub.value = selectClubes.value;
      form.style.display = "block";
    } else {
      form.style.display = "none";
    }
  });

  // Guardar cambios
  $("guardarClubBtn").addEventListener("click", async () => {
    const original = selectClubes.value;
    const nuevo = inputClub.value.trim();
    console.log("Nuevo nombre: ", nuevo);

    if (!nuevo) return alert("Ingresa un nombre válido.");
    { //Ortus hikers
      if (confirm(`¿Renombrar "${original}" por "${nuevo}"?`)) {
        // 
        const val = enviarDatosClub("Editar", original, nuevo);
        console.log(val);
        const resp = await enviarPOST(val);
        alert(resp.message);
        const i = losClubes.indexOf(original);
        if (i !== -1) losClubes[i] = nuevo;
        alert(`Club actualizado: ${original} → ${nuevo}`);
        inicializarClubes(); // recargar lista  
      }

    }
  });

  // Eliminar club
  $("eliminarClubBtn").addEventListener("click", async () => {
    const aEliminar = selectClubes.value;
    if (confirm(`¿Eliminar el club "${aEliminar}"?`)) {
      const val = enviarDatosClub("Eliminar", aEliminar, "");
      console.log(val);
      const resp = await enviarPOST(val);
      alert(resp.message);
      losClubes = losClubes.filter(c => c !== aEliminar);
      alert("Club eliminado.");
      inicializarClubes();
    }
  });

  // Agregar nuevo club
  $("agregarClubBtn").addEventListener("click", async () => {
    const nuevo = $("nuevoClubInput").value.trim();
    if (!nuevo) return alert("Ingresa un nombre.");
    if (losClubes.includes(nuevo)) return alert("Ese club ya existe.");
    {
      losClubes.push(nuevo);
      alert("Nuevo club agregado.");
      $("nuevoClubInput").value = "";
      const val = enviarDatosClub("Agregar", nuevo, "");
      console.log(val);
      const resp = await enviarPOST(val);
      alert(resp.message);
      inicializarClubes();
    }
  });
}

function enviarDatosClub(subDestino, clubTarget, nuevoNombre) {
  let destino = "Clubes";
  const datos = {};
  datos["subDestino"] = subDestino;
  datos["clubTarget"] = clubTarget;
  datos["estado"] = elEstado;
  if (nuevoNombre !== "")
    datos["nuevoNombre"] = nuevoNombre;
  const val = JSON.stringify({ destino, datos });
  return val;
}

// Cuando se cambie el nombre de un club también se deberá cambiar en el
// array de los asociados
