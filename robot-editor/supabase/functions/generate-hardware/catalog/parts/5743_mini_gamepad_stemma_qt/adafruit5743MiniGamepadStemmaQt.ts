import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit5743MiniGamepadStemmaQt: CatalogPart = {
  "id": "5743-mini-gamepad-stemma-qt",
  "name": "5743 Mini Gamepad STEMMA QT",
  "category": "ui",
  "description": "5743 Mini Gamepad STEMMA QT imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "mini",
    "gamepad",
    "ui"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 50.8,
      "depth": 22.86,
      "height": 13.07
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-left-mount",
      "label": "Front Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        48.26,
        20.32,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #6013; radius 1.25 mm."
    },
    {
      "id": "front-right-mount",
      "label": "Front Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        48.26,
        2.54,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #6095; radius 1.25 mm."
    },
    {
      "id": "back-left-mount",
      "label": "Back Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        20.32,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #6015; radius 1.25 mm."
    },
    {
      "id": "back-right-mount",
      "label": "Back Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        2.54,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #6093; radius 1.25 mm."
    }
  ],
  "electricalPorts": [
    {
      "id": "stemma-qt-i2c",
      "label": "STEMMA QT / Qwiic-compatible I2C connector",
      "kind": "i2c",
      "voltage": "3.3V-5V logic, part dependent",
      "notes": "Connectorized I2C path for STEMMA QT/Qwiic-style cabling. Confirm the product guide for exact voltage limits before wiring."
    },
    {
      "id": "vin",
      "label": "STEMMA power input",
      "kind": "power",
      "voltage": "3.3V-5V, part dependent",
      "notes": "Power carried through the STEMMA/Qwiic cable. Confirm the product guide for exact allowed supply voltage."
    },
    {
      "id": "gnd",
      "label": "Ground",
      "kind": "ground",
      "voltage": "0V",
      "notes": "Ground reference carried through the STEMMA/Qwiic cable."
    }
  ]
}
