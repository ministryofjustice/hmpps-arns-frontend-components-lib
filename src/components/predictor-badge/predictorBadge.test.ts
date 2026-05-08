import { JSDOM } from 'jsdom'
import {
  expectedPredictorNameMappings,
  getInitialDom,
  getRenderedHtml,
  getRiskTestData,
  legacyFallbackTestCases,
  PredictorOption,
} from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

// Reuse same JSDOM object to improve performance
let dom: JSDOM = null

describe('predictor-badge', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

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
