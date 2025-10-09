// Widget Queue Simulation - Main
// Animation loop, state management, and simulation initialization

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// Global state
let simulationSpeed = 1.0;
let lastTime = 0;
let customers = [];

// Initialize simulation
function init() {
    // Don't spawn any customers initially
    // Customers will be spawned via button
}

// Spawn a new customer
function spawnCustomer() {
    const id = customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 0;
    customers.push(new Customer(id));
}

// Update simulation
function update(deltaTime) {
    for (let customer of customers) {
        customer.update(deltaTime);
    }
    
    // Remove customers who reached the exit
    customers = customers.filter(c => !c.atExit);
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#E8F4F8';
    ctx.fillRect(0, 0, CONFIG.canvasWidth, CONFIG.canvasHeight);
    
    // Draw entrance
    entrance.draw();
    
    // Draw exit
    exit.draw();
    
    // Draw both widget counters
    widgetCounter1.draw();
    widgetCounter2.draw();
    
    // Draw customers
    for (let customer of customers) {
        customer.draw();
    }
    
    // Draw queue lines for both counters
    const queue1Customers = customers.filter(c => c.inQueue && c.assignedCounter === 1);
    const queue2Customers = customers.filter(c => c.inQueue && c.assignedCounter === 2);
    
    if (queue1Customers.length > 0) {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(widgetCounter1.getQueueStartX(), widgetCounter1.getBottomY());
        ctx.lineTo(widgetCounter1.getQueueStartX(), 
                   widgetCounter1.getBottomY() + CONFIG.queueSpacing * queue1Customers.length);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    if (queue2Customers.length > 0) {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(widgetCounter2.getQueueStartX(), widgetCounter2.getBottomY());
        ctx.lineTo(widgetCounter2.getQueueStartX(), 
                   widgetCounter2.getBottomY() + CONFIG.queueSpacing * queue2Customers.length);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw stats
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Customers: ${customers.length}`, 10, 20);
    ctx.fillText(`Queue 1: ${queue1Customers.length}`, 10, 40);
    ctx.fillText(`Queue 2: ${queue2Customers.length}`, 10, 60);
    ctx.fillText(`Wanting Widget: ${customers.filter(c => c.wantsWidget && !c.inQueue).length}`, 10, 80);
}

// Animation loop
function animate(currentTime) {
    // Calculate delta time in seconds
    if (lastTime === 0) {
        lastTime = currentTime;
    }
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1) * simulationSpeed;
    lastTime = currentTime;
    
    // Update and draw
    update(deltaTime);
    draw();
    
    // Continue animation
    requestAnimationFrame(animate);
}

// Speed slider handler
speedSlider.addEventListener('input', (e) => {
    simulationSpeed = parseFloat(e.target.value);
    speedValue.textContent = simulationSpeed.toFixed(1) + 'x';
});

// Spawn customer button handler
const spawnButton = document.getElementById('spawnButton');
spawnButton.addEventListener('click', () => {
    spawnCustomer();
});

// Start simulation
init();
requestAnimationFrame(animate);
