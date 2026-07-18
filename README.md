# Duck World

Duck World is a playful browser-based canvas experience that fills the screen with animated ducks, lets you tweak their behavior, and turns the scene into a tiny interactive toy. The project is built with plain HTML, CSS, and JavaScript and is designed to be easy to run locally.

## What this project does

This project creates a full-screen animated pond scene where:

- A background image is rendered behind the canvas.
- A large number of ducks are spawned and animated across the viewport.
- The mouse position influences duck movement, causing nearby ducks to steer toward the cursor.
- The settings panel lets you adjust duck size and movement speed.
- You can toggle duck-to-duck collisions on or off.
- Clicking on the canvas spawns an additional duck.
- Holding the left mouse button on the canvas spawns ducks continuously every 250 ms.
- The Disintegrate Duck button removes a duck and creates a burst of particles.
- Hunter mode lets the cursor disintegrate nearby ducks when the toggle is enabled.

## Recent updates

The latest version of the project includes the following interaction and visual improvements:

- Added a Hunter mode toggle in the settings panel.
- Enabled hover-based disintegration in Hunter mode so ducks vanish when the cursor gets close enough.
- Refined the particle system so the manual disintegrate action uses a more dramatic burst while Hunter mode uses a subtler effect.
- Added click-and-hold duck spawning, with ducks appearing at the pointer location every 250 ms while the left mouse button is held.
- Kept the original duck movement, collision, and particle systems intact while layering in the new interactions.

## How it works

### 1. Page structure

The app uses a very small static structure:

- [index.html](index.html) contains the settings panel, the canvas element, and the background layer.
- [style.css](style.css) defines the full-screen layout, the animated pond background, and the styling of the control panel.
- [script.js](script.js) handles the animation loop, duck behavior, UI events, particle effects, and the new pointer-driven interactions.

### 2. Animation loop

The animation is driven by requestAnimationFrame, which repeatedly:

1. Clears the canvas.
2. Updates each duck's position and movement.
3. Applies collision logic when enabled.
4. Draws ducks to the canvas.
5. Updates and renders particle effects for disintegration.

### 3. Duck behavior

Each duck object has:

- A random angle and movement speed variation.
- A size based on the slider setting and a random size multiplier.
- A turn speed that allows it to steer toward the cursor when the pointer is near.
- Boundary checks so ducks bounce off the screen edges.

### 4. UI controls

The settings panel exposes the following controls:

- Duck Size slider: adjusts the size of all ducks.
- Duck Speed slider: changes the base movement speed.
- Duck collisions checkbox: enables or disables collision behavior.
- Hunter mode checkbox: enables cursor-based disintegration for nearby ducks.
- Disintegrate Duck button: removes a random duck and creates a burst of particles.

## File structure

```text
duck-world/
├── assets/
│   ├── background.png
│   └── duck.png
├── index.html
├── script.js
├── style.css
└── README.md
```

## Assets

The project uses the following files from the assets folder:

- [assets/background.png](assets/background.png) — the pond and scene background image.
- [assets/duck.png](assets/duck.png) — the sprite used for rendering each duck.

## Run locally

You can open [index.html](index.html) directly in a browser, or serve the project from a simple local server:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000/

## Future ideas

Possible enhancements for the project include:

- Adding sound effects and water ripple animations.
- Supporting different duck colors or sprite variants.
- Introducing food and feeding interactions.
- Making the duck movement feel more natural with smoother physics.
- Adding more UI polish and a dark/light mode toggle.

