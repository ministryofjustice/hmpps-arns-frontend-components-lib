import { DOMWindow, JSDOM } from 'jsdom'
import {
  expectedPredictorNameMappings,
  expectElementMissing,
  expectStyleToBe,
  getCombinations,
  getInitialDom,
  getRenderedHtml,
  getRiskTestData,
  predictorConfig,
  PredictorOption,
  StaticOrDynamicContent,
} from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

const inputCombinations: Record<keyof PredictorBadgeTestCase, any[]> = {
  predictor: [
    'allReoffendingPredictor',
    'violentReoffendingPredictor',
    'seriousViolentReoffendingPredictor',
    'directContactSexualReoffendingPredictor',
    'indirectImageContactSexualReoffendingPredictor',
    'combinedSeriousReoffendingPredictor',
    'ogrs3',
    'ovp',
    'ogp',
    'ospdc',
    'ospiic',
    'rsr',
  ],
  level: [BandLevel.LOW, BandLevel.MEDIUM, BandLevel.HIGH, BandLevel.VERY_HIGH, BandLevel.NOT_APPLICABLE, null],
  score: ['12.34', undefined],
  staticOrDynamic: ['Static', 'Dynamic'],
  showScore: [true, false, undefined],
}

// Reuse same JSDOM object to improve performance
let dom: JSDOM = null

describe('predictor-badge', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  it.each(getCombinations(inputCombinations))(
    'should render correct html/css - {predictor: $predictor, level: $level, score: $score, staticOrDynamic: $staticOrDynamic, showScore: $showScore}',
    ({ predictor, level, score, staticOrDynamic, showScore }) => {
      const renderedHtml = getRenderedHtml(
        dom,
        'PREDICTOR_BADGE',
        `predictor: "${predictor}", showScore: ${showScore}`,
        getRiskTestData([{ predictor, level, score, staticOrDynamic }]),
      )
      validateBadge(renderedHtml, predictor, level, score, staticOrDynamic, showScore)
    },
  )
})

const validateBadge = (
  renderedHtml: DOMWindow,
  predictor: PredictorOption,
  band: BandLevel,
  score: number | undefined,
  staticOrDynamic: StaticOrDynamicContent,
  showScore: boolean | undefined,
) => {
  const { document } = renderedHtml

  // 1. Resolve 'shouldShowScore' logic (mirroring the .njk template)
  const config = (predictorConfig as any)[predictor]
  const expectedShouldShowScore = showScore ?? config.showScore

  // 2. Resolve unknown band logic (mirroring the .njk template)
  const shouldBeUnkownBand = !band || (expectedShouldShowScore === true && !score)
  const properties = shouldBeUnkownBand ? nullBandMapping : expectedBandMappings[band]

  // 3. Reconstruct the dynamic attribute used .njk template
  const displayBand = shouldBeUnkownBand ? 'UNKNOWN' : band?.replace('_', ' ')
  const predictorName = expectedPredictorNameMappings[predictor].name
  const badgeSelector = `[data-predictor-badge="${predictorName} ${displayBand}"]`

  const badgeContainer = document.querySelector(badgeSelector)
  if (!badgeContainer) {
    throw new Error(`Could not find badge with selector: ${badgeSelector}`)
  }

  // 4. A badge is "default" visually if band is null/N.A. or explicitly 'UNKNOWN'
  const isDefaultBadge = band === BandLevel.NOT_APPLICABLE || displayBand === 'UNKNOWN' || shouldBeUnkownBand

  // 5. Validate Main Container Styles
  expectStyleToBe(renderedHtml, badgeContainer, [
    { tag: 'display', value: 'inline-flex' },
    { tag: 'outline', value: `2px solid ${properties.borderColour}` },
  ])

  // 6. Validate Name and Band (Scoped search using data-test-id)
  const nameAndBand = badgeContainer.querySelector('[data-test-id="nameAndBand"]')
  expectStyleToBe(
    renderedHtml,
    nameAndBand,
    [
      { tag: 'color', value: properties.typeAndLevelColour },
      { tag: 'backgroundColor', value: 'rgba(0, 0, 0, 0)' },
    ],
    `${expectedPredictorNameMappings[predictor].badgeContent} <strong>${displayBand}</strong>`,
  )

  // 7. Validate Score (Scoped search using data-test-id)
  const scoreEl = badgeContainer.querySelector('[data-test-id="score"]')
  if (expectedShouldShowScore && !isDefaultBadge) {
    expectStyleToBe(
      renderedHtml,
      scoreEl,
      [
        { tag: 'color', value: 'rgb(11, 12, 12)' },
        { tag: 'backgroundColor', value: properties.scoreBackgroundColour },
      ],
      `${score}%`,
    )
  } else {
    // Verifies the {% if shouldShowScore and badgeClass != ... %} logic
    expectElementMissing(badgeContainer, '[data-test-id="score"]')
  }

  // 8. Validate Static/Dynamic (Scoped search using data-test-id)
  const sdEl = badgeContainer.querySelector('[data-test-id="staticOrDynamic"]')
  if (expectedPredictorNameMappings[predictor].showStaticDynamic && staticOrDynamic && !isDefaultBadge) {
    expectStyleToBe(
      renderedHtml,
      sdEl,
      [
        { tag: 'color', value: 'rgb(40, 45, 48)' },
        { tag: 'backgroundColor', value: 'rgb(229, 230, 231)' },
      ],
      staticOrDynamic,
    )
  } else {
    expectElementMissing(badgeContainer, '[data-test-id="staticOrDynamic"]')
  }
}

const expectedBandMappings: Record<BandLevel, PredictorProperties> = {
  LOW: {
    borderColour: '#85994b',
    typeAndLevelColour: 'rgb(72, 91, 16)',
    scoreBackgroundColour: 'rgb(222, 233, 189)',
  },
  MEDIUM: {
    borderColour: '#f47738',
    typeAndLevelColour: 'rgb(163, 78, 0)',
    scoreBackgroundColour: 'rgb(249, 232, 189)',
  },
  HIGH: {
    borderColour: '#d4351c',
    typeAndLevelColour: 'rgb(148, 37, 20)',
    scoreBackgroundColour: 'rgb(246, 215, 210)',
  },
  VERY_HIGH: {
    borderColour: '#942514',
    typeAndLevelColour: 'rgb(113, 26, 13)',
    scoreBackgroundColour: 'rgb(255, 172, 159)',
  },
  NOT_APPLICABLE: {
    borderColour: '#b1b4b6',
    typeAndLevelColour: 'rgb(11, 12, 12)',
    scoreBackgroundColour: null,
  },
}

const nullBandMapping: PredictorProperties = {
  borderColour: '#b1b4b6',
  typeAndLevelColour: 'rgb(11, 12, 12)',
  scoreBackgroundColour: null,
}

type PredictorProperties = {
  borderColour: string
  typeAndLevelColour: string
  scoreBackgroundColour: string
}

interface PredictorBadgeTestCase {
  predictor: PredictorOption
  level: BandLevel
  score: number
  staticOrDynamic: StaticOrDynamicContent
  showScore: boolean
}
