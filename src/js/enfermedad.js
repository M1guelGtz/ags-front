// ============================================
// 1. SISTEMA DE ALERTAS PERSONALIZADAS
// ============================================

// Inyectar estilos CSS para las alertas si no existen
if (!document.getElementById('estilos-alertas')) {
  const estilosAlerta = document.createElement('style');
  estilosAlerta.id = 'estilos-alertas';
  estilosAlerta.textContent = `
    .alerta-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background-color: rgba(0, 0, 0, 0.6); display: none;
      justify-content: center; align-items: center; z-index: 10001;
    }
    .alerta-overlay.active { display: flex !important; }
    .alerta-container {
      background: white; border-radius: 12px; max-width: 400px; width: 90%;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); animation: alertaSlideIn 0.3s ease;
    }
    @keyframes alertaSlideIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
    .alerta-header {
      padding: 20px; border-radius: 12px 12px 0 0; display: flex; align-items: center; gap: 15px; color: white;
    }
    .alerta-header.error { background-color: #dc3545; }
    .alerta-header.success { background-color: #28a745; }
    .alerta-header.warning { background-color: #ffc107; color: #333; }
    .alerta-header.info { background-color: #17a2b8; }
    .alerta-icon { font-size: 2rem; }
    .alerta-title { margin: 0; font-size: 1.2rem; font-weight: bold; }
    .alerta-body { padding: 25px; text-align: center; }
    .alerta-message { font-size: 1rem; color: #333; line-height: 1.6; }
    .alerta-footer { padding: 15px 20px; display: flex; justify-content: center; border-top: 1px solid #e0e0e0; }
    .btn-alerta-ok {
      padding: 10px 30px; border: none; border-radius: 8px; cursor: pointer;
      font-weight: bold; font-size: 0.95rem; background-color: rgba(114, 158, 100, 1);
      color: white; transition: all 0.3s ease;
    }
    .btn-alerta-ok:hover { background-color: rgba(94, 138, 80, 1); transform: translateY(-2px); }
  `;
  document.head.appendChild(estilosAlerta);
}

// Crear modal de alerta en el DOM
const modalAlerta = document.createElement('div');
modalAlerta.classList.add('alerta-overlay');
modalAlerta.innerHTML = `
  <div class="alerta-container">
    <div class="alerta-header" id="alertaHeader">
      <i class="fas fa-info-circle alerta-icon" id="alertaIcon"></i>
      <h3 class="alerta-title" id="alertaTitle">Alerta</h3>
    </div>
    <div class="alerta-body">
      <p class="alerta-message" id="alertaMessage"></p>
    </div>
    <div class="alerta-footer">
      <button class="btn-alerta-ok" id="btnAlertaOk">Aceptar</button>
    </div>
  </div>
`;
document.body.appendChild(modalAlerta);

const alertaHeader = document.getElementById('alertaHeader');
const alertaIcon = document.getElementById('alertaIcon');
const alertaTitle = document.getElementById('alertaTitle');
const alertaMessage = document.getElementById('alertaMessage');
const btnAlertaOk = document.getElementById('btnAlertaOk');

function mostrarAlerta(mensaje, tipo = 'info') {
  alertaHeader.className = 'alerta-header ' + tipo;
  
  const config = {
    error: { icon: 'fa-exclamation-circle', title: 'Error' },
    success: { icon: 'fa-check-circle', title: 'Éxito' },
    warning: { icon: 'fa-exclamation-triangle', title: 'Advertencia' },
    info: { icon: 'fa-info-circle', title: 'Información' }
  };

  const tipoConfig = config[tipo] || config.info;
  alertaIcon.className = `fas ${tipoConfig.icon} alerta-icon`;
  alertaTitle.textContent = tipoConfig.title;
  alertaMessage.textContent = mensaje;
  
  modalAlerta.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarAlerta() {
  modalAlerta.classList.remove('active');
  document.body.style.overflow = 'auto';
}

btnAlertaOk.addEventListener('click', cerrarAlerta);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalAlerta.classList.contains('active')) {
    cerrarAlerta();
  }
});


// ============================================
// 2. VARIABLES Y SELECTORES
// ============================================

let enfermedades = [];

const modal = document.getElementById('modalAgregarEnfermedad');
const btnGuardar = document.getElementById('btnGuardarEnfermedad');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnAgregar = document.querySelector('.btn-agregar');
const tablaEnfermedades = document.querySelector('.tabla-animales');
const buscador = document.querySelector('.buscador input');

// Inputs
const inputNombre = document.getElementById('nombre');
const inputTipo = document.getElementById('tipo');
const inputSintomas = document.getElementById('sintomas');
const inputDuracion = document.getElementById('duracion');
const inputTratamientos = document.getElementById('tratamientos');
const selectRiesgo = document.getElementById('riesgo');
const inputTransmision = document.getElementById('transmision');

// Modal Visualizar
const modalVisualizar = document.getElementById('modalVisualizarEnfermedad');
const contenidoEnfermedad = document.getElementById('contenidoEnfermedad');
const btnCerrarVisualizar = document.getElementById('btnCerrarVisualizar');

let editIndex = null;
let enfermedadAEliminar = null;


// ============================================
// 3. HELPERS (AUTH & ROLES)
// ============================================

async function getAuthHeaders(){
  const token = localStorage.getItem('token') || '';
  const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
  let idUsuarioHeader = '';
  if(datosUsuarioRaw){
    try{ const parsed = JSON.parse(datosUsuarioRaw); if(parsed && (parsed.idUsuario||parsed.id)) idUsuarioHeader = String(parsed.idUsuario||parsed.id); else if(parsed && parsed.usuario) idUsuarioHeader = String(parsed.usuario); }
    catch(e){ idUsuarioHeader = String(datosUsuarioRaw); }
  }
  return {
    'Content-Type': 'application/json',
    ...(token? { 'Authorization': `Bearer ${token}` } : {}),
    ...(idUsuarioHeader? { 'Id-Usuario': idUsuarioHeader } : {})
  };
}

function getCurrentUserRole(){
  const datosStr = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
  if(!datosStr) return '';
  try{ const d = JSON.parse(datosStr); return (d.rolNombre || (d.rol && (d.rol.nombre || (d.rol.idRol===1?'Administrador':''))) || d.rol || '').toString().toLowerCase(); }catch(e){ return String(datosStr).toLowerCase(); }
}
function isVeterinario(){ const r = getCurrentUserRole(); return r.includes('veterinario') || r.includes('vet'); }
function isAdmin(){ const r = getCurrentUserRole(); return r.includes('admin') || r.includes('administrador'); }


// ============================================
// 4. MODAL ELIMINAR
// ============================================

const modalEliminar = document.createElement('div');
modalEliminar.id = 'modalEliminarEnfermedad';
modalEliminar.classList.add('modal-overlay');
modalEliminar.innerHTML = `
  <div class="modal-container">
    <div class="modal-header-custom">
      <h2 class="modal-title-custom">
        <i class="fas fa-trash-alt"></i> Eliminar Enfermedad
      </h2>
      <button onclick="cerrarModalEliminar()" class="btn-close-custom">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body-custom">
      <div class="modal-icon-warning" style="background-color: #f8d7da;">
        <i class="fas fa-exclamation-triangle" style="color: #721c24;"></i>
      </div>
      <p class="modal-message">¿Estás seguro de eliminar esta enfermedad?</p>
      <p class="modal-submessage" id="mensajeEliminarEnfermedad">
        Esta acción no se puede deshacer.
      </p>
    </div>
    <div class="modal-footer-custom">
      <button onclick="cerrarModalEliminar()" class="btn-modal-cancelar">
        Cancelar
      </button>
      <button onclick="confirmarEliminarEnfermedad()" class="btn-modal-confirmar">
        Eliminar
      </button>
    </div>
  </div>
`;
document.body.appendChild(modalEliminar);

function abrirModalEliminar(enfermedad) {
  enfermedadAEliminar = enfermedad;
  document.getElementById('mensajeEliminarEnfermedad').textContent =
    `Se eliminará la enfermedad "${enfermedad.nombre}".`;
  document.getElementById('modalEliminarEnfermedad').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
  document.getElementById('modalEliminarEnfermedad').classList.remove('active');
  document.body.style.overflow = 'auto';
  enfermedadAEliminar = null;
}

function confirmarEliminarEnfermedad() {
  (async ()=>{
    if(enfermedadAEliminar){
      const id = enfermedadAEliminar.idEnfermedad || (enfermedadAEliminar.raw && (enfermedadAEliminar.raw.idEnfermedad||enfermedadAEliminar.raw.id));
      if(id){
        const ok = await deleteEnfermedadBackend(id);
        if(ok) cerrarModalEliminar();
      } else {
        const nombreEnfermedad = enfermedadAEliminar.nombre;
        const idx = enfermedades.indexOf(enfermedadAEliminar);
        if(idx>-1) enfermedades.splice(idx,1);
        renderizarEnfermedades();
        cerrarModalEliminar();
        mostrarAlerta(`La enfermedad "${nombreEnfermedad}" ha sido eliminada exitosamente.`, 'success');
      }
    }
  })();
}

// Globales para el HTML
window.cerrarModalEliminar = cerrarModalEliminar;
window.confirmarEliminarEnfermedad = confirmarEliminarEnfermedad;


// ============================================
// 5. API / BACKEND
// ============================================

async function fetchEnfermedadesFromBackend(){
  try{
    const res = await fetch('http://100.30.25.253:7000/enfermedades', { headers: await getAuthHeaders() });
    const text = await res.text(); if(!res.ok){ console.error('Error cargando enfermedades', res.status, text); mostrarAlerta('Error cargando enfermedades (ver consola)','error'); return; }
    const data = text? JSON.parse(text) : [];
    enfermedades = (data || []).map(e => ({
      idEnfermedad: e.idEnfermedad || e.id || null,
      nombre: e.nombreEnfermedad || e.nombre || '',
      tipo: e.tipoEnfermedad || e.tipo || '',
      sintomas: e.sintomas || '',
      duracion: e.duracionEstimada || e.duracion || e.duracion_estimada || '',
      tratamientos: e.tratamientosRecomendados || e.tratamientos || '',
      riesgo: e.nivelRiesgo || e.riesgo || '',
      transmision: e.modoTransmision || e.transmision || '',
      idMedicamento: e.idMedicamento || null,
      raw: e
    }));
    renderizarEnfermedades(enfermedades);
  }catch(err){ console.error(err); mostrarAlerta('Error comunicando con el servidor','error'); }
}

async function createEnfermedadBackend(payload){
  try{
    const headers = await getAuthHeaders();
    const res = await fetch('http://100.30.25.253:7000/enfermedades', { method: 'POST', headers, body: JSON.stringify(payload) });
    if(!res.ok){ mostrarAlerta('Error creando enfermedad','error'); return false; }
    mostrarAlerta('Enfermedad creada correctamente','success');
    await fetchEnfermedadesFromBackend();
    return true;
  }catch(e){ console.error(e); mostrarAlerta('Error de conexión','error'); return false; }
}

async function updateEnfermedadBackend(idEnfermedad, payload){
  try{
    const headers = await getAuthHeaders();
    const res = await fetch(`http://100.30.25.253:7000/enfermedades/${idEnfermedad}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
    if(!res.ok){ mostrarAlerta('Error actualizando enfermedad','error'); return false; }
    mostrarAlerta('Enfermedad actualizada correctamente','success');
    await fetchEnfermedadesFromBackend();
    return true;
  }catch(e){ console.error(e); mostrarAlerta('Error de conexión','error'); return false; }
}

async function deleteEnfermedadBackend(idEnfermedad){
  try{
    const headers = await getAuthHeaders();
    const res = await fetch(`http://100.30.25.253:7000/enfermedades/${idEnfermedad}`, { method: 'DELETE', headers });
    if(!res.ok){ mostrarAlerta('Error eliminando enfermedad','error'); return false; }
    mostrarAlerta('Enfermedad eliminada correctamente','success');
    await fetchEnfermedadesFromBackend();
    return true;
  }catch(e){ console.error(e); mostrarAlerta('Error de conexión','error'); return false; }
}


// ============================================
// 6. LÓGICA DE INTERFAZ (UI)
// ============================================

// Botón Agregar
if (btnAgregar) {
  btnAgregar.addEventListener('click', () => {
    limpiarModal();
    const hdr = modal && modal.querySelector('h2'); if(hdr) hdr.textContent = 'Agregar Enfermedad';
    if(btnGuardar) btnGuardar.textContent = 'Guardar';
    modal.style.display = 'flex';
  });
}

// Permisos (Admin no ve botón agregar)
if(isAdmin() && btnAgregar){ btnAgregar.style.display = 'none'; }

// Cerrar Modales
if(btnCerrarModal) btnCerrarModal.addEventListener('click', () => modal.style.display = 'none');
if(btnCerrarVisualizar) btnCerrarVisualizar.addEventListener('click', () => modalVisualizar.style.display = 'none');

window.addEventListener('click', (e) => { 
  if (e.target === modal) modal.style.display = 'none'; 
  if (e.target === modalVisualizar) modalVisualizar.style.display = 'none'; 
  if (e.target === modalEliminar) cerrarModalEliminar();
});

function limpiarModal() {
  inputNombre.value = '';
  inputTipo.value = '';
  inputSintomas.value = '';
  inputDuracion.value = '';
  inputTratamientos.value = '';
  selectRiesgo.value = 'Leve';
  inputTransmision.value = '';
  editIndex = null;
}

function getBadgeClass(riesgo) {
  const clases = {
    'Leve': 'badge-leve',
    'Moderado': 'badge-moderado',
    'Grave': 'badge-grave',
    'Crítico': 'badge-critico'
  };
  return clases[riesgo] || 'badge-leve';
}


// ============================================
// 7. GUARDAR
// ============================================
btnGuardar.addEventListener('click', async () => {
  const nombre = inputNombre.value.trim();
  const tipo = inputTipo.value.trim();
  
  if (!nombre || !tipo) {
    mostrarAlerta('Complete los campos obligatorios: Nombre y Tipo.', 'warning');
    return;
  }

  const payload = {
    nombreEnfermedad: nombre,
    tipoEnfermedad: tipo,
    sintomas: inputSintomas.value.trim() || undefined,
    duracionEstimada: inputDuracion.value ? Number(inputDuracion.value) : undefined,
    tratamientosRecomendados: inputTratamientos.value.trim() || undefined,
    nivelRiesgo: selectRiesgo.value || undefined,
    modoTransmision: inputTransmision.value.trim() || undefined,
    idMedicamento: null,
  };

  if(editIndex !== null){
    const existing = enfermedades[editIndex];
    if(existing && existing.idMedicamento) payload.idMedicamento = Number(existing.idMedicamento);
    const idEnfermedad = existing && existing.idEnfermedad;
    payload.idEnfermedad = Number(idEnfermedad);
    
    const ok = await updateEnfermedadBackend(idEnfermedad, payload);
    if(ok){ modal.style.display = 'none'; editIndex = null; }
  } else {
    const ok = await createEnfermedadBackend(payload);
    if(ok){ modal.style.display = 'none'; }
  }
});


// ============================================
// 8. RENDERIZAR TABLA
// ============================================
function renderizarEnfermedades(lista = enfermedades) {
  tablaEnfermedades.innerHTML = '';
  
  if (lista.length === 0) {
    tablaEnfermedades.innerHTML = '<p>No hay enfermedades registradas.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Tipo</th>
        <th>Riesgo</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = tabla.querySelector('tbody');
  lista.forEach(enfermedad => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${enfermedad.nombre}</td>
      <td>${enfermedad.tipo}</td>
      <td><span class="badge-riesgo ${getBadgeClass(enfermedad.riesgo)}">${enfermedad.riesgo}</span></td>
      <td>
        <button class="btn-ver" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>
        <button class="btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
        <button class="btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash-can"></i></button>
      </td>
    `;

    // ---------------------------------------------
    // VISUALIZAR (ESTILO MEJORADO .detalle-item)
    // ---------------------------------------------
    fila.querySelector('.btn-ver').addEventListener('click', () => {
      contenidoEnfermedad.innerHTML = `
       <div class="detalle-item">
          <strong>Nombre:</strong> 
          <p>${enfermedad.nombre}</p>
       </div>
       <div class="detalle-item">
          <strong>Tipo:</strong> 
          <p>${enfermedad.tipo}</p>
       </div>
       <div class="detalle-item">
          <strong>Síntomas:</strong>
          <p>${enfermedad.sintomas || 'No especificados'}</p>
       </div>
       <div class="detalle-item">
          <strong>Duración:</strong>
          <p>${enfermedad.duracion || 'N/A'}</p>
       </div>
       <div class="detalle-item">
          <strong>Tratamientos:</strong>
          <p>${enfermedad.tratamientos || 'No especificados'}</p>
       </div>
       <div class="detalle-item">
          <strong>Riesgo:</strong>
          <p><span class="badge-riesgo ${getBadgeClass(enfermedad.riesgo)}">${enfermedad.riesgo}</span></p>
       </div>
       <div class="detalle-item">
          <strong>Transmisión:</strong> 
          <p>${enfermedad.transmision || 'N/A'}</p>
       </div>
      `;
      modalVisualizar.style.display = 'flex';
    });

    // Editar / Eliminar (Solo Veterinario)
    if(!isVeterinario()){
      const be = fila.querySelector('.btn-editar'); if(be) be.style.display = 'none';
      const bd = fila.querySelector('.btn-eliminar'); if(bd) bd.style.display = 'none';
    } else {
      const be = fila.querySelector('.btn-editar');
      if(be) be.addEventListener('click', () => {
        inputNombre.value = enfermedad.nombre;
        inputTipo.value = enfermedad.tipo;
        inputSintomas.value = enfermedad.sintomas;
        inputDuracion.value = enfermedad.duracion;
        inputTratamientos.value = enfermedad.tratamientos;
        selectRiesgo.value = enfermedad.riesgo;
        inputTransmision.value = enfermedad.transmision;
        editIndex = enfermedades.indexOf(enfermedad);
        const hdr = modal && modal.querySelector('h2'); if(hdr) hdr.textContent = 'Editar Enfermedad';
        if(btnGuardar) btnGuardar.textContent = 'Actualizar';
        modal.style.display = 'flex';
      });

      const bd = fila.querySelector('.btn-eliminar');
      if(bd) bd.addEventListener('click', () => abrirModalEliminar(enfermedad));
    }

    tbody.appendChild(fila);
  });

  tablaEnfermedades.appendChild(tabla);
}

// Buscador
buscador.addEventListener('input', () => {
  const texto = buscador.value.toLowerCase();
  const resultados = enfermedades.filter(e =>
    e.nombre.toLowerCase().includes(texto) ||
    e.tipo.toLowerCase().includes(texto)
  );
  renderizarEnfermedades(resultados);
});

// Init
fetchEnfermedadesFromBackend();