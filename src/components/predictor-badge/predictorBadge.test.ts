import { JSDOM } from 'jsdom'
import {
  getBadgeContainer,
  expectedPredictorNameMappings,
  expectElementMissing,
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

// Reuse same JSDOM object to improve performance
let dom: JSDOM = null

const inputCombinationsTemplateLogic: Record<keyof PredictorBadgeTestCase, any[]> = {
  predictor: ['allReoffendingPredictor'],
  level: [BandLevel.VERY_HIGH],
  score: ['12.34'],
  staticOrDynamic: ['Static'],
  showScore: [true, false, undefined],
}

interface PredictorBadgeTestCase {
  predictor: PredictorOption
  level: BandLevel
  score: number
  staticOrDynamic: StaticOrDynamicContent
  showScore: boolean
}

describe('predictor-badge', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  it.each(getCombinations(inputCombinationsTemplateLogic))(
    'should show score either from input or from config - {predictor: $predictor, level: $level, score: $score, staticOrDynamic: $staticOrDynamic, showScore: $showScore}',
    ({ predictor, level, score, staticOrDynamic, showScore }) => {
      const config = (predictorConfig as any)[predictor]
      const expectedShouldShowScore = showScore ?? config.showScore
      const { document } = getRenderedHtml(
        dom,
        'PREDICTOR_BADGE',
        `predictor: "${predictor}", showScore: ${showScore}`,
        getRiskTestData([{ predictor, level, score, staticOrDynamic }]),
      )

      const badgeContainer = getBadgeContainer(document, `[data-badge-base="All reoffending predictor VERY HIGH"]`)

      const scoreEl = badgeContainer.querySelector('[data-test-id="score"]')

      if (expectedShouldShowScore) {
        expect(scoreEl?.textContent.trim()).toBe(`${score}%`)
      } else {
        // Verifies the {% if shouldShowScore and badgeClass != ... %} logic
        expectElementMissing(badgeContainer, '[data-test-id="score"]')
      }
    },
  )

  describe('legacy fallback', () => {
    it.each(legacyFallbackTestCases)(
      'Legacy fallback, assessmentPredictor: %s, predictorInMacro: %s, predictorRendered: %s',
      (assessmentPredictor: PredictorOption, predictorInMacro: PredictorOption, predictorRendered: PredictorOption) => {
        const renderedHtml = getRenderedHtml(
          dom,
          'PREDICTOR_BADGE',
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
