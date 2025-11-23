document.addEventListener('DOMContentLoaded', function() {
    
    // Verificar si ya hay una sesión activa
    const usuarioGuardado = localStorage.getItem('usuarioAgroSystem');
    if (usuarioGuardado) {
        window.location.href = './src/pages/home.html';
        return;
    }
    
    // Seleccionar elementos del DOM
    const form = document.getElementById('loginForm');
    const toggleEye = document.querySelector('.toggle-eye');
    const passwordInput = document.getElementById('passwordInput');
    const userInput = document.getElementById('usuarioInput');
    const loginButton = document.querySelector('.login-button');
    
    // Estado del ojo (visible/oculto)
    let passwordVisible = false;
    
    // Función para alternar visibilidad de contraseña
    if (toggleEye) {
        toggleEye.addEventListener('click', function() {
            passwordVisible = !passwordVisible;
            
            if (passwordVisible) {
                passwordInput.type = 'text';
                toggleEye.textContent = '👁️‍🗨️';
            } else {
                passwordInput.type = 'password';
                toggleEye.textContent = '👁️';
            }
        });
    }
    
    // Validación y envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const usuario = userInput.value.trim();
        const contraseña = passwordInput.value.trim();
        
        // Validaciones
        if (usuario === '') {
            mostrarAlerta('Por favor, ingresa tu usuario', 'error');
            userInput.focus();
            return;
        }
        
        if (contraseña === '') {
            mostrarAlerta('Por favor, ingresa tu contraseña', 'error');
            passwordInput.focus();
            return;
        }
        
        if (contraseña.length < 6) {
            mostrarAlerta('La contraseña debe tener al menos 6 caracteres', 'error');
            passwordInput.focus();
            return;
        }
        
        // Real login: POST /login
        loginButton.textContent = 'Iniciando...';
        loginButton.disabled = true;
        (async () => {
            try {
                const res = await fetch('http://100.30.25.253:7000/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: usuario, contrasena: contraseña })
                });
                const text = await res.text();
                let data = null;
                try{ data = text ? JSON.parse(text) : null; }catch(e){ data = text; }
                if(!res.ok){
                    const msg = (data && data.message) ? data.message : `Error ${res.status}`;
                    mostrarAlerta(msg, 'error');
                    loginButton.textContent = 'Iniciar sesión';
                    loginButton.disabled = false;
                    return;
                }
                // Expecting { success: true, usuario: {...}, token }
                if(data && data.success){
                    mostrarAlerta(data.message || 'Inicio de sesión exitoso', 'success');
                    // save token and user info
                    if(data.token) {
                        localStorage.setItem('token', data.token);
                        sessionStorage.setItem('token', data.token);
                    }
                    if(data.usuario){
                        // Enriquecer el objeto usuario con un campo legible de rol para evitar nulls en la UI
                        try{
                            const usuarioObj = Object.assign({}, data.usuario);
                            if (usuarioObj.rol && typeof usuarioObj.rol === 'object') {
                                usuarioObj.rolNombre = usuarioObj.rol.nombre || (usuarioObj.rol.idRol === 1 ? 'Administrador' : null);
                            } else {
                                usuarioObj.rolNombre = usuarioObj.rol || null;
                            }
                            // store both a short username key and full object
                            try{ localStorage.setItem('usuarioAgroSystem', String(usuarioObj.nombre || usuarioObj.usuario || '')); }catch(e){}
                            try{ sessionStorage.setItem('datosUsuarioAgroSystem', JSON.stringify(usuarioObj)); localStorage.setItem('datosUsuarioAgroSystem', JSON.stringify(usuarioObj)); }catch(e){}
                        }catch(e){
                            try{ sessionStorage.setItem('datosUsuarioAgroSystem', JSON.stringify(data.usuario)); localStorage.setItem('datosUsuarioAgroSystem', JSON.stringify(data.usuario)); }catch(e){}
                        }
                    }
                    setTimeout(()=>{ window.location.href = './src/pages/home.html'; }, 800);
                } else {
                    const msg = (data && data.message) ? data.message : 'Credenciales inválidas';
                    mostrarAlerta(msg, 'error');
                    loginButton.textContent = 'Iniciar sesión';
                    loginButton.disabled = false;
                }
            } catch(err){
                console.error('Login error', err);
                mostrarAlerta('No se pudo conectar con el servidor de autenticación', 'error');
                loginButton.textContent = 'Iniciar sesión';
                loginButton.disabled = false;
            }
        })();
    });
    
    // Función para mostrar alertas
    function mostrarAlerta(mensaje, tipo) {
        const alertaExistente = document.querySelector('.alerta');
        if (alertaExistente) {
            alertaExistente.remove();
        }
        
        const alerta = document.createElement('div');
        alerta.className = `alerta alerta-${tipo}`;
        alerta.textContent = mensaje;
        
        document.body.appendChild(alerta);
        
        setTimeout(() => {
            alerta.classList.add('alerta-salir');
            setTimeout(() => alerta.remove(), 300);
        }, 3000);
    }
    
    // Link de registro
    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = './src/pages/registrarse.html';
        });
    }
    
});