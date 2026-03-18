import { DOMWindow, JSDOM } from 'jsdom'
import { getInitialDom, getRenderedHtml, getRiskTestData } from '../test-utils/testEnvironmentHelper'
import { RiskData } from '../../types/RiskData'
import { AssessmentV2 } from '../../types/AssessmentV2'

let dom: JSDOM = null

describe('risk-predictor-scores-content', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('should render page correctly', () => {
    it('should render the correct assessment source & predictor sections', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      validatePage(renderedHtml, riskData, forename)
    })
  })

  describe('should render static or dynamic factors statement within predictor details sections', () => {
    const staticFactorsStatement = 'This score has been calculated using static factors only.'
    const dynamicFactorsStatement = 'This score has been calculated using static factors only.'

    it('should render static or dyanamic factors statement for all reoffending predictor', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.allReoffendingPredictor.band = 'STATIC'
      let renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="arp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(staticFactorsStatement)
      firstAssessment.allReoffendingPredictor.band = 'DYNAMIC'
      renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="arp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(dynamicFactorsStatement)
    })

    it('should render static or dyanamic factors statement for violent reoffending predictor', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.violentReoffendingPredictor.band = 'STATIC'
      let renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="vrp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(staticFactorsStatement)
      firstAssessment.violentReoffendingPredictor.band = 'DYNAMIC'
      renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="vrp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(dynamicFactorsStatement)
    })
  })
})

export const validatePage = (renderedHtml: DOMWindow, riskData: RiskData, forename: string) => {
  const latestAssessment: AssessmentV2 = riskData.assessments?.[0] as AssessmentV2

  const introTestElement = renderedHtml.document.querySelector('[data-test-id="predictor-intro"]')
  expect(introTestElement.textContent.trim()).toContain(
    'We have developed and validated these risk predictors using real historical data about how often people who have been on probation get further sanctions.',
  )

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

  const expectedArpProbabilityStatement = `About [X] in [Y] people (${latestAssessment.allReoffendingPredictor.score}%) with a similar profile to ${forename} will get a sanction for an
      offence they commit within two years. This puts ${forename} in the ${latestAssessment.allReoffendingPredictor.band.toLowerCase()} risk band.`
  expect(renderedHtml.document.querySelector('[data-test-id="arp-probability-statement"]').textContent.trim()).toBe(
    expectedArpProbabilityStatement,
  )

  const expectedVrpProbabilityStatement = `About [X] in [Y] people (${latestAssessment.violentReoffendingPredictor.score}%) with a similar profile to ${forename} will get a sanction for a
      violent offence they commit within two years. This puts ${forename} in the ${latestAssessment.violentReoffendingPredictor.band.toLowerCase()} risk band.`
  expect(renderedHtml.document.querySelector('[data-test-id="vrp-probability-statement"]').textContent.trim()).toBe(
    expectedVrpProbabilityStatement,
  )

  const expectedCsrpProbabilityStatement = `About [X] in [Y] people (${latestAssessment.combinedSeriousReoffendingPredictor.score}%) with a similar profile to ${forename} will get a sanction for a
      seriously harmful offence they commit within two years. This puts ${forename} in the ${latestAssessment.combinedSeriousReoffendingPredictor.band.toLowerCase()} risk band.`
  expect(renderedHtml.document.querySelector('[data-test-id="csrp-probability-statement"]').textContent.trim()).toBe(
    expectedCsrpProbabilityStatement,
  )
}
