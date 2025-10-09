# GitHub Copilot Instructions for Widget Queue Simulation

## Project Overview
This is an HTML5 canvas simulation featuring agent-based modeling where customers (represented as colored circles) randomly walk around a room until they decide they want to purchase a widget from one of two counters. The simulation demonstrates queue formation, collision avoidance, and autonomous agent behavior.

## Code Architecture
The codebase is organized into four main files with clear separation of concerns:
- **`config.js`** - All simulation constants and configuration parameters
- **`entities.js`** - Scene entities (widget counters, exit, entrance)
- **`customer.js`** - Customer class with all agent behavior logic
- **`simulation.js`** - Main simulation loop and state management
- **`index.html`** - HTML structure and UI controls

See [ARCHITECTURE.md](../ARCHITECTURE.md) for detailed documentation.

## Key Design Principles
1. **Frame-independent movement** - All movement uses deltaTime for consistent speed regardless of frame rate
2. **Collision detection** - Customers avoid overlapping with each other, counters, exit, and entrance
3. **Personal space** - Customers maintain personal boundaries when not in queue
4. **State machine** - Customer behavior is managed through clear states (randomWalk, wantsWidget, inQueue, isLeaving)
5. **Separation of concerns** - Each file has a single, well-defined responsibility

## Common Editing Patterns

### Adjusting Customer Behavior
- **Speed changes**: Modify `CONFIG.baseSpeed` in `config.js`
- **Decision making**: Edit `makeDecision()` method in `customer.js`
- **Queue selection**: Modify `chooseCounter()` method in `customer.js`
- **Movement patterns**: Update methods in `customer.js` like `randomWalk()`, `moveTowardsQueue()`, `moveTowardsExit()`

### Adding New Features
- **New entity**: Add to `entities.js` with draw() and position methods
- **New configuration**: Add to CONFIG object in `config.js`
- **New customer state**: Add to `update()` state machine in `customer.js`
- **New UI control**: Add to `index.html` and handle in `simulation.js`

### Collision Detection
All collision methods follow similar patterns:
- Calculate closest point or distance
- Check if distance is less than radius
- Return collision object with metadata (dx, dy, etc.)
- Handle collision in calling code (push away, reflect velocity)

### Personal Space
Customers respect personal boundaries:
- When both customers are NOT in queue: `personalSpaceBuffer = this.radius * 0.5`
- When at least one is in queue: No extra buffer (tight queue formation)
- Applies in `collidesWith()` and `resolveCollision()` methods

## Current Known Behaviors
- Customers spawn at entrance and initially move away from it
- Customers randomly walk until they decide to want a widget (20% chance every 3 seconds)
- Customers choose the shorter queue when deciding to purchase
- Customers can switch lines once if the other line becomes 3+ people shorter
- Purchase takes 2 seconds at front of queue
- Customers leave via exit after purchase
- Entrance avoidance: Customers move away quickly when entrance is crowded (3+ nearby)

## Important Guidelines
1. **Minimal changes** - Make surgical modifications to specific methods rather than rewriting large sections
2. **Configuration over hardcoding** - Use CONFIG object for any tunable parameters
3. **Consistency** - Follow existing patterns for collision detection, state management, and rendering
4. **Testing** - Manually test by opening `index.html` in a browser (no automated tests exist)
5. **Frame independence** - Always multiply movement by `deltaTime` for time-based consistency

## Common Files to Edit by Scenario
| Task | File to Edit | Method/Section |
|------|-------------|----------------|
| Adjust customer speed | `config.js` | CONFIG.baseSpeed |
| Change queue behavior | `customer.js` | chooseCounter(), considerLineSwitching() |
| Modify pathfinding | `customer.js` | moveTowardsQueue(), moveTowardsExit() |
| Update collision logic | `customer.js` | collidesWith(), resolveCollision() |
| Change entity appearance | `entities.js` | draw() methods |
| Add UI controls | `index.html` + `simulation.js` | Event handlers |
| Adjust timing | `config.js` | CONFIG timing parameters |

## Dependencies
- No external libraries required
- Pure JavaScript (ES6+ features used)
- HTML5 Canvas API for rendering
- No build process needed - runs directly in browser

## Performance Considerations
- Customer collision checks are O(n²) - avoid adding more complex calculations in the update loop
- Use deltaTime for all time-based calculations to maintain frame independence
- Keep collision detection simple and efficient
