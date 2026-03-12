import { DOMWindow, JSDOM } from 'jsdom'
import { getInitialDom, getRenderedHtml, getRiskTestData } from '../test-utils/testEnvironmentHelper'
import { RiskData } from '../../types/RiskData'
import { AssessmentV1 } from '../../types/AssessmentV1'
import { AssessmentV2 } from '../../types/AssessmentV2'

let dom: JSDOM = null

describe('risk-predictor-scores-content', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('should test assessment source', () => {
    it('should render the correct assessment type and date', () => {
      const riskData = getRiskTestData(null)
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', null, riskData)
      validatePredictorScoresSource(renderedHtml, riskData)
    })
  })
})

export const validatePredictorScoresSource = (renderedHtml: DOMWindow, riskData: RiskData) => {
  const latestAssessment: AssessmentV1 | AssessmentV2 = riskData.assessments?.[0]

  const sourceTextElement = renderedHtml.document.querySelector('.govuk-inset-text')

  expect(sourceTextElement).not.toBeNull()

  const expectedText = `Source: ${latestAssessment.assessmentType} assessment, completed on ${latestAssessment.completedDate}`
  expect(sourceTextElement.textContent.trim()).toBe(expectedText)

  const scaleSelectorList = [
    renderedHtml.document.querySelector('[data-test-id="allReoffendingPredictor-scale"]'),
    renderedHtml.document.querySelector('[data-test-id="violentReoffendingPredictor-scale"]'),
    renderedHtml.document.querySelector('[data-test-id="seriousViolentReoffendingPredictor-scale"]'),
    renderedHtml.document.querySelector('[data-test-id="directContactSexualReoffendingPredictor-scale"]'),
    renderedHtml.document.querySelector('[data-test-id="indirectImageContactSexualReoffendingPredictor-scale"]'),
    renderedHtml.document.querySelector('[data-test-id="combinedSeriousReoffendingPredictor-scale"]'),
  ]

  scaleSelectorList.forEach(scaleSelector => {
    expect(scaleSelector).not.toBeNull()
  })

  const staticOrDynamicExpected = [
    renderedHtml.document.querySelector('[data-test-id="arp-staticOrDynamic"]'),
    renderedHtml.document.querySelector('[data-test-id="vrp-staticOrDynamic"]'),
    renderedHtml.document.querySelector('[data-test-id="csrp-staticOrDynamic"]'),
    renderedHtml.document.querySelector('[data-test-id="svrp-staticOrDynamic"]'),
  ]

  staticOrDynamicExpected.forEach(selector => {
    expect(selector).not.toBeNull()
  })

  const staticOrDynamicNull = [
    renderedHtml.document.querySelector('[data-test-id="dcsrp-staticOrDynamic"]'),
    renderedHtml.document.querySelector('[data-test-id="iicsrp-staticOrDynamic"]'),
  ]

  staticOrDynamicNull.forEach(selector => {
    expect(selector).toBeNull()
  })
}
