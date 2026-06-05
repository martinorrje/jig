import type { CatalogPart } from '../../../../_shared/partCatalogContract.ts'

export const adafruit4026StemmaSoilSensor: CatalogPart = {
  "id": "4026-stemma-soil-sensor",
  "name": "4026 STEMMA Soil Sensor",
  "category": "sensor",
  "description": "4026 STEMMA Soil Sensor imported from the CAD part labeler with labeled mounting features for enclosure generation.",
  "tags": [
    "adafruit",
    "stemma",
    "qwiic-compatible",
    "i2c",
    "soil",
    "sensor"
  ],
  "mechanical": {
    "dimensionsMm": {
      "width": 76.2,
      "depth": 13.97,
      "height": 6.37
    },
    "features": []
  },
  "attachmentPoints": [
    {
      "id": "right-mount",
      "label": "Right Mount",
      "kind": "mounting-hole",
      "positionMm": [
        22.86,
        11.176,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.54,
      "notes": "Selected center from #5998; radius 1.27 mm."
    },
    {
      "id": "left-mount",
      "label": "Left Mount",
      "kind": "mounting-hole",
      "positionMm": [
        22.86,
        2.54,
        0
      ],
      "normal": [
        0,
        0,
        -1
      ],
      "diameterMm": 2.54,
      "notes": "Selected center from #6000; radius 1.27 mm."
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
