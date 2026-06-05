import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit4431StemmaButtons: CatalogPart = {
  "id": "4431-stemma-buttons",
  "name": "4431 STEMMA Buttons",
  "category": "ui",
  "description": "4431 STEMMA Buttons imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "buttons",
    "ui"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 20.8,
      "depth": 27.8,
      "height": 14.132
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-mount",
      "label": "Front Mount",
      "kind": "mounting-hole",
      "positionMm": [
        17.8,
        2.4,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 3.2,
      "notes": "Selected center from #1894; radius 1.6 mm."
    },
    {
      "id": "back-mount",
      "label": "Back Mount",
      "kind": "mounting-hole",
      "positionMm": [
        3,
        2.4,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 3.2,
      "notes": "Selected center from #1896; radius 1.6 mm."
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
