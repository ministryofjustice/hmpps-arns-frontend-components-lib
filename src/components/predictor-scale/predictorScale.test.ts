import { JSDOM } from 'jsdom'
import {
  expectedPredictorNameMappings,
  expectStyleToBe,
  getInitialDom,
  getRenderedHtml,
  getRiskTestData,
  PredictorOption,
  RiskTestDataOptions,
  StaticOrDynamicContent,
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
      expect(document.querySelector(`[data-test-id="${predictor}-scale"]`)).not.toBeNull()
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

    expect(document.querySelector('[data-test-id="notApplicableSummary"]')?.innerHTML).toBe(
      'We only calculate sexual reoffending predictor scores for men with a known history of sexual or sexually motivated offending. This individual does not have a score for this predictor.',
    )

    // Ensure standard scale elements are HIDDEN
    expect(document.querySelector('[data-test-id="scaleMarker"]')).toBeNull()
    expect(document.querySelector('[data-test-id="barType"]')).toBeNull()
  })

  const unknownScenarios: RiskTestDataOptions[] = [
    {
      predictor: 'rsr',
      level: null,
      score: 0,
    },
    {
      predictor: 'rsr',
      level: undefined,
      score: 0,
    },
    {
      predictor: 'rsr',
      level: BandLevel.LOW,
      score: null,
    },
    {
      predictor: 'rsr',
      level: BandLevel.LOW,
      score: undefined,
    },
  ]

  it.each(unknownScenarios)(
    'should render only the Unknown message when either the band or score is missing',
    ({ predictor, level, score }) => {
      const renderedHtml = getRenderedHtml(
        dom,
        'PREDICTOR_SCALE',
        `predictor: "${predictor}"`,
        getRiskTestData([
          {
            predictor,
            level,
            score,
            staticOrDynamic: 'Static',
          },
        ]),
      )

      const { document } = renderedHtml

      expect(document.querySelector('[data-test-id="unknownSummary"]')?.innerHTML).toBe(
        'The score cannot be calculated due to missing information (e.g. no assessment, completed, or required data not present).',
      )

      // Ensure standard scale elements are HIDDEN
      expect(document.querySelector('[data-test-id="scaleMarker"]')).toBeNull()
      expect(document.querySelector('[data-test-id="barType"]')).toBeNull()
    },
  )

  const missingStaticOrDynamicScenarios: StaticOrDynamicContent[] = [null, undefined]

  it.each(missingStaticOrDynamicScenarios)(
    'should render scale excluding staticOrDynamic when staticOrDynamic is missing',
    staticOrDynamic => {
      const predictor: PredictorOption = 'ogrs3'
      const renderedHtml = getRenderedHtml(
        dom,
        'PREDICTOR_SCALE',
        `predictor: "ogrs3"`,
        getRiskTestData([
          {
            predictor,
            level: BandLevel.LOW,
            score: 0,
            staticOrDynamic,
          },
        ]),
      )

      const { document } = renderedHtml

      // Validate Header Name
      expect(document.querySelector('[data-test-id="name"]')?.textContent).toBe(
        expectedPredictorNameMappings[predictor].name,
      )

      // assert scale bar exists
      expect(document.querySelector('[data-test-id="ogrs3-scale"]')).not.toBeNull()

      // assert static or dynamic is excluded
      expect(document.querySelector('[data-test-id="staticOrDynamic"]')).toBeNull()
    },
  )

  const missingCompletedDateScenarios: string[] = [null, undefined, '']

  it.each(missingCompletedDateScenarios)(
    'should render scale with unknown last updated date when completedDate is missing',
    completedDate => {
      const predictor: PredictorOption = 'ogrs3'
      const renderedHtml = getRenderedHtml(
        dom,
        'PREDICTOR_SCALE',
        `predictor: "ogrs3"`,
        getRiskTestData([
          {
            predictor,
            level: BandLevel.LOW,
            score: 0,
            staticOrDynamic: 'Static',
            completedDate,
            allowFalseyCompletedDate: true,
          },
        ]),
      )

      const { document } = renderedHtml

      // Validate Header Name
      expect(document.querySelector('[data-test-id="name"]')?.textContent).toBe(
        expectedPredictorNameMappings[predictor].name,
      )

      // assert scale bar exists
      expect(document.querySelector('[data-test-id="ogrs3-scale"]')).not.toBeNull()

      // assert last updated date is unknown
      expect(document.querySelector('[data-test-id="LastUpdatedDate"]')?.textContent).toBe('Last updated: unknown')
    },
  )

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
