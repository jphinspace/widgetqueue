# widgetqueue
Customers form lines to buy widgets

## About
This is an HTML5 canvas simulation featuring agent-based modeling where customers (represented as colored circles) randomly walk around a room until they decide they want to purchase a widget. When a customer wants a widget, they navigate to one of two widget counters at the top of the room and join the queue. The simulation includes:

- **Frame-independent movement** - Smooth animation that runs consistently regardless of frame rate
- **Collision detection** - Customers cannot walk through each other or the widget counters
- **Dual queue system** - Two widget counters with separate queues
- **Intelligent queue selection** - Customers choose the shorter line when deciding to purchase
- **Line switching** - Customers can switch to the other line once if it becomes obviously shorter (3+ people difference)
- **Queue formation** - Customers automatically find and join the end of the line
- **Adjustable speed** - Use the slider to control simulation speed from 0.1x to 3.0x

## Running the Simulation

Simply open `index.html` in a web browser:

```bash
# Option 1: Open directly
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows

# Option 2: Using a local server
python3 -m http.server 8080
# Then navigate to http://localhost:8080/index.html
```

## Features

- Autonomous customer agents with random walking behavior
- Two widget counters positioned at the top of the room
- Real-time collision detection and physics
- Intelligent queue selection based on line length
- Line-switching behavior (customers can switch once to a shorter line)
- Visual indicators showing customer state (wanting widget vs. in queue)
- Statistics display showing both queue counts
- Interactive speed control slider
- Spawn customer button to add customers on demand

## Code Structure

The simulation is organized into separate files for better maintainability:

- **`config.js`** - Configuration constants and simulation parameters
- **`entities.js`** - Scene entities (widget counters, exit, entrance)
- **`customer.js`** - Customer class with agent behavior logic
- **`simulation.js`** - Main simulation loop and state management
- **`index.html`** - HTML structure and UI controls

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation on the codebase structure.
