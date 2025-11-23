// =====================
// SISTEMA DE ALERTAS PERSONALIZADAS
// =====================
function mostrarAlerta(tipo, titulo, mensaje) {
    const overlay = document.createElement("div");
    overlay.classList.add("alerta-overlay", "active");

    overlay.innerHTML = `
        <div class="alerta-container">
            <div class="alerta-header ${tipo}">
                <span class="alerta-icon">⚠️</span>
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

    overlay.querySelector(".btn-alerta-ok").addEventListener("click", () => {
        overlay.remove();
    });
}

// Mostrar confirmación con botones Sí / No. Devuelve Promise<boolean>.
function mostrarConfirmacion(titulo, mensaje) {
    return new Promise(resolve => {
        const overlay = document.createElement("div");
        overlay.classList.add("alerta-overlay", "active");

        overlay.innerHTML = `
                <div class="alerta-container">
                    <div class="alerta-header warning">
                        <span class="alerta-icon">⚠️</span>
                        <h3 class="alerta-title">${titulo}</h3>
                    </div>
                    <div class="alerta-body">
                        <p class="alerta-message">${mensaje}</p>
                    </div>
                    <div class="alerta-footer">
                        <button class="btn-alerta-ok btn-confirm-si">Sí</button>
                        <button class="btn-alerta-ok btn-confirm-no">No</button>
                    </div>
                </div>
            `;

        document.body.appendChild(overlay);

        const btnSi = overlay.querySelector('.btn-confirm-si');
        const btnNo = overlay.querySelector('.btn-confirm-no');

        const cleanup = () => { if(overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay); };

        btnSi.addEventListener('click', () => { cleanup(); resolve(true); });
        btnNo.addEventListener('click', () => { cleanup(); resolve(false); });
    });
}



// =====================
// VARIABLES
// =====================
const btnAgregar = document.querySelector(".btn-agregar");
const modalAgregar = document.getElementById("modalAgregarReporte");
const modalVisualizar = document.getElementById("modalVisualizarReporte");

const btnCerrarAgregar = document.getElementById("btnCerrarModal");
const btnCerrarVisualizar = document.getElementById("btnCerrarVisualizar");
const btnGuardar = document.getElementById("btnGuardarReporte");

const tabla = document.querySelector(".tabla-animales");

// selects y elementos nuevos
const selectAnimalReporte = document.getElementById('selectAnimalReporte');

// helper headers
async function getAuthHeaders() {
    const token = localStorage.getItem('token') || '';
    // prefer sessionStorage for user session data, fallback to localStorage
    const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    let idUsuarioHeader = '';
    if (datosUsuarioRaw) {
        try {
            const parsed = JSON.parse(datosUsuarioRaw);
            // prefer numeric id fields if available
            if (parsed && (parsed.idUsuario || parsed.id)) {
                idUsuarioHeader = String(parsed.idUsuario || parsed.id);
            } else if (parsed && parsed.usuario) {
                // fallback to username string if no numeric id
                idUsuarioHeader = String(parsed.usuario);
            }
        } catch (e) {
            // raw string stored
            idUsuarioHeader = String(datosUsuarioRaw);
        }
    }
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(idUsuarioHeader ? { 'Id-Usuario': idUsuarioHeader } : {})
    };
}

// Role helpers
function getCurrentUserRole() {
    const datosStr = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    if (!datosStr) return '';
    try { const d = JSON.parse(datosStr); return (d.rolNombre || (d.rol && (d.rol.nombre || (d.rol.idRol===1?'Administrador':''))) || d.rol || '').toString().toLowerCase(); } catch(e){ return String(datosStr).toLowerCase(); }
}
function isAdmin(){ const r = getCurrentUserRole(); return r.includes('admin') || r.includes('administrador'); }
function isVeterinario(){ const r = getCurrentUserRole(); return r.includes('veterinario') || r.includes('vet'); }

// Fetch animales to populate select
async function fetchAnimalesForSelect(){
    try{
        console.debug('GET /animales for select');
        const res = await fetch('http://100.30.25.253:7000/animales', { headers: await getAuthHeaders() });
        const text = await res.text();
        if(!res.ok){ console.error('Error cargando animales', res.status, text); return; }
        let data = [];
        if(text){ try{ data = JSON.parse(text); }catch(e){ console.warn('fetchAnimalesForSelect: not JSON', text); return; } }
        if(selectAnimalReporte){
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
    }catch(err){ console.error(err); }
}

// Fetch reportes from backend
async function fetchReportes(){
    try{
        console.debug('GET /reportes');
        const res = await fetch('http://100.30.25.253:7000/reportes', { headers: await getAuthHeaders() });
        const text = await res.text();
        if(!res.ok){ console.error('Error cargando reportes', res.status, text); return; }
        let data = [];
        if(text){ try{ data = JSON.parse(text); }catch(e){ console.warn('fetchReportes: not JSON', text); return; } }
        console.debug('GET /reportes response', data);
        // map into local reportes array
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
    }catch(err){ console.error(err); }
}

// Send POST to create reporte
async function sendReporteToBackend(payload, idUsuarioHeaderOverride){
    try{
        console.debug('POST /reportes payload', payload);
        const baseHeaders = await getAuthHeaders();
        // override Id-Usuario header if caller resolved a numeric id
        if(idUsuarioHeaderOverride){
            baseHeaders['Id-Usuario'] = String(idUsuarioHeaderOverride);
        }
        const res = await fetch('http://100.30.25.253:7000/reportes', {
            method: 'POST',
            headers: baseHeaders,
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        let created = null;
        if(text){ try{ created = JSON.parse(text); }catch(e){ created = text; } }
        if(!res.ok){ console.error('POST /reportes error', res.status, created); mostrarAlerta('warning','Error','No se pudo crear el reporte.'); return; }
        console.debug('POST /reportes response', created);
        mostrarAlerta('success','Creado','Reporte médico creado correctamente.');
        if(modalAgregar) modalAgregar.style.display = 'none';
        // refresh
        fetchReportes();
    }catch(err){ console.error(err); mostrarAlerta('warning','Error','Error creando reporte'); }
}

// Update existing reporte via PUT /reportes/{id}
async function updateReporteBackend(payload, id, idUsuarioHeaderOverride){
    try{
        if(!id) throw new Error('Missing id for update');
        // ensure payload contains idReporte matching route
        payload.idReporte = Number(id);
        console.debug(`PUT /reportes/${id} payload`, payload);
        const baseHeaders = await getAuthHeaders();
        if(idUsuarioHeaderOverride){ baseHeaders['Id-Usuario'] = String(idUsuarioHeaderOverride); }
        const res = await fetch(`http://100.30.25.253:7000/reportes/${id}`, {
            method: 'PUT',
            headers: baseHeaders,
            body: JSON.stringify(payload)
        });
        const text = await res.text();
        let updated = null;
        if(text){ try{ updated = JSON.parse(text); }catch(e){ updated = text; } }
        if(!res.ok){ console.error('PUT /reportes error', res.status, updated); mostrarAlerta('warning','Error','No se pudo actualizar el reporte.'); return; }
        console.debug('PUT /reportes response', updated);
        mostrarAlerta('success','Actualizado','Reporte médico actualizado correctamente.');
        if(modalAgregar) modalAgregar.style.display = 'none';
        currentEditingId = null;
        // restore modal title/button
        const hdr = modalAgregar && modalAgregar.querySelector('h2'); if(hdr) hdr.textContent = 'Agregar Reporte Médico';
        if(btnGuardar) btnGuardar.textContent = 'Guardar';
        // refresh
        fetchReportes();
    }catch(err){ console.error(err); mostrarAlerta('warning','Error','Error actualizando reporte'); }
}

// Try to resolve a username/string to numeric user id by querying /usuarios
async function resolveUsuarioId(usuarioString){
    if(!usuarioString) return null;
    try{
        console.debug('Resolving usuario id for', usuarioString);
        const res = await fetch('http://100.30.25.253:7000/usuarios', { headers: await getAuthHeaders() });
        const text = await res.text();
        if(!res.ok){ console.warn('Could not fetch usuarios to resolve id', res.status, text); return null; }
        let list = [];
        if(text){ try{ list = JSON.parse(text); }catch(e){ console.warn('resolveUsuarioId: usuarios response not JSON', text); return null; } }
        // try to find by 'usuario' or 'nombreUsuario' or 'correo'
        const found = (list || []).find(u => {
            const uname = u.usuario || u.nombreUsuario || u.correo || '';
            return String(uname).toLowerCase() === String(usuarioString).toLowerCase();
        });
        if(found){
            return found.idUsuario || found.id || null;
        }
        return null;
    }catch(e){ console.error(e); return null; }
}

// Reportes almacenados
let reportes = [];

// Para identificar si estamos editando
let editIndex = -1;
// id del reporte que estamos editando (null cuando es nuevo)
let currentEditingId = null;


// =====================
// ABRIR MODAL AGREGAR
// =====================
if (btnAgregar) {
    btnAgregar.addEventListener("click", () => {
        // refrescar lista de animales antes de abrir
        fetchAnimalesForSelect();
        modalAgregar.style.display = "flex";
        limpiarCampos();
        editIndex = -1; 
    });
}
// Ocultar crear para admin (solo veterinario puede crear aquí)
if (isAdmin() && btnAgregar) {
    btnAgregar.style.display = 'none';
}


// =====================
// CERRAR MODAL AGREGAR
// =====================
btnCerrarAgregar.addEventListener("click", () => {
    modalAgregar.style.display = "none";
    currentEditingId = null;
    // reset modal title and button text
    const hdr = modalAgregar && modalAgregar.querySelector('h2'); if(hdr) hdr.textContent = 'Agregar Reporte Médico';
    if(btnGuardar) btnGuardar.textContent = 'Guardar';
});


// =====================
// CERRAR MODAL VISUALIZAR
// =====================
btnCerrarVisualizar.addEventListener("click", () => {
    modalVisualizar.style.display = "none";
});


// =====================
// GUARDAR (AGREGAR O EDITAR)
// =====================
    btnGuardar.addEventListener("click", async () => {
    // Construir payload para backend
    const selectedAnimal = selectAnimalReporte ? selectAnimalReporte.value : '';
    const fecha = document.getElementById("fecha").value;
    const temperatura = document.getElementById("temperatura").value;
    const condicionCorporal = document.getElementById("condicionCorporal").value;
    const frecuenciaRespiratoria = document.getElementById("frecuenciaRespiratoria").value;
    const diagnosticoPresuntivo = document.getElementById("diagnosticoPresuntivo").value;
    const diagnosticoDefinitivo = document.getElementById("diagnosticoDefinitivo").value;

    if(!selectedAnimal || !fecha){
        mostrarAlerta('warning','Campos incompletos','Seleccione un animal y fecha.');
        return;
    }

    // obtener idUsuario desde sessionStorage (preferido) o localStorage
    const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    let idUsuario = null;
    if(datosUsuarioRaw){
        try{
            const parsed = JSON.parse(datosUsuarioRaw);
            if(parsed && (parsed.idUsuario || parsed.id)) idUsuario = parsed.idUsuario || parsed.id;
            else if(parsed && parsed.usuario) idUsuario = parsed.usuario; // fallback to username string
        }catch(e){
            // raw string
            idUsuario = datosUsuarioRaw;
        }
    }
    // if numeric string, convert to number; else keep as-is
    const idUsuarioForPayload = (!isNaN(Number(idUsuario)) && idUsuario !== null) ? Number(idUsuario) : idUsuario || 0;
    console.debug('Using idUsuario for payload/header:', idUsuarioForPayload);

    const payload = {
        idAnimales: { idAnimal: Number(selectedAnimal) },
        idUsuario: { idUsuario: idUsuarioForPayload },
        temperatura: Number(temperatura) || 0,
        condicionCorporal: condicionCorporal || '',
        frecuenciaRespiratoria: Number(frecuenciaRespiratoria) || 0,
        fecha: fecha,
        diagnosticoPresuntivo: diagnosticoPresuntivo || '',
        diagnosticoDefinitivo: diagnosticoDefinitivo || ''
    };

    // If idUsuarioForPayload is not a positive number, try to resolve it via /usuarios
    let resolvedIdForHeader = null;
    if(typeof idUsuarioForPayload === 'number' && idUsuarioForPayload > 0){
        resolvedIdForHeader = idUsuarioForPayload;
    } else if(typeof idUsuarioForPayload === 'string' && idUsuarioForPayload.trim()){ 
        // try to resolve username -> numeric id
        const resolved = await resolveUsuarioId(idUsuarioForPayload);
        if(resolved){
            resolvedIdForHeader = resolved;
            // update payload idUsuario to numeric
            payload.idUsuario.idUsuario = resolved;
        }
    }

    if(!resolvedIdForHeader){
        mostrarAlerta('warning','Usuario no válido','No se pudo determinar un id de usuario numérico. Añade `idUsuario` al objeto `datosUsuarioAgroSystem` en sessionStorage con un id numérico o asegúrate que el nombre de usuario exista en el sistema.');
        return;
    }

    // If we are editing an existing report, call PUT, otherwise POST
    if(currentEditingId){
        // update payload idReporte inside update function
        await updateReporteBackend(payload, currentEditingId, resolvedIdForHeader);
    } else {
        // enviar al backend con header override
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
                        <button onclick="verReporte(${index})">👁</button>
                        ${ isVeterinario() ? `<button onclick="editarReporte(${index})">✏️</button><button onclick="eliminarReporte(${index})">🗑️</button>` : '' }
                    </td>
                </tr>
            `;
        });

        html += "</table>";
        tabla.innerHTML = html;
}


// =====================
// VISUALIZAR REPORTE
// =====================
function verReporte(i) {
        const r = reportes[i];
        const anim = r.idAnimales || {};
        const contenido = `
         <div class="detalle item">
            <strong>Arete:</strong>
            <p>${anim.numArete || ''}</p>
            <strong>Nombre:</strong>
            <p>${anim.nombreAnimal || anim.nombre || ''}</p>
            <strong>Fecha:</strong>
            <p>${r.fecha || ''}</p>
            <strong>Temperatura:</strong>
            <p>${r.temperatura || ''}</p>
            <strong>Condición Corporal:</strong>
            <p>${r.condicionCorporal || ''}</p>
            <strong>Frecuencia Respiratoria:</strong>
            <p>${r.frecuenciaRespiratoria || ''}</p>
            <strong>Diagnóstico Presuntivo:</strong>
            <p>${r.diagnosticoPresuntivo || ''}</p>
            <strong>Diagnóstico Definitivo:</strong>
            <p>${r.diagnosticoDefinitivo || ''}</p>
        </div>
        `;

        const cont = document.getElementById("contenidoReporte");
        if(cont) cont.innerHTML = contenido;
        if(modalVisualizar) modalVisualizar.style.display = "flex";
}


// =====================
// EDITAR REPORTE
// =====================
function editarReporte(i) {
    const r = reportes[i];
    editIndex = i;
    currentEditingId = r.idReporte || null;
    // if idAnimales available, set select
    if(selectAnimalReporte && r.idAnimales && (r.idAnimales.idAnimal || r.idAnimales.id)){
        selectAnimalReporte.value = r.idAnimales.idAnimal || r.idAnimales.id;
    }
    // set modal title and button text
    const hdr = modalAgregar && modalAgregar.querySelector('h2'); if(hdr) hdr.textContent = 'Editar Reporte Médico';
    if(btnGuardar) btnGuardar.textContent = 'Actualizar';
    if(document.getElementById("fecha")) document.getElementById("fecha").value = r.fecha || '';
    if(document.getElementById("temperatura")) document.getElementById("temperatura").value = r.temperatura || '';
    if(document.getElementById("condicionCorporal")) document.getElementById("condicionCorporal").value = r.condicionCorporal || '';
    if(document.getElementById("frecuenciaRespiratoria")) document.getElementById("frecuenciaRespiratoria").value = r.frecuenciaRespiratoria || '';
    if(document.getElementById("diagnosticoPresuntivo")) document.getElementById("diagnosticoPresuntivo").value = r.diagnosticoPresuntivo || '';
    if(document.getElementById("diagnosticoDefinitivo")) document.getElementById("diagnosticoDefinitivo").value = r.diagnosticoDefinitivo || '';
    if(document.getElementById("veterinario")) document.getElementById("veterinario").value = r.veterinario || '';
    if(document.getElementById("sintomas")) document.getElementById("sintomas").value = r.sintomas || '';
    if(document.getElementById("tratamiento")) document.getElementById("tratamiento").value = r.tratamiento || '';
    if(document.getElementById("medicamentos")) document.getElementById("medicamentos").value = r.medicamentos || '';
    if(document.getElementById("observaciones")) document.getElementById("observaciones").value = r.observaciones || '';
    if(modalAgregar) modalAgregar.style.display = "flex";
}


// =====================
// ELIMINAR REPORTE
// =====================
async function eliminarReporte(i) {
    const r = reportes[i];
    if(!r){ mostrarAlerta('warning','Error','Reporte no encontrado'); return; }

    // Pedir confirmación Sí/No
    const confirmado = await mostrarConfirmacion('Eliminar reporte', '¿Estás segura de que deseas eliminar este reporte?');
    if(!confirmado) return;

    // Obtener idUsuario válido para header (preferir numérico)
    const datosUsuarioRaw = sessionStorage.getItem('datosUsuarioAgroSystem') || localStorage.getItem('datosUsuarioAgroSystem') || '';
    let idUsuario = null;
    if(datosUsuarioRaw){
        try{
            const parsed = JSON.parse(datosUsuarioRaw);
            if(parsed && (parsed.idUsuario || parsed.id)) idUsuario = parsed.idUsuario || parsed.id;
            else if(parsed && parsed.usuario) idUsuario = parsed.usuario; // may be username
        }catch(e){ idUsuario = datosUsuarioRaw; }
    }

    let resolvedIdForHeader = null;
    if(typeof idUsuario === 'number' && idUsuario > 0) resolvedIdForHeader = idUsuario;
    else if(typeof idUsuario === 'string' && idUsuario.trim()){
        const resolved = await resolveUsuarioId(idUsuario);
        if(resolved) resolvedIdForHeader = resolved;
    }

    if(!resolvedIdForHeader){
        mostrarAlerta('warning','Usuario no válido','No se pudo determinar un id de usuario numérico para realizar la eliminación.');
        return;
    }

    try{
        const headers = await getAuthHeaders();
        // override Id-Usuario header con id numérico resuelto
        headers['Id-Usuario'] = String(resolvedIdForHeader);
        console.debug(`DELETE /reportes/${r.idReporte}`, { headers });
        const res = await fetch(`http://100.30.25.253:7000/reportes/${r.idReporte}`, { method: 'DELETE', headers });
        const text = await res.text();
        let body = null;
        if(text){ try{ body = JSON.parse(text); }catch(e){ body = text; } }
        if(!res.ok){ console.error('DELETE /reportes error', res.status, body); mostrarAlerta('warning','Error','No se pudo eliminar el reporte (ver consola).'); return; }
        // éxito: actualizar UI
        reportes.splice(i,1);
        mostrarTabla();
        mostrarAlerta('success','Eliminado','El reporte se eliminó correctamente.');
    }catch(err){ console.error(err); mostrarAlerta('warning','Error','Error eliminando reporte'); }
}


// =====================
// LIMPIAR CAMPOS
// =====================
function limpiarCampos() {
    const el = id => document.getElementById(id);
    if(el('selectAnimalReporte')) el('selectAnimalReporte').value = '';
    if(el('numArete')) el('numArete').value = '';
    if(el('fecha')) el('fecha').value = '';
    if(el('veterinario')) el('veterinario').value = '';
    if(el('temperatura')) el('temperatura').value = '';
    if(el('condicionCorporal')) el('condicionCorporal').value = '';
    if(el('frecuenciaRespiratoria')) el('frecuenciaRespiratoria').value = '';
    if(el('diagnosticoPresuntivo')) el('diagnosticoPresuntivo').value = '';
    if(el('diagnosticoDefinitivo')) el('diagnosticoDefinitivo').value = '';
    if(el('sintomas')) el('sintomas').value = '';
    if(el('tratamiento')) el('tratamiento').value = '';
    if(el('medicamentos')) el('medicamentos').value = '';
    if(el('estado')) el('estado').value = 'Estable';
    if(el('observaciones')) el('observaciones').value = '';
}


// =====================
// HACER FUNCIONES GLOBALES
// =====================
window.verReporte = verReporte;
window.editarReporte = editarReporte;
window.eliminarReporte = eliminarReporte;

// Inicializar datos desde el backend
fetchAnimalesForSelect();
fetchReportes();
