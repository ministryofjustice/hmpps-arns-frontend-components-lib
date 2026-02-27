import { JSDOM } from 'jsdom'
import {
  expectedPredictorNameMappings,
  expectStyleToBe,
  getInitialDom,
  getRenderedHtml,
  getRiskTestData,
  PredictorOption,
} from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

describe('predictor-scale', () => {
  let dom: JSDOM

  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('should test predictor names and expect a scale bar to exist', () => {
    const predictors = Object.keys(expectedPredictorNameMappings) as PredictorOption[]
    it.each(predictors)('should render correct name for: %s', predictor => {
      const renderedHtml = getRenderedHtml(
        dom,
        'PREDICTOR_SCALE',
        `predictor: "${predictor}"`,
        getRiskTestData([{ predictor, level: BandLevel.LOW, score: 12.34, staticOrDynamic: 'Static' }]),
      )
      const { document } = renderedHtml
      // Validate Header Name
      expect(document.querySelector('[data-test-id="name"]')?.textContent).toBe(
        expectedPredictorNameMappings[predictor].name,
      )

      // assert scale bar exists
      expect(document.querySelector('[data-test-id="barType"]')).toBeDefined()
    })
  })

  it('should render only the Not Applicable message when band is NOT APPLICABLE', () => {
    const predictor: PredictorOption = 'rsr'
    const renderedHtml = getRenderedHtml(
      dom,
      'PREDICTOR_SCALE',
      `predictor: "rsr"`,
      getRiskTestData([{ predictor, level: BandLevel.NOT_APPLICABLE, score: 0, staticOrDynamic: 'Static' }]),
    )

    const { document } = renderedHtml

    expect(document.querySelector('[data-test-id="notApplicable"]')?.innerHTML).toBe('Not applicable')

    // Ensure standard scale elements are HIDDEN
    expect(document.querySelector('[data-test-id="scaleMarker"]')).toBeNull()
    expect(document.querySelector('[data-test-id="barType"]')).toBeNull()
  })

  it('should render the border box, staticOrDynamic and lastUpdated content and styles', () => {
    const predictor: PredictorOption = 'rsr'
    const renderedHtml = getRenderedHtml(
      dom,
      'PREDICTOR_SCALE',
      `predictor: "rsr"`,
      getRiskTestData([{ predictor, level: BandLevel.HIGH, score: 50, staticOrDynamic: 'Dynamic' }]),
    )

    // border box
    const container = renderedHtml.document.querySelector('[data-predictor-scale="RSR"]')
    expectStyleToBe(renderedHtml, container, [{ tag: 'borderTopColor', value: 'rgb(177, 180, 182)' }])

    // govuk design system components
    const sdEl = renderedHtml.document.querySelector('[data-test-id="staticOrDynamic"]')
    expect(sdEl?.innerHTML).toContain('govuk-tag--grey')
    expect(sdEl?.textContent?.trim()).toBe('Dynamic')
    const lastUpdatedEl = renderedHtml.document.querySelector('[data-test-id="LastUpdatedDate"]')
    expect(lastUpdatedEl?.className).toContain('govuk-hint')
    expect(lastUpdatedEl?.textContent?.trim()).toBe('Last updated: 02 January 2024')
  })
})
