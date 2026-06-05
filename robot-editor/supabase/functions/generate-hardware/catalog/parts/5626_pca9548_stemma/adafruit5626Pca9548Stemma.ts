import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit5626Pca9548Stemma: CatalogPart = {
  "id": "5626-pca9548-stemma",
  "name": "5626 PCA9548 Stemma",
  "category": "controller",
  "description": "5626 PCA9548 Stemma imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "pca9548",
    "controller"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 40.64,
      "depth": 20.32,
      "height": 4.53
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-left-mount",
      "label": "Front Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        38.1,
        17.78,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.032,
      "notes": "Selected center from #7225; radius 1.016 mm."
    },
    {
      "id": "front-right-mount",
      "label": "Front Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        38.1,
        2.54,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.032,
      "notes": "Selected center from #7223; radius 1.016 mm."
    },
    {
      "id": "back-left-mount",
      "label": "Back Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        17.907,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #7212; radius 1.25 mm."
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
      "notes": "Selected center from #7082; radius 1.25 mm."
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
