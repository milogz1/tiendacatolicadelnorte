// =================== INICIALIZACIÓN GENERAL ===================
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar año en el footer
    document.getElementById('y').textContent = new Date().getFullYear();
    
    // Inicializar sistema de cotizaciones
    inicializarSistemaCotizaciones();
    
    // Inicializar sistema de cuentos
    inicializarSistemaCuentos();
});

// =================== SISTEMA DE COTIZACIONES ===================
function inicializarSistemaCotizaciones() {
    // Referencias a elementos del DOM
    const cotizacionForm = document.getElementById('cotizacion-form');
    const resultadoCotizacion = document.getElementById('resultado-cotizacion');
    const baseDatosSection = document.getElementById('base-datos-section');
    const cancelarBtn = document.getElementById('cancelar-btn');
    const nuevaCotizacionBtn = document.getElementById('nueva-cotizacion');
    const verBaseDatosBtn = document.getElementById('ver-base-datos');
    const actualizarDbBtn = document.getElementById('actualizar-db');
    const limpiarDbBtn = document.getElementById('limpiar-db');
    const cerrarDbBtn = document.getElementById('cerrar-db');
    const contenidoDb = document.getElementById('contenido-db');
    
    // Precios de los productos
    const precios = {
        'Soporte Básico': 150000,
        'Instalación de Software': 200000,
        'Gestión de Redes': 350000,
        'Centros de Datos': 500000
    };
    
    // Función para formatear números con separadores de miles
    function formatoMoneda(numero) {
        return new Intl.NumberFormat('es-CO').format(numero);
    }
    
    // Función para actualizar el subtotal de un producto
function actualizarSubtotal(checkbox) {
    const productoId = checkbox.id;
    
    // Mapeo específico para "Soporte Básico" que tiene ID diferente
    const mapeoIds = {
        'soporte-basico': 'basico',
        'instalacion-software': 'software', 
        'gestion-redes': 'redes',
        'centros-datos': 'datos'
    };
    
    const sufijo = mapeoIds[productoId];
    const cantidadInput = document.getElementById(`cantidad-${sufijo}`);
    const subtotalElement = document.getElementById(`subtotal-${sufijo}`);
    
    if (checkbox.checked) {
        const precio = precios[checkbox.value];
        const cantidad = parseInt(cantidadInput.value) || 1;
        const subtotal = precio * cantidad;
        subtotalElement.textContent = `Subtotal: $${formatoMoneda(subtotal)}`;
    } else {
        subtotalElement.textContent = `Subtotal: $0`;
    }
}
    
    // Inicializar todos los subtotales a 0
    document.querySelectorAll('.subtotal-info').forEach(element => {
        element.textContent = 'Subtotal: $0';
    });
    
    // Habilitar/deshabilitar campos de cantidad según checkbox y actualizar subtotal
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        // Configurar evento change para cada checkbox
        checkbox.addEventListener('change', function() {
            const productId = this.id;
            const cantidadInput = document.getElementById(`cantidad-${productId.split('-')[1]}`);
            cantidadInput.disabled = !this.checked;
            
            if (!this.checked) {
                cantidadInput.value = 1;
            }
            
            // Actualizar subtotal inmediatamente
            actualizarSubtotal(this);
        });
        
        // Actualizar subtotal inicial para checkboxes ya marcados (por si acaso)
        if (checkbox.checked) {
            actualizarSubtotal(checkbox);
        }
    });
    
   // Manejar botones de incremento y decremento
document.querySelectorAll('.cantidad-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const currentValue = parseInt(input.value) || 1;
        
        if (this.classList.contains('increment')) {
            input.value = currentValue + 1;
        } else if (this.classList.contains('decrement') && currentValue > 1) {
            input.value = currentValue - 1;
        }
        
        // Encontrar el checkbox relacionado usando el mapeo inverso
        const mapeoInverso = {
            'cantidad-basico': 'soporte-basico',
            'cantidad-software': 'instalacion-software',
            'cantidad-redes': 'gestion-redes', 
            'cantidad-datos': 'centros-datos'
        };
        
        const checkboxId = mapeoInverso[targetId];
        const checkbox = document.getElementById(checkboxId);
        if (checkbox && checkbox.checked) {
            actualizarSubtotal(checkbox);
        }
    });
});

// Manejar cambios directos en los inputs de cantidad
document.querySelectorAll('.cantidad-input').forEach(input => {
    input.addEventListener('input', function() {
        // Asegurarse de que el valor no sea menor a 1
        if (this.value < 1) {
            this.value = 1;
        }
        
        // Encontrar el checkbox relacionado usando el mapeo inverso
        const mapeoInverso = {
            'cantidad-basico': 'soporte-basico',
            'cantidad-software': 'instalacion-software',
            'cantidad-redes': 'gestion-redes',
            'cantidad-datos': 'centros-datos'
        };
        
        const checkboxId = mapeoInverso[this.id];
        const checkbox = document.getElementById(checkboxId);
        if (checkbox && checkbox.checked) {
            actualizarSubtotal(checkbox);
        }
    });
});
    
    // Manejar envío del formulario de cotización
    cotizacionForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Obtener datos del formulario
        const nombreCompleto = document.getElementById('nombre-completo').value;
        const ciudad = document.getElementById('ciudad').value;
        const direccion = document.getElementById('direccion').value;
        const celular = document.getElementById('celular').value;
        
        // Obtener productos seleccionados
        const productosSeleccionados = [];
        let totalCotizacion = 0;
        
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            const producto = checkbox.value;
            const cantidadId = `cantidad-${checkbox.id.split('-')[1]}`;
            const cantidad = parseInt(document.getElementById(cantidadId).value) || 1;
            const precioUnitario = precios[producto];
            const subtotal = precioUnitario * cantidad;
            
            productosSeleccionados.push({
                producto,
                cantidad,
                precioUnitario,
                subtotal
            });
            
            totalCotizacion += subtotal;
        });
        
        // Validar que se haya seleccionado al menos un producto
        if (productosSeleccionados.length === 0) {
            alert('Por favor selecciona al menos un producto.');
            return;
        }
        
        // Crear objeto de cotización
        const cotizacion = {
            id: Date.now(), // ID único basado en timestamp
            fecha: new Date().toLocaleString('es-CO'),
            nombreCompleto,
            ciudad,
            direccion,
            celular,
            productos: productosSeleccionados,
            total: totalCotizacion
        };
        
        // Guardar en localStorage
        guardarCotizacion(cotizacion);
        
        // Mostrar resumen de la cotización
        mostrarResumenCotizacion(cotizacion);
    });
    
    // Función para guardar cotización en localStorage
    function guardarCotizacion(cotizacion) {
        let cotizaciones = JSON.parse(localStorage.getItem('cotizaciones')) || [];
        cotizaciones.push(cotizacion);
        localStorage.setItem('cotizaciones', JSON.stringify(cotizaciones));
    }
    
    // Función para mostrar el resumen de la cotización
    function mostrarResumenCotizacion(cotizacion) {
        // Ocultar formulario y mostrar resultados
        document.querySelector('.cotizacion-container').style.display = 'none';
        resultadoCotizacion.style.display = 'block';
        
        // Mostrar información del cliente
        document.getElementById('res-nombre').textContent = cotizacion.nombreCompleto;
        document.getElementById('res-ciudad').textContent = cotizacion.ciudad;
        document.getElementById('res-direccion').textContent = cotizacion.direccion;
        document.getElementById('res-celular').textContent = cotizacion.celular;
        
        // Mostrar productos en la tabla
        const tablaProductos = document.getElementById('tabla-productos');
        tablaProductos.innerHTML = '';
        
        cotizacion.productos.forEach(producto => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.producto}</td>
                <td>${producto.cantidad}</td>
                <td>$${formatoMoneda(producto.precioUnitario)}</td>
                <td>$${formatoMoneda(producto.subtotal)}</td>
            `;
            tablaProductos.appendChild(fila);
        });
        
        // Mostrar total
        document.getElementById('total-cotizacion').textContent = `$${formatoMoneda(cotizacion.total)}`;
        
        // Hacer scroll a la sección de resultados
        resultadoCotizacion.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Función para mostrar la base de datos
    function mostrarBaseDatos() {
        resultadoCotizacion.style.display = 'none';
        baseDatosSection.style.display = 'block';
        actualizarVistaBaseDatos();
    }
    
    // Función para actualizar la vista de la base de datos
    function actualizarVistaBaseDatos() {
        const cotizaciones = JSON.parse(localStorage.getItem('cotizaciones')) || [];
        
        if (cotizaciones.length === 0) {
            contenidoDb.innerHTML = '<p>No hay cotizaciones almacenadas en la base de datos.</p>';
            return;
        }
        
        let html = '<div class="card">';
        html += '<h4>Total de cotizaciones: ' + cotizaciones.length + '</h4>';
        
        cotizaciones.forEach((cotizacion, index) => {
            html += `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                    <h4>Cotización #${index + 1} (ID: ${cotizacion.id})</h4>
                    <p><strong>Fecha:</strong> ${cotizacion.fecha}</p>
                    <p><strong>Cliente:</strong> ${cotizacion.nombreCompleto}</p>
                    <p><strong>Ciudad:</strong> ${cotizacion.ciudad}</p>
                    <p><strong>Dirección:</strong> ${cotizacion.direccion}</p>
                    <p><strong>Celular:</strong> ${cotizacion.celular}</p>
                    <h5>Productos:</h5>
                    <table class="tabla-cotizaciones" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio Unitario</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            cotizacion.productos.forEach(producto => {
                html += `
                    <tr>
                        <td>${producto.producto}</td>
                        <td>${producto.cantidad}</td>
                        <td>$${formatoMoneda(producto.precioUnitario)}</td>
                        <td>$${formatoMoneda(producto.subtotal)}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                        <tfoot>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right;">Total:</td>
                                <td>$${formatoMoneda(cotizacion.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `;
        });
        
        html += '</div>';
        contenidoDb.innerHTML = html;
    }
    
    // Función para limpiar la base de datos
    function limpiarBaseDatos() {
        if (confirm('¿Estás seguro de que deseas eliminar todas las cotizaciones almacenadas?')) {
            localStorage.removeItem('cotizaciones');
            actualizarVistaBaseDatos();
            alert('Base de datos limpiada correctamente.');
        }
    }
    
    // Función para volver al formulario
    function volverAlFormulario() {
        resultadoCotizacion.style.display = 'none';
        baseDatosSection.style.display = 'none';
        document.querySelector('.cotizacion-container').style.display = 'grid';
        cotizacionForm.reset();
        
        // Deshabilitar todos los campos de cantidad y resetear valores
        document.querySelectorAll('.cantidad-input').forEach(input => {
            input.disabled = true;
            input.value = 1;
        });
        
        // Resetear subtotales
        document.querySelectorAll('.subtotal-info').forEach(element => {
            element.textContent = 'Subtotal: $0';
        });
        
        // Desmarcar todos los checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Hacer scroll al formulario
        document.getElementById('cotizacion').scrollIntoView({ behavior: 'smooth' });
    }
    
    // Función para cancelar y volver al inicio
    function cancelarCotizacion() {
        if (confirm('¿Estás seguro de que deseas cancelar? Se perderán los datos ingresados.')) {
            volverAlFormulario();
            // Hacer scroll al inicio de la página
            document.getElementById('inicio').scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Asignar event listeners a los botones
    cancelarBtn.addEventListener('click', cancelarCotizacion);
    nuevaCotizacionBtn.addEventListener('click', volverAlFormulario);
    verBaseDatosBtn.addEventListener('click', mostrarBaseDatos);
    actualizarDbBtn.addEventListener('click', actualizarVistaBaseDatos);
    limpiarDbBtn.addEventListener('click', limpiarBaseDatos);
    cerrarDbBtn.addEventListener('click', function() {
        baseDatosSection.style.display = 'none';
        resultadoCotizacion.style.display = 'block';
    });
    
    // Inicializar: deshabilitar todos los campos de cantidad al cargar la página
    document.querySelectorAll('.cantidad-input').forEach(input => {
        input.disabled = true;
    });
}

// =================== SISTEMA DE CUENTOS ===================
function inicializarSistemaCuentos() {
    const cuentoForm = document.getElementById('cuento-form');
    
    // Escuchamos el evento 'submit' del formulario
    cuentoForm.addEventListener('submit', function(event) {
        // Prevenimos el comportamiento por defecto del formulario (que es recargar la página)
        event.preventDefault();
        
        // Capturamos los valores de cada campo del formulario
        const nombre = document.getElementById('nombre').value;
        const apodo = document.getElementById('apodo').value;
        const cabello = document.getElementById('cabello').value;
        const ojos = document.getElementById('ojos').value;
        const edad = document.getElementById('edad').value;
        const hobby = document.getElementById('hobby').value;
        
        // Construimos la historia usando los datos del usuario
        const historia = `En el corazón de un bosque encantado, vivía una persona de ${edad} años llamada ${nombre}, aunque todos en el reino le conocían por su apodo: "${apodo}".
        
Su cabello, de un asombroso color ${cabello}, parecía capturar la luz del sol, y sus ojos, de un profundo tono ${ojos}, reflejaban la sabiduría de los árboles ancestrales.
        
No había nadie en el reino que practicara su hobby, ${hobby}, con tanta pasión y destreza. Un día, el rey convocó a "${apodo}" al castillo, pues solo alguien con su talento único para ${hobby} podría resolver el gran acertijo que protegía el tesoro perdido del reino.
        
Y así, ${nombre} emprendió la mayor aventura de su vida, demostrando que un pasatiempo puede cambiar el destino de todos.`;
        
        // Seleccionamos los elementos donde mostraremos el resultado
        const resultadoDiv = document.getElementById('resultado-cuento');
        const historiaP = document.getElementById('historia-generada');
        
        // Asignamos el texto de la historia al párrafo correspondiente
        historiaP.textContent = historia;
        
        // Hacemos visible el contenedor del resultado
        resultadoDiv.style.display = 'block';

        // Opcional: hacemos scroll para que el usuario vea el resultado
        resultadoDiv.scrollIntoView({ behavior: 'smooth' });
    });
}

// Agrega esta función al final de tu script.js para hacer consultas avanzadas
function consultarBaseDatos() {
    const cotizaciones = JSON.parse(localStorage.getItem('cotizaciones')) || [];
    
    if (cotizaciones.length === 0) {
        console.log('No hay cotizaciones en la base de datos.');
        return;
    }
    
    console.log('=== BASE DE DATOS DE COTIZACIONES ===');
    console.log(`Total de registros: ${cotizaciones.length}`);
    
    // Estadísticas por ciudad
    const porCiudad = {};
    cotizaciones.forEach(cot => {
        porCiudad[cot.ciudad] = (porCiudad[cot.ciudad] || 0) + 1;
    });
    console.log('Cotizaciones por ciudad:', porCiudad);
    
    // Estadísticas por producto
    const productosVendidos = {};
    let totalVentas = 0;
    
    cotizaciones.forEach(cot => {
        cot.productos.forEach(prod => {
            productosVendidos[prod.producto] = productosVendidos[prod.producto] || { cantidad: 0, total: 0 };
            productosVendidos[prod.producto].cantidad += prod.cantidad;
            productosVendidos[prod.producto].total += prod.subtotal;
        });
        totalVentas += cot.total;
    });
    
    console.log('Ventas por producto:', productosVendidos);
    console.log('Total en ventas: $' + new Intl.NumberFormat('es-CO').format(totalVentas));
    
    // Mostrar todas las cotizaciones
    console.log('Detalle completo:', cotizaciones);
}

// Para usar esta función, ejecuta en la consola: consultarBaseDatos()
