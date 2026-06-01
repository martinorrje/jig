# Architecture Docs

## Coordinate conventions

Uses a right-handed Z-up coordinate system.

## Folder responsibilities

### `robot-editor`

The frontend code, uses `Three.js`, `vite`, `zustand` to create a 3D-viewer where skeleton graphs can be edited and compiled into valid CAD.

#### `robot-editor/viewport`

Contains the code for the `Three.js` viewport.

#### `robot-editor/model`

Contains the code defining the robot skeleton model.

#### `robot-editor/ui`

Contains React components for the UI.

#### `robot-editor/store`

Contains the `zustand` editor state definition.
