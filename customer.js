// Widget Queue Simulation - Customer
// Customer class with behavior logic

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
        this.assignedCounter = null; // Which counter this customer is queuing for (1 or 2)
        this.hasSwitchedLines = false; // Track if customer has already switched lines
        
        // Random speed multiplier between 0.9x and 1.5x
        this.speedMultiplier = 0.9 + Math.random() * 0.6; // Random value between 0.9 and 1.5
        
        // Start just above the entrance (entering from the entrance at bottom)
        this.x = entrance.getCenterX();
        this.y = entrance.y - this.radius - 5; // Just above the entrance
        
        // Random velocity - but initially move away from entrance
        const angle = Math.random() * Math.PI * 2;
        this.vx = Math.cos(angle) * CONFIG.baseSpeed * this.speedMultiplier;
        this.vy = Math.sin(angle) * CONFIG.baseSpeed * this.speedMultiplier;
        
        // Ensure initial upward movement away from entrance
        if (this.vy > -CONFIG.baseSpeed * 0.3) {
            this.vy = -CONFIG.baseSpeed * this.speedMultiplier;
        }
        
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
            const queueIndex = customers.filter(c => c.inQueue && c.assignedCounter === this.assignedCounter && c.queueJoinTime < this.queueJoinTime).length;
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
            // Check if should switch lines before joining queue
            if (!this.hasSwitchedLines && !this.inQueue) {
                this.considerLineSwitching();
            }
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
        const counterCollision = this.collidesWithCounter();
        if (counterCollision.collision) {
            // Push away from counter based on collision normal
            const dist = Math.sqrt(counterCollision.dx * counterCollision.dx + counterCollision.dy * counterCollision.dy);
            if (dist > 0) {
                const pushDistance = this.radius - dist;
                this.x += (counterCollision.dx / dist) * pushDistance;
                this.y += (counterCollision.dy / dist) * pushDistance;
            }
            
            // Reflect velocity away from counter
            const dotProduct = this.vx * counterCollision.dx + this.vy * counterCollision.dy;
            if (dotProduct < 0) {
                const dist = Math.sqrt(counterCollision.dx * counterCollision.dx + counterCollision.dy * counterCollision.dy);
                if (dist > 0) {
                    const normalX = counterCollision.dx / dist;
                    const normalY = counterCollision.dy / dist;
                    const factor = 2 * dotProduct;
                    this.vx -= factor * normalX;
                    this.vy -= factor * normalY;
                }
            }
        }
        
        // Check exit collision - avoid exit to keep path clear
        const exitCollision = this.collidesWithExit();
        if (exitCollision.collision) {
            // Push away from exit
            const dist = Math.sqrt(exitCollision.dx * exitCollision.dx + exitCollision.dy * exitCollision.dy);
            if (dist > 0) {
                const pushDistance = this.radius - dist;
                this.x += (exitCollision.dx / dist) * pushDistance;
                this.y += (exitCollision.dy / dist) * pushDistance;
            }
            
            // Reflect velocity away from exit
            const dotProduct = this.vx * exitCollision.dx + this.vy * exitCollision.dy;
            if (dotProduct < 0) {
                const dist = Math.sqrt(exitCollision.dx * exitCollision.dx + exitCollision.dy * exitCollision.dy);
                if (dist > 0) {
                    const normalX = exitCollision.dx / dist;
                    const normalY = exitCollision.dy / dist;
                    const factor = 2 * dotProduct;
                    this.vx -= factor * normalX;
                    this.vy -= factor * normalY;
                }
            }
        }
        
        // Check customer collisions and track if any collision occurred
        let hasCollision = false;
        for (let other of customers) {
            if (other !== this) {
                if (this.collidesWith(other)) {
                    // Only resolve collision if at least one customer is not in queue
                    // Customers in queue maintain their position via moveToQueuePosition
                    if (!this.inQueue || !other.inQueue) {
                        this.resolveCollision(other);
                        hasCollision = true;
                    }
                }
            }
        }
        
        // Check if near entrance and crowded - move away quickly
        const entranceDistance = Math.sqrt(
            Math.pow(this.x - entrance.getCenterX(), 2) + 
            Math.pow(this.y - entrance.getCenterY(), 2)
        );
        const nearbyCustomers = customers.filter(c => {
            if (c === this) return false;
            const dx = c.x - entrance.getCenterX();
            const dy = c.y - entrance.getCenterY();
            return Math.sqrt(dx * dx + dy * dy) < 100;
        }).length;
        
        // Track whether we're actively avoiding entrance
        const isAvoidingEntrance = entranceDistance < 100 && nearbyCustomers >= 3;
        
        // If near entrance and crowded (3+ customers nearby), move away quickly
        if (isAvoidingEntrance) {
            const awayX = this.x - entrance.getCenterX();
            const awayY = this.y - entrance.getCenterY();
            const awayDist = Math.sqrt(awayX * awayX + awayY * awayY);
            if (awayDist > 0) {
                this.vx = (awayX / awayDist) * CONFIG.baseSpeed * 2;
                this.vy = (awayY / awayDist) * CONFIG.baseSpeed * 2;
            }
        } else if (!hasCollision) {
            // If not avoiding entrance and not colliding, restore normal velocity
            // Get current velocity magnitude
            const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            const normalSpeed = CONFIG.baseSpeed * this.speedMultiplier;
            
            // If speed is significantly different from normal, instantly restore it
            if (Math.abs(currentSpeed - normalSpeed) > 1) {
                const ratio = normalSpeed / currentSpeed;
                this.vx *= ratio;
                this.vy *= ratio;
            }
        }
        
        // Occasionally change direction
        if (Math.random() < 0.01) {
            const angle = Math.random() * Math.PI * 2;
            this.vx = Math.cos(angle) * CONFIG.baseSpeed * this.speedMultiplier;
            this.vy = Math.sin(angle) * CONFIG.baseSpeed * this.speedMultiplier;
        }
    }
    
    makeDecision() {
        // 20% chance to decide to want a widget
        if (!this.wantsWidget && Math.random() < 0.2) {
            this.wantsWidget = true;
            // Choose the counter with the shorter queue
            this.chooseCounter();
            // Find end of queue
            this.findQueueTarget();
        }
    }
    
    chooseCounter() {
        // Count customers in each queue
        const queue1Count = customers.filter(c => 
            (c.inQueue || c.wantsWidget) && c.assignedCounter === 1
        ).length;
        const queue2Count = customers.filter(c => 
            (c.inQueue || c.wantsWidget) && c.assignedCounter === 2
        ).length;
        
        // Choose the shorter queue (or randomly if equal)
        if (queue1Count < queue2Count) {
            this.assignedCounter = 1;
        } else if (queue2Count < queue1Count) {
            this.assignedCounter = 2;
        } else {
            this.assignedCounter = Math.random() < 0.5 ? 1 : 2;
        }
    }
    
    considerLineSwitching() {
        // Only switch if not already in queue and haven't switched before
        if (this.inQueue || this.hasSwitchedLines || !this.assignedCounter) {
            return;
        }
        
        // Get current queue lengths
        const currentQueueCount = customers.filter(c => 
            (c.inQueue || c.wantsWidget) && c.assignedCounter === this.assignedCounter
        ).length;
        const otherCounter = this.assignedCounter === 1 ? 2 : 1;
        const otherQueueCount = customers.filter(c => 
            (c.inQueue || c.wantsWidget) && c.assignedCounter === otherCounter
        ).length;
        
        // Switch if the other line is obviously shorter (at least 3 people shorter)
        if (currentQueueCount - otherQueueCount >= 3) {
            this.assignedCounter = otherCounter;
            this.hasSwitchedLines = true;
            // Recalculate target
            this.findQueueTarget();
        }
    }
    
    findQueueTarget() {
        if (!this.assignedCounter) {
            this.chooseCounter();
        }
        
        // Count how many customers are in queue or going to this specific queue
        const queueCount = customers.filter(c => 
            (c.inQueue || (c.wantsWidget && c !== this)) && c.assignedCounter === this.assignedCounter
        ).length;
        
        // Get the counter we're assigned to
        const counter = this.assignedCounter === 1 ? widgetCounter1 : widgetCounter2;
        
        // Calculate target position at end of queue
        const queueX = counter.getQueueStartX();
        const queueY = counter.getBottomY() + CONFIG.queueSpacing * (queueCount + 1);
        
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
            const speed = CONFIG.baseSpeed * 1.5 * this.speedMultiplier; // Move faster when heading to queue
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
            const speed = CONFIG.baseSpeed * 1.5 * this.speedMultiplier;
            this.x += (dx / distance) * speed * deltaTime;
            this.y += (dy / distance) * speed * deltaTime;
        }
    }
    
    moveToQueuePosition(deltaTime) {
        // Update queue position based on position in line (by join time, not ID)
        const queueIndex = customers.filter(c => c.inQueue && c.assignedCounter === this.assignedCounter && c.queueJoinTime < this.queueJoinTime).length;
        const counter = this.assignedCounter === 1 ? widgetCounter1 : widgetCounter2;
        const targetX = counter.getQueueStartX();
        const targetY = counter.getBottomY() + CONFIG.queueSpacing * (queueIndex + 1);
        
        // Smoothly move to correct position in queue (both X and Y)
        if (Math.abs(this.x - targetX) > 1) {
            this.x += (targetX - this.x) * deltaTime * 5;
        } else {
            this.x = targetX;
        }
        
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
        // Check collision with both counters
        for (let counter of widgetCounters) {
            const counterLeft = counter.x;
            const counterRight = counter.x + counter.width;
            const counterTop = counter.y;
            const counterBottom = counter.y + counter.height;
            
            // Find closest point on counter to customer center
            const closestX = Math.max(counterLeft, Math.min(this.x, counterRight));
            const closestY = Math.max(counterTop, Math.min(this.y, counterBottom));
            
            const dx = this.x - closestX;
            const dy = this.y - closestY;
            
            if ((dx * dx + dy * dy) < (this.radius * this.radius)) {
                return { collision: true, closestX, closestY, dx, dy };
            }
        }
        return { collision: false };
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
        
        const distSq = dx * dx + dy * dy;
        if (distSq < (this.radius * this.radius)) {
            return { collision: true, dx, dy };
        }
        return { collision: false };
    }
    
    collidesWithEntrance() {
        const entranceLeft = entrance.x;
        const entranceRight = entrance.x + entrance.width;
        const entranceTop = entrance.y;
        const entranceBottom = entrance.y + entrance.height;
        
        // Find closest point on entrance to customer center
        const closestX = Math.max(entranceLeft, Math.min(this.x, entranceRight));
        const closestY = Math.max(entranceTop, Math.min(this.y, entranceBottom));
        
        const dx = this.x - closestX;
        const dy = this.y - closestY;
        
        return (dx * dx + dy * dy) < (this.radius * this.radius);
    }
    
    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Add personal space buffer when not in queue
        // When both customers are not in queue, require more space
        const bothNotInQueue = !this.inQueue && !other.inQueue;
        const personalSpaceBuffer = bothNotInQueue ? this.radius * 0.5 : 0;
        
        return distance < (this.radius + other.radius + personalSpaceBuffer);
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
        
        // Add personal space buffer when not in queue
        const bothNotInQueue = !this.inQueue && !other.inQueue;
        const personalSpaceBuffer = bothNotInQueue ? this.radius * 0.5 : 0;
        
        // Push apart
        const overlap = (this.radius + other.radius + personalSpaceBuffer) - distance;
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
