// Widget Queue Simulation - Entities
// Widget counters, exit, and entrance objects

// Widget Counters
const counterGap = 50; // Gap between the two counters
const widgetCounter1 = {
    id: 1,
    x: (CONFIG.canvasWidth - CONFIG.counterWidth * 2 - counterGap) / 2,
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
        ctx.fillText('WIDGET COUNTER 1', this.x + this.width / 2, this.y + this.height / 2);
    },
    
    getBottomY() {
        return this.y + this.height;
    },
    
    getQueueStartX() {
        return this.x + this.width / 2;
    }
};

const widgetCounter2 = {
    id: 2,
    x: (CONFIG.canvasWidth - CONFIG.counterWidth * 2 - counterGap) / 2 + CONFIG.counterWidth + counterGap,
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
        ctx.fillText('WIDGET COUNTER 2', this.x + this.width / 2, this.y + this.height / 2);
    },
    
    getBottomY() {
        return this.y + this.height;
    },
    
    getQueueStartX() {
        return this.x + this.width / 2;
    }
};

const widgetCounters = [widgetCounter1, widgetCounter2];

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

// Entrance
const entrance = {
    x: (CONFIG.canvasWidth - CONFIG.entranceWidth) / 2 - CONFIG.entranceWidth - 20,
    y: CONFIG.canvasHeight - CONFIG.entranceHeight,
    width: CONFIG.entranceWidth,
    height: CONFIG.entranceHeight,
    
    draw() {
        ctx.fillStyle = '#4169E1';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#1E3A8A';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        
        // Entrance label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('ENTRANCE', this.x + this.width / 2, this.y + this.height / 2);
    },
    
    getCenterX() {
        return this.x + this.width / 2;
    },
    
    getCenterY() {
        return this.y + this.height / 2;
    }
};
