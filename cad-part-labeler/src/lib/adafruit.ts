import type { AdafruitCadFile, CadFormat } from '../types/catalog'
import {
  adafruitStemmaCategoryProductIds,
  robotEditorCatalogProductIds,
} from './adafruitCategory'

type GitTreeResponse = {
  tree?: Array<{
    path?: string
    type?: string
  }>
}

type ProductMetadata = {
  id: string
  name: string
  url?: string
  stock?: string
  isInStock: boolean | null
}

const repoRawBase =
  'https://raw.githubusercontent.com/adafruit/Adafruit_CAD_Parts/main'
const treeUrl =
  'https://api.github.com/repos/adafruit/Adafruit_CAD_Parts/git/trees/main?recursive=1'
const productsUrl = 'https://www.adafruit.com/api/products'

export async function fetchAdafruitCadParts(): Promise<AdafruitCadFile[]> {
  const [treeResponse, productsById] = await Promise.all([
    fetch(treeUrl),
    fetchAdafruitProducts().catch(() => new Map<string, ProductMetadata>()),
  ])

  if (!treeResponse.ok) {
    throw new Error(`Could not load Adafruit parts: ${treeResponse.status}`)
  }

  const data = (await treeResponse.json()) as GitTreeResponse

  return (data.tree ?? [])
    .filter((entry) => entry.type === 'blob')
    .map((entry) => entry.path)
    .filter((path): path is string => Boolean(path))
    .filter((path) => /\.(step|stp|stl)$/i.test(path))
    .map((path) => {
      const format: CadFormat = /\.(step|stp)$/i.test(path) ? 'step' : 'stl'
      const product = findProductForPath(path, productsById)
      const name = createPartName(path)
      const searchableText = `${name} ${path} ${product?.name ?? ''}`

      return {
        name,
        path,
        rawUrl: `${repoRawBase}/${encodeURIComponentPath(path)}`,
        format,
        productId: product?.id ?? null,
        ...(product?.name ? { productName: product.name } : {}),
        ...(product?.url ? { productUrl: product.url } : {}),
        ...(product?.stock ? { productStock: product.stock } : {}),
        isInStock: product?.isInStock ?? null,
        usefulnessScore: scoreUsefulness(searchableText),
      }
    })
    .filter(isAdafruitCatalogQueuePart)
    .reduce(dedupeAdafruitParts, [])
    .sort(compareAdafruitParts)
}

async function fetchAdafruitProducts() {
  const response = await fetch(productsUrl)
  const productsById = new Map<string, ProductMetadata>()
  if (!response.ok) return productsById

  const products = (await response.json()) as unknown
  if (!Array.isArray(products)) return productsById

  for (const product of products) {
    if (!product || typeof product !== 'object') continue

    const data = product as Record<string, unknown>

    if (data.product_id === undefined || data.product_id === null) {
      continue
    }

    const id = String(data.product_id)
    const stock = typeof data.product_stock === 'string' ? data.product_stock : undefined
    const url = typeof data.product_url === 'string' ? data.product_url : undefined
    const name = typeof data.product_name === 'string' ? data.product_name : ''

    productsById.set(id, {
      id,
      name,
      ...(url ? { url } : {}),
      ...(stock ? { stock } : {}),
      isInStock: stock ? stockTextMeansInStock(stock) : null,
    })
  }

  return productsById
}

export function compareAdafruitParts(a: AdafruitCadFile, b: AdafruitCadFile) {
  const scoreDelta = rankPart(b) - rankPart(a)
  if (scoreDelta !== 0) return scoreDelta

  if (a.format !== b.format) return a.format === 'step' ? -1 : 1
  return a.name.localeCompare(b.name)
}

function rankPart(part: AdafruitCadFile) {
  const stockBoost = part.isInStock === true ? 28 : part.isInStock === false ? -28 : 0
  const formatBoost = part.format === 'step' ? 16 : 0

  return part.usefulnessScore + stockBoost + formatBoost
}

function findProductForPath(
  path: string,
  productsById: Map<string, ProductMetadata>,
) {
  for (const productId of getLikelyProductIds(path)) {
    const product = productsById.get(productId)
    if (product) return product
  }

  return null
}

function getLikelyProductIds(path: string) {
  return path
    .split(/[^0-9]+/)
    .filter((token) => /^\d{3,5}$/.test(token))
    .filter((token, index, tokens) => tokens.indexOf(token) === index)
}

export function scoreUsefulness(text: string) {
  const normalized = text.toLowerCase()

  return usefulnessRules.reduce(
    (score, rule) => (rule.pattern.test(normalized) ? score + rule.score : score),
    0,
  )
}

export function isStemmaPart(part: AdafruitCadFile) {
  return getPartProductIds(part).some((productId) =>
    adafruitStemmaCategoryProductIds.has(productId),
  )
}

export function isAdafruitCatalogQueuePart(part: AdafruitCadFile) {
  const productIds = getPartProductIds(part)

  return (
    productIds.some((productId) =>
      adafruitStemmaCategoryProductIds.has(productId),
    ) &&
    productIds.every((productId) => !robotEditorCatalogProductIds.has(productId))
  )
}

export function getPartDedupeKey(part: AdafruitCadFile) {
  if (part.productId) return `product:${part.productId}`

  return `name:${normalizePartName(part.productName ?? part.name)}`
}

function dedupeAdafruitParts(
  parts: AdafruitCadFile[],
  nextPart: AdafruitCadFile,
) {
  const nextKey = getPartDedupeKey(nextPart)
  const existingIndex = parts.findIndex(
    (part) => getPartDedupeKey(part) === nextKey,
  )

  if (existingIndex === -1) return [...parts, nextPart]

  const existingPart = parts[existingIndex]
  if (!existingPart) return parts

  if (compareAdafruitParts(nextPart, existingPart) < 0) {
    const nextParts = [...parts]
    nextParts[existingIndex] = nextPart
    return nextParts
  }

  return parts
}

function getPartProductIds(part: AdafruitCadFile) {
  return [part.productId, ...getLikelyProductIds(part.path)].filter(
    (productId, index, productIds): productId is string =>
      Boolean(productId) && productIds.indexOf(productId) === index,
  )
}

const usefulnessRules = [
  { pattern: /\b(esp32|esp8266|feather|qt py|itsybitsy|arduino|raspberry pi|pico)\b/, score: 80 },
  { pattern: /\b(stemma|qwiic|i2c|spi|breakout|wing|bonnet|hat|shield)\b/, score: 58 },
  { pattern: /\b(sensor|accelerometer|gyro|imu|temperature|humidity|pressure|tof|gps|camera)\b/, score: 52 },
  { pattern: /\b(usb|usb-c|lipo|battery|charger|boost|buck|regulator|power)\b/, score: 48 },
  { pattern: /\b(oled|tft|display|lcd|led|neopixel|matrix)\b/, score: 42 },
  { pattern: /\b(audio|speaker|amplifier|mic|microphone|dac)\b/, score: 38 },
  { pattern: /\b(motor|servo|stepper|relay|solenoid|driver)\b/, score: 36 },
  { pattern: /\b(button|switch|encoder|potentiometer|joystick|keypad)\b/, score: 34 },
  { pattern: /\b(header|terminal|connector|jack|socket|plug|cable)\b/, score: 24 },
  { pattern: /\b(enclosure|case|box|mount|bracket|holder)\b/, score: 12 },
  { pattern: /\b(logo|badge|coin|ornament|stand|toy)\b/, score: -24 },
]

function stockTextMeansInStock(stock: string) {
  const normalized = stock.toLowerCase()

  if (/\bout of stock\b|discontinued|no longer/.test(normalized)) return false
  return /\bin stock\b|available/.test(normalized)
}

function createPartName(path: string) {
  return path.split('/').at(-1)?.replace(/\.(step|stp|stl)$/i, '') ?? path
}

function encodeURIComponentPath(path: string) {
  return path.split('/').map(encodeURIComponent).join('/')
}

function normalizePartName(name: string) {
  return name
    .toLowerCase()
    .replace(/\.(step|stp|stl)$/g, '')
    .replace(/\b(step|stp|stl|cad|model|part|adafruit)\b/g, ' ')
    .replace(/\b\d{3,5}\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
