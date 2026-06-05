import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit1910AlphanumericBackpackStemmaQt: CatalogPart = {
  "id": "1910-alphanumeric-backpack-stemma-qt",
  "name": "1910 Alphanumeric Backpack STEMMA QT",
  "category": "ui",
  "description": "1910 Alphanumeric Backpack STEMMA QT imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "alphanumeric",
    "backpack",
    "ui"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 50.8,
      "depth": 27.94,
      "height": 13.57
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-left-mount",
      "label": "Front Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        23.495,
        12.065,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2,
      "notes": "Selected center from #8771; radius 1 mm."
    },
    {
      "id": "front-right-mount",
      "label": "Front Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        23.495,
        -12.065,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2,
      "notes": "Selected center from #20205; radius 1 mm."
    },
    {
      "id": "back-left-mount",
      "label": "Back Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        -23.495,
        12.065,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2,
      "notes": "Selected center from #8769; radius 1 mm."
    },
    {
      "id": "back-right-mount",
      "label": "Back Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        -23.495,
        -12.065,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2,
      "notes": "Selected center from #8765; radius 1 mm."
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
