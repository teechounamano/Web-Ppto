// Estado de la aplicación
const state = {
    activationFee: 10,
    selectedServices: {},
    roommatesCount: 1,
    totalCost: 10,
    costPerPerson: 10,
    banoCount: 0,
    habitacionCount: 0,
    cristalSalonCount: 0,
    cristalCocinaCount: 0,
    cristalBanoCount: 0,
    cristalHabitacionCount: 0,
    cristalTerrazaCount: 0,
    cristalLavanderiaCount: 0,
    cristalBalconerasCount: 0,
    cristalEscaparatesCount: 0,
    customPrices: {
        salon: 10,
        cocina: 10,
        bano: 10,
        habitacion: 10,
        pasillo: 5,
        platos: 5,
        mamparas: 5,
        basura: 5,
        horno: 20,
        nevera: 20,
        campana: 20,
        escalera: 10,
        terraza: 15,
        lavanderia: 12,
        organizacion: 20,
        'cristal-salon': 10,
        'cristal-cocina': 10,
        'cristal-bano': 10,
        'cristal-habitacion': 10,
        'cristal-terraza': 10,
        'cristal-lavanderia': 10,
        'cristal-balconeras': 10,
        'cristal-escaparates': 10
    },
    activeCategories: {
        areas: true,
        complements: true,
        electrodomesticos: true,
        windows: true,
        special: true
    },
    clientData: {
        nombre: '',
        calle: '',
        portal: '',
        piso: '',
        puerta: '',
        fecha1: '',
        fecha2: ''
    }
};

// Elementos del DOM
const modules = document.querySelectorAll('.service-module');
const toggles = document.querySelectorAll('.module-toggle');
const options = document.querySelectorAll('.module-option');
const summaryItems = document.getElementById('summary-items');
const totalCostDisplay = document.getElementById('total-cost');
const costPerPersonDisplay = document.getElementById('cost-per-person');
const roommatesCountDisplay = document.getElementById('roommates-count');
const banoCountDisplay = document.getElementById('bano-count');
const habitacionCountDisplay = document.getElementById('habitacion-count');
const cristalSalonCountDisplay = document.getElementById('cristal-salon-count');
const cristalCocinaCountDisplay = document.getElementById('cristal-cocina-count');
const cristalBanoCountDisplay = document.getElementById('cristal-bano-count');
const cristalHabitacionCountDisplay = document.getElementById('cristal-habitacion-count');
const cristalTerrazaCountDisplay = document.getElementById('cristal-terraza-count');
const cristalLavanderiaCountDisplay = document.getElementById('cristal-lavanderia-count');
const cristalBalconerasCountDisplay = document.getElementById('cristal-balconeras-count');
const cristalEscaparatesCountDisplay = document.getElementById('cristal-escaparates-count');

// Elementos de subtotales
const areasSubtotalDisplay = document.getElementById('areas-subtotal');
const complementsSubtotalDisplay = document.getElementById('complements-subtotal');
const electrodomesticosSubtotalDisplay = document.getElementById('electrodomesticos-subtotal');
const windowsSubtotalDisplay = document.getElementById('windows-subtotal');
const specialSubtotalDisplay = document.getElementById('special-subtotal');

// Elementos del header mejorado
const headerTotalCostDisplay = document.getElementById('header-total-cost');
const headerPeopleCountDisplay = document.getElementById('header-people-count');

const proceedButton = document.getElementById('proceed-to-form');
const resetButton = document.getElementById('reset-order');
const finalSummaryModal = document.getElementById('final-summary-modal');
const sendWhatsAppButton = document.getElementById('send-whatsapp-btn');
const cancelFinalSummaryButton = document.getElementById('cancel-final-summary-btn');

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateUI();
    
    // Agregar listener para cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (finalSummaryModal.classList.contains('open') && 
            e.target === finalSummaryModal) {
            finalSummaryModal.classList.remove('open');
        }
    });
});

// Configurar event listeners
function initializeEventListeners() {
    // Toggles de módulos (ahora para activar/desactivar categorías)
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            const module = this.closest('.service-module');
            const moduleId = module.id;
            const category = getCategoryFromModuleId(moduleId);
            
            // Cambiar estado de la categoría
            state.activeCategories[category] = !state.activeCategories[category];
            
            // Actualizar UI del toggle
            this.classList.toggle('active', state.activeCategories[category]);
            
            // Actualizar apariencia del módulo
            module.classList.toggle('disabled', !state.activeCategories[category]);
            
            // Colapsar automáticamente cuando se desactiva
            if (!state.activeCategories[category]) {
                module.classList.remove('active');
            }
            
            // Recalcular total
            calculateTotal();
            updateUI();
        });
    });

    // Clic en el header para expandir/colapsar contenido
    document.querySelectorAll('.module-header').forEach(header => {
        header.addEventListener('click', function(e) {
            // No hacer nada si se hizo clic en el toggle
            if (e.target.closest('.module-toggle')) return;
            
            const module = this.closest('.service-module');
            const category = getCategoryFromModuleId(module.id);
            
            // Solo expandir/colapsar si la categoría está activa
            if (state.activeCategories[category]) {
                module.classList.toggle('active');
            }
        });
    });

    // Opciones de servicios
    options.forEach(option => {
        option.addEventListener('click', function(e) {
            // Evitar que el clic en el input active/desactive la selección
            if (e.target.tagName === 'INPUT') {
                return;
            }
            
            const service = this.dataset.service;
            const category = getCategoryFromService(service);
            
            // Solo permitir seleccionar si la categoría está activa
            if (!state.activeCategories[category]) {
                return;
            }
            
            if (this.classList.contains('selected')) {
                // Deseleccionar
                this.classList.remove('selected');
                delete state.selectedServices[service];
            } else {
                // Seleccionar
                this.classList.add('selected');
                const priceInput = this.querySelector('.price-input');
                const price = priceInput ? parseFloat(priceInput.value) : state.customPrices[service];
                
                state.selectedServices[service] = {
                    name: this.querySelector('.option-name').textContent.trim(),
                    price: price,
                    customPrice: priceInput ? true : false
                };
            }
            
            calculateTotal();
            updateUI();
        });
    });

    // Inputs de precio para opciones normales
    document.querySelectorAll('.price-input').forEach(input => {
        input.addEventListener('input', function() {
            const service = this.closest('.module-option').dataset.service;
            const price = parseFloat(this.value) || 0;
            
            // Actualizar precio en el estado
            state.customPrices[service] = price;
            
            // Si el servicio está seleccionado, actualizar su precio
            if (state.selectedServices[service]) {
                state.selectedServices[service].price = price;
                state.selectedServices[service].customPrice = true;
                
                // Recalcular total
                calculateTotal();
                updateUI();
            }
        });

        // Evitar que el clic en el input active/desactive la opción
        input.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Controles para baños
    document.getElementById('bano-increment').addEventListener('click', () => {
        if (state.activeCategories.areas) {
            state.banoCount++;
            updateBanoCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('bano-decrement').addEventListener('click', () => {
        if (state.activeCategories.areas && state.banoCount > 0) {
            state.banoCount--;
            updateBanoCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para baños
    document.getElementById('bano-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices.bano = price;
        calculateTotal();
        updateUI();
    });

    // Controles para habitaciones
    document.getElementById('habitacion-increment').addEventListener('click', () => {
        if (state.activeCategories.areas) {
            state.habitacionCount++;
            updateHabitacionCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('habitacion-decrement').addEventListener('click', () => {
        if (state.activeCategories.areas && state.habitacionCount > 0) {
            state.habitacionCount--;
            updateHabitacionCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para habitaciones
    document.getElementById('habitacion-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices.habitacion = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales salón
    document.getElementById('cristal-salon-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalSalonCount++;
            updateCristalSalonCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-salon-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalSalonCount > 0) {
            state.cristalSalonCount--;
            updateCristalSalonCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales salón
    document.getElementById('cristal-salon-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-salon'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales cocina
    document.getElementById('cristal-cocina-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalCocinaCount++;
            updateCristalCocinaCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-cocina-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalCocinaCount > 0) {
            state.cristalCocinaCount--;
            updateCristalCocinaCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales cocina
    document.getElementById('cristal-cocina-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-cocina'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales baño
    document.getElementById('cristal-bano-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalBanoCount++;
            updateCristalBanoCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-bano-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalBanoCount > 0) {
            state.cristalBanoCount--;
            updateCristalBanoCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales baño
    document.getElementById('cristal-bano-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-bano'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales habitación
    document.getElementById('cristal-habitacion-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalHabitacionCount++;
            updateCristalHabitacionCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-habitacion-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalHabitacionCount > 0) {
            state.cristalHabitacionCount--;
            updateCristalHabitacionCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales habitación
    document.getElementById('cristal-habitacion-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-habitacion'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales terraza
    document.getElementById('cristal-terraza-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalTerrazaCount++;
            updateCristalTerrazaCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-terraza-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalTerrazaCount > 0) {
            state.cristalTerrazaCount--;
            updateCristalTerrazaCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales terraza
    document.getElementById('cristal-terraza-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-terraza'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales lavandería
    document.getElementById('cristal-lavanderia-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalLavanderiaCount++;
            updateCristalLavanderiaCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-lavanderia-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalLavanderiaCount > 0) {
            state.cristalLavanderiaCount--;
            updateCristalLavanderiaCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales lavandería
    document.getElementById('cristal-lavanderia-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-lavanderia'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales balconeras
    document.getElementById('cristal-balconeras-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalBalconerasCount++;
            updateCristalBalconerasCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-balconeras-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalBalconerasCount > 0) {
            state.cristalBalconerasCount--;
            updateCristalBalconerasCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales balconeras
    document.getElementById('cristal-balconeras-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-balconeras'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles para cristales escaparates
    document.getElementById('cristal-escaparates-increment').addEventListener('click', () => {
        if (state.activeCategories.windows) {
            state.cristalEscaparatesCount++;
            updateCristalEscaparatesCount();
            calculateTotal();
            updateUI();
        }
    });

    document.getElementById('cristal-escaparates-decrement').addEventListener('click', () => {
        if (state.activeCategories.windows && state.cristalEscaparatesCount > 0) {
            state.cristalEscaparatesCount--;
            updateCristalEscaparatesCount();
            calculateTotal();
            updateUI();
        }
    });

    // Input de precio para cristales escaparates
    document.getElementById('cristal-escaparates-price').addEventListener('input', function() {
        const price = parseFloat(this.value) || 0;
        state.customPrices['cristal-escaparates'] = price;
        calculateTotal();
        updateUI();
    });

    // Controles de compañeros
    document.getElementById('roommates-increment').addEventListener('click', () => {
        state.roommatesCount++;
        updateRoommatesCount();
        calculateTotal();
        updateUI();
    });

    document.getElementById('roommates-decrement').addEventListener('click', () => {
        if (state.roommatesCount > 1) {
            state.roommatesCount--;
            updateRoommatesCount();
            calculateTotal();
            updateUI();
        }
    });

    // Navegación
    proceedButton.addEventListener('click', () => {
        if (Object.keys(state.selectedServices).length === 0 && 
            state.banoCount === 0 && 
            state.habitacionCount === 0 &&
            state.cristalSalonCount === 0 &&
            state.cristalCocinaCount === 0 &&
            state.cristalBanoCount === 0 &&
            state.cristalHabitacionCount === 0 &&
            state.cristalTerrazaCount === 0 &&
            state.cristalLavanderiaCount === 0 &&
            state.cristalBalconerasCount === 0 &&
            state.cristalEscaparatesCount === 0) {
            alert('Por favor, selecciona al menos un servicio antes de continuar.');
            return;
        }
        
        showFinalSummary();
    });

    resetButton.addEventListener('click', resetOrder);

    // Modal de resumen final
    sendWhatsAppButton.addEventListener('click', sendWhatsAppMessage);
    cancelFinalSummaryButton.addEventListener('click', () => {
        finalSummaryModal.classList.remove('open');
    });
}

// Obtener categoría a partir del ID del módulo
function getCategoryFromModuleId(moduleId) {
    const categoryMap = {
        'areas-module': 'areas',
        'complements-module': 'complements',
        'electrodomesticos-module': 'electrodomesticos',
        'windows-module': 'windows',
        'special-module': 'special'
    };
    return categoryMap[moduleId] || 'areas';
}

// Actualizar interfaz
function updateUI() {
    updateSummary();
    updateTotalCost();
    updateCostPerPerson();
    updateCategorySubtotals();
    updateHeaderInfo();
}

// Actualizar información del header
function updateHeaderInfo() {
    headerTotalCostDisplay.textContent = `${state.totalCost}€`;
    headerPeopleCountDisplay.textContent = `${state.roommatesCount} ${state.roommatesCount === 1 ? 'Persona' : 'Personas'}`;
}

// Actualizar subtotales de categorías
function updateCategorySubtotals() {
    // Calcular subtotal REAL de Áreas Principales (sin importar si está activa)
    let areasRealSubtotal = 0;
    if (state.selectedServices.salon) areasRealSubtotal += state.selectedServices.salon.price;
    if (state.selectedServices.cocina) areasRealSubtotal += state.selectedServices.cocina.price;
    areasRealSubtotal += state.banoCount * state.customPrices.bano;
    areasRealSubtotal += state.habitacionCount * state.customPrices.habitacion;
    
    areasSubtotalDisplay.textContent = `${areasRealSubtotal}€`;
    areasSubtotalDisplay.classList.toggle('zero', areasRealSubtotal === 0);

    // Calcular subtotal REAL de Complementos
    let complementsRealSubtotal = 0;
    if (state.selectedServices.pasillo) complementsRealSubtotal += state.selectedServices.pasillo.price;
    if (state.selectedServices.platos) complementsRealSubtotal += state.selectedServices.platos.price;
    if (state.selectedServices.mamparas) complementsRealSubtotal += state.selectedServices.mamparas.price;
    if (state.selectedServices.basura) complementsRealSubtotal += state.selectedServices.basura.price;
    
    complementsSubtotalDisplay.textContent = `${complementsRealSubtotal}€`;
    complementsSubtotalDisplay.classList.toggle('zero', complementsRealSubtotal === 0);

    // Calcular subtotal REAL de Electrodomésticos
    let electrodomesticosRealSubtotal = 0;
    if (state.selectedServices.horno) electrodomesticosRealSubtotal += state.selectedServices.horno.price;
    if (state.selectedServices.nevera) electrodomesticosRealSubtotal += state.selectedServices.nevera.price;
    if (state.selectedServices.campana) electrodomesticosRealSubtotal += state.selectedServices.campana.price;
    
    electrodomesticosSubtotalDisplay.textContent = `${electrodomesticosRealSubtotal}€`;
    electrodomesticosSubtotalDisplay.classList.toggle('zero', electrodomesticosRealSubtotal === 0);

    // Calcular subtotal REAL de Cristales
    let windowsRealSubtotal = 0;
    windowsRealSubtotal += state.cristalSalonCount * state.customPrices['cristal-salon'];
    windowsRealSubtotal += state.cristalCocinaCount * state.customPrices['cristal-cocina'];
    windowsRealSubtotal += state.cristalBanoCount * state.customPrices['cristal-bano'];
    windowsRealSubtotal += state.cristalHabitacionCount * state.customPrices['cristal-habitacion'];
    windowsRealSubtotal += state.cristalTerrazaCount * state.customPrices['cristal-terraza'];
    windowsRealSubtotal += state.cristalLavanderiaCount * state.customPrices['cristal-lavanderia'];
    windowsRealSubtotal += state.cristalBalconerasCount * state.customPrices['cristal-balconeras'];
    windowsRealSubtotal += state.cristalEscaparatesCount * state.customPrices['cristal-escaparates'];
    
    windowsSubtotalDisplay.textContent = `${windowsRealSubtotal}€`;
    windowsSubtotalDisplay.classList.toggle('zero', windowsRealSubtotal === 0);

    // Calcular subtotal REAL de Servicios Especiales
    let specialRealSubtotal = 0;
    if (state.selectedServices.escalera) specialRealSubtotal += state.selectedServices.escalera.price;
    if (state.selectedServices.terraza) specialRealSubtotal += state.selectedServices.terraza.price;
    if (state.selectedServices.lavanderia) specialRealSubtotal += state.selectedServices.lavanderia.price;
    if (state.selectedServices.organizacion) specialRealSubtotal += state.selectedServices.organizacion.price;
    
    specialSubtotalDisplay.textContent = `${specialRealSubtotal}€`;
    specialSubtotalDisplay.classList.toggle('zero', specialRealSubtotal === 0);
}

// Actualizar resumen de pedido
function updateSummary() {
    // Limpiar resumen (excepto cuota de activación)
    const itemsToRemove = summaryItems.querySelectorAll('.summary-item:not(:first-child)');
    itemsToRemove.forEach(item => item.remove());
    
    // Añadir servicios seleccionados (solo si la categoría está activa)
    Object.entries(state.selectedServices).forEach(([serviceKey, service]) => {
        const category = getCategoryFromService(serviceKey);
        if (state.activeCategories[category]) {
            const item = document.createElement('div');
            item.className = 'summary-item';
            
            // Añadir indicador de precio personalizado si corresponde
            const customIndicator = service.customPrice ? ' 🎯' : '';
            
            item.innerHTML = `
                <span class="summary-item-name">${service.name}${customIndicator}</span>
                <span class="summary-item-price">${service.price}€</span>
            `;
            summaryItems.appendChild(item);
        }
    });
    
    // Añadir baños si hay y la categoría está activa
    if (state.banoCount > 0 && state.activeCategories.areas) {
        const banoTotal = state.banoCount * state.customPrices.bano;
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🚿 Baños (${state.banoCount} x ${state.customPrices.bano}€)</span>
            <span class="summary-item-price">${banoTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir habitaciones si hay y la categoría está activa
    if (state.habitacionCount > 0 && state.activeCategories.areas) {
        const habitacionTotal = state.habitacionCount * state.customPrices.habitacion;
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🛏️ Habitaciones (${state.habitacionCount} x ${state.customPrices.habitacion}€)</span>
            <span class="summary-item-price">${habitacionTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales salón si hay y la categoría está activa
    if (state.cristalSalonCount > 0 && state.activeCategories.windows) {
        const cristalSalonTotal = state.cristalSalonCount * state.customPrices['cristal-salon'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Cristales Salón (${state.cristalSalonCount} x ${state.customPrices['cristal-salon']}€)</span>
            <span class="summary-item-price">${cristalSalonTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales cocina si hay y la categoría está activa
    if (state.cristalCocinaCount > 0 && state.activeCategories.windows) {
        const cristalCocinaTotal = state.cristalCocinaCount * state.customPrices['cristal-cocina'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Cristales Cocina (${state.cristalCocinaCount} x ${state.customPrices['cristal-cocina']}€)</span>
            <span class="summary-item-price">${cristalCocinaTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales baño si hay y la categoría está activa
    if (state.cristalBanoCount > 0 && state.activeCategories.windows) {
        const cristalBanoTotal = state.cristalBanoCount * state.customPrices['cristal-bano'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Cristales Baño (${state.cristalBanoCount} x ${state.customPrices['cristal-bano']}€)</span>
            <span class="summary-item-price">${cristalBanoTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales habitación si hay y la categoría está activa
    if (state.cristalHabitacionCount > 0 && state.activeCategories.windows) {
        const cristalHabitacionTotal = state.cristalHabitacionCount * state.customPrices['cristal-habitacion'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Cristales Habitación (${state.cristalHabitacionCount} x ${state.customPrices['cristal-habitacion']}€)</span>
            <span class="summary-item-price">${cristalHabitacionTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales terraza si hay y la categoría está activa
    if (state.cristalTerrazaCount > 0 && state.activeCategories.windows) {
        const cristalTerrazaTotal = state.cristalTerrazaCount * state.customPrices['cristal-terraza'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Cristales Terraza (${state.cristalTerrazaCount} x ${state.customPrices['cristal-terraza']}€)</span>
            <span class="summary-item-price">${cristalTerrazaTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales lavandería si hay y la categoría está activa
    if (state.cristalLavanderiaCount > 0 && state.activeCategories.windows) {
        const cristalLavanderiaTotal = state.cristalLavanderiaCount * state.customPrices['cristal-lavanderia'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Cristales Lavandería (${state.cristalLavanderiaCount} x ${state.customPrices['cristal-lavanderia']}€)</span>
            <span class="summary-item-price">${cristalLavanderiaTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales balconeras si hay y la categoría está activa
    if (state.cristalBalconerasCount > 0 && state.activeCategories.windows) {
        const cristalBalconerasTotal = state.cristalBalconerasCount * state.customPrices['cristal-balconeras'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Balconeras (${state.cristalBalconerasCount} x ${state.customPrices['cristal-balconeras']}€)</span>
            <span class="summary-item-price">${cristalBalconerasTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
    
    // Añadir cristales escaparates si hay y la categoría está activa
    if (state.cristalEscaparatesCount > 0 && state.activeCategories.windows) {
        const cristalEscaparatesTotal = state.cristalEscaparatesCount * state.customPrices['cristal-escaparates'];
        const item = document.createElement('div');
        item.className = 'summary-item';
        item.innerHTML = `
            <span class="summary-item-name">🪟 Escaparates (${state.cristalEscaparatesCount} x ${state.customPrices['cristal-escaparates']}€)</span>
            <span class="summary-item-price">${cristalEscaparatesTotal}€</span>
        `;
        summaryItems.appendChild(item);
    }
}

// Obtener categoría a partir del servicio
function getCategoryFromService(serviceKey) {
    const categoryMap = {
        'salon': 'areas',
        'cocina': 'areas',
        'pasillo': 'complements',
        'platos': 'complements',
        'mamparas': 'complements',
        'basura': 'complements',
        'horno': 'electrodomesticos',
        'nevera': 'electrodomesticos',
        'campana': 'electrodomesticos',
        'escalera': 'special',
        'terraza': 'special',
        'lavanderia': 'special',
        'organizacion': 'special'
    };
    return categoryMap[serviceKey] || 'areas';
}

// Actualizar contadores
function updateBanoCount() {
    banoCountDisplay.textContent = state.banoCount;
}

function updateHabitacionCount() {
    habitacionCountDisplay.textContent = state.habitacionCount;
}

function updateCristalSalonCount() {
    cristalSalonCountDisplay.textContent = state.cristalSalonCount;
}

function updateCristalCocinaCount() {
    cristalCocinaCountDisplay.textContent = state.cristalCocinaCount;
}

function updateCristalBanoCount() {
    cristalBanoCountDisplay.textContent = state.cristalBanoCount;
}

function updateCristalHabitacionCount() {
    cristalHabitacionCountDisplay.textContent = state.cristalHabitacionCount;
}

function updateCristalTerrazaCount() {
    cristalTerrazaCountDisplay.textContent = state.cristalTerrazaCount;
}

function updateCristalLavanderiaCount() {
    cristalLavanderiaCountDisplay.textContent = state.cristalLavanderiaCount;
}

function updateCristalBalconerasCount() {
    cristalBalconerasCountDisplay.textContent = state.cristalBalconerasCount;
}

function updateCristalEscaparatesCount() {
    cristalEscaparatesCountDisplay.textContent = state.cristalEscaparatesCount;
}

function updateRoommatesCount() {
    roommatesCountDisplay.textContent = state.roommatesCount;
}

// Actualizar coste total
function updateTotalCost() {
    totalCostDisplay.textContent = `${state.totalCost}€`;
}

// Actualizar coste por persona
function updateCostPerPerson() {
    costPerPersonDisplay.textContent = `${state.costPerPerson.toFixed(2)}€`;
}

// Calcular total
function calculateTotal() {
    let subtotal = state.activationFee;
    
    // Sumar servicios seleccionados (solo si la categoría está activa)
    Object.entries(state.selectedServices).forEach(([serviceKey, service]) => {
        const category = getCategoryFromService(serviceKey);
        if (state.activeCategories[category]) {
            subtotal += service.price;
        }
    });
    
    // Sumar baños (cantidad × precio personalizado) si la categoría está activa
    if (state.activeCategories.areas) {
        subtotal += state.banoCount * state.customPrices.bano;
    }
    
    // Sumar habitaciones (cantidad × precio personalizado) si la categoría está activa
    if (state.activeCategories.areas) {
        subtotal += state.habitacionCount * state.customPrices.habitacion;
    }
    
    // Sumar cristales (cantidad × precio personalizado) si la categoría está activa
    if (state.activeCategories.windows) {
        subtotal += state.cristalSalonCount * state.customPrices['cristal-salon'];
        subtotal += state.cristalCocinaCount * state.customPrices['cristal-cocina'];
        subtotal += state.cristalBanoCount * state.customPrices['cristal-bano'];
        subtotal += state.cristalHabitacionCount * state.customPrices['cristal-habitacion'];
        subtotal += state.cristalTerrazaCount * state.customPrices['cristal-terraza'];
        subtotal += state.cristalLavanderiaCount * state.customPrices['cristal-lavanderia'];
        subtotal += state.cristalBalconerasCount * state.customPrices['cristal-balconeras'];
        subtotal += state.cristalEscaparatesCount * state.customPrices['cristal-escaparates'];
    }
    
    state.totalCost = subtotal;
    state.costPerPerson = state.totalCost / state.roommatesCount;
}

// Reiniciar pedido
function resetOrder() {
    state.selectedServices = {};
    state.banoCount = 0;
    state.habitacionCount = 0;
    state.cristalSalonCount = 0;
    state.cristalCocinaCount = 0;
    state.cristalBanoCount = 0;
    state.cristalHabitacionCount = 0;
    state.cristalTerrazaCount = 0;
    state.cristalLavanderiaCount = 0;
    state.cristalBalconerasCount = 0;
    state.cristalEscaparatesCount = 0;
    state.roommatesCount = 1;
    state.totalCost = state.activationFee;
    state.costPerPerson = state.activationFee;
    
    // Reactivar todas las categorías
    Object.keys(state.activeCategories).forEach(category => {
        state.activeCategories[category] = true;
    });
    
    // Deseleccionar todas las opciones
    options.forEach(option => {
        option.classList.remove('selected');
    });
    
    // Restablecer toggles a activo
    toggles.forEach(toggle => {
        toggle.classList.add('active');
    });
    
    // Restablecer apariencia de módulos
    modules.forEach(module => {
        module.classList.remove('disabled');
        // Solo mantener activo el primer módulo
        if (module.id === 'areas-module') {
            module.classList.add('active');
        } else {
            module.classList.remove('active');
        }
    });
    
    // Restablecer precios a valores por defecto
    document.querySelectorAll('.price-input').forEach(input => {
        const service = input.closest('.module-option')?.dataset.service;
        if (service) {
            input.value = state.customPrices[service];
        }
    });
    
    // Restablecer precios de baños, habitaciones y cristales
    document.getElementById('bano-price').value = state.customPrices.bano;
    document.getElementById('habitacion-price').value = state.customPrices.habitacion;
    document.getElementById('cristal-salon-price').value = state.customPrices['cristal-salon'];
    document.getElementById('cristal-cocina-price').value = state.customPrices['cristal-cocina'];
    document.getElementById('cristal-bano-price').value = state.customPrices['cristal-bano'];
    document.getElementById('cristal-habitacion-price').value = state.customPrices['cristal-habitacion'];
    document.getElementById('cristal-terraza-price').value = state.customPrices['cristal-terraza'];
    document.getElementById('cristal-lavanderia-price').value = state.customPrices['cristal-lavanderia'];
    document.getElementById('cristal-balconeras-price').value = state.customPrices['cristal-balconeras'];
    document.getElementById('cristal-escaparates-price').value = state.customPrices['cristal-escaparates'];
    
    // Actualizar todos los contadores
    updateBanoCount();
    updateHabitacionCount();
    updateCristalSalonCount();
    updateCristalCocinaCount();
    updateCristalBanoCount();
    updateCristalHabitacionCount();
    updateCristalTerrazaCount();
    updateCristalLavanderiaCount();
    updateCristalBalconerasCount();
    updateCristalEscaparatesCount();
    updateRoommatesCount();
    updateUI();
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return 'No seleccionada';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Mostrar resumen final
function showFinalSummary() {
    // Limpiar lista de servicios
    const servicesList = document.getElementById('final-services-list');
    servicesList.innerHTML = '';

    // Añadir servicios seleccionados al resumen final
    Object.entries(state.selectedServices).forEach(([serviceKey, service]) => {
        const category = getCategoryFromService(serviceKey);
        if (state.activeCategories[category]) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'summary-item';
            itemDiv.innerHTML = `
                <span class="summary-item-label">${service.name}</span>
                <span class="summary-item-value">${service.price} €</span>
            `;
            servicesList.appendChild(itemDiv);
        }
    });

    // Añadir baños si hay
    if (state.banoCount > 0 && state.activeCategories.areas) {
        const banoTotal = state.banoCount * state.customPrices.bano;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Baños (${state.banoCount} x ${state.customPrices.bano}€)</span>
            <span class="summary-item-value">${banoTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir habitaciones si hay
    if (state.habitacionCount > 0 && state.activeCategories.areas) {
        const habitacionTotal = state.habitacionCount * state.customPrices.habitacion;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Habitaciones (${state.habitacionCount} x ${state.customPrices.habitacion}€)</span>
            <span class="summary-item-value">${habitacionTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales salón si hay
    if (state.cristalSalonCount > 0 && state.activeCategories.windows) {
        const cristalSalonTotal = state.cristalSalonCount * state.customPrices['cristal-salon'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Cristales Salón (${state.cristalSalonCount} x ${state.customPrices['cristal-salon']}€)</span>
            <span class="summary-item-value">${cristalSalonTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales cocina si hay
    if (state.cristalCocinaCount > 0 && state.activeCategories.windows) {
        const cristalCocinaTotal = state.cristalCocinaCount * state.customPrices['cristal-cocina'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Cristales Cocina (${state.cristalCocinaCount} x ${state.customPrices['cristal-cocina']}€)</span>
            <span class="summary-item-value">${cristalCocinaTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales baño si hay
    if (state.cristalBanoCount > 0 && state.activeCategories.windows) {
        const cristalBanoTotal = state.cristalBanoCount * state.customPrices['cristal-bano'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Cristales Baño (${state.cristalBanoCount} x ${state.customPrices['cristal-bano']}€)</span>
            <span class="summary-item-value">${cristalBanoTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales habitación si hay
    if (state.cristalHabitacionCount > 0 && state.activeCategories.windows) {
        const cristalHabitacionTotal = state.cristalHabitacionCount * state.customPrices['cristal-habitacion'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Cristales Habitación (${state.cristalHabitacionCount} x ${state.customPrices['cristal-habitacion']}€)</span>
            <span class="summary-item-value">${cristalHabitacionTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales terraza si hay
    if (state.cristalTerrazaCount > 0 && state.activeCategories.windows) {
        const cristalTerrazaTotal = state.cristalTerrazaCount * state.customPrices['cristal-terraza'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Cristales Terraza (${state.cristalTerrazaCount} x ${state.customPrices['cristal-terraza']}€)</span>
            <span class="summary-item-value">${cristalTerrazaTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales lavandería si hay
    if (state.cristalLavanderiaCount > 0 && state.activeCategories.windows) {
        const cristalLavanderiaTotal = state.cristalLavanderiaCount * state.customPrices['cristal-lavanderia'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Cristales Lavandería (${state.cristalLavanderiaCount} x ${state.customPrices['cristal-lavanderia']}€)</span>
            <span class="summary-item-value">${cristalLavanderiaTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales balconeras si hay
    if (state.cristalBalconerasCount > 0 && state.activeCategories.windows) {
        const cristalBalconerasTotal = state.cristalBalconerasCount * state.customPrices['cristal-balconeras'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Balconeras (${state.cristalBalconerasCount} x ${state.customPrices['cristal-balconeras']}€)</span>
            <span class="summary-item-value">${cristalBalconerasTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Añadir cristales escaparates si hay
    if (state.cristalEscaparatesCount > 0 && state.activeCategories.windows) {
        const cristalEscaparatesTotal = state.cristalEscaparatesCount * state.customPrices['cristal-escaparates'];
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-label">Escaparates (${state.cristalEscaparatesCount} x ${state.customPrices['cristal-escaparates']}€)</span>
            <span class="summary-item-value">${cristalEscaparatesTotal} €</span>
        `;
        servicesList.appendChild(itemDiv);
    }

    // Actualizar información en el modal
    document.getElementById('final-nombre').textContent = state.clientData.nombre || 'No proporcionado';
    document.getElementById('final-direccion').textContent = state.clientData.calle ? 
        `${state.clientData.calle}, Portal ${state.clientData.portal}, Piso ${state.clientData.piso}, Puerta ${state.clientData.puerta}` : 
        'No proporcionada';
    document.getElementById('final-fecha1').textContent = formatDate(state.clientData.fecha1);
    document.getElementById('final-fecha2').textContent = formatDate(state.clientData.fecha2);
    document.getElementById('final-total-cost').textContent = `${state.totalCost} €`;
    document.getElementById('final-cost-per-person').textContent = `${state.costPerPerson.toFixed(2)} €`;
    document.getElementById('final-roommates-count').textContent = state.roommatesCount;
    document.getElementById('final-roommates-plural').textContent = state.roommatesCount === 1 ? '' : 's';

    // Mostrar el modal de resumen final
    finalSummaryModal.classList.add('open');
    
    // Scroll al inicio del modal
    finalSummaryModal.querySelector('.final-summary-content').scrollTop = 0;
}

// Función para editar secciones
function editSection(section) {
    finalSummaryModal.classList.remove('open');
    
    if (section === 'services') {
        // Ya estamos en la sección de servicios
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (section === 'client-data' || section === 'dates') {
        // Mostrar formulario para datos del cliente
        showClientForm();
    }
}

// Mostrar formulario de cliente (opcional)
function showClientForm() {
    // Crear formulario modal si no existe
    let clientFormModal = document.getElementById('client-form-modal');
    
    if (!clientFormModal) {
        clientFormModal = document.createElement('div');
        clientFormModal.id = 'client-form-modal';
        clientFormModal.className = 'final-summary-modal';
        clientFormModal.innerHTML = `
            <div class="final-summary-content" style="max-width: 500px;">
                <div class="flex justify-between items-start mb-6">
                    <div class="summary-header">
                        <h2>👤 Datos del Cliente</h2>
                        <p>Opcional - Puedes completar ahora o más tarde</p>
                    </div>
                    <button onclick="document.getElementById('client-form-modal').classList.remove('open')" class="modal-close-btn">
                        ✕
                    </button>
                </div>

                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                        <input type="text" id="client-nombre" class="w-full p-3 border border-gray-300 rounded-lg" 
                               placeholder="Tu nombre" value="${state.clientData.nombre}">
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                            <input type="text" id="client-calle" class="w-full p-3 border border-gray-300 rounded-lg" 
                                   placeholder="Calle y número" value="${state.clientData.calle}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Portal</label>
                            <input type="text" id="client-portal" class="w-full p-3 border border-gray-300 rounded-lg" 
                                   placeholder="Portal" value="${state.clientData.portal}">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Piso</label>
                            <input type="text" id="client-piso" class="w-full p-3 border border-gray-300 rounded-lg" 
                                   placeholder="Piso" value="${state.clientData.piso}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Puerta</label>
                            <input type="text" id="client-puerta" class="w-full p-3 border border-gray-300 rounded-lg" 
                                   placeholder="Puerta" value="${state.clientData.puerta}">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Primera fecha</label>
                            <input type="date" id="client-fecha1" class="w-full p-3 border border-gray-300 rounded-lg" 
                                   value="${state.clientData.fecha1}">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Segunda fecha</label>
                            <input type="date" id="client-fecha2" class="w-full p-3 border border-gray-300 rounded-lg" 
                                   value="${state.clientData.fecha2}">
                        </div>
                    </div>

                    <div class="flex gap-3 mt-6">
                        <button onclick="saveClientData()" class="flex-1 bg-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-blue-700">
                            Guardar y Continuar
                        </button>
                        <button onclick="document.getElementById('client-form-modal').classList.remove('open'); showFinalSummary();" 
                                class="flex-1 bg-gray-200 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-300">
                            Omitir por ahora
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(clientFormModal);
    }
    
    clientFormModal.classList.add('open');
}

// Guardar datos del cliente
function saveClientData() {
    state.clientData = {
        nombre: document.getElementById('client-nombre').value.trim(),
        calle: document.getElementById('client-calle').value.trim(),
        portal: document.getElementById('client-portal').value.trim(),
        piso: document.getElementById('client-piso').value.trim(),
        puerta: document.getElementById('client-puerta').value.trim(),
        fecha1: document.getElementById('client-fecha1').value,
        fecha2: document.getElementById('client-fecha2').value
    };
    
    document.getElementById('client-form-modal').classList.remove('open');
    showFinalSummary();
}

// Enviar mensaje por WhatsApp
function sendWhatsAppMessage() {
    const nombre = state.clientData.nombre || 'No proporcionado';
    const direccion = state.clientData.calle ? 
        `${state.clientData.calle}, Portal ${state.clientData.portal}, Piso ${state.clientData.piso}, Puerta ${state.clientData.puerta}` : 
        'No proporcionada';
    const fecha1 = state.clientData.fecha1;
    const fecha2 = state.clientData.fecha2;

    // Mensaje profesional y minimalista para WhatsApp - INCLUYENDO TODOS LOS DETALLES
    let message = `PPTO. SERVICIO DE LIMPIEZA\n\n`;
    
    message += `INFORMACIÓN CLIENTE\n`;
    message += `• Nombre: ${nombre}\n`;
    message += `• Dirección: ${direccion}\n\n`;
    
    message += `FECHAS PARA VISITA\n`;
    message += `• Primera opción: ${formatDate(fecha1)}\n`;
    message += `• Segunda opción: ${formatDate(fecha2)}\n\n`;
    
    message += `SERVICIOS SOLICITADOS\n`;
    
    // Servicios seleccionados
    Object.entries(state.selectedServices).forEach(([serviceKey, service]) => {
        const category = getCategoryFromService(serviceKey);
        if (state.activeCategories[category]) {
            message += `• ${service.name}: ${service.price}€\n`;
        }
    });
    
    // Baños
    if (state.banoCount > 0 && state.activeCategories.areas) {
        const banoTotal = state.banoCount * state.customPrices.bano;
        message += `• Baños (${state.banoCount} x ${state.customPrices.bano}€): ${banoTotal}€\n`;
    }
    
    // Habitaciones
    if (state.habitacionCount > 0 && state.activeCategories.areas) {
        const habitacionTotal = state.habitacionCount * state.customPrices.habitacion;
        message += `• Habitaciones (${state.habitacionCount} x ${state.customPrices.habitacion}€): ${habitacionTotal}€\n`;
    }
    
    // Cristales salón
    if (state.cristalSalonCount > 0 && state.activeCategories.windows) {
        const cristalSalonTotal = state.cristalSalonCount * state.customPrices['cristal-salon'];
        message += `• Cristales Salón (${state.cristalSalonCount} x ${state.customPrices['cristal-salon']}€): ${cristalSalonTotal}€\n`;
    }
    
    // Cristales cocina
    if (state.cristalCocinaCount > 0 && state.activeCategories.windows) {
        const cristalCocinaTotal = state.cristalCocinaCount * state.customPrices['cristal-cocina'];
        message += `• Cristales Cocina (${state.cristalCocinaCount} x ${state.customPrices['cristal-cocina']}€): ${cristalCocinaTotal}€\n`;
    }
    
    // Cristales baño
    if (state.cristalBanoCount > 0 && state.activeCategories.windows) {
        const cristalBanoTotal = state.cristalBanoCount * state.customPrices['cristal-bano'];
        message += `• Cristales Baño (${state.cristalBanoCount} x ${state.customPrices['cristal-bano']}€): ${cristalBanoTotal}€\n`;
    }
    
    // Cristales habitación
    if (state.cristalHabitacionCount > 0 && state.activeCategories.windows) {
        const cristalHabitacionTotal = state.cristalHabitacionCount * state.customPrices['cristal-habitacion'];
        message += `• Cristales Habitación (${state.cristalHabitacionCount} x ${state.customPrices['cristal-habitacion']}€): ${cristalHabitacionTotal}€\n`;
    }
    
    // Cristales terraza
    if (state.cristalTerrazaCount > 0 && state.activeCategories.windows) {
        const cristalTerrazaTotal = state.cristalTerrazaCount * state.customPrices['cristal-terraza'];
        message += `• Cristales Terraza (${state.cristalTerrazaCount} x ${state.customPrices['cristal-terraza']}€): ${cristalTerrazaTotal}€\n`;
    }
    
    // Cristales lavandería
    if (state.cristalLavanderiaCount > 0 && state.activeCategories.windows) {
        const cristalLavanderiaTotal = state.cristalLavanderiaCount * state.customPrices['cristal-lavanderia'];
        message += `• Cristales Lavandería (${state.cristalLavanderiaCount} x ${state.customPrices['cristal-lavanderia']}€): ${cristalLavanderiaTotal}€\n`;
    }
    
    // Cristales balconeras
    if (state.cristalBalconerasCount > 0 && state.activeCategories.windows) {
        const cristalBalconerasTotal = state.cristalBalconerasCount * state.customPrices['cristal-balconeras'];
        message += `• Balconeras (${state.cristalBalconerasCount} x ${state.customPrices['cristal-balconeras']}€): ${cristalBalconerasTotal}€\n`;
    }
    
    // Cristales escaparates
    if (state.cristalEscaparatesCount > 0 && state.activeCategories.windows) {
        const cristalEscaparatesTotal = state.cristalEscaparatesCount * state.customPrices['cristal-escaparates'];
        message += `• Escaparates (${state.cristalEscaparatesCount} x ${state.customPrices['cristal-escaparates']}€): ${cristalEscaparatesTotal}€\n`;
    }
    
    message += `\nDETALLE DE COSTES\n`;
    message += `• Cuota de activación: ${state.activationFee}€\n`;
    message += `• Número de compañeros: ${state.roommatesCount}\n`;
    message += `• Coste total del servicio: ${state.totalCost}€\n`;
    message += `• Coste por persona: ${state.costPerPerson.toFixed(2)}€\n\n`;

    message += `INFORMACIÓN ADICIONAL\n`;
    message += `Esta solicitud ha sido generada a través del Constructor de Presupuestos TUM.\n\n`;
    
    message += `AGRADECEMOS SU CONFIANZA`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/34602846694?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Cerrar modal
    finalSummaryModal.classList.remove('open');
    
    // Mostrar mensaje de confirmación
    setTimeout(() => {
        alert('¡Presupuesto enviado por WhatsApp! Nos pondremos en contacto contigo pronto.');
        resetOrder();
    }, 500);
}
