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
    const dynamicFactorsStatement = 'This score has been calculated using both dynamic and static factors.'

    it('should render static or dyanamic factors statement for All reoffending predictor', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.allReoffendingPredictor.staticOrDynamic = 'STATIC'
      let renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="arp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(staticFactorsStatement)
      firstAssessment.allReoffendingPredictor.staticOrDynamic = 'DYNAMIC'
      renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="arp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(dynamicFactorsStatement)
    })

    it('should render static or dyanamic factors statement for Violent reoffending predictor', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.violentReoffendingPredictor.staticOrDynamic = 'STATIC'
      let renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="vrp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(staticFactorsStatement)
      firstAssessment.violentReoffendingPredictor.staticOrDynamic = 'DYNAMIC'
      renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="vrp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(dynamicFactorsStatement)
    })

    it('should render static or dyanamic factors statement for Serious violent reoffending predictor', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.seriousViolentReoffendingPredictor.staticOrDynamic = 'STATIC'
      let renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="svrp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(staticFactorsStatement)
      firstAssessment.seriousViolentReoffendingPredictor.staticOrDynamic = 'DYNAMIC'
      renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="svrp-static-or-dynamic-factors"]').textContent.trim(),
      ).toBe(dynamicFactorsStatement)
    })
  })

  describe('should render dynamic content for Serious violent reoffending predictor details section', () => {
    it('should render "why this score is the same as..." content when there is no sexual reoffending history', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.directContactSexualReoffendingPredictor.band = 'NOT APPLICABLE'
      firstAssessment.indirectImageContactSexualReoffendingPredictor.band = 'NOT APPLICABLE'
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(
        renderedHtml.document.querySelector('[data-test-id="svrp-no-sexual-history-header"]').textContent.trim(),
      ).toBe('Why this score is the same as Combined serious reoffending predictor')
    })

    it('should not render "why this score is the same as..." content when there is sexual reoffending history', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="svrp-no-sexual-history-header"]')).toBeNull()
    })
  })

  describe('should render dynamic content for Direct contact - Sexual reoffending predictor section', () => {
    it('should render appropriate content when there is no direct contact - Sexual reoffending history', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.directContactSexualReoffendingPredictor.band = 'NOT APPLICABLE'
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="dcsrp-not-applicable"]')).not.toBeNull()
      expect(renderedHtml.document.querySelector('[data-test-id="dcsrp-probability-statement"]')).toBeNull()
      expect(
        renderedHtml.document.querySelector('[data-test-id="directContactSexualReoffendingPredictor-scale"]'),
      ).toBeNull()
    })

    it('should render appropriate content when there is direct contact - Sexual reoffending history', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="dcsrp-not-applicable"]')).toBeNull()
      expect(renderedHtml.document.querySelector('[data-test-id="dcsrp-probability-statement"]')).not.toBeNull()
      expect(
        renderedHtml.document.querySelector('[data-test-id="directContactSexualReoffendingPredictor-scale"]'),
      ).not.toBeNull()
    })
  })

  describe('should render dynamic content for Image and indirect contact - Sexual reoffending predictor section', () => {
    it('should render appropriate content when there is no Image and indirect contact - Sexual reoffending history', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2
      firstAssessment.indirectImageContactSexualReoffendingPredictor.band = 'NOT APPLICABLE'
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-not-applicable"]')).not.toBeNull()
      expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-intro-statement"]')).toBeNull()
      expect(
        renderedHtml.document.querySelector('[data-test-id="indirectImageContactSexualReoffendingPredictor-scale"]'),
      ).toBeNull()
    })

    it('should render appropriate content when there is Image and indirect contact - Sexual reoffending history', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-not-applicable"]')).toBeNull()
      expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-intro-statement"]')).not.toBeNull()
      expect(
        renderedHtml.document.querySelector('[data-test-id="indirectImageContactSexualReoffendingPredictor-scale"]'),
      ).not.toBeNull()
    })

    it('should render intro statement with correct amount of sanctions when there is Image and indirect contact - Sexual reoffending history', () => {
      const riskData = getRiskTestData(null)
      const forename = 'Alex'
      const firstAssessment = riskData.assessments?.[0] as AssessmentV2

      firstAssessment.indirectImageContactSexualReoffendingPredictor.band = 'LOW'
      let renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-intro-statement"]').textContent).toContain(
        'This is because they have 0 previous relevant sanctions.',
      )

      firstAssessment.indirectImageContactSexualReoffendingPredictor.band = 'MEDIUM'
      renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-intro-statement"]').textContent).toContain(
        'This is because they have 1 previous relevant sanctions.',
      )

      firstAssessment.indirectImageContactSexualReoffendingPredictor.band = 'HIGH'
      renderedHtml = getRenderedHtml(dom, 'RISK_PREDICTOR_SCORES_CONTENT', `forename: '${forename}'`, riskData)
      expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-intro-statement"]').textContent).toContain(
        'This is because they have more than 2 previous relevant sanctions.',
      )
    })
  })
})

export const validatePage = (renderedHtml: DOMWindow, riskData: RiskData, forename: string) => {
  const latestAssessment: AssessmentV2 = riskData.assessments?.[0] as AssessmentV2

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

  const expectedSvrpProbabilityStatement = `About [X] in [Y] people (${latestAssessment.seriousViolentReoffendingPredictor.score}%) with a similar profile to ${forename} will get a sanction for a
      serious violent offence they commit within two years. This puts ${forename} in the ${latestAssessment.seriousViolentReoffendingPredictor.band.toLowerCase()} risk band.`
  expect(renderedHtml.document.querySelector('[data-test-id="svrp-probability-statement"]').textContent.trim()).toBe(
    expectedSvrpProbabilityStatement,
  )

  const expectedDcsrpProbabilityStatement = `About [X] in [Y] people (${latestAssessment.directContactSexualReoffendingPredictor.score}%) with a similar profile to ${forename} will get a sanction for a
        direct contact sexual offence they commit within two years. This puts ${forename} in the ${latestAssessment.directContactSexualReoffendingPredictor.band.toLowerCase()} risk band.`
  expect(renderedHtml.document.querySelector('[data-test-id="dcsrp-probability-statement"]').textContent.trim()).toBe(
    expectedDcsrpProbabilityStatement,
  )

  const expectedIicsrpIntroStatement = `${forename} is in the ${latestAssessment.indirectImageContactSexualReoffendingPredictor.band.toLowerCase()} risk category for getting a sanction for an indirect sexual contact
        offence they commit within two years. This is because they have more than 2 previous relevant sanctions.`
  expect(renderedHtml.document.querySelector('[data-test-id="iicsrp-intro-statement"]').textContent.trim()).toBe(
    expectedIicsrpIntroStatement,
  )
}
