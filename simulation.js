// Widget Queue Simulation
// Agent-based modeling with collision detection and queuing behavior

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');

// Configuration
const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 600,
    counterHeight: 60,
    customerRadius: 15,
    baseSpeed: 50, // pixels per second
    decisionInterval: 3000, // ms between decisions
    queueSpacing: 35,
    counterWidth: 200,
    counterY: 40,
    exitWidth: 100,
    exitHeight: 40,
    purchaseTime: 2000 // ms to complete purchase
};

// Global state
let simulationSpeed = 1.0;
let lastTime = 0;
let customers = [];

// Widget Counter
const widgetCounter = {
    x: (CONFIG.canvasWidth - CONFIG.counterWidth) / 2,
    y: CONFIG.counterY,
    width: CONFIG.counterWidth,
    height: CONFIG.counterHeight,
    
    draw() {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Counter label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('WIDGET COUNTER', this.x + this.width / 2, this.y + this.height / 2);
    },
    
    getBottomY() {
        return this.y + this.height;
    },
    
    getQueueStartX() {
        return this.x + this.width / 2;
    }
};

// Exit
const exit = {
    x: (CONFIG.canvasWidth - CONFIG.exitWidth) / 2,
    y: CONFIG.canvasHeight - CONFIG.exitHeight,
    width: CONFIG.exitWidth,
    height: CONFIG.exitHeight,
    
    draw() {
        ctx.fillStyle = '#228B22';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#006400';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Exit label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EXIT', this.x + this.width / 2, this.y + this.height / 2);
    },
    
    getCenterX() {
        return this.x + this.width / 2;
    },
    
    getCenterY() {
        return this.y + this.height / 2;
    }
};

// Customer class
class Customer {
    constructor(id) {
        this.id = id;
        this.radius = CONFIG.customerRadius;
        this.wantsWidget = false;
        this.inQueue = false;
        this.queuePosition = -1;
        this.queueJoinTime = null;
        this.hasPurchased = false;
        this.isLeaving = false;
        this.purchaseTimer = 0;
        this.atExit = false;
        
        // Start just above the exit (entering from the exit)
        this.x = exit.getCenterX();
        this.y = exit.y - this.radius - 5; // Just above the exit
        
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * CONFIG.baseSpeed;
        this.vy = Math.sin(angle) * CONFIG.baseSpeed;
        
        // Decision timer
        this.decisionTimer = Math.random() * CONFIG.decisionInterval;
        
        // Target for pathfinding
        this.targetX = null;
        this.targetY = null;
        
        // Color
        this.color = this.getRandomColor();
    }
    
    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', 
                       '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    update(deltaTime) {
        if (this.isLeaving) {
            // Move towards exit
            this.moveTowardsExit(deltaTime);
        } else if (this.inQueue) {
            // Move towards queue position or handle purchase
            this.moveToQueuePosition(deltaTime);
            
            // Check if at front of queue
            const queueIndex = customers.filter(c => c.inQueue && c.queueJoinTime < this.queueJoinTime).length;
            if (queueIndex === 0 && !this.hasPurchased) {
                // At front of queue, start purchase timer
                this.purchaseTimer += deltaTime * 1000;
                if (this.purchaseTimer >= CONFIG.purchaseTime) {
                    // Purchase complete, start leaving
                    this.hasPurchased = true;
                    this.isLeaving = true;
                    this.inQueue = false;
                    this.targetX = exit.getCenterX();
                    this.targetY = exit.getCenterY();
                    this.updateQueuePositions();
                }
            }
        } else if (this.wantsWidget) {
            // Move towards end of queue
            this.moveTowardsQueue(deltaTime);
        } else {
            // Random walk behavior
            this.randomWalk(deltaTime);
            
            // Update decision timer
            this.decisionTimer -= deltaTime * 1000;
            if (this.decisionTimer <= 0) {
                this.makeDecision();
                this.decisionTimer = CONFIG.decisionInterval;
            }
        }
    }
    
    randomWalk(deltaTime) {
        // Try to move
        const newX = this.x + this.vx * deltaTime;
        const newY = this.y + this.vy * deltaTime;
        
        // Check boundaries
        let hitWall = false;
        if (newX - this.radius < 0 || newX + this.radius > CONFIG.canvasWidth) {
            this.vx = -this.vx;
            hitWall = true;
        }
        if (newY - this.radius < 0 || newY + this.radius > CONFIG.canvasHeight) {
            this.vy = -this.vy;
            hitWall = true;
        }
        
        // Update position
        if (!hitWall) {
            this.x = newX;
            this.y = newY;
        }
        
        // Check counter collision
        if (this.collidesWithCounter()) {
            this.x -= this.vx * deltaTime;
            this.y -= this.vy * deltaTime;
            
            // Bounce off counter
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.vx = -this.vx;
            } else {
                this.vy = -this.vy;
            }
        }
        
        // Check exit collision
        if (this.collidesWithExit()) {
            this.x -= this.vx * deltaTime;
            this.y -= this.vy * deltaTime;
            
            // Bounce off exit
            if (Math.abs(this.vx) > Math.abs(this.vy)) {
                this.vx = -this.vx;
            } else {
                this.vy = -this.vy;
            }
        }
        
        // Check customer collisions
        for (let other of customers) {
            if (other !== this && !other.inQueue) {
                if (this.collidesWith(other)) {
                    this.resolveCollision(other);
                }
            }
        }
        
        // Occasionally change direction
        if (Math.random() < 0.01) {
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * CONFIG.baseSpeed;
            this.vy = Math.sin(angle) * CONFIG.baseSpeed;
        }
    }
    
    makeDecision() {
        // 20% chance to decide to want a widget
        if (!this.wantsWidget && Math.random() < 0.2) {
            this.wantsWidget = true;
            // Find end of queue
            this.findQueueTarget();
        }
    }
    
    findQueueTarget() {
        // Count how many customers are in queue or going to queue
        const queueCount = customers.filter(c => c.inQueue || (c.wantsWidget && c !== this)).length;
        
        // Calculate target position at end of queue
        const queueX = widgetCounter.getQueueStartX();
        const queueY = widgetCounter.getBottomY() + CONFIG.queueSpacing * (queueCount + 1);
        
        this.targetX = queueX;
        this.targetY = queueY;
    }
    
    moveTowardsQueue(deltaTime) {
        if (this.targetX === null || this.targetY === null) {
            this.findQueueTarget();
            return;
        }
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            // Reached queue position
            this.inQueue = true;
            this.queueJoinTime = performance.now(); // Track when customer joined queue
            this.x = this.targetX;
            this.y = this.targetY;
            this.updateQueuePositions();
        } else {
            // Move towards target
            const speed = CONFIG.baseSpeed * 1.5; // Move faster when heading to queue
            this.x += (dx / distance) * speed * deltaTime;
            this.y += (dy / distance) * speed * deltaTime;
            
            // Avoid other customers while moving to queue
            for (let other of customers) {
                if (other !== this && !other.inQueue && this.collidesWith(other)) {
                    // Move around them
                    const avoidX = this.x - other.x;
                    const avoidY = this.y - other.y;
                    const avoidDist = Math.sqrt(avoidX * avoidX + avoidY * avoidY);
                    if (avoidDist > 0) {
                        this.x += (avoidX / avoidDist) * 2;
                        this.y += (avoidY / avoidDist) * 2;
                    }
                }
            }
        }
    }
    
    moveTowardsExit(deltaTime) {
        if (this.targetX === null || this.targetY === null) {
            this.targetX = exit.getCenterX();
            this.targetY = exit.getCenterY();
        }
        
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
            // Reached exit, mark for removal
            this.atExit = true;
        } else {
            // Move towards exit
            const speed = CONFIG.baseSpeed * 1.5;
            this.x += (dx / distance) * speed * deltaTime;
            this.y += (dy / distance) * speed * deltaTime;
        }
    }
    
    moveToQueuePosition(deltaTime) {
        // Update queue position based on position in line (by join time, not ID)
        const queueIndex = customers.filter(c => c.inQueue && c.queueJoinTime < this.queueJoinTime).length;
        const targetY = widgetCounter.getBottomY() + CONFIG.queueSpacing * (queueIndex + 1);
        
        // Smoothly move to correct position in queue
        if (Math.abs(this.y - targetY) > 1) {
            this.y += (targetY - this.y) * deltaTime * 5;
        } else {
            this.y = targetY;
        }
    }
    
    updateQueuePositions() {
        // Recalculate all queue positions
        const queuedCustomers = customers.filter(c => c.inQueue);
        queuedCustomers.forEach((customer, index) => {
            customer.queuePosition = index;
        });
    }
    
    collidesWithCounter() {
        const counterLeft = widgetCounter.x;
        const counterRight = widgetCounter.x + widgetCounter.width;
        const counterTop = widgetCounter.y;
        const counterBottom = widgetCounter.y + widgetCounter.height;
        
        // Find closest point on counter to customer center
        const closestX = Math.max(counterLeft, Math.min(this.x, counterRight));
        const closestY = Math.max(counterTop, Math.min(this.y, counterBottom));
        
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        
        return (dx * dx + dy * dy) < (this.radius * this.radius);
    }
    
    collidesWithExit() {
        const exitLeft = exit.x;
        const exitRight = exit.x + exit.width;
        const exitTop = exit.y;
        const exitBottom = exit.y + exit.height;
        
        // Find closest point on exit to customer center
        const closestX = Math.max(exitLeft, Math.min(this.x, exitRight));
        const closestY = Math.max(exitTop, Math.min(this.y, exitBottom));
        
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        
        return (dx * dx + dy * dy) < (this.radius * this.radius);
    }
    
    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.radius + other.radius);
    }
    
    collidesWithOthers() {
        for (let other of customers) {
            if (other !== this && this.collidesWith(other)) {
                return true;
            }
        }
        return false;
    }
    
    resolveCollision(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        // Push apart
        const overlap = (this.radius + other.radius) - distance;
        const pushX = (dx / distance) * overlap * 0.5;
        const pushY = (dy / distance) * overlap * 0.5;
        
        this.x += pushX;
        this.y += pushY;
        other.x -= pushX;
        other.y -= pushY;
        
        // Bounce velocities
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        
        // Rotate velocities
        const vx1 = this.vx * cos + this.vy * sin;
        const vy1 = this.vy * cos - this.vx * sin;
        const vx2 = other.vx * cos + other.vy * sin;
        const vy2 = other.vy * cos - other.vx * sin;
        
        // Swap normal velocities
        const temp = vx1;
        this.vx = vx2 * cos - vy1 * sin;
        this.vy = vy1 * cos + vx2 * sin;
        other.vx = temp * cos - vy2 * sin;
        other.vy = vy2 * cos + temp * sin;
    }
    
    draw() {
        // Draw customer
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw indicator if wants widget
        if (this.wantsWidget) {
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.radius - 8, 4, 0, Math.PI * 2);
            ctx.fillStyle = this.inQueue ? '#00FF00' : '#FFD700';
            ctx.fill();
        }
    }
}

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
    
    // Draw exit
    exit.draw();
    
    // Draw widget counter
    widgetCounter.draw();
    
    // Draw customers
    for (let customer of customers) {
        customer.draw();
    }
    
    // Draw queue lines
    const queuedCustomers = customers.filter(c => c.inQueue);
    if (queuedCustomers.length > 0) {
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(widgetCounter.getQueueStartX(), widgetCounter.getBottomY());
        ctx.lineTo(widgetCounter.getQueueStartX(), 
                   widgetCounter.getBottomY() + CONFIG.queueSpacing * queuedCustomers.length);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    // Draw stats
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Customers: ${customers.length}`, 10, 20);
    ctx.fillText(`In Queue: ${queuedCustomers.length}`, 10, 40);
    ctx.fillText(`Wanting Widget: ${customers.filter(c => c.wantsWidget && !c.inQueue).length}`, 10, 60);
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
