import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit3885StemmaSpeakerRevA: CatalogPart = {
  "id": "3885-stemma-speaker-rev-a",
  "name": "3885 STEMMA Speaker rev A",
  "category": "actuator",
  "description": "3885 STEMMA Speaker rev A imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "speaker",
    "rev",
    "actuator"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 30.48,
      "depth": 36.83,
      "height": 6.57
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "front-left-mount",
      "label": "Front Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        27.94,
        34.29,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.2,
      "notes": "Selected center from #5153; radius 1.1 mm."
    },
    {
      "id": "front-right-mount",
      "label": "Front Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        27.94,
        2.54,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.2,
      "notes": "Selected center from #5155; radius 1.1 mm."
    },
    {
      "id": "back-left-mount",
      "label": "Back Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        2.54,
        34.29,
        0
      ],
      "normal": [
        0,
        0,
        1
      ],
      "diameterMm": 2.2,
      "notes": "Selected center from #5133; radius 1.1 mm."
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
      "diameterMm": 2.2,
      "notes": "Selected center from #5131; radius 1.1 mm."
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
