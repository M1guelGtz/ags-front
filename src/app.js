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
        
        // Simular proceso de login
        loginButton.textContent = 'Iniciando...';
        loginButton.disabled = true;
        
        // Simular llamada al servidor
        setTimeout(() => {
            // Verificar si es admin
            if (usuario === 'admin' && contraseña === 'admin123') {
                mostrarAlerta('¡Inicio de sesión exitoso!', 'success');
                
                const datosUsuario = {
                    usuario: usuario,
                    rol: 'admin',
                    nombreCompleto: 'Administrador',
                    fechaLogin: new Date().toISOString()
                };
                
                localStorage.setItem('usuarioAgroSystem', usuario);
                localStorage.setItem('datosUsuarioAgroSystem', JSON.stringify(datosUsuario));
                
                setTimeout(() => {
                    window.location.href = './src/pages/home.html';
                }, 1500);
            } else {
                // Verificar usuarios registrados
                const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
                const usuarioEncontrado = usuarios.find(u => u.usuario === usuario && u.contrasena === contraseña);
                
                if (usuarioEncontrado) {
                    mostrarAlerta('¡Inicio de sesión exitoso!', 'success');
                    
                    const datosUsuario = {
                        usuario: usuarioEncontrado.usuario,
                        rol: usuarioEncontrado.cargo,
                        nombreCompleto: usuarioEncontrado.nombreCompleto,
                        telefono: usuarioEncontrado.telefono,
                        fechaLogin: new Date().toISOString()
                    };
                    
                    localStorage.setItem('usuarioAgroSystem', usuarioEncontrado.usuario);
                    localStorage.setItem('datosUsuarioAgroSystem', JSON.stringify(datosUsuario));
                    
                    setTimeout(() => {
                        window.location.href = './src/pages/home.html';
                    }, 1500);
                } else {
                    mostrarAlerta('Usuario o contraseña incorrectos', 'error');
                    loginButton.textContent = 'Iniciar sesión';
                    loginButton.disabled = false;
                    passwordInput.value = '';
                    passwordInput.focus();
                }
            }
        }, 1500);
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
    
    // Link de registro - REDIRIGIR AL FORMULARIO
    const registerLink = document.querySelector('.register-link');
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = './src/pages/registrarse.html';
        });
    }
    
});