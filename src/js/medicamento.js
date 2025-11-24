// ============================================
// 1. SISTEMA DE ALERTAS PERSONALIZADAS
// ============================================

// Inyectar estilos si no existen (fallback)
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
// 2. MODAL DE CONFIRMACIÓN DE ELIMINAR
// ============================================

const modalEliminar = document.createElement('div');
modalEliminar.id = 'modalEliminarMedicamento';
modalEliminar.classList.add('modal-overlay'); // Usar clase del CSS unificado

modalEliminar.innerHTML = `
  <div class="modal-container">
    <div class="modal-header-custom">
      <h2 class="modal-title-custom">
        <i class="fas fa-trash-alt"></i> Eliminar Medicamento
      </h2>
      <button onclick="cerrarModalEliminar()" class="btn-close-custom">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body-custom">
      <div class="modal-icon-warning">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <p class="modal-message">¿Estás seguro de eliminar este medicamento?</p>
      <p class="modal-submessage" id="mensajeEliminarMedicamento">Esta acción no se puede deshacer.</p>
    </div>
    <div class="modal-footer-custom">
      <button onclick="cerrarModalEliminar()" class="btn-modal-cancelar">
        Cancelar
      </button>
      <button onclick="confirmarEliminarMedicamento()" class="btn-modal-confirmar">
        Eliminar
      </button>
    </div>
  </div>
`;
document.body.appendChild(modalEliminar);

let medicamentoAEliminar = null;

function abrirModalEliminar(medicamento) {
  medicamentoAEliminar = medicamento;
  const nombreMostrar = medicamento.nombre || medicamento.nombreMedicamento || 'sin nombre';
  document.getElementById('mensajeEliminarMedicamento').textContent = 
    `Se eliminará el medicamento "${nombreMostrar}".`;
  
  document.getElementById('modalEliminarMedicamento').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
  document.getElementById('modalEliminarMedicamento').classList.remove('active');
  document.body.style.overflow = 'auto';
  medicamentoAEliminar = null;
}

function confirmarEliminarMedicamento() {
  if (medicamentoAEliminar) {
    const id = medicamentoAEliminar.idMedicamento || medicamentoAEliminar.id;
    cerrarModalEliminar(); // Cerrar modal visualmente
    if(id) deleteMedicamentoBackend(id);
  }
}

// Exportar funciones globales para onclick
window.cerrarModalEliminar = cerrarModalEliminar;
window.confirmarEliminarMedicamento = confirmarEliminarMedicamento;


// ============================================
// 3. VARIABLES Y SELECTORES
// ============================================

let medicamentos = [];

const modal = document.getElementById('modalMedicamento');
const btnGuardar = document.getElementById('btnGuardarMedicamento');
const btnCerrarModal = document.getElementById('btnCerrarModal');
const btnAgregar = document.querySelector('.btn-agregar');
const tablaMedicamentos = document.querySelector('.tabla-medicamentos');
const buscador = document.querySelector('.buscador input');

const inputNombre = document.getElementById('nombre');
const inputPresentacion = document.getElementById('presentacion');
const inputDosis = document.getElementById('dosis');
const inputCaducidad = document.getElementById('caducidad');
const inputVia = document.getElementById('via');
const inputComposicion = document.getElementById('composicion');
const inputIndicaciones = document.getElementById('indicaciones');
// Frecuencia (puede llamarse 'frecuencia' o 'frecuenciaAplicacion' en el DOM)
const inputFrecuencia = document.getElementById('frecuencia') || document.getElementById('frecuenciaAplicacion');

// Modal de visualización
const modalVisualizar = document.getElementById('modalVisualizarMedicamento');
const contenidoMedicamento = document.getElementById('contenidoMedicamento');
const btnCerrarVisualizar = document.getElementById('btnCerrarVisualizar');

let editIndex = null;


// ============================================
// 4. HELPERS (AUTH & ROLES)
// ============================================

function getCurrentUserRole() {
  const datosStr = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || null;
  if (!datosStr) return '';
  try { const datos = JSON.parse(datosStr); return (datos.rolNombre || (datos.rol && (datos.rol.nombre || (datos.rol.idRol === 1 ? 'Administrador' : ''))) || datos.rol || '').toString().toLowerCase(); } catch(e){ return String(datosStr).toLowerCase(); }
}
function isVeterinario(){ const r = getCurrentUserRole(); return r.includes('veterinario') || r.includes('vet'); }
function isAdmin(){ const r = getCurrentUserRole(); return r.includes('admin') || r.includes('administrador'); }

function getAuthHeaders() {
  const token = localStorage.getItem('token') || '';
  const datosUsuario = localStorage.getItem('datosUsuarioAgroSystem') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(datosUsuario ? { 'Id-Usuario': datosUsuario } : {})
  };
}

function formatDateToISO(dateStr) {
  if(!dateStr) return null;
  const parts = dateStr.split('-');
  let iso = '';
  if(parts.length === 3){
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    iso = new Date(Date.UTC(y, m, d)).toISOString();
  } else {
    iso = new Date(dateStr).toISOString();
  }
  return iso.replace('.000','');
}

function msToDateInput(ms) {
  if(!ms) return '';
  try{
    return new Date(Number(ms)).toISOString().slice(0,10);
  }catch(e){
    return '';
  }
}


// ============================================
// 5. FETCH / BACKEND
// ============================================

async function fetchMedicamentosFromBackend(){
  try{
    console.debug('GET /medicamento — iniciando petición');
    const res = await fetch('http://100.30.25.253:7000/medicamento', {
      method: 'GET',
      headers: getAuthHeaders()
    });
    if(!res.ok) throw new Error(`GET medicamentos: ${res.status}`);
    const data = await res.json();
    console.debug('GET /medicamento response', data);
    medicamentos = (data || []).map(item => ({
      idMedicamento: item.idMedicamento,
      nombre: item.nombreMedicamento,
      nombreMedicamento: item.nombreMedicamento,
      presentacion: item.solucion,
      solucion: item.solucion,
      dosis: item.dosis,
      caducidadMs: item.caducidad,
      caducidad: item.caducidad ? msToDateInput(item.caducidad) : '',
      via: item.viaAdministracion,
      viaAdministracion: item.viaAdministracion,
      composicion: item.composicion,
      indicaciones: item.indicaciones,
      frecuencia: item.frecuenciaAplicacion,
      frecuenciaAplicacion: item.frecuenciaAplicacion
    }));
    renderizarMedicamentos();
  }catch(err){
    console.error(err);
    mostrarAlerta('No se pudieron cargar los medicamentos desde el servidor.', 'error');
  }
}

async function sendMedicamentoToBackend(med){
  const nombreMedicamento = med.nombre;
  const solucion = med.presentacion || med.solucion;
  const dosis = med.dosis !== undefined && med.dosis !== '' ? Number(med.dosis) : null;
  const caducidad = med.caducidad ? formatDateToISO(med.caducidad) : null;
  const viaAdministracion = med.via;
  const composicion = med.composicion;
  const indicaciones = med.indicaciones;
  const frecuenciaAplicacion = med.frecuencia || med.frecuenciaAplicacion;

  const missing = [];
  if(!nombreMedicamento) missing.push('nombreMedicamento');
  if(!solucion) missing.push('solucion');
  if(dosis === null || Number.isNaN(dosis)) missing.push('dosis');
  if(!caducidad) missing.push('caducidad');
  if(!viaAdministracion) missing.push('viaAdministracion');
  if(!composicion) missing.push('composicion');
  if(!indicaciones) missing.push('indicaciones');
  if(!frecuenciaAplicacion) missing.push('frecuenciaAplicacion');
  
  if(missing.length){
    const msg = `Faltan campos requeridos: ${missing.join(', ')}`;
    mostrarAlerta(msg, 'error');
    throw new Error(msg);
  }

  const payload = {
    nombreMedicamento, solucion, dosis, caducidad, viaAdministracion, composicion, indicaciones, frecuenciaAplicacion
  };

  const res = await fetch('http://100.30.25.253:7000/medicamento', {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(payload)
  });
  
  let created;
  try{ created = await res.json(); } catch(e){ created = null; }
  
  if(!res.ok){
    throw new Error(`POST medicamento: ${res.status}`);
  }
  
  // Recargar lista
  await fetchMedicamentosFromBackend();
  mostrarAlerta(`Medicamento registrado exitosamente.`, 'success');
}

async function updateMedicamentoBackend(med, id){
  if(!id) throw new Error('ID requerido para actualizar medicamento');
  const payload = {
    idMedicamento: id,
    nombreMedicamento: med.nombre,
    solucion: med.presentacion,
    dosis: med.dosis ? Number(med.dosis) : null,
    caducidad: med.caducidad ? formatDateToISO(med.caducidad) : null,
    viaAdministracion: med.via,
    composicion: med.composicion,
    indicaciones: med.indicaciones,
    frecuenciaAplicacion: med.frecuencia || med.frecuenciaAplicacion
  };
  
  const res = await fetch(`http://100.30.25.253:7000/medicamento/${id}`, {
    method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify(payload)
  });
  if(!res.ok) throw new Error(`PUT medicamento: ${res.status}`);
  
  await fetchMedicamentosFromBackend();
  mostrarAlerta(`Medicamento actualizado exitosamente.`, 'success');
}

async function deleteMedicamentoBackend(id){
  if(!id) return;
  try{
    const res = await fetch(`http://100.30.25.253:7000/medicamento/${id}`, {
      method: 'DELETE', headers: getAuthHeaders()
    });
    if(!res.ok) throw new Error(`DELETE medicamento: ${res.status}`);
    
    await fetchMedicamentosFromBackend();
    mostrarAlerta(`Medicamento eliminado exitosamente.`, 'success');
  }catch(err){
    console.error(err);
    mostrarAlerta('No se pudo eliminar el medicamento en el servidor.', 'error');
  }
}


// ============================================
// 6. INTERFAZ Y EVENTOS
// ============================================

// Abrir modal
if (btnAgregar) {
  btnAgregar.addEventListener('click', () => {
    limpiarModal();
    const hdr = modal && modal.querySelector('h2'); if(hdr) hdr.textContent = 'Agregar Medicamento';
    if(btnGuardar) btnGuardar.textContent = 'Guardar';
    modal.style.display = 'flex';
  });
}

// Mostrar acciones CRUD sólo para admin en medicamentos
if (!isAdmin() && btnAgregar) {
  btnAgregar.style.display = 'none';
}

// Cerrar modales
btnCerrarModal.addEventListener('click', () => modal.style.display = 'none');
btnCerrarVisualizar.addEventListener('click', () => modalVisualizar.style.display = 'none');

window.addEventListener('click', e => { 
  if(e.target === modal) modal.style.display = 'none'; 
  if(e.target === modalVisualizar) modalVisualizar.style.display = 'none'; 
  if(e.target === modalEliminar) cerrarModalEliminar();
});

// Limpiar modal
function limpiarModal() {
  const inputs = [inputNombre, inputPresentacion, inputDosis, inputCaducidad, inputVia, inputComposicion, inputIndicaciones];
  inputs.forEach(i => { if(i) i.value = ''; });
  
  if (inputFrecuencia) inputFrecuencia.value = '';
  const altSol = document.getElementById('solucion'); if (altSol) altSol.value = '';
  const altFreq = document.getElementById('frecuenciaAplicacion'); if (altFreq) altFreq.value = '';
  
  editIndex = null;
}

// Guardar
btnGuardar.addEventListener('click', async () => {
  const nombre = inputNombre ? inputNombre.value.trim() : '';
  const presentacion = inputPresentacion ? inputPresentacion.value.trim() : (document.getElementById('solucion') ? document.getElementById('solucion').value.trim() : '');
  const dosis = inputDosis ? inputDosis.value.trim() : '';
  const caducidad = inputCaducidad ? inputCaducidad.value.trim() : '';
  const via = inputVia ? inputVia.value.trim() : '';
  const composicion = inputComposicion ? inputComposicion.value.trim() : '';
  const indicaciones = inputIndicaciones ? inputIndicaciones.value.trim() : '';
  
  let frecuencia = '';
  if (inputFrecuencia) frecuencia = inputFrecuencia.value.trim();
  else if (document.getElementById('frecuenciaAplicacion')) frecuencia = document.getElementById('frecuenciaAplicacion').value.trim();

  if(!nombre || !presentacion) {
    mostrarAlerta('Complete al menos Nombre y Presentación.', 'error');
    return;
  }

  const medData = { 
    nombre, presentacion, dosis, caducidad, via, composicion, indicaciones, frecuencia, frecuenciaAplicacion: frecuencia
  };

  modal.style.display = 'none';

  try {
    if(editIndex !== null){
      const id = medicamentos[editIndex].idMedicamento || medicamentos[editIndex].id;
      await updateMedicamentoBackend(medData, id);
    } else {
      await sendMedicamentoToBackend(medData);
    }
  } catch (err) {
    console.error(err);
    mostrarAlerta(err.message || 'Error en la operación.', 'error');
  }
});

// Renderizar tabla
function renderizarMedicamentos(lista = medicamentos){
  tablaMedicamentos.innerHTML = '';

  if(lista.length === 0){
    tablaMedicamentos.innerHTML = '<p>No hay medicamentos registrados.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML = `
    <thead>
      <tr>
        <th>Nombre</th>
        <th>Presentación</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = tabla.querySelector('tbody');

  lista.forEach((med) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${med.nombre || med.nombreMedicamento || ''}</td>
      <td>${med.presentacion || med.solucion || ''}</td>
     <td>
      <button class="btn-ver" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>
      <button class="btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
      <button class="btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
     </td>
    `;

    // VISUALIZAR (ESTILO MEJORADO .detalle-item)
    fila.querySelector('.btn-ver').addEventListener('click', () => {
      contenidoMedicamento.innerHTML = `
        <div class="detalle-item">
          <strong>Nombre</strong>
          <p>${med.nombre || med.nombreMedicamento || ''}</p>
        </div>
        <div class="detalle-item">
          <strong>Solución / Presentación</strong>
          <p>${med.presentacion || med.solucion || ''}</p>
        </div>
        <div class="detalle-item">
          <strong>Dosis</strong>
          <p>${med.dosis ?? 'No especificada'}</p>
        </div>
        <div class="detalle-item">
          <strong>Caducidad</strong>
          <p>${med.caducidad || (med.caducidadMs ? new Date(med.caducidadMs).toLocaleDateString() : 'No especificada')}</p>
        </div>
        <div class="detalle-item">
          <strong>Vía de Administración</strong>
          <p>${med.via || med.viaAdministracion || 'No especificada'}</p>
        </div>
        <div class="detalle-item">
          <strong>Composición</strong>
          <p>${med.composicion || 'N/A'}</p>
        </div>
        <div class="detalle-item">
          <strong>Frecuencia de aplicación</strong>
          <p>${med.frecuencia || med.frecuenciaAplicacion || 'No especificada'}</p>
        </div>
        <div class="detalle-item">
          <strong>Indicaciones</strong>
          <p>${med.indicaciones || 'Ninguna'}</p>
        </div>
      `;
      modalVisualizar.style.display = 'flex';
    });

    // Editar / Eliminar
    if (!isAdmin()) {
      const be = fila.querySelector('.btn-editar'); if (be) be.style.display = 'none';
      const bd = fila.querySelector('.btn-eliminar'); if (bd) bd.style.display = 'none';
    } else {
      const beEl = fila.querySelector('.btn-editar');
      if (beEl) beEl.addEventListener('click', () => {
        inputNombre.value = med.nombre || med.nombreMedicamento || '';
        
        const valorPresent = med.presentacion || med.solucion || '';
        if (inputPresentacion) inputPresentacion.value = valorPresent;
        const altSolInput = document.getElementById('solucion'); if (altSolInput) altSolInput.value = valorPresent;

        inputDosis.value = med.dosis ?? '';
        inputCaducidad.value = med.caducidad || (med.caducidadMs ? new Date(med.caducidadMs).toISOString().slice(0,10) : '');
        inputVia.value = med.via || med.viaAdministracion || '';
        inputComposicion.value = med.composicion || '';
        
        const valorFreq = med.frecuencia || med.frecuenciaAplicacion || '';
        if (inputFrecuencia) inputFrecuencia.value = valorFreq;
        const altFreqInput = document.getElementById('frecuenciaAplicacion'); if (altFreqInput) altFreqInput.value = valorFreq;

        inputIndicaciones.value = med.indicaciones || '';
        editIndex = medicamentos.indexOf(med);
        
        const hdr = modal && modal.querySelector('h2'); if(hdr) hdr.textContent = 'Editar Medicamento';
        if(btnGuardar) btnGuardar.textContent = 'Actualizar';
        modal.style.display = 'flex';
      });
      
      const bdEl = fila.querySelector('.btn-eliminar'); 
      if (bdEl) bdEl.addEventListener('click', () => { abrirModalEliminar(med); });
    }

    tbody.appendChild(fila);
  });

  tablaMedicamentos.appendChild(tabla);
}

// Buscador
buscador.addEventListener('input', () => {
  const texto = buscador.value.toLowerCase();
  const resultados = medicamentos.filter(m =>
    String(m.nombre || '').toLowerCase().includes(texto) ||
    String(m.presentacion || '').toLowerCase().includes(texto)
  );
  renderizarMedicamentos(resultados);
});

// Init
fetchMedicamentosFromBackend();