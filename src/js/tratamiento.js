// ============================================
// 1. SISTEMA DE ALERTAS PERSONALIZADAS
// ============================================

// Inyectar estilos si no existen
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

// Crear HTML del modal de alerta
const modalAlerta = document.createElement('div');
modalAlerta.id = 'alertaPersonalizada';
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
  if (e.key === 'Escape' && modalAlerta.classList.contains('active')) cerrarAlerta();
});


// ============================================
// 2. MODAL DE CONFIRMACIÓN DE ELIMINAR (ACTUALIZADO)
// ============================================

// Aquí es donde cambiamos la estructura para que coincida con tu CSS
const modalEliminar = document.createElement('div');
modalEliminar.id = 'modalEliminarTratamiento';
modalEliminar.classList.add('modal-overlay'); // Clase principal del CSS

modalEliminar.innerHTML = `
  <div class="modal-container">
    <div class="modal-header-custom">
      <h2 class="modal-title-custom">
        <i class="fas fa-trash-alt"></i> Eliminar Tratamiento
      </h2>
      <button onclick="cerrarModalEliminar()" class="btn-close-custom">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body-custom">
      <div class="modal-icon-warning">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <p class="modal-message">¿Estás seguro de eliminar este tratamiento?</p>
      <p class="modal-submessage" id="mensajeEliminarTratamiento">Esta acción no se puede deshacer.</p>
    </div>
    <div class="modal-footer-custom">
      <button onclick="cerrarModalEliminar()" class="btn-modal-cancelar">
        Cancelar
      </button>
      <button onclick="confirmarEliminarTratamiento()" class="btn-modal-confirmar">
        Eliminar
      </button>
    </div>
  </div>
`;
document.body.appendChild(modalEliminar);

// Variables globales para el modal
let tratamientoAEliminar = null;

function abrirModalEliminar(tratamiento) {
  tratamientoAEliminar = tratamiento;
  document.getElementById('mensajeEliminarTratamiento').textContent = 
    `Se eliminará el tratamiento "${tratamiento.nombreTratamiento}" del animal ${tratamiento.numArete}.`;
  document.getElementById('modalEliminarTratamiento').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
  document.getElementById('modalEliminarTratamiento').classList.remove('active');
  document.body.style.overflow = 'auto';
  tratamientoAEliminar = null;
}

function confirmarEliminarTratamiento() {
  (async () => {
    if (tratamientoAEliminar) {
      const id = tratamientoAEliminar.idTratamiento || tratamientoAEliminar.id;
      if(id){
        const ok = await deleteTratamientoBackend(id);
        if(ok) cerrarModalEliminar();
      } else {
        // Fallback para eliminación local (si no hay backend conectado)
        const globalIndex = tratamientos.indexOf(tratamientoAEliminar);
        if(globalIndex > -1) tratamientos.splice(globalIndex, 1);
        renderizarTratamientos();
        cerrarModalEliminar();
        mostrarAlerta('Tratamiento eliminado correctamente.', 'success');
      }
    }
  })();
}

// Hacer funciones accesibles globalmente para los botones onclick
window.cerrarModalEliminar = cerrarModalEliminar;
window.confirmarEliminarTratamiento = confirmarEliminarTratamiento;


// ============================================
// 3. VARIABLES Y SELECTORES
// ============================================

let tratamientos = [];
let animalesList = [];
let reportesList = [];
let medicamentosList = [];

const modal = document.getElementById('modalAgregarTratamiento');
const btnGuardar = document.getElementById('btnGuardarTratamiento');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnAgregar = document.querySelector('.btn-agregar');
const tablaTratamientos = document.querySelector('.tabla-animales');
const buscador = document.querySelector('.buscador input');

// Inputs Formulario
const inputNumArete = document.getElementById('numArete');
const inputNombreTratamiento = document.getElementById('nombreTratamiento');
const inputFechaInicio = document.getElementById('fechaInicio');
const inputFechaFin = document.getElementById('fechaFin');
const inputEnfermedad = document.getElementById('enfermedad');
const inputMedicamentos = document.getElementById('medicamentos');
const selectAnimalTratamiento = document.getElementById('selectAnimalTratamiento');
const selectReporteTratamiento = document.getElementById('selectReporteTratamiento');
const selectMedicamentoTratamiento = document.getElementById('selectMedicamentoTratamiento');
const inputDosis = document.getElementById('dosis');
const selectVia = document.getElementById('via');
const inputFrecuencia = document.getElementById('frecuencia');
const inputDuracion = document.getElementById('duracion');
const inputVeterinario = document.getElementById('veterinario');
const selectEstado = document.getElementById('estado');
const inputObservaciones = document.getElementById('observaciones');

// Visualizar
const modalVisualizar = document.getElementById('modalVisualizarTratamiento');
const contenidoTratamiento = document.getElementById('contenidoTratamiento');
const btnCerrarVisualizar = document.getElementById('btnCerrarVisualizar');

let editIndex = null;


// ============================================
// 4. HELPERS (FECHAS, AUTH, ROLES)
// ============================================

function formatDateForInput(d){
  if(!d && d !== 0) return '';
  try{
    if(Array.isArray(d)){
      const [y, m, day] = d;
      return `${y}-${String(m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    }
    if(typeof d === 'number'){
      const dt = new Date(d);
      return isNaN(dt) ? '' : dt.toISOString().slice(0,10);
    }
    if(typeof d === 'string'){
      const s = d.trim();
      if(s.length >= 10) return s.substring(0,10);
    }
  }catch(e){ console.warn('formatDateForInput error', e); }
  return '';
}

async function getAuthHeaders() {
  const token = localStorage.getItem('token') || '';
  const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
  let idUsuarioHeader = '';
  if (datosUsuarioRaw) {
    try {
      const parsed = JSON.parse(datosUsuarioRaw);
      if (parsed && (parsed.idUsuario || parsed.id)) idUsuarioHeader = String(parsed.idUsuario || parsed.id);
      else if (parsed && parsed.usuario) idUsuarioHeader = String(parsed.usuario);
    } catch (e) { idUsuarioHeader = String(datosUsuarioRaw); }
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(idUsuarioHeader ? { 'Id-Usuario': idUsuarioHeader } : {})
  };
}

async function resolveUsuarioId(usuarioString){
  if(!usuarioString) return null;
  try{
    const res = await fetch('http://100.30.25.253:7000/usuarios', { headers: await getAuthHeaders() });
    if(!res.ok) return null;
    const list = await res.json();
    const found = (list || []).find(u => { const uname = u.usuario || u.nombreUsuario || u.correo || ''; return String(uname).toLowerCase() === String(usuarioString).toLowerCase(); });
    if(found) return found.idUsuario || found.id || null;
    return null;
  }catch(e){ console.error(e); return null; }
}

function getCurrentUserRole() {
  const datosStr = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || null;
  if (!datosStr) return '';
  try { const datos = JSON.parse(datosStr); return (datos.rolNombre || (datos.rol && (datos.rol.nombre || (datos.rol.idRol === 1 ? 'Administrador' : ''))) || datos.rol || '').toString().toLowerCase(); } catch(e){ return String(datosStr).toLowerCase(); }
}
function isVeterinario(){ const r = getCurrentUserRole(); return r.includes('veterinario') || r.includes('vet'); }
function isAdmin(){ const r = getCurrentUserRole(); return r.includes('admin') || r.includes('administrador'); }


// ============================================
// 5. FETCH DATA (LISTAS Y TRATAMIENTOS)
// ============================================

async function fetchAnimales(){
  try{
    const res = await fetch('http://100.30.25.253:7000/animales', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    animalesList = await res.json();
    if(selectAnimalTratamiento){
      selectAnimalTratamiento.innerHTML = '<option value="">-- Seleccione un animal --</option>';
      (animalesList || []).forEach(a => {
        const o = document.createElement('option');
        o.value = a.idAnimal || a.id;
        o.textContent = `${a.nombreAnimal || a.nombre} (arete ${a.numArete || ''})`;
        selectAnimalTratamiento.appendChild(o);
      });
    }
  }catch(e){ console.error(e); }
}

async function fetchReportes(){
  try{
    const res = await fetch('http://100.30.25.253:7000/reportes', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    reportesList = await res.json();
    if(selectReporteTratamiento){
      selectReporteTratamiento.innerHTML = '<option value="">-- Seleccione un reporte (opcional) --</option>';
      (reportesList || []).forEach(r => {
        const id = r.idReporte || r.id;
        const anim = r.idAnimales || r.idAnimal || {};
        const fecha = Array.isArray(r.fecha)? r.fecha.join('-') : r.fecha || '';
        const o = document.createElement('option');
        o.value = id;
        o.textContent = `#${id} - ${fecha} (arete ${anim.numArete || ''})`;
        selectReporteTratamiento.appendChild(o);
      });
    }
  }catch(e){ console.error(e); }
}

async function fetchMedicamentos(){
  try{
    const res = await fetch('http://100.30.25.253:7000/medicamento', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    medicamentosList = await res.json();
    if(selectMedicamentoTratamiento){
      selectMedicamentoTratamiento.innerHTML = '<option value="">-- Seleccione un medicamento --</option>';
      (medicamentosList || []).forEach(m => {
        const o = document.createElement('option');
        o.value = m.idMedicamento || m.id;
        o.textContent = m.nombreMedicamento || m.nombre;
        selectMedicamentoTratamiento.appendChild(o);
      });
    }
  }catch(e){ console.error(e); }
}

async function fetchTratamientosFromBackend(){
  try{
    const res = await fetch('http://100.30.25.253:7000/tratamientos', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    const data = await res.json();
    
    tratamientos = (data || []).map(t => ({
      idTratamiento: t.idTratamiento || t.id,
      idAnimal: t.idAnimal || t.idAnimales || null,
      idReporte: t.idReporte || null,
      idUsuario: t.idUsuario || null,
      idMedicamento: t.idMedicamento || null,
      nombreTratamiento: t.nombreTratamiento || t.nombre || '',
      fechaInicio: formatDateForInput(t.fechaInicio || t.fecha),
      fechaFin: formatDateForInput(t.fechaFinal || t.fechaFin),
      medicamentos: t.medicamentos || (t.idMedicamento && t.idMedicamento.nombreMedicamento) || '',
      dosis: t.dosis || (t.idMedicamento && t.idMedicamento.dosis) || '',
      via: t.via || (t.idMedicamento && t.idMedicamento.viaAdministracion) || '',
      frecuencia: t.frecuencia || t.frecuenciaAplicacion || '',
      duracion: t.duracion || '',
      veterinario: t.veterinario || '',
      numArete: String((t.idAnimal && (t.idAnimal.numArete || t.idAnimal.numArete === 0) ? t.idAnimal.numArete : (t.idAnimales && t.idAnimales.numArete ? t.idAnimales.numArete : (t.numArete || '')))),
      enfermedad: (t.idReporte && (t.idReporte.diagnosticoPresuntivo || t.idReporte.diagnosticoDefinitivo)) ? (t.idReporte.diagnosticoPresuntivo || t.idReporte.diagnosticoDefinitivo) : (t.enfermedad || ''),
      estado: t.estado || t.estadoTratamiento || 'N/A',
      observaciones: t.observaciones || t.observacion || ''
    }));
    
    renderizarTratamientos(tratamientos);
  }catch(e){ console.error(e); }
}

// ============================================
// 6. CRUD (POST, PUT, DELETE)
// ============================================

async function updateTratamientoBackend(idTratamiento, payload, idUsuarioHeaderOverride){
  try{
    payload.idTratamiento = Number(idTratamiento);
    const headers = await getAuthHeaders();
    if(idUsuarioHeaderOverride) headers['Id-Usuario'] = String(idUsuarioHeaderOverride);
    
    const res = await fetch(`http://100.30.25.253:7000/tratamientos/${idTratamiento}`, { 
      method: 'PUT', headers, body: JSON.stringify(payload) 
    });
    
    if(!res.ok){ mostrarAlerta('Error actualizando tratamiento', 'error'); return false; }
    mostrarAlerta('Tratamiento actualizado correctamente.', 'success');
    modal.style.display = 'none';
    editIndex = null;
    await fetchTratamientosFromBackend();
    return true;
  }catch(e){ console.error(e); mostrarAlerta('Error de conexión', 'error'); return false; }
}

async function deleteTratamientoBackend(idTratamiento){
  try{
    const headers = await getAuthHeaders();
    // Resolve user ID logic handled in call
    const res = await fetch(`http://100.30.25.253:7000/tratamientos/${idTratamiento}`, { method: 'DELETE', headers });
    if(!res.ok){ mostrarAlerta('No se pudo eliminar el tratamiento', 'error'); return false; }
    mostrarAlerta('Tratamiento eliminado correctamente.', 'success');
    await fetchTratamientosFromBackend();
    return true;
  }catch(e){ console.error(e); mostrarAlerta('Error de conexión', 'error'); return false; }
}


// ============================================
// 7. LÓGICA DE INTERFAZ (UI)
// ============================================

// Botones Modales
if(btnAgregar) btnAgregar.addEventListener('click', () => {
  limpiarModal();
  const hdr = modal && modal.querySelector('h2'); if(hdr) hdr.textContent = 'Agregar Tratamiento';
  if(btnGuardar) btnGuardar.textContent = 'Guardar';
  modal.style.display = 'flex';
});

if (!isVeterinario() && btnAgregar) btnAgregar.style.display = 'none';

if(btnCerrarModal) btnCerrarModal.addEventListener('click', () => modal.style.display = 'none');
if(btnCerrarVisualizar) btnCerrarVisualizar.addEventListener('click', () => modalVisualizar.style.display = 'none');

window.addEventListener('click', (e) => {
  if (e.target === modal) modal.style.display = 'none';
  if (e.target === modalVisualizar) modalVisualizar.style.display = 'none';
  if (e.target === modalEliminar) cerrarModalEliminar();
});

function limpiarModal() {
  const inputs = [inputNumArete, inputNombreTratamiento, inputFechaInicio, inputFechaFin, inputEnfermedad, inputMedicamentos, inputDosis, inputFrecuencia, inputDuracion, inputVeterinario, inputObservaciones];
  inputs.forEach(i => { if(i) i.value = ''; });
  if(selectAnimalTratamiento) { selectAnimalTratamiento.value = ''; selectAnimalTratamiento.disabled = false; }
  if(selectVia) selectVia.value = 'Oral';
  if(selectEstado) selectEstado.value = 'En curso';
  
  // Habilitar campos
  const els = [selectReporteTratamiento, selectMedicamentoTratamiento, inputFechaInicio, inputFechaFin, inputDosis, selectVia, inputFrecuencia, inputDuracion, inputVeterinario, inputObservaciones, inputNombreTratamiento, selectEstado, inputEnfermedad, inputMedicamentos];
  els.forEach(el => { if(el) el.disabled = false; });
  
  editIndex = null;
}

// Botón Guardar
btnGuardar.addEventListener('click', () => {
  (async () => {
    const numArete = inputNumArete ? inputNumArete.value.trim() : (selectAnimalTratamiento?.value || '');
    const nombreTratamiento = inputNombreTratamiento.value.trim();
    const fechaInicio = inputFechaInicio.value.trim();
    const enfermedad = inputEnfermedad.value.trim();

    if (!numArete || !nombreTratamiento || !fechaInicio || !enfermedad) {
      mostrarAlerta('Complete los campos obligatorios.', 'warning');
      return;
    }
    
    await Promise.all([fetchAnimales(), fetchReportes(), fetchMedicamentos()]);

    let idAnimal = null;
    if(selectAnimalTratamiento && selectAnimalTratamiento.value) idAnimal = selectAnimalTratamiento.value;
    else {
      const animal = (animalesList || []).find(a => String(a.numArete) === String(numArete));
      if(!animal){ mostrarAlerta('Animal no encontrado.', 'warning'); return; }
      idAnimal = animal.idAnimal || animal.id;
    }

    // Buscar Reporte (Simplificado)
    let idReporte = null;
    if(selectReporteTratamiento && selectReporteTratamiento.value) idReporte = selectReporteTratamiento.value;
    else {
      // Fallback: usar el primer reporte del animal
      const rep = (reportesList||[]).find(r => {
        const ra = r.idAnimales || r.idAnimal;
        return ra && String(ra.idAnimal || ra.id) === String(idAnimal);
      });
      if(rep) idReporte = rep.idReporte || rep.id;
    }
    if(!idReporte){ mostrarAlerta('Debe existir un reporte para este animal.', 'warning'); return; }

    // Buscar Medicamento
    let idMedicamento = null;
    if(selectMedicamentoTratamiento && selectMedicamentoTratamiento.value) idMedicamento = selectMedicamentoTratamiento.value;
    else if(medicamentosList.length > 0) idMedicamento = medicamentosList[0].idMedicamento || medicamentosList[0].id;

    // ID Usuario
    const resolvedIdForHeader = await resolveUsuarioId(sessionStorage.getItem('datosUsuarioAgroSystem') || '');
    if(!resolvedIdForHeader){ mostrarAlerta('Error de usuario.', 'warning'); return; }

    const payload = {
      idAnimal: { idAnimal: Number(idAnimal) },
      idReporte: { idReporte: Number(idReporte) },
      idUsuario: { idUsuario: Number(resolvedIdForHeader) },
      nombreTratamiento: nombreTratamiento,
      fechaInicio: fechaInicio,
      fechaFinal: inputFechaFin.value.trim() || undefined,
      idMedicamento: idMedicamento ? { idMedicamento: Number(idMedicamento) } : null,
      observaciones: inputObservaciones.value.trim() || ''
    };

    if(editIndex !== null){
      const existing = tratamientos[editIndex];
      const idTratamiento = existing.idTratamiento;
      await updateTratamientoBackend(idTratamiento, payload, resolvedIdForHeader);
    } else {
      try{
        const headers = await getAuthHeaders(); 
        headers['Id-Usuario'] = String(resolvedIdForHeader);
        const res = await fetch('http://100.30.25.253:7000/tratamientos', { method: 'POST', headers, body: JSON.stringify(payload) });
        if(!res.ok) throw new Error();
        mostrarAlerta('Tratamiento creado.', 'success');
        modal.style.display = 'none';
        await fetchTratamientosFromBackend();
      }catch(e){ mostrarAlerta('Error creando tratamiento', 'error'); }
    }
  })();
});

// Renderizar Tabla
function renderizarTratamientos(lista = tratamientos) {
  tablaTratamientos.innerHTML = '';

  if (lista.length === 0) {
    tablaTratamientos.innerHTML = '<p>No hay tratamientos registrados.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Num. Arete</th>
        <th>Tratamiento</th>
        <th>Enfermedad</th>
        <th>Fecha Inicio</th>
        <th>Estado</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = tabla.querySelector('tbody');

  lista.forEach((tratamiento) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${tratamiento.numArete}</td>
      <td>${tratamiento.nombreTratamiento}</td>
      <td>${tratamiento.enfermedad}</td>
      <td>${tratamiento.fechaInicio}</td>
      <td>${tratamiento.estado}</td>
      <td>
         <button class="btn-ver" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>
        ${ isVeterinario() ? `
          <button class="btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
          <button class="btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        ` : '' }
      </td>
    `;

    // ===============================================
    // VISUALIZAR (ESTILO MEJORADO)
    // ===============================================
    const btnVer = fila.querySelector('.btn-ver');
    if (btnVer) btnVer.addEventListener('click', () => {
      contenidoTratamiento.innerHTML = `
      <div class="detalle-item">
        <strong>Animal (Arete):</strong> 
        <p>${tratamiento.numArete || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Tratamiento:</strong>
        <p>${tratamiento.nombreTratamiento || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Enfermedad:</strong> 
        <p>${tratamiento.enfermedad || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Medicamentos:</strong> 
        <p>${tratamiento.medicamentos || 'Ninguno'}</p>
      </div>
      <div class="detalle-item">
        <strong>Dosis:</strong>
        <p>${tratamiento.dosis || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Vía de Adm.:</strong>
        <p>${tratamiento.via || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Fechas:</strong>
        <p>Inicio: ${tratamiento.fechaInicio}</p>
        <p> Fin: ${tratamiento.fechaFin || '...'}</p>
      </div>
      <div class="detalle-item">
        <strong>Veterinario:</strong> 
        <p>${tratamiento.veterinario || 'No asignado'}</p>
      </div>
      <div class="detalle-item">
        <strong>Estado:</strong> 
        <p>${tratamiento.estado || 'N/A'}</p>
      </div>
      <div class="detalle-item">
        <strong>Observaciones:</strong>
        <p>${tratamiento.observaciones || 'Ninguna'}</p>
      </div>
      `;
      modalVisualizar.style.display = 'flex';
    });

    // Editar
    const btnEditar = fila.querySelector('.btn-editar');
    if (btnEditar) btnEditar.addEventListener('click', async () => {
      await Promise.all([fetchAnimales(), fetchReportes(), fetchMedicamentos()]);
      
      // Prefill Logic Simplificado
      if(inputNombreTratamiento) inputNombreTratamiento.value = tratamiento.nombreTratamiento || '';
      if(inputFechaInicio) inputFechaInicio.value = tratamiento.fechaInicio || '';
      if(inputEnfermedad) inputEnfermedad.value = tratamiento.enfermedad || '';
      
      // Selects prefill
      if(selectAnimalTratamiento && tratamiento.idAnimal) {
         selectAnimalTratamiento.value = tratamiento.idAnimal.idAnimal || tratamiento.idAnimal.id || tratamiento.idAnimal;
         selectAnimalTratamiento.disabled = true;
      }

      editIndex = tratamientos.indexOf(tratamiento);
      const hdr = modal && modal.querySelector('h2'); if(hdr) hdr.textContent = 'Editar Tratamiento';
      if(btnGuardar) btnGuardar.textContent = 'Actualizar';
      modal.style.display = 'flex';
    });

    // Eliminar
    const btnEliminarFila = fila.querySelector('.btn-eliminar');
    if (btnEliminarFila) {
      btnEliminarFila.addEventListener('click', () => { abrirModalEliminar(tratamiento); });
    }

    tbody.appendChild(fila);
  });

  tablaTratamientos.appendChild(tabla);
}

// Buscador
buscador.addEventListener('input', () => {
  const texto = buscador.value.toLowerCase();
  const resultados = tratamientos.filter(t =>
    String(t.numArete).toLowerCase().includes(texto) ||
    String(t.nombreTratamiento).toLowerCase().includes(texto)
  );
  renderizarTratamientos(resultados);
});

// Init
(async function init(){
  await Promise.all([fetchAnimales(), fetchReportes(), fetchMedicamentos(), fetchTratamientosFromBackend()]);
})();