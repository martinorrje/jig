# CAD Part Labeler

A focused Vite app for labeling attachment points on CAD parts and saving them as catalog part JSON.

## Run

```sh
npm install
npm run dev
```

## Workflow

1. Search and load an Adafruit STEMMA STEP/STL part, or upload a local STEP/STL.
2. Prefer STEP/STP when available; STEP files preserve imported part colors and topology.
3. Move over circular edges or cylindrical features in the viewport.
4. When a circular feature is detected under the pointer, its center is shown.
5. Click while hovering the feature to select that center as an attachment point.
6. Select the created attachment marker and label its kind, name, and notes.
7. Save to browser local storage or export the catalog JSON file.

The Adafruit library is loaded from `adafruit/Adafruit_CAD_Parts` through GitHub's tree API and raw CAD URLs, then filtered to STEMMA/STEMMA QT parts.
When product IDs can be inferred from CAD filenames, the list is enriched with Adafruit product stock from the Adafruit Product API and sorted toward useful, in-stock STEMMA modules first.
