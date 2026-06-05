import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit5880RotaryEncoderI2cStemmaQt: CatalogPart = {
  "id": "5880-rotary-encoder-i2c-stemma-qt",
  "name": "5880 Rotary Encoder I2C STEMMA QT",
  "category": "ui",
  "description": "5880 Rotary Encoder I2C STEMMA QT imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "rotary",
    "encoder",
    "ui"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 25.4,
      "depth": 25.4,
      "height": 25.93
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-right-mount",
      "label": "Front Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        22.86,
        2.54,
        1.57
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #8467; radius 1.25 mm."
    },
    {
      "id": "front-left-mount",
      "label": "Front Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        22.86,
        22.86,
        1.57
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #8469; radius 1.25 mm."
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
      "notes": "Selected center from #8561; radius 1.25 mm."
    },
    {
      "id": "back-left-mount",
      "label": "Back Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        22.86,
        1.57
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #8559; radius 1.25 mm."
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
