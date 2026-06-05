import { useEffect, useMemo, useState } from 'react'
import { CadViewport } from './components/CadViewport'
import { fetchAdafruitCadParts } from './lib/adafruit'
import {
  createCatalogJson,
  createPartId,
  loadCatalogParts,
  saveCatalogPart,
} from './lib/catalogStorage'
import { parseCircularFeatures } from './lib/stepFeatures'
import type {
  AdafruitCadFile,
  AttachmentPoint,
  CadFormat,
  CatalogPartDraft,
  CircularFeature,
  Vec3,
} from './types/catalog'

type LoadedModel =
  | { provider: 'adafruit'; name: string; path: string; url: string; format: CadFormat }
  | { provider: 'local'; name: string; path: string; url: string; format: CadFormat }

const defaultKind = 'mount'

export function App() {
  const [parts, setParts] = useState<AdafruitCadFile[]>([])
  const [partsStatus, setPartsStatus] = useState('Loading Adafruit STEMMA CAD index...')
  const [featureStatus, setFeatureStatus] = useState('Load a STEP file to detect circular features.')
  const [query, setQuery] = useState('')
  const [loadedModel, setLoadedModel] = useState<LoadedModel | null>(null)
  const [dimensionsMm, setDimensionsMm] = useState<Vec3>([0, 0, 0])
  const [circularFeatures, setCircularFeatures] = useState<CircularFeature[]>([])
  const [attachmentPoints, setAttachmentPoints] = useState<AttachmentPoint[]>([])
  const [selectedAttachmentId, setSelectedAttachmentId] = useState<string | null>(null)
  const [savedParts, setSavedParts] = useState<CatalogPartDraft[]>(() =>
    loadCatalogParts(),
  )

  useEffect(() => {
    fetchAdafruitCadParts()
      .then((nextParts) => {
        setParts(nextParts)
        setPartsStatus(createPartsStatus(nextParts))
      })
      .catch((error) => {
        setPartsStatus(error instanceof Error ? error.message : 'Could not load parts')
      })
  }, [])

  const visibleParts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return parts
      .filter((part) =>
        normalizedQuery
          ? `${part.name} ${part.path}`.toLowerCase().includes(normalizedQuery)
          : true,
      )
      .slice(0, 80)
  }, [parts, query])

  const selectedAttachment = attachmentPoints.find(
    (point) => point.id === selectedAttachmentId,
  )
  const currentCatalogPart = loadedModel
    ? createCatalogPart(loadedModel, dimensionsMm, attachmentPoints)
    : null

  function loadAdafruitPart(part: AdafruitCadFile) {
    setLoadedModel({
      provider: 'adafruit',
      name: part.name,
      path: part.path,
      url: part.rawUrl,
      format: part.format,
    })
    setAttachmentPoints([])
    setSelectedAttachmentId(null)
    void detectCircularFeatures(part.rawUrl, part.format)
  }

  function loadLocalFile(file: File) {
    const format = getCadFormat(file.name)
    const url = URL.createObjectURL(file)

    setLoadedModel({
      provider: 'local',
      name: file.name.replace(/\.(step|stp|stl)$/i, ''),
      path: file.name,
      url,
      format,
    })
    setAttachmentPoints([])
    setSelectedAttachmentId(null)
    void detectCircularFeatures(url, format)
  }

  function addAttachment(input: {
    positionMm: Vec3
    normal: Vec3
    label?: string
    kind?: string
    notes?: string
  }) {
    const nextIndex = attachmentPoints.length + 1
    const id = `attachment-${nextIndex}`
    const point: AttachmentPoint = {
      id,
      label: input.label ?? `Attachment ${nextIndex}`,
      kind: input.kind ?? defaultKind,
      positionMm: input.positionMm,
      normal: input.normal,
      notes: input.notes ?? '',
    }

    setAttachmentPoints((points) => [...points, point])
    setSelectedAttachmentId(id)
  }

  function selectAttachment(id: string) {
    setSelectedAttachmentId(id)
  }

  function selectCircularFeatureCenter(feature: CircularFeature) {
    addAttachment({
      label: feature.label,
      kind: feature.kind === 'cylindrical-surface' ? 'mount' : 'datum',
      positionMm: feature.centerMm,
      normal: feature.normal,
      notes: `Selected center from ${feature.sourceEntity}; radius ${feature.radiusMm} mm.`,
    })
  }

  async function detectCircularFeatures(sourceUrl: string, format: CadFormat) {
    setCircularFeatures([])

    if (format !== 'step') {
      setFeatureStatus('STL has no STEP topology; circular features are unavailable.')
      return
    }

    setFeatureStatus('Detecting circular features from STEP topology...')

    try {
      const response = await fetch(sourceUrl)
      if (!response.ok) throw new Error(`STEP fetch failed: ${response.status}`)

      const features = parseCircularFeatures(await response.text())
      setCircularFeatures(features)
      setFeatureStatus(
        features.length === 0
          ? 'No circular STEP features detected.'
          : `${features.length} circular STEP features detected. Hover circular edges to select centers.`,
      )
    } catch (error) {
      setFeatureStatus(
        error instanceof Error ? error.message : 'Could not detect circular features',
      )
    }
  }

  function updateSelectedAttachment(patch: Partial<AttachmentPoint>) {
    if (!selectedAttachmentId) return

    setAttachmentPoints((points) =>
      points.map((point) =>
        point.id === selectedAttachmentId ? { ...point, ...patch } : point,
      ),
    )
  }

  function deleteSelectedAttachment() {
    if (!selectedAttachmentId) return

    setAttachmentPoints((points) =>
      points.filter((point) => point.id !== selectedAttachmentId),
    )
    setSelectedAttachmentId(null)
  }

  function deleteAllAttachments() {
    setAttachmentPoints([])
    setSelectedAttachmentId(null)
  }

  function saveCurrentPart() {
    if (!currentCatalogPart) return

    setSavedParts(saveCatalogPart(currentCatalogPart))
  }

  function downloadCurrentPart() {
    if (!currentCatalogPart) return

    const blob = new Blob([createCatalogJson(currentCatalogPart)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentCatalogPart.id}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app-shell">
      <section className="library-pane" aria-label="Part library">
        <header className="pane-header">
          <p className="eyebrow">Adafruit STEMMA CAD Parts</p>
          <h1>CAD Labeler</h1>
        </header>

        <label className="search-field">
          <span>Search STEMMA STEP/STL parts</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="PAM8302, speaker, Feather..."
          />
        </label>

        <label className="upload-button">
          Upload local STEP/STL
          <input
            type="file"
            accept=".step,.stp,.stl"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) loadLocalFile(file)
            }}
          />
        </label>

        <p className="library-status">{partsStatus}</p>

        <div className="part-list">
          {visibleParts.map((part) => (
            <button
              className="part-row"
              key={part.path}
              type="button"
              onClick={() => loadAdafruitPart(part)}
            >
              <span>{part.name}</span>
              <small>
                {part.format.toUpperCase()}
                {part.productStock ? ` · ${part.productStock}` : ''}
                {' · '}
                {part.path}
              </small>
            </button>
          ))}
        </div>
      </section>

      <section className="workspace-pane" aria-label="CAD labeling workspace">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Loaded part</p>
            <h2>{loadedModel?.name ?? 'No part loaded'}</h2>
          </div>
          <div className="workspace-actions">
            <button type="button" onClick={saveCurrentPart} disabled={!currentCatalogPart}>
              Save catalog part
            </button>
            <button type="button" onClick={downloadCurrentPart} disabled={!currentCatalogPart}>
              Export JSON
            </button>
          </div>
        </header>

        <CadViewport
          model={loadedModel}
          circularFeatures={circularFeatures}
          attachmentPoints={attachmentPoints}
          selectedAttachmentId={selectedAttachmentId}
          onSelectCircularFeatureCenter={selectCircularFeatureCenter}
          onSelectAttachment={selectAttachment}
          onDimensionsChange={setDimensionsMm}
        />
      </section>

      <section className="inspector-pane" aria-label="Attachment inspector">
        <header className="pane-header compact">
          <p className="eyebrow">Attachment points</p>
          <h2>{attachmentPoints.length} labeled</h2>
        </header>

        <div className="dimension-grid">
          <span>X {dimensionsMm[0]} mm</span>
          <span>Y {dimensionsMm[1]} mm</span>
          <span>Z {dimensionsMm[2]} mm</span>
        </div>

        <p className="library-status">{featureStatus}</p>

        <button
          className="danger-button"
          type="button"
          disabled={attachmentPoints.length === 0}
          onClick={deleteAllAttachments}
        >
          Delete all points
        </button>

        {selectedAttachment ? (
          <form className="attachment-editor">
            <label>
              Label
              <input
                value={selectedAttachment.label}
                onChange={(event) =>
                  updateSelectedAttachment({ label: event.target.value })
                }
              />
            </label>
            <label>
              Kind
              <select
                value={selectedAttachment.kind}
                onChange={(event) =>
                  updateSelectedAttachment({ kind: event.target.value })
                }
              >
                <option value="mount">Mount</option>
                <option value="connector">Connector</option>
                <option value="port">Port</option>
                <option value="datum">Datum</option>
                <option value="keepout">Keepout</option>
              </select>
            </label>
            <label>
              Notes
              <textarea
                value={selectedAttachment.notes}
                onChange={(event) =>
                  updateSelectedAttachment({ notes: event.target.value })
                }
              />
            </label>
            <div className="coordinate-readout">
              <span>Position: {selectedAttachment.positionMm.join(', ')}</span>
              <span>Normal: {selectedAttachment.normal.join(', ')}</span>
            </div>
            <button
              className="danger-button"
              type="button"
              onClick={deleteSelectedAttachment}
            >
              Delete selected point
            </button>
          </form>
        ) : (
          <p className="empty-copy">
            Hover a circular edge or cylindrical feature in the viewport, then
            click to select its center as an attachment point.
          </p>
        )}

        <div className="attachment-list">
          {attachmentPoints.map((point) => (
            <button
              className="attachment-row"
              data-selected={point.id === selectedAttachmentId}
              key={point.id}
              type="button"
              onClick={() => selectAttachment(point.id)}
            >
              <span>{point.label}</span>
              <small>{point.kind}</small>
            </button>
          ))}
        </div>

        <section className="saved-parts">
          <p className="eyebrow">Saved locally</p>
          {savedParts.slice(0, 8).map((part) => (
            <div key={part.id} className="saved-part">
              <span>{part.name}</span>
              <small>{part.attachmentPoints.length} points</small>
            </div>
          ))}
        </section>
      </section>
    </main>
  )
}

function createCatalogPart(
  model: LoadedModel,
  dimensionsMm: Vec3,
  attachmentPoints: AttachmentPoint[],
): CatalogPartDraft {
  return {
    id: createPartId(model.name),
    name: model.name,
    source: {
      provider: model.provider,
      path: model.path,
      format: model.format,
      ...(model.provider === 'adafruit' ? { url: model.url } : {}),
    },
    dimensionsMm,
    attachmentPoints,
    updatedAt: new Date().toISOString(),
  }
}

function getCadFormat(fileName: string): CadFormat {
  return /\.(step|stp)$/i.test(fileName) ? 'step' : 'stl'
}

function createPartsStatus(parts: AdafruitCadFile[]) {
  const knownStockCount = parts.filter((part) => part.isInStock !== null).length
  const inStockCount = parts.filter((part) => part.isInStock === true).length

  if (knownStockCount === 0) {
    return `${parts.length} Adafruit STEMMA STEP/STL parts available`
  }

  return `${parts.length} Adafruit STEMMA STEP/STL parts available · ${inStockCount} matched in stock`
}
