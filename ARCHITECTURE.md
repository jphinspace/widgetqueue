# Architecture Documentation

## File Structure

The simulation codebase has been organized into four separate files for better maintainability and to reduce merge conflicts:

### 1. `config.js` (19 lines)
**Purpose**: Central configuration for all simulation parameters

**Contains**:
- `CONFIG` object with all simulation constants:
  - Canvas dimensions
  - Entity sizes (counters, customers, exit, entrance)
  - Movement speed
  - Timing parameters
  - Queue spacing

**When to edit**: When adjusting simulation parameters or adding new configuration values

### 2. `entities.js` (134 lines)
**Purpose**: Scene entities and environment objects

**Contains**:
- `widgetCounter1` - First widget counter object with draw and position methods
- `widgetCounter2` - Second widget counter object with draw and position methods
- `widgetCounters` - Array containing both counters
- `exit` - Exit door object
- `entrance` - Entrance door object

**When to edit**: When modifying counter appearance, adding new scene objects, or changing entity behavior

**Dependencies**: 
- Requires `CONFIG` from `config.js`
- Requires `ctx` from `simulation.js`

### 3. `customer.js` (488 lines)
**Purpose**: Customer agent class with all behavior logic

**Contains**:
- `Customer` class with methods:
  - Constructor and initialization
  - `update()` - Main state machine
  - `randomWalk()` - Random movement behavior
  - `makeDecision()` - Decision to want a widget
  - `chooseCounter()` - Queue selection logic
  - `considerLineSwitching()` - Line switching behavior
  - `findQueueTarget()` - Queue position calculation
  - `moveTowardsQueue()` - Pathfinding to queue
  - `moveTowardsExit()` - Pathfinding to exit
  - `moveToQueuePosition()` - Queue position maintenance
  - Collision detection methods
  - `draw()` - Customer rendering

**When to edit**: When modifying customer behavior, AI logic, or adding new customer features

**Dependencies**:
- Requires `CONFIG` from `config.js`
- Requires `widgetCounters`, `exit`, `entrance` from `entities.js`
- Requires `customers` array from `simulation.js`
- Requires `ctx` from `simulation.js`

### 4. `simulation.js` (127 lines)
**Purpose**: Main simulation loop, state management, and initialization

**Contains**:
- Canvas and DOM element references
- Global state variables (`simulationSpeed`, `lastTime`, `customers`)
- `init()` - Initialization function
- `spawnCustomer()` - Customer spawning
- `update()` - Simulation update loop
- `draw()` - Main rendering function
- `animate()` - Animation loop
- Event handlers for UI controls

**When to edit**: When adding new global features, UI controls, or modifying the simulation loop

**Dependencies**:
- Requires `CONFIG` from `config.js`
- Requires entities from `entities.js`
- Requires `Customer` class from `customer.js`

## Load Order

Files must be loaded in this order in `index.html`:

```html
<script src="config.js"></script>     <!-- 1. Configuration first -->
<script src="entities.js"></script>   <!-- 2. Scene objects (depends on CONFIG) -->
<script src="customer.js"></script>   <!-- 3. Customer class (depends on CONFIG and entities) -->
<script src="simulation.js"></script> <!-- 4. Main loop (depends on everything) -->
```

## Dependency Graph

```
config.js (no dependencies)
    ↓
entities.js (depends on: config.js, ctx)
    ↓
customer.js (depends on: config.js, entities.js, ctx, customers array)
    ↓
simulation.js (depends on: config.js, entities.js, customer.js)
```

## Benefits of This Structure

1. **Reduced Merge Conflicts**: Changes to customer behavior, entities, or config are isolated
2. **Clear Separation of Concerns**: Each file has a single, well-defined responsibility
3. **Easier Navigation**: Developers can quickly find relevant code
4. **Better Maintainability**: Changes are localized and don't affect unrelated code
5. **Scalability**: Easy to add new entities or customer behaviors without touching other files

## Common Edit Scenarios

| Scenario | File to Edit |
|----------|-------------|
| Adjust customer speed | `config.js` (CONFIG.baseSpeed) |
| Change counter appearance | `entities.js` (widgetCounter1/2.draw()) |
| Modify queue selection logic | `customer.js` (chooseCounter()) |
| Add new UI control | `simulation.js` (event handlers section) |
| Change decision-making behavior | `customer.js` (makeDecision()) |
| Add new entity to scene | `entities.js` (new object) |
| Modify stats display | `simulation.js` (draw() function) |
