# widgetqueue
Customers form lines to buy widgets

## About
This is an HTML5 canvas simulation featuring agent-based modeling where customers (represented as colored circles) randomly walk around a room until they decide they want to purchase a widget. When a customer wants a widget, they navigate to the widget counter at the top of the room and join the queue. The simulation includes:

- **Frame-independent movement** - Smooth animation that runs consistently regardless of frame rate
- **Collision detection** - Customers cannot walk through each other or the widget counter
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

- 15 autonomous customer agents with random walking behavior
- Widget counter positioned at the top of the room
- Real-time collision detection and physics
- Visual indicators showing customer state (wanting widget vs. in queue)
- Statistics display showing customer counts
- Interactive speed control slider
