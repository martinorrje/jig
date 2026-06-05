import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit938Mono128x64OledStemma: CatalogPart = {
  "id": "938-mono-128x64-oled-stemma",
  "name": "938 Mono 128x64 OLED Stemma",
  "category": "ui",
  "description": "938 Mono 128x64 OLED Stemma imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "mono",
    "128x64",
    "oled",
    "ui"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 35.56,
      "depth": 33.014,
      "height": 6.526
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-left-mount",
      "label": "Front Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        33.02,
        30.48,
        1.57
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #5833; radius 1.25 mm."
    },
    {
      "id": "front-right-mount",
      "label": "Front Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        33.02,
        2.54,
        1.57
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 5.08,
      "notes": "Selected center from #5849; radius 2.54 mm."
    },
    {
      "id": "back-right-mount",
      "label": "Back Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        2.54,
        1.57
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #5773; radius 1.25 mm."
    },
    {
      "id": "back-left-mount",
      "label": "Back Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        30.48,
        1.57
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #5775; radius 1.25 mm."
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
