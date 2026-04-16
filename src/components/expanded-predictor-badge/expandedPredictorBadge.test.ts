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
const inputCombinationsTemplateLogic: Record<keyof ExpandedPredictorBadgeTestCase, any[]> = {
  predictor: ['allReoffendingPredictor', 'directContactSexualReoffendingPredictor'],
  level: [BandLevel.MEDIUM, BandLevel.VERY_HIGH, BandLevel.NOT_APPLICABLE, null],
  score: ['12.34', undefined],
  staticOrDynamic: ['Static', 'Dynamic'],
  showScore: [true, false, undefined],
  fixedWidth: [true, false, undefined],
}

// Reuse same JSDOM object to improve performance
let dom: JSDOM = null

describe('expanded-predictor-badge', () => {
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
          'EXPANDED_PREDICTOR_BADGE',
          `predictor: "${predictor}"`,
          getRiskTestData([{ predictor, level, score: 12.34, staticOrDynamic: 'Static' }]),
        )
        validateBadge(renderedHtml, predictor, level, 12.34, 'Static', undefined, undefined)
      },
    )
  })

  const predictors = Object.keys(expectedPredictorNameMappings) as PredictorOption[]
  describe('should test predictor names', () => {
    it.each(predictors)('should render correct name for: %s', predictor => {
      const renderedHtml = getRenderedHtml(
        dom,
        'EXPANDED_PREDICTOR_BADGE',
        `predictor: "${predictor}"`,
        getRiskTestData([{ predictor, level: BandLevel.LOW, score: 12.34, staticOrDynamic: 'Static' }]),
      )
      const name = renderedHtml.document.querySelector('[data-test-id="name"]')
      expect(name.innerHTML).toBe(expectedPredictorNameMappings[predictor].name)
    })
  })

  it.each(getCombinations(inputCombinationsTemplateLogic))(
    'should render correct html/css template logic - {predictor: $predictor, level: $level, score: $score, staticOrDynamic: $staticOrDynamic, showScore: $showScore, fixedWidth: $fixedWidth}',
    ({ predictor, level, score, staticOrDynamic, showScore, fixedWidth }) => {
      const renderedHtml = getRenderedHtml(
        dom,
        'EXPANDED_PREDICTOR_BADGE',
        `predictor: "${predictor}", showScore: ${showScore}, fixedWidth: ${fixedWidth}`,
        getRiskTestData([{ predictor, level, score, staticOrDynamic }]),
      )
      validateBadge(renderedHtml, predictor, level, score, staticOrDynamic, showScore, fixedWidth)
    },
  )

  it('should render the component without lastUpdated', () => {
    const predictor: PredictorOption = 'rsr'
    const renderedHtml = getRenderedHtml(
      dom,
      'EXPANDED_PREDICTOR_BADGE',
      `predictor: "rsr", excludeDate: true`,
      getRiskTestData([{ predictor, level: BandLevel.HIGH, score: 50, staticOrDynamic: 'Dynamic' }]),
    )

    expect(renderedHtml.document.querySelector('[data-test-id="LastUpdatedDate"]')).toBeNull()
    expect(renderedHtml.document.querySelector('[data-test-id="badgeStats"]').className).toContain('arns-excluded-date')
  })

  describe('legacy fallback', () => {
    it.each(legacyFallbackTestCases)(
      'Legacy fallback, assessmentPredictor: %s, predictorInMacro: %s, predictorRendered: %s',
      (assessmentPredictor: PredictorOption, predictorInMacro: PredictorOption, predictorRendered: PredictorOption) => {
        const renderedHtml = getRenderedHtml(
          dom,
          'EXPANDED_PREDICTOR_BADGE',
          `predictor: "${predictorInMacro}", legacyFallback: true`,
          getRiskTestData([
            { predictor: assessmentPredictor, level: BandLevel.LOW, score: 12.34, staticOrDynamic: 'Static' },
          ]),
        )
        const name = renderedHtml.document.querySelector('[data-test-id="name"]')
        if (predictorRendered) {
          expect(name.innerHTML).toBe(expectedPredictorNameMappings[predictorRendered].name)
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
  fixedWidth: boolean | undefined,
) => {
  const { document } = renderedHtml

  // Resolve 'shouldShowScore' logic (mirroring the .njk template)
  const config = (predictorConfig as any)[predictor]
  const expectedShouldShowScore = showScore ?? config.showScore

  // Resolve unknown band logic (mirroring the .njk template)
  const shouldBeUnkownBand = !band || (expectedShouldShowScore === true && !score)
  const properties = shouldBeUnkownBand ? nullBandMapping : expectedBandMappings[band]

  // Reconstruct the dynamic attribute used .njk template
  const displayBand = shouldBeUnkownBand ? 'UNKNOWN' : band?.replace('_', ' ')
  const predictorName = expectedPredictorNameMappings[predictor].name
  const badgeSelector = `[data-expanded-predictor-badge="${predictorName} ${displayBand}"]`

  const badgeContainer = document.querySelector(badgeSelector)
  if (!badgeContainer) {
    throw new Error(`Could not find badge with selector: ${badgeSelector}`)
  }

  // A badge is "default" visually if band is null/N.A. or explicitly 'UNKNOWN'
  const isDefaultBadge = band === BandLevel.NOT_APPLICABLE || displayBand === 'UNKNOWN' || shouldBeUnkownBand

  // fixedWidth style logic
  const expectedWidth = fixedWidth === true || fixedWidth === undefined ? `259px` : `100%`

  // Validate Main Container Styles
  expectStyleToBe(renderedHtml, badgeContainer, [
    { tag: 'display', value: 'inline-flex' },
    { tag: 'outline', value: `2px solid ${properties.borderColour}` },
    { tag: 'width', value: `${expectedWidth}` },
  ])

  // Validate Name (Scoped search using data-test-id)
  const name = badgeContainer.querySelector('[data-test-id="name"]')
  expectStyleToBe(
    renderedHtml,
    name,
    [
      { tag: 'color', value: properties.typeColour },
      { tag: 'backgroundColor', value: 'rgba(0, 0, 0, 0)' },
    ],
    `${expectedPredictorNameMappings[predictor].name}`,
  )

  // Validate Band (Scoped search using data-test-id)
  const bandEl = badgeContainer.querySelector('[data-test-id="band"]')
  expectStyleToBe(
    renderedHtml,
    bandEl,
    [
      { tag: 'color', value: properties.levelColour },
      { tag: 'backgroundColor', value: 'rgba(0, 0, 0, 0)' },
    ],
    `${displayBand}`,
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

  const hasSDWrapperStyles =
    expectedShouldShowScore &&
    (band === BandLevel.VERY_HIGH || band === BandLevel.MEDIUM) &&
    staticOrDynamic === 'Dynamic'
  const displayCss = hasSDWrapperStyles ? 'inline-block' : 'inline'
  const marginTopCss = hasSDWrapperStyles ? '3px' : ''

  // Validate Static/Dynamic (Scoped search using data-test-id)
  const sdEl = badgeContainer.querySelector('[data-test-id="staticOrDynamic"]')
  if (expectedPredictorNameMappings[predictor].showStaticDynamic && staticOrDynamic && !isDefaultBadge) {
    expectStyleToBe(
      renderedHtml,
      sdEl,
      [
        { tag: 'color', value: 'rgb(40, 45, 48)' },
        { tag: 'backgroundColor', value: 'rgb(229, 230, 231)' },
        { tag: 'display', value: displayCss },
        { tag: 'marginTop', value: marginTopCss },
      ],
      staticOrDynamic,
    )
  } else {
    expectElementMissing(badgeContainer, '[data-test-id="staticOrDynamic"]')
  }

  // Validate completeDate (Scoped search using data-test-id)
  const completedDateEl = badgeContainer.querySelector('[data-test-id="completedDate"]')
  expectStyleToBe(
    renderedHtml,
    completedDateEl,
    [
      { tag: 'color', value: 'rgb(110, 119, 122)' },
      { tag: 'backgroundColor', value: 'rgba(0, 0, 0, 0)' },
    ],
    `Last updated: ${expectedPredictorNameMappings[predictor].completedDate}`,
  )
}

const expectedBandMappings: Record<BandLevel, PredictorProperties> = {
  LOW: {
    borderColour: '#85994b',
    typeColour: 'rgb(11, 12, 12)',
    levelColour: 'rgb(72, 91, 16)',
    scoreBackgroundColour: 'rgb(222, 233, 189)',
  },
  MEDIUM: {
    borderColour: '#f47738',
    typeColour: 'rgb(11, 12, 12)',
    levelColour: 'rgb(163, 78, 0)',
    scoreBackgroundColour: 'rgb(249, 232, 189)',
  },
  HIGH: {
    borderColour: '#d4351c',
    typeColour: 'rgb(11, 12, 12)',
    levelColour: 'rgb(148, 37, 20)',
    scoreBackgroundColour: 'rgb(246, 215, 210)',
  },
  VERY_HIGH: {
    borderColour: '#942514',
    typeColour: 'rgb(11, 12, 12)',
    levelColour: 'rgb(113, 26, 13)',
    scoreBackgroundColour: 'rgb(255, 172, 159)',
  },
  NOT_APPLICABLE: {
    borderColour: '#cecece',
    typeColour: 'rgb(11, 12, 12)',
    levelColour: 'rgb(11, 12, 12)',
    scoreBackgroundColour: null,
  },
}

const nullBandMapping: PredictorProperties = {
  borderColour: '#cecece',
  typeColour: 'rgb(11, 12, 12)',
  levelColour: 'rgb(11, 12, 12)',
  scoreBackgroundColour: null,
}

type PredictorProperties = {
  borderColour: string
  typeColour: string
  levelColour: string
  scoreBackgroundColour: string
}

interface ExpandedPredictorBadgeTestCase {
  predictor: PredictorOption
  level: BandLevel
  score: number
  staticOrDynamic: StaticOrDynamicContent
  showScore: boolean
  fixedWidth: boolean
}
