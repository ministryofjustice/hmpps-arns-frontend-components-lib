import { DOMWindow, JSDOM } from 'jsdom'
import {
  expectedPredictorNameMappings,
  expectElementMissing,
  expectStyleToBe,
  getBadgeContainer,
  getCombinations,
  getDomFromNjks,
  getInitialDom,
  getRiskTestData,
  PredictorOption,
  StaticOrDynamicContent,
} from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

// allReoffendingPredictor, directContactSexualReoffendingPredictor showScore from config
const inputCombinationsTemplateLogic: Record<keyof BadgeBaseTestCase, any[]> = {
  predictor: ['allReoffendingPredictor', 'directContactSexualReoffendingPredictor'],
  level: [BandLevel.VERY_HIGH, BandLevel.NOT_APPLICABLE, null],
  score: ['12.34', undefined],
  staticOrDynamic: ['Static', 'Dynamic'],
  showScore: [true, false],
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

        const riskData = getRiskTestData([{ predictor, level, score: 12.34, staticOrDynamic: 'Static' }])

        const assessment = riskData.assessments[0]
        const predictorObj = (assessment as any)[predictor]

        const renderedHtml = getDomFromNjks(
          dom,
          `{% from "badge-base/macro.njk" import badgeBase as macro %}
                {{ macro(name, band, score, staticOrDynamic, shouldShowScore) }}`,
          {
            name: predictorObj.name,
            band: predictorObj.band,
            score: predictorObj.score,
            staticOrDynamic: predictorObj.staticOrDynamic,
            shouldShowScore: false,
          },
        )

        validateBadge(renderedHtml, predictor, level, 12.34, 'Static', false)
      },
    )
  })

  const predictors = Object.keys(expectedPredictorNameMappings) as PredictorOption[]
  describe('should test predictor names', () => {
    it.each(predictors)('should render correct name for: %s', predictor => {
      const riskData = getRiskTestData([{ predictor, level: BandLevel.LOW, score: 12.34, staticOrDynamic: 'Static' }])

      const assessment = riskData.assessments[0]
      const predictorObj = (assessment as any)[predictor]

      const renderedHtml = getDomFromNjks(
        dom,
        `{% from "badge-base/macro.njk" import badgeBase as macro %}
                {{ macro(name, band, score, staticOrDynamic, shouldShowScore) }}`,
        {
          name: predictorObj.name,
          band: predictorObj.band,
          score: predictorObj.score,
          staticOrDynamic: predictorObj.staticOrDynamic,
          shouldShowScore: false,
        },
      )

      const name = renderedHtml.document.querySelector('[data-test-id="nameAndBand"]')
      expect(name.innerHTML).toBe(`${expectedPredictorNameMappings[predictor].name} <strong>LOW</strong>`)
    })
  })

  it.each(getCombinations(inputCombinationsTemplateLogic))(
    'should render correct html/css - {predictor: $predictor, band: $level, score: $score, staticOrDynamic: $staticOrDynamic, showScore: $showScore}',
    ({ predictor, level, score, staticOrDynamic, showScore }) => {
      const riskData = getRiskTestData([{ predictor, level, score, staticOrDynamic }])
      const assessment = riskData.assessments[0]
      const predictorObj = (assessment as any)[predictor]

      const renderedHtml = getDomFromNjks(
        dom,
        `{% from "badge-base/macro.njk" import badgeBase as macro %}
                {{ macro(name, band, score, staticOrDynamic, shouldShowScore) }}`,
        {
          name: predictorObj.name,
          band: predictorObj.band,
          score: predictorObj.score,
          staticOrDynamic: predictorObj.staticOrDynamic,
          shouldShowScore: showScore,
        },
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
  // Resolve unknown band logic (mirroring the .njk template)
  const shouldBeUnkownBand = !band || (showScore && !score)
  const properties = shouldBeUnkownBand ? nullBandMapping : expectedBandMappings[band]

  // Reconstruct the dynamic attribute used .njk template
  const displayBand = shouldBeUnkownBand ? 'UNKNOWN' : band?.replace('_', ' ')
  const predictorName = expectedPredictorNameMappings[predictor].name
  const badgeContainer = getBadgeContainer(document, `[data-badge-base="${predictorName} ${displayBand}"]`)

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
    `${predictorName} ${displayBand}`,
  )

  // Validate Score (Scoped search using data-test-id)
  const scoreEl = badgeContainer.querySelector('[data-test-id="score"]')
  if (showScore && !isDefaultBadge) {
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
  if (expectedPredictorNameMappings[predictor].showStaticDynamic && staticOrDynamic && !isDefaultBadge) {
    expectStyleToBe(
      renderedHtml,
      sdEl,
      [
        { tag: 'color', value: 'rgb(40, 45, 48)' },
        { tag: 'backgroundColor', value: 'rgb(206, 206, 206)' },
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

interface BadgeBaseTestCase {
  predictor: PredictorOption
  level: BandLevel
  score: number
  staticOrDynamic: StaticOrDynamicContent
  showScore: boolean
}
