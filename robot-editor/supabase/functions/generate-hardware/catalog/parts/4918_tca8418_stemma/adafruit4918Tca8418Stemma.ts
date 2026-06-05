import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit4918Tca8418Stemma: CatalogPart = {
  "id": "4918-tca8418-stemma",
  "name": "4918 TCA8418 Stemma",
  "category": "controller",
  "description": "4918 TCA8418 Stemma imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "tca8418",
    "controller"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 35.56,
      "depth": 17.78,
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
        22.86,
        8.89,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #6032; radius 1.25 mm."
    },
    {
      "id": "back-mount",
      "label": "Back Mount",
      "kind": "mounting-hole",
      "positionMm": [
        12.7,
        8.89,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.5,
      "notes": "Selected center from #6076; radius 1.25 mm."
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
