// ============================================
// 1. SISTEMA DE ALERTAS PERSONALIZADAS Y ESTILOS
// ============================================

// Inyectar CSS de alertas si no existe
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

// Función Mostrar Alerta
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

// Cerrar con ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalAlerta.classList.contains('active')) {
    cerrarAlerta();
  }
});


// ============================================
// 2. VARIABLES Y SELECTORES
// ============================================

let tarjetas = [];

const btnAgregar = document.querySelector('.btn-agregar');
const tablaContenedor = document.querySelector('.tabla-tarjetas'); // Asegúrate de que tu HTML tenga <div class="tabla-tarjetas"></div> o similar

const modal = document.getElementById('modalAgregar');
const btnGuardar = document.getElementById('btnGuardar');
const btnCerrarModal = document.getElementById('btnCerrarModal');

const modalVisualizar = document.getElementById('modalVisualizar');
const contenidoVisualizar = document.getElementById('contenidoVisualizar');
const btnCerrarVisualizar = document.getElementById('btnCerrarVisualizar');

const buscador = document.querySelector('.buscador input');

// Selects para relacionar tarjeta (Backend)
const selectAnimal = document.getElementById('selectAnimal');
const selectEnfermedad = document.getElementById('selectEnfermedad');
const selectTratamiento = document.getElementById('selectTratamiento');

// Inputs opcionales (por si usas el modo local/mixto)
const inputNombre = document.getElementById('nombre');
const inputNumArete = document.getElementById('numArete');
const selectSexo = document.getElementById('sexo');
const inputPeso = document.getElementById('peso');
const inputFechaNac = document.getElementById('fechaNac');
const inputRebano = document.getElementById('rebano');
const inputCaract = document.getElementById('caract');

// Inputs historial (opcionales)
const inputHFecha = document.getElementById('hFecha');
const inputHEvento = document.getElementById('hEvento');
const inputHDiag = document.getElementById('hDiag');
const inputHDesc = document.getElementById('hDesc');
const inputHTrat = document.getElementById('hTrat');
const inputHVet = document.getElementById('hVet');
const inputHEstado = document.getElementById('hEstado');

let editIndex = null;
let tarjetaAEliminar = null;
let currentEditingId = null;


// ============================================
// 3. HELPERS (ROLES Y AUTH)
// ============================================

function getCurrentUserRole(){
  const datosStr = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
  if(!datosStr) return '';
  try{ const d = JSON.parse(datosStr); return (d.rolNombre || (d.rol && (d.rol.nombre || (d.rol.idRol===1?'Administrador':''))) || d.rol || '').toString().toLowerCase(); }catch(e){ return String(datosStr).toLowerCase(); }
}
function isVeterinario(){ const r = getCurrentUserRole(); return r.includes('veterinario') || r.includes('vet'); }
function isAdmin(){ const r = getCurrentUserRole(); return r.includes('admin') || r.includes('administrador'); }

async function getAuthHeaders() {
  const token = localStorage.getItem('token') || '';
  const datosUsuario = localStorage.getItem('datosUsuarioAgroSystem') || '';
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(datosUsuario ? { 'Id-Usuario': datosUsuario } : {})
  };
}


// ============================================
// 4. MODAL ELIMINAR
// ============================================
const modalEliminar = document.createElement('div');
modalEliminar.id = 'modalEliminarTarjeta';
modalEliminar.classList.add('modal-overlay');
modalEliminar.innerHTML = `
  <div class="modal-container">
    <div class="modal-header-custom">
      <h2 class="modal-title-custom">
        <i class="fas fa-trash-alt"></i> Eliminar Tarjeta
      </h2>
      <button onclick="cerrarModalEliminar()" class="btn-close-custom">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body-custom">
      <div class="modal-icon-warning" style="background-color: #f8d7da;">
        <i class="fas fa-exclamation-triangle" style="color: #721c24;"></i>
      </div>
      <p class="modal-message">¿Estás seguro de eliminar este registro?</p>
      <p class="modal-submessage" id="mensajeEliminarTarjeta">Esta acción no se puede deshacer.</p>
    </div>
    <div class="modal-footer-custom">
      <button onclick="cerrarModalEliminar()" class="btn-modal-cancelar">
        <i class="fas fa-times"></i> Cancelar
      </button>
      <button onclick="confirmarEliminarTarjeta()" class="btn-modal-confirmar">
        <i class="fas fa-trash-alt"></i> Eliminar
      </button>
    </div>
  </div>
`;
document.body.appendChild(modalEliminar);

function abrirModalEliminar(tarjeta) {
  tarjetaAEliminar = tarjeta;
  const nombre = tarjeta.nombre || (tarjeta.idAnimal ? (tarjeta.idAnimal.nombreAnimal || tarjeta.idAnimal.nombre) : 'Desconocido');
  document.getElementById('mensajeEliminarTarjeta').textContent = 
    `Se eliminará la tarjeta de "${nombre}".`;
  document.getElementById('modalEliminarTarjeta').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function cerrarModalEliminar() {
  document.getElementById('modalEliminarTarjeta').classList.remove('active');
  document.body.style.overflow = 'auto';
  tarjetaAEliminar = null;
}

// Hacer globales para onclick en HTML
window.cerrarModalEliminar = cerrarModalEliminar;
window.confirmarEliminarTarjeta = confirmarEliminarTarjeta;


// ============================================
// 5. LÓGICA DE INTERFAZ (MODALES Y BOTONES)
// ============================================

// Botón Agregar
if(btnAgregar){
  btnAgregar.addEventListener('click', () => {
    limpiarModal();
    const titulo = document.getElementById('tituloModal');
    if(titulo) titulo.textContent='Agregar Tarjeta de Salud';
    editIndex=null;
    currentEditingId=null;
    // refrescar listas
    fetchEnfermedades();
    fetchAnimalesList();
    fetchTratamientos();
    if(modal) modal.style.display='flex';
  });
}

// Ocultar botón agregar si no es veterinario
if (!isVeterinario() && btnAgregar) {
  btnAgregar.style.display = 'none';
}

// Cerrar Modales
if(btnCerrarModal) btnCerrarModal.addEventListener('click', ()=>{ if(modal) modal.style.display='none'; });
if(btnCerrarVisualizar) btnCerrarVisualizar.addEventListener('click', ()=>{ if(modalVisualizar) modalVisualizar.style.display='none'; });

window.addEventListener('click', e => {
  if(e.target === modal) modal.style.display='none';
  if(e.target === modalVisualizar) modalVisualizar.style.display='none';
  if(e.target === modalEliminar) cerrarModalEliminar();
});

function limpiarModal(){
  const inputs = [inputNombre, inputNumArete, inputPeso, inputFechaNac, inputRebano, inputCaract,
                  inputHFecha, inputHEvento, inputHDiag, inputHDesc, inputHTrat, inputHVet, inputHEstado];
  inputs.forEach(i => { if(i) i.value = ''; });
  
  if(selectSexo) selectSexo.value='H';
  if(selectAnimal) selectAnimal.value = '';
  if(selectEnfermedad) selectEnfermedad.value = '';
  if(selectTratamiento) selectTratamiento.value = '';
}


// ============================================
// 6. GUARDAR (CREATE / UPDATE)
// ============================================

if(btnGuardar){
  btnGuardar.addEventListener('click', async ()=>{
    
    // CASO 1: Usando Selects (Backend Relacional)
    if(selectAnimal || selectEnfermedad || selectTratamiento){
      const selAnimal = selectAnimal ? selectAnimal.value : '';
      const selEnf = selectEnfermedad ? selectEnfermedad.value : '';
      const selTrat = selectTratamiento ? selectTratamiento.value : '';

      if(selAnimal || selEnf || selTrat){
        if(!selAnimal || !selEnf || !selTrat){
          mostrarAlerta('Seleccione Animal, Enfermedad y Tratamiento para crear la tarjeta.', 'warning');
          return;
        }

        const payload = {
          idAnimal: { idAnimal: Number(selAnimal) },
          idEnfermedad: { idEnfermedad: Number(selEnf) },
          idTratamiento: { idTratamiento: Number(selTrat) }
        };

        if(currentEditingId){
          await updateTarjetaBackend(currentEditingId, payload);
        } else {
          await sendTarjetaToBackend(payload);
        }
        return;
      }
    }

    // CASO 2: Modo Local / Mixto (si los selects están vacíos o no existen)
    const animal = {
      nombre: inputNombre ? inputNombre.value.trim() : '',
      numArete: inputNumArete ? inputNumArete.value.trim() : '',
      sexo: selectSexo ? selectSexo.value : 'H',
      peso: inputPeso ? inputPeso.value : '',
      // ... otros campos locales
      historial: {
         fecha: inputHFecha ? inputHFecha.value : '',
         // ...
      }
    };
    
    if(!animal.nombre || !animal.numArete){ 
      mostrarAlerta('El nombre y el número de arete son obligatorios', 'warning');
      return; 
    }

    if(editIndex!==null){
      tarjetas[editIndex]=animal;
      mostrarAlerta('Registro actualizado correctamente', 'success');
    }else{
      tarjetas.push(animal);
      mostrarAlerta('Registro agregado correctamente', 'success');
    }

    modal.style.display='none';
    renderizarTabla();
  });
}


// ============================================
// 7. RENDERIZAR TABLA Y VISUALIZAR
// ============================================

function renderizarTabla(lista=tarjetas){
  if(!tablaContenedor) return;
  tablaContenedor.innerHTML='';
  
  if(lista.length===0){
    tablaContenedor.innerHTML='<p>No hay tarjetas registradas.</p>';
    return;
  }

  const tabla = document.createElement('table');
  tabla.innerHTML=`
    <thead>
      <tr>
        <th>Nombre Animal</th>
        <th>Número de Arete</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = tabla.querySelector('tbody');

  lista.forEach((t,i)=>{
    const fila = document.createElement('tr');
    
    // Detectar si es objeto backend o local
    let nombreAnim = '', numArete = '';
    if(t.idTarjeta){
      nombreAnim = (t.idAnimal && (t.idAnimal.nombreAnimal || t.idAnimal.nombre)) || 'Sin nombre';
      numArete = (t.idAnimal && t.idAnimal.numArete) || 'N/A';
    } else {
      nombreAnim = t.nombre || '';
      numArete = t.numArete || '';
    }

    fila.innerHTML=`
      <td>${nombreAnim}</td>
      <td>${numArete}</td>
      <td>
        <button class="btn-ver" title="Ver detalles"><i class="fa-solid fa-eye"></i></button>
        ${ isVeterinario() ? `
          <button class="btn-editar" title="Editar"><i class="fa-solid fa-pencil"></i></button>
          <button class="btn-eliminar" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
        ` : '' }
      </td>
    `;

    // -------------------------
    // EVENTO VISUALIZAR (Estilo Mejorado)
    // -------------------------
    fila.querySelector('.btn-ver').addEventListener('click', () => {
      let html = '';

      if(t.idTarjeta){
        // Datos del backend
        const anim = t.idAnimal || {};
        const enf = t.idEnfermedad || {};
        const trat = t.idTratamiento || {};

        html = `
          <div class="detalle-item">
             <strong>Nombre Animal:</strong>
             <p>${anim.nombreAnimal || anim.nombre || 'N/A'}</p>
          </div>
          <div class="detalle-item">
             <strong>Arete:</strong>
             <p>${anim.numArete || 'N/A'}</p>
          </div>
          <div class="detalle-item">
             <strong>Enfermedad:</strong>
             <p>${enf.nombreEnfermedad || 'N/A'}</p>
          </div>
          <div class="detalle-item">
             <strong>Tipo Enfermedad:</strong>
             <p>${enf.tipoEnfermedad || 'N/A'}</p>
          </div>
          <div class="detalle-item">
             <strong>Tratamiento:</strong>
             <p>${trat.nombreTratamiento || 'N/A'}</p>
          </div>
          <div class="detalle-item">
             <strong>Dosis Recomendada:</strong>
             <p>${trat.dosisRecomendada || 'No especificada'}</p>
          </div>
        `;
      } else {
        // Datos locales
        html = `
          <div class="detalle-item">
             <strong>Nombre:</strong> <p>${t.nombre}</p>
          </div>
          <div class="detalle-item">
             <strong>Arete:</strong> <p>${t.numArete}</p>
          </div>
          <div class="detalle-item">
             <strong>Sexo:</strong> <p>${t.sexo}</p>
          </div>
          <div class="detalle-item">
             <strong>Peso:</strong> <p>${t.peso}</p>
          </div>
          <div class="detalle-item">
             <strong>Rebaño:</strong> <p>${t.rebano}</p>
          </div>
        `;
      }

      contenidoVisualizar.innerHTML = html;
      modalVisualizar.style.display = 'flex';
    });

    // EVENTO EDITAR
    const btnEditar = fila.querySelector('.btn-editar');
    if(btnEditar){
      btnEditar.addEventListener('click', async ()=>{
        if(t.idTarjeta){
          // Backend edit
          await Promise.all([fetchEnfermedades(), fetchAnimalesList(), fetchTratamientos()]);
          
          const aid = (t.idAnimal && (t.idAnimal.idAnimal || t.idAnimal.id)) || '';
          const eid = (t.idEnfermedad && (t.idEnfermedad.idEnfermedad || t.idEnfermedad.id)) || '';
          const trid = (t.idTratamiento && (t.idTratamiento.idTratamiento || t.idTratamiento.id)) || '';
          
          if(selectAnimal) selectAnimal.value = String(aid);
          if(selectEnfermedad) selectEnfermedad.value = String(eid);
          if(selectTratamiento) selectTratamiento.value = String(trid);
          
          currentEditingId = t.idTarjeta;
          editIndex = i;
          if(btnGuardar) btnGuardar.textContent = 'Actualizar';
          if(modal) modal.style.display='flex';
        } else {
          // Local edit
          if(inputNombre) inputNombre.value = t.nombre;
          if(inputNumArete) inputNumArete.value = t.numArete;
          editIndex=i;
          if(modal) modal.style.display='flex';
        }
      });
    }

    // EVENTO ELIMINAR
    const btnDel = fila.querySelector('.btn-eliminar');
    if(btnDel){
      btnDel.addEventListener('click', () => {
        abrirModalEliminar(t);
      });
    }

    tbody.appendChild(fila);
  });

  tablaContenedor.appendChild(tabla);
}

function confirmarEliminarTarjeta() {
  if (tarjetaAEliminar) {
    if(tarjetaAEliminar.idTarjeta){
      const id = tarjetaAEliminar.idTarjeta;
      deleteTarjetaBackend(id);
    } else {
      const idx = tarjetas.indexOf(tarjetaAEliminar);
      if (idx > -1) tarjetas.splice(idx, 1);
      renderizarTabla();
      mostrarAlerta('Eliminado correctamente', 'success');
    }
    cerrarModalEliminar();
  }
}


// ============================================
// 8. PETICIONES BACKEND (FETCH)
// ============================================

async function fetchEnfermedades(){
  try{
    const res = await fetch('http://100.30.25.253:7000/enfermedades', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    const data = await res.json();
    if(selectEnfermedad){
      selectEnfermedad.innerHTML = '<option value="">-- Seleccione una enfermedad --</option>';
      (data || []).forEach(e => {
        const o = document.createElement('option');
        o.value = e.idEnfermedad || e.id;
        o.textContent = e.nombreEnfermedad || e.nombre;
        selectEnfermedad.appendChild(o);
      });
    }
  }catch(err){ console.error(err); }
}

async function fetchAnimalesList(){
  try{
    const res = await fetch('http://100.30.25.253:7000/animales', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    const data = await res.json();
    if(selectAnimal){
      selectAnimal.innerHTML = '<option value="">-- Seleccione un animal --</option>';
      (data || []).forEach(a => {
        const o = document.createElement('option');
        o.value = a.idAnimal || a.id;
        o.textContent = `${a.nombreAnimal || a.nombre} (${a.numArete})`;
        selectAnimal.appendChild(o);
      });
    }
  }catch(err){ console.error(err); }
}

async function fetchTratamientos(){
  try{
    const res = await fetch('http://100.30.25.253:7000/tratamientos', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    const data = await res.json();
    if(selectTratamiento){
      selectTratamiento.innerHTML = '<option value="">-- Seleccione un tratamiento --</option>';
      (data || []).forEach(t => {
        const o = document.createElement('option');
        o.value = t.idTratamiento || t.id;
        o.textContent = t.nombreTratamiento || t.nombre;
        selectTratamiento.appendChild(o);
      });
    }
  }catch(err){ console.error(err); }
}

async function fetchTarjetasFromBackend(){
  try{
    const res = await fetch('http://100.30.25.253:7000/tarjetas', { headers: await getAuthHeaders() });
    if(!res.ok) return;
    const data = await res.json();
    tarjetas = (data || []).map(item => ({
      idTarjeta: item.idTarjeta || item.id,
      idAnimal: item.idAnimal,
      idEnfermedad: item.idEnfermedad,
      idTratamiento: item.idTratamiento
    }));
    renderizarTabla();
  }catch(err){ console.error(err); }
}

async function sendTarjetaToBackend(payload){
  try{
    const res = await fetch('http://100.30.25.253:7000/tarjetas', {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if(!res.ok){
      mostrarAlerta(`Error creando tarjeta: ${res.status}`, 'error');
      return;
    }
    mostrarAlerta('Tarjeta creada correctamente', 'success');
    if(modal) modal.style.display='none';
    fetchTarjetasFromBackend(); // Recargar todo
  }catch(err){ console.error(err); mostrarAlerta('Error de conexión', 'error'); }
}

async function updateTarjetaBackend(id, payload){
  try{
    const bodyPayload = Object.assign({}, payload, { idTarjeta: Number(id) });
    const res = await fetch(`http://100.30.25.253:7000/tarjetas/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(bodyPayload)
    });
    if(!res.ok){
      mostrarAlerta('Error actualizando tarjeta', 'error');
      return;
    }
    mostrarAlerta('Tarjeta actualizada correctamente', 'success');
    if(modal) modal.style.display='none';
    currentEditingId = null;
    if(btnGuardar) btnGuardar.textContent = 'Guardar';
    fetchTarjetasFromBackend();
  }catch(err){ console.error(err); mostrarAlerta('Error de conexión', 'error'); }
}

async function deleteTarjetaBackend(id){
  try{
    const res = await fetch(`http://100.30.25.253:7000/tarjetas/${id}`, { method: 'DELETE', headers: await getAuthHeaders() });
    if(!res.ok) throw new Error('DELETE failed');
    mostrarAlerta('Tarjeta eliminada correctamente', 'success');
    fetchTarjetasFromBackend();
  }catch(err){ console.error(err); mostrarAlerta('No se pudo eliminar la tarjeta', 'error'); }
}

// ============================================
// 9. INICIALIZACIÓN
// ============================================

// Buscador
if(buscador){
  buscador.addEventListener('input',()=>{
    const texto=buscador.value.toLowerCase();
    const filtrados = tarjetas.filter(t => {
      let nombre = '', arete = '';
      if(t.idTarjeta){
         nombre = (t.idAnimal && (t.idAnimal.nombreAnimal || t.idAnimal.nombre)) || '';
         arete = (t.idAnimal && t.idAnimal.numArete) || '';
      } else {
         nombre = t.nombre || '';
         arete = t.numArete || '';
      }
      return String(nombre).toLowerCase().includes(texto) || String(arete).toLowerCase().includes(texto);
    });
    renderizarTabla(filtrados);
  });
}

// Cargar Datos
fetchEnfermedades();
fetchAnimalesList();
fetchTratamientos();
fetchTarjetasFromBackend();