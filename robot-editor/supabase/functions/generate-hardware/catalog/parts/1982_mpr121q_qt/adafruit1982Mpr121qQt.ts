import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit1982Mpr121qQt: CatalogPart = {
  "id": "1982-mpr121q-qt",
  "name": "1982 MPR121Q QT",
  "category": "sensor",
  "description": "1982 MPR121Q QT imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "mpr121q",
    "sensor"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 33.02,
      "depth": 19.177,
      "height": 4.53
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-mount",
      "label": "Front Mount",
      "kind": "mounting-hole",
      "positionMm": [
        30.48,
        2.54,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #5004; radius 1.25 mm."
    },
    {
      "id": "back-mount",
      "label": "Back Mount",
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
      "notes": "Selected center from #4926; radius 1.25 mm."
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
