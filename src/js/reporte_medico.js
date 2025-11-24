// =====================
// SISTEMA DE ALERTAS (NOTIFICACIONES)
// =====================
function mostrarAlerta(tipo, titulo, mensaje) {
    // Mapeo de iconos según el tipo
    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    const iconoClase = iconos[tipo] || iconos.info;

    const overlay = document.createElement("div");
    overlay.classList.add("alerta-overlay", "active");

    overlay.innerHTML = `
        <div class="alerta-container">
            <div class="alerta-header ${tipo}">
                <span class="alerta-icon"><i class="fas ${iconoClase}"></i></span>
                <h3 class="alerta-title">${titulo}</h3>
            </div>
            <div class="alerta-body">
                <p class="alerta-message">${mensaje}</p>
            </div>
            <div class="alerta-footer">
                <button class="btn-alerta-ok">Aceptar</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const btnOk = overlay.querySelector(".btn-alerta-ok");
    btnOk.focus();

    btnOk.addEventListener("click", () => {
        overlay.remove();
    });

    // Cerrar con Enter o Escape
    overlay.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'Escape') overlay.remove();
    });
}

// =====================
// SISTEMA DE CONFIRMACIÓN (MODAL ELIMINAR)
// =====================
function mostrarConfirmacion(titulo, mensaje) {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        // Usamos la clase 'modal-overlay' del CSS de confirmación
        overlay.classList.add("modal-overlay", "active");

        // Estructura HTML coincidente con tu CSS de Confirmación
        overlay.innerHTML = `
            <div class="modal-container">
                <div class="modal-header-custom">
                    <h2 class="modal-title-custom">
                        <i class="fas fa-trash-alt"></i> ${titulo}
                    </h2>
                    <button class="btn-close-custom">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body-custom">
                    <div class="modal-icon-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <p class="modal-message">¿Estás seguro?</p>
                    <p class="modal-submessage">${mensaje}</p>
                </div>
                <div class="modal-footer-custom">
                    <button class="btn-modal-cancelar">Cancelar</button>
                    <button class="btn-modal-confirmar">Eliminar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const btnSi = overlay.querySelector('.btn-modal-confirmar');
        const btnNo = overlay.querySelector('.btn-modal-cancelar');
        const btnClose = overlay.querySelector('.btn-close-custom');

        const cleanup = () => { 
            if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); 
        };

        btnSi.addEventListener('click', () => { cleanup(); resolve(true); });
        btnNo.addEventListener('click', () => { cleanup(); resolve(false); });
        btnClose.addEventListener('click', () => { cleanup(); resolve(false); });
    });
}


// =====================
// VARIABLES DOM
// =====================
const btnAgregar = document.querySelector(".btn-agregar");
const modalAgregar = document.getElementById("modalAgregarReporte");
const modalVisualizar = document.getElementById("modalVisualizarReporte");

const btnCerrarAgregar = document.getElementById("btnCerrarModal");
const btnCerrarVisualizar = document.getElementById("btnCerrarVisualizar");
const btnGuardar = document.getElementById("btnGuardarReporte");

const tabla = document.querySelector(".tabla-animales");
const selectAnimalReporte = document.getElementById('selectAnimalReporte');


// =====================
// HELPERS (AUTH & ROLES)
// =====================
async function getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    let idUsuarioHeader = '';
    if (datosUsuarioRaw) {
        try {
            const parsed = JSON.parse(datosUsuarioRaw);
            if (parsed && (parsed.idUsuario || parsed.id)) {
                idUsuarioHeader = String(parsed.idUsuario || parsed.id);
            } else if (parsed && parsed.usuario) {
                idUsuarioHeader = String(parsed.usuario);
            }
        } catch (e) {
            idUsuarioHeader = String(datosUsuarioRaw);
        }
    }
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(idUsuarioHeader ? { 'Id-Usuario': idUsuarioHeader } : {})
    };
}

function getCurrentUserRole() {
    const datosStr = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    if (!datosStr) return '';
    try { const d = JSON.parse(datosStr); return (d.rolNombre || (d.rol && (d.rol.nombre || (d.rol.idRol === 1 ? 'Administrador' : ''))) || d.rol || '').toString().toLowerCase(); } catch (e) { return String(datosStr).toLowerCase(); }
}
function isAdmin() { const r = getCurrentUserRole(); return r.includes('admin') || r.includes('administrador'); }
function isVeterinario() { const r = getCurrentUserRole(); return r.includes('veterinario') || r.includes('vet'); }


// =====================
// FETCH DATA
// =====================

// Cargar animales para el select
async function fetchAnimalesForSelect() {
    try {
        console.debug('GET /animales for select');
        const res = await fetch('http://100.30.25.253:7000/animales', { headers: await getAuthHeaders() });
        const text = await res.text();
        if (!res.ok) { console.error('Error cargando animales', res.status, text); return; }
        let data = [];
        if (text) { try { data = JSON.parse(text); } catch (e) { console.warn('fetchAnimalesForSelect: not JSON', text); return; } }
        if (selectAnimalReporte) {
            selectAnimalReporte.innerHTML = '<option value="">-- Seleccione un animal --</option>';
            (data || []).forEach(a => {
                const id = a.idAnimal || a.id;
                const name = a.nombreAnimal || a.nombre || `Animal ${id}`;
                const o = document.createElement('option');
                o.value = id;
                o.textContent = `${name} (arete ${a.numArete || ''})`;
                selectAnimalReporte.appendChild(o);
            });
        }
    } catch (err) { console.error(err); }
}

// Cargar reportes del backend
async function fetchReportes() {
    try {
        console.debug('GET /reportes');
        const res = await fetch('http://100.30.25.253:7000/reportes', { headers: await getAuthHeaders() });
        const text = await res.text();
        if (!res.ok) { console.error('Error cargando reportes', res.status, text); return; }
        let data = [];
        if (text) { try { data = JSON.parse(text); } catch (e) { console.warn('fetchReportes: not JSON', text); return; } }
        console.debug('GET /reportes response', data);
        
        reportes = (data || []).map(item => ({
            idReporte: item.idReporte || item.id,
            idAnimales: item.idAnimales,
            idUsuario: item.idUsuario,
            temperatura: item.temperatura,
            condicionCorporal: item.condicionCorporal,
            veterinario: item.veterinario || item.nombreVeterinario || '',
            frecuenciaRespiratoria: item.frecuenciaRespiratoria,
            fecha: Array.isArray(item.fecha) ? item.fecha.join('-') : item.fecha,
            diagnosticoPresuntivo: item.diagnosticoPresuntivo,
            diagnosticoDefinitivo: item.diagnosticoDefinitivo,
            sintomas: item.sintomas || item.sintomasObservados || '',
            tratamiento: item.tratamiento || item.tratamientoAplicado || '',
            medicamentos: item.medicamentos || '',
            observaciones: item.observaciones || ''
        }));
        mostrarTabla();
    } catch (err) { console.error(err); }
}

// Resolver ID de usuario
async function resolveUsuarioId(usuarioString) {
    if (!usuarioString) return null;
    try {
        console.debug('Resolving usuario id for', usuarioString);
        const res = await fetch('http://100.30.25.253:7000/usuarios', { headers: await getAuthHeaders() });
        const text = await res.text();
        if (!res.ok) { console.warn('Could not fetch usuarios to resolve id', res.status, text); return null; }
        let list = [];
        if (text) { try { list = JSON.parse(text); } catch (e) { console.warn('resolveUsuarioId: usuarios response not JSON', text); return null; } }
        
        const found = (list || []).find(u => {
            const uname = u.usuario || u.nombreUsuario || u.correo || '';
            return String(uname).toLowerCase() === String(usuarioString).toLowerCase();
        });
        if (found) {
            return found.idUsuario || found.id || null;
        }
        return null;
    } catch (e) { console.error(e); return null; }
}


// =====================
// OPERACIONES CRUD (POST / PUT / DELETE)
// =====================

async function sendReporteToBackend(payload, idUsuarioHeaderOverride) {
    try {
        console.debug('POST /reportes payload', payload);
        const baseHeaders = await getAuthHeaders();
        if (idUsuarioHeaderOverride) {
            baseHeaders['Id-Usuario'] = String(idUsuarioHeaderOverride);
        }
        const res = await fetch('http://100.30.25.253:7000/reportes', {
            method: 'POST',
            headers: baseHeaders,
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        let created = null;
        if (text) { try { created = JSON.parse(text); } catch (e) { created = text; } }
        if (!res.ok) { console.error('POST /reportes error', res.status, created); mostrarAlerta('warning', 'Error', 'No se pudo crear el reporte.'); return; }
        
        mostrarAlerta('success', 'Creado', 'Reporte médico creado correctamente.');
        if (modalAgregar) modalAgregar.style.display = 'none';
        fetchReportes();
    } catch (err) { console.error(err); mostrarAlerta('warning', 'Error', 'Error creando reporte'); }
}

async function updateReporteBackend(payload, id, idUsuarioHeaderOverride) {
    try {
        if (!id) throw new Error('Missing id for update');
        payload.idReporte = Number(id);
        console.debug(`PUT /reportes/${id} payload`, payload);
        const baseHeaders = await getAuthHeaders();
        if (idUsuarioHeaderOverride) { baseHeaders['Id-Usuario'] = String(idUsuarioHeaderOverride); }
        
        const res = await fetch(`http://100.30.25.253:7000/reportes/${id}`, {
            method: 'PUT',
            headers: baseHeaders,
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        let updated = null;
        if (text) { try { updated = JSON.parse(text); } catch (e) { updated = text; } }
        if (!res.ok) { console.error('PUT /reportes error', res.status, updated); mostrarAlerta('warning', 'Error', 'No se pudo actualizar el reporte.'); return; }
        
        mostrarAlerta('success', 'Actualizado', 'Reporte médico actualizado correctamente.');
        if (modalAgregar) modalAgregar.style.display = 'none';
        currentEditingId = null;
        // Restaurar título del modal
        const hdr = modalAgregar && modalAgregar.querySelector('h2'); if (hdr) hdr.textContent = 'Agregar Reporte Médico';
        if (btnGuardar) btnGuardar.textContent = 'Guardar';
        fetchReportes();
    } catch (err) { console.error(err); mostrarAlerta('warning', 'Error', 'Error actualizando reporte'); }
}

async function eliminarReporte(i) {
    const r = reportes[i];
    if (!r) { mostrarAlerta('warning', 'Error', 'Reporte no encontrado'); return; }

    // USAR LA NUEVA FUNCIÓN DE CONFIRMACIÓN
    const confirmado = await mostrarConfirmacion('Eliminar reporte', '¿Estás segura de que deseas eliminar este reporte?');
    if (!confirmado) return;

    // Obtener idUsuario para header
    const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    let idUsuario = null;
    if (datosUsuarioRaw) {
        try {
            const parsed = JSON.parse(datosUsuarioRaw);
            if (parsed && (parsed.idUsuario || parsed.id)) idUsuario = parsed.idUsuario || parsed.id;
            else if (parsed && parsed.usuario) idUsuario = parsed.usuario;
        } catch (e) { idUsuario = datosUsuarioRaw; }
    }

    let resolvedIdForHeader = null;
    if (typeof idUsuario === 'number' && idUsuario > 0) resolvedIdForHeader = idUsuario;
    else if (typeof idUsuario === 'string' && idUsuario.trim()) {
        const resolved = await resolveUsuarioId(idUsuario);
        if (resolved) resolvedIdForHeader = resolved;
    }

    if (!resolvedIdForHeader) {
        mostrarAlerta('warning', 'Usuario no válido', 'No se pudo determinar un id de usuario numérico para eliminar.');
        return;
    }

    try {
        const headers = await getAuthHeaders();
        headers['Id-Usuario'] = String(resolvedIdForHeader);
        console.debug(`DELETE /reportes/${r.idReporte}`, { headers });
        const res = await fetch(`http://100.30.25.253:7000/reportes/${r.idReporte}`, { method: 'DELETE', headers });
        const text = await res.text();
        if (!res.ok) { console.error('DELETE error', res.status, text); mostrarAlerta('warning', 'Error', 'No se pudo eliminar el reporte.'); return; }
        
        reportes.splice(i, 1);
        mostrarTabla();
        mostrarAlerta('success', 'Eliminado', 'El reporte se eliminó correctamente.');
    } catch (err) { console.error(err); mostrarAlerta('warning', 'Error', 'Error eliminando reporte'); }
}


// =====================
// VARIABLES DE ESTADO Y EVENTOS
// =====================
let reportes = [];
let editIndex = -1;
let currentEditingId = null;

// Abrir Modal Agregar
if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
        fetchAnimalesForSelect();
        modalAgregar.style.display = "flex";
        limpiarCampos();
        editIndex = -1;
        // Restaurar textos por defecto
        const hdr = modalAgregar.querySelector('h2'); if(hdr) hdr.textContent = 'Agregar Reporte Médico';
        if(btnGuardar) btnGuardar.textContent = 'Guardar';
    });
}

// Ocultar botón agregar si es admin
if (isAdmin() && btnAgregar) {
    btnAgregar.style.display = 'none';
}

// Cerrar Modales
btnCerrarAgregar.addEventListener("click", () => {
    modalAgregar.style.display = "none";
    currentEditingId = null;
});

btnCerrarVisualizar.addEventListener("click", () => {
    modalVisualizar.style.display = "none";
});


// Botón Guardar (Create / Update)
btnGuardar.addEventListener("click", async () => {
    const selectedAnimal = selectAnimalReporte ? selectAnimalReporte.value : '';
    const fecha = document.getElementById("fecha").value;
    const temperatura = document.getElementById("temperatura").value;
    const condicionCorporal = document.getElementById("condicionCorporal").value;
    const frecuenciaRespiratoria = document.getElementById("frecuenciaRespiratoria").value;
    const diagnosticoPresuntivo = document.getElementById("diagnosticoPresuntivo").value;
    const diagnosticoDefinitivo = document.getElementById("diagnosticoDefinitivo").value;
    const sintomas = document.getElementById("sintomas").value;
    const tratamiento = document.getElementById("tratamiento").value;
    const medicamentos = document.getElementById("medicamentos").value;
    const observaciones = document.getElementById("observaciones").value;
    const veterinario = document.getElementById("veterinario").value;

    if (!selectedAnimal || !fecha) {
        mostrarAlerta('warning', 'Campos incompletos', 'Seleccione un animal y fecha.');
        return;
    }

    // Obtener ID Usuario
    const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    let idUsuario = null;
    if (datosUsuarioRaw) {
        try {
            const parsed = JSON.parse(datosUsuarioRaw);
            if (parsed && (parsed.idUsuario || parsed.id)) idUsuario = parsed.idUsuario || parsed.id;
            else if (parsed && parsed.usuario) idUsuario = parsed.usuario;
        } catch (e) { idUsuario = datosUsuarioRaw; }
    }
    const idUsuarioForPayload = (!isNaN(Number(idUsuario)) && idUsuario !== null) ? Number(idUsuario) : idUsuario || 0;

    const payload = {
        idAnimales: { idAnimal: Number(selectedAnimal) },
        idUsuario: { idUsuario: idUsuarioForPayload },
        temperatura: Number(temperatura) || 0,
        condicionCorporal: condicionCorporal || '',
        frecuenciaRespiratoria: Number(frecuenciaRespiratoria) || 0,
        fecha: fecha,
        diagnosticoPresuntivo: diagnosticoPresuntivo || '',
        diagnosticoDefinitivo: diagnosticoDefinitivo || '',
        sintomas: sintomas || '',
        tratamiento: tratamiento || '',
        medicamentos: medicamentos || '',
        observaciones: observaciones || '',
        veterinario: veterinario || ''
    };

    let resolvedIdForHeader = null;
    if (typeof idUsuarioForPayload === 'number' && idUsuarioForPayload > 0) {
        resolvedIdForHeader = idUsuarioForPayload;
    } else if (typeof idUsuarioForPayload === 'string' && idUsuarioForPayload.trim()) {
        const resolved = await resolveUsuarioId(idUsuarioForPayload);
        if (resolved) {
            resolvedIdForHeader = resolved;
            payload.idUsuario.idUsuario = resolved;
        }
    }

    if (!resolvedIdForHeader) {
        mostrarAlerta('warning', 'Usuario no válido', 'No se pudo determinar un ID de usuario válido.');
        return;
    }

    if (currentEditingId) {
        await updateReporteBackend(payload, currentEditingId, resolvedIdForHeader);
    } else {
        await sendReporteToBackend(payload, resolvedIdForHeader);
    }
});


// =====================
// MOSTRAR TABLA
// =====================
function mostrarTabla() {
    if (reportes.length === 0) {
        tabla.innerHTML = "<p>No hay reportes registrados.</p>";
        return;
    }

    let html = `
        <table border="1" class="tabla-estilo">
            <tr>
                <th>Arete</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Temperatura</th>
                <th>Acciones</th>
            </tr>
    `;

    reportes.forEach((r, index) => {
        const arete = (r.idAnimales && (r.idAnimales.numArete || r.idAnimales.numArete === 0)) ? r.idAnimales.numArete : '';
        const nombre = (r.idAnimales && (r.idAnimales.nombreAnimal || r.idAnimales.nombre)) ? (r.idAnimales.nombreAnimal || r.idAnimales.nombre) : '';
        html += `
            <tr>
                <td>${arete}</td>
                <td>${nombre}</td>
                <td>${r.fecha}</td>
                <td>${r.temperatura}</td>
                <td>
                     <button class="btn-ver" title="Ver detalles" onclick="verReporte(${index})">
                        <i class="fa-solid fa-eye"></i>
                     </button>

                    ${isVeterinario() ? `
                        <button onclick="editarReporte(${index})" class="btn-editar" title="Editar">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button onclick="eliminarReporte(${index})" class="btn-eliminar" title="Eliminar">
                            <i class="fa-solid fa-trash"></i>
                        </button>`
            : ''}
                </td>
            </tr>
        `;
    });

    html += "</table>";
    tabla.innerHTML = html;
}


// =====================
// VISUALIZAR REPORTE (CORREGIDO)
// =====================
function verReporte(i) {
    const r = reportes[i];
    const anim = r.idAnimales || {};
    
    // Aquí generamos cada bloque con la clase "detalle-item" para que el CSS ponga las líneas
    let contenido = `
        <div class="detalle-item">
            <strong>Arete:</strong>
            <p>${anim.numArete || 'N/A'}</p>
        </div>

        <div class="detalle-item">
            <strong>Nombre Animal:</strong>
            <p>${anim.nombreAnimal || anim.nombre || 'N/A'}</p>
        </div>

        <div class="detalle-item">
            <strong>Fecha:</strong>
            <p>${r.fecha || '--/--/----'}</p>
        </div>

        <div class="detalle-item">
            <strong>Veterinario:</strong>
            <p>${r.veterinario || 'No especificado'}</p>
        </div>

        <div class="detalle-item">
            <strong>Temperatura:</strong>
            <p>${r.temperatura ? r.temperatura + ' °C' : 'Sin datos'}</p>
        </div>

        <div class="detalle-item">
            <strong>Condición Corporal:</strong>
            <p>${r.condicionCorporal || 'Sin datos'}</p>
        </div>

        <div class="detalle-item">
            <strong>Frecuencia Respiratoria:</strong>
            <p>${r.frecuenciaRespiratoria ? r.frecuenciaRespiratoria + ' rpm' : 'Sin datos'}</p>
        </div>

        <div class="detalle-item">
            <strong>Diagnóstico Presuntivo:</strong>
            <p>${r.diagnosticoPresuntivo || 'Ninguno'}</p>
        </div>

        <div class="detalle-item">
            <strong>Diagnóstico Definitivo:</strong>
            <p>${r.diagnosticoDefinitivo || 'Ninguno'}</p>
        </div>

        <div class="detalle-item">
            <strong>Síntomas:</strong>
            <p>${r.sintomas || 'No registrados'}</p>
        </div>

        <div class="detalle-item">
            <strong>Tratamiento:</strong>
            <p>${r.tratamiento || 'Ninguno'}</p>
        </div>

        <div class="detalle-item">
            <strong>Medicamentos:</strong>
            <p>${r.medicamentos || 'Ninguno'}</p>
        </div>

        <div class="detalle-item">
            <strong>Observaciones:</strong>
            <p>${r.observaciones || 'Ninguna'}</p>
        </div>
    `;

    const cont = document.getElementById("contenidoReporte");
    if (cont) cont.innerHTML = contenido;
    if (modalVisualizar) modalVisualizar.style.display = "flex";
}


// =====================
// EDITAR REPORTE
// =====================
function editarReporte(i) {
    const r = reportes[i];
    editIndex = i;
    currentEditingId = r.idReporte || null;
    
    if (selectAnimalReporte && r.idAnimales && (r.idAnimales.idAnimal || r.idAnimales.id)) {
        selectAnimalReporte.value = r.idAnimales.idAnimal || r.idAnimales.id;
    }
    
    // Cambiar título del modal
    const hdr = modalAgregar && modalAgregar.querySelector('h2'); if (hdr) hdr.textContent = 'Editar Reporte Médico';
    if (btnGuardar) btnGuardar.textContent = 'Actualizar';

    const setVal = (id, val) => { const el = document.getElementById(id); if(el) el.value = val || ''; };
    
    setVal("fecha", r.fecha);
    setVal("temperatura", r.temperatura);
    setVal("condicionCorporal", r.condicionCorporal);
    setVal("frecuenciaRespiratoria", r.frecuenciaRespiratoria);
    setVal("diagnosticoPresuntivo", r.diagnosticoPresuntivo);
    setVal("diagnosticoDefinitivo", r.diagnosticoDefinitivo);
    setVal("veterinario", r.veterinario);
    setVal("sintomas", r.sintomas);
    setVal("tratamiento", r.tratamiento);
    setVal("medicamentos", r.medicamentos);
    setVal("observaciones", r.observaciones);
    setVal("estado", r.estado || 'Estable'); // Si tienes campo estado

    if (modalAgregar) modalAgregar.style.display = "flex";
}


// =====================
// LIMPIAR CAMPOS
// =====================
function limpiarCampos() {
    const el = id => document.getElementById(id);
    const campos = ['selectAnimalReporte', 'fecha', 'veterinario', 'temperatura', 
                    'condicionCorporal', 'frecuenciaRespiratoria', 'diagnosticoPresuntivo', 
                    'diagnosticoDefinitivo', 'sintomas', 'tratamiento', 'medicamentos', 'observaciones'];
    
    campos.forEach(id => {
        const element = el(id);
        if(element) element.value = '';
    });
    
    const estado = el('estado');
    if(estado) estado.value = 'Estable';
}

// =====================
// EXPORTAR FUNCIONES AL WINDOW (Para onclick en HTML)
// =====================
window.verReporte = verReporte;
window.editarReporte = editarReporte;
window.eliminarReporte = eliminarReporte;

// Inicializar
fetchAnimalesForSelect();
fetchReportes();