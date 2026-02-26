import { DOMWindow, JSDOM } from 'jsdom'
import { getInitialDom, getRenderedHtml, getRiskTestData } from '../test-utils/testEnvironmentHelper'
import { RiskData } from '../../types/RiskData'
import { AssessmentV1 } from '../../types/AssessmentV1'
import { AssessmentV2 } from '../../types/AssessmentV2'

let dom: JSDOM = null

describe('predictor-scores-accordion', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('should test assessment source', () => {
    it('should render the correct assessment type and date', () => {
      const riskData = getRiskTestData(null)
      const renderedHtml = getRenderedHtml(dom, 'PREDICTOR_SCORES_ACCORDION', null, riskData)
      validatePredictorScoresAccordionSource(renderedHtml, riskData)
    })
  })
})

export const validatePredictorScoresAccordionSource = (renderedHtml: DOMWindow, riskData: RiskData) => {
  const latestAssessment: AssessmentV1 | AssessmentV2 = riskData.assessments?.[0]

  const sourceTextElement = renderedHtml.document.querySelector('.govuk-inset-text')

  expect(sourceTextElement).not.toBeNull()

  const expectedText = `Source: ${latestAssessment.assessmentType} assessment, completed on ${latestAssessment.completedDate}`
  expect(sourceTextElement.textContent.trim()).toBe(expectedText)
}
