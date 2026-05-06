import { DOMWindow, JSDOM } from 'jsdom'
import {
  expectedPredictorNameMappings,
  expectElementMissing,
  expectStyleToBe,
  getCombinations,
  getInitialDom,
  getRenderedHtml,
  getRiskTestData,
  legacyFallbackTestCases,
  predictorConfig,
  PredictorOption,
  StaticOrDynamicContent,
} from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

// allReoffendingPredictor, directContactSexualReoffendingPredictor showScore from config
const inputCombinationsTemplateLogic: Record<keyof badgeRootTestCase, any[]> = {
  predictor: ['allReoffendingPredictor', 'directContactSexualReoffendingPredictor'],
  level: [BandLevel.VERY_HIGH, BandLevel.NOT_APPLICABLE, null],
  score: ['12.34', undefined],
  staticOrDynamic: ['Static', 'Dynamic'],
  showScore: [true, false, undefined],
  hideScoreAndStaticOrDynamic: [true, false],
}

// Reuse same JSDOM object to improve performance
let dom: JSDOM = null

describe('badge-base', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('should test band styles only', () => {
    it.each([BandLevel.LOW, BandLevel.MEDIUM, BandLevel.HIGH, BandLevel.VERY_HIGH, BandLevel.NOT_APPLICABLE, null])(
      'should render correct colors for band: %s',
      level => {
        const predictor = 'allReoffendingPredictor'
        const renderedHtml = getRenderedHtml(
          dom,
          'PREDICTOR_BADGE_ROOT',
          `predictor: "${predictor}"`,
          getRiskTestData([{ predictor, level, score: 12.34, staticOrDynamic: 'Static' }]),
        )
        validateBadge(renderedHtml, predictor, level, 12.34, 'Static', undefined, false)
      },
    )
  })

  const predictors = Object.keys(expectedPredictorNameMappings) as PredictorOption[]
  describe('should test predictor names', () => {
    it.each(predictors)('should render correct name for: %s', predictor => {
      const renderedHtml = getRenderedHtml(
        dom,
        'PREDICTOR_BADGE_ROOT',
        `predictor: "${predictor}"`,
        getRiskTestData([{ predictor, level: BandLevel.LOW, score: 12.34, staticOrDynamic: 'Static' }]),
      )
      const name = renderedHtml.document.querySelector('[data-test-id="nameAndBand"]')
      expect(name.innerHTML).toBe(`${expectedPredictorNameMappings[predictor].name} <strong>LOW</strong>`)
    })
  })

  it.each(getCombinations(inputCombinationsTemplateLogic))(
    'should render correct html/css - {predictor: $predictor, level: $level, score: $score, staticOrDynamic: $staticOrDynamic, showScore: $showScore, hideScoreAndStaticOrDynamic: $hideScoreAndStaticOrDynamic}',
    ({ predictor, level, score, staticOrDynamic, showScore, hideScoreAndStaticOrDynamic }) => {
      const renderedHtml = getRenderedHtml(
        dom,
        'PREDICTOR_BADGE_ROOT',
        `predictor: "${predictor}", showScore: ${showScore}, hideScoreAndStaticOrDynamic: ${hideScoreAndStaticOrDynamic}`,
        getRiskTestData([{ predictor, level, score, staticOrDynamic }]),
      )
      validateBadge(renderedHtml, predictor, level, score, staticOrDynamic, showScore, hideScoreAndStaticOrDynamic)
    },
  )

  describe('legacy fallback', () => {
    it.each(legacyFallbackTestCases)(
      'Legacy fallback, assessmentPredictor: %s, predictorInMacro: %s, predictorRendered: %s',
      (assessmentPredictor: PredictorOption, predictorInMacro: PredictorOption, predictorRendered: PredictorOption) => {
        const renderedHtml = getRenderedHtml(
          dom,
          'PREDICTOR_BADGE_ROOT',
          `predictor: "${predictorInMacro}", legacyFallback: true`,
          getRiskTestData([
            { predictor: assessmentPredictor, level: BandLevel.LOW, score: 12.34, staticOrDynamic: 'Static' },
          ]),
        )
        const name = renderedHtml.document.querySelector('[data-test-id="nameAndBand"]')
        if (predictorRendered) {
          expect(name.innerHTML).toBe(`${expectedPredictorNameMappings[predictorRendered].name} <strong>LOW</strong>`)
        } else {
          expect(name).toBeNull()
        }
      },
    )
  })
})

const validateBadge = (
  renderedHtml: DOMWindow,
  predictor: PredictorOption,
  band: BandLevel,
  score: number | undefined,
  staticOrDynamic: StaticOrDynamicContent,
  showScore: boolean | undefined,
  hideScoreAndStaticOrDynamic: boolean,
) => {
  const { document } = renderedHtml

  // Resolve 'shouldShowScore' logic (mirroring the .njk template)
  const config = (predictorConfig as any)[predictor]
  const expectedShouldShowScore = hideScoreAndStaticOrDynamic === true ? false : (showScore ?? config.showScore)

  // Resolve 'shouldShowStaticOrDynamic' logic (mirroring the .njk template)
  const expectedShouldShowStaticOrDynamic =
    expectedPredictorNameMappings[predictor].showStaticDynamic && !hideScoreAndStaticOrDynamic && staticOrDynamic

  // Resolve unknown band logic (mirroring the .njk template)
  const shouldBeUnkownBand = !band || (expectedShouldShowScore === true && !score)
  const properties = shouldBeUnkownBand ? nullBandMapping : expectedBandMappings[band]

  // Reconstruct the dynamic attribute used .njk template
  const displayBand = shouldBeUnkownBand ? 'UNKNOWN' : band?.replace('_', ' ')
  const predictorName = expectedPredictorNameMappings[predictor].name
  const badgeSelector = `[data-badge-base="${predictorName} ${displayBand}"]`

  const badgeContainer = document.querySelector(badgeSelector)
  if (!badgeContainer) {
    throw new Error(`Could not find badge with selector: ${badgeSelector}`)
  }

  // A badge is "default" visually if band is null/N.A. or explicitly 'UNKNOWN'
  const isDefaultBadge = band === BandLevel.NOT_APPLICABLE || displayBand === 'UNKNOWN' || shouldBeUnkownBand

  // Validate Main Container Styles
  expectStyleToBe(renderedHtml, badgeContainer, [
    { tag: 'display', value: 'inline-flex' },
    { tag: 'outline', value: `2px solid ${properties.borderColour}` },
  ])

  // Validate Name and Band (Scoped search using data-test-id)
  const nameAndBand = badgeContainer.querySelector('[data-test-id="nameAndBand"]')
  expectStyleToBe(
    renderedHtml,
    nameAndBand,
    [
      { tag: 'color', value: properties.typeAndLevelColour },
      { tag: 'backgroundColor', value: 'rgba(0, 0, 0, 0)' },
    ],
    `${expectedPredictorNameMappings[predictor].name} <strong>${displayBand}</strong>`,
  )

  // Validate Score (Scoped search using data-test-id)
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

  // Validate Static/Dynamic (Scoped search using data-test-id)
  const sdEl = badgeContainer.querySelector('[data-test-id="staticOrDynamic"]')
  if (expectedShouldShowStaticOrDynamic && !isDefaultBadge) {
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
    borderColour: '#cecece',
    typeAndLevelColour: 'rgb(11, 12, 12)',
    scoreBackgroundColour: null,
  },
}

const nullBandMapping: PredictorProperties = {
  borderColour: '#cecece',
  typeAndLevelColour: 'rgb(11, 12, 12)',
  scoreBackgroundColour: null,
}

type PredictorProperties = {
  borderColour: string
  typeAndLevelColour: string
  scoreBackgroundColour: string
}

interface badgeRootTestCase {
  predictor: PredictorOption
  level: BandLevel
  score: number
  staticOrDynamic: StaticOrDynamicContent
  showScore: boolean
  hideScoreAndStaticOrDynamic: boolean
}
