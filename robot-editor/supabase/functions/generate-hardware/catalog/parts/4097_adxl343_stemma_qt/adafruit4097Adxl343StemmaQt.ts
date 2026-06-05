import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit4097Adxl343StemmaQt: CatalogPart = {
  "id": "4097-adxl343-stemma-qt",
  "name": "4097 ADXL343 STEMMA QT",
  "category": "sensor",
  "description": "4097 ADXL343 STEMMA QT imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "adxl343",
    "sensor"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 25.4,
      "depth": 17.78,
      "height": 4.53
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
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #5050; radius 1.25 mm."
    },
    {
      "id": "front-left-mount",
      "label": "Front Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        22.86,
        15.24,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #5048; radius 1.25 mm."
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
      "diameterMm": 5.08,
      "notes": "Selected center from #5060; radius 2.54 mm."
    },
    {
      "id": "back-left-mount",
      "label": "Back Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        15.24,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #4982; radius 1.25 mm."
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
