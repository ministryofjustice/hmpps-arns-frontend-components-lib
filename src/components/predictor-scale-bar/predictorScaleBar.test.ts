import { JSDOM } from 'jsdom'
import {
  expectStyleToBe,
  getDomFromNjks,
  getInitialDom,
  getRiskTestData,
  PredictorOption,
} from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

describe('predictor-scale-bar', () => {
  let dom: JSDOM

  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('Scale Marker Styles across Risk Levels', () => {
    const levelTestCases = [
      {
        level: BandLevel.LOW,
        expectedClass: 'arns-scale-marker-wrapper--low',
        border: 'rgb(133, 153, 75)',
        background: 'rgb(222, 233, 189)',
        textColor: 'rgb(72, 91, 16)',
      },
      {
        level: BandLevel.MEDIUM,
        expectedClass: 'arns-scale-marker-wrapper--medium',
        border: 'rgb(244, 119, 56)',
        background: 'rgb(249, 232, 189)',
        textColor: 'rgb(163, 78, 0)',
      },
      {
        level: BandLevel.HIGH,
        expectedClass: 'arns-scale-marker-wrapper--high',
        border: 'rgb(212, 53, 28)',
        background: 'rgb(246, 215, 210)',
        textColor: 'rgb(148, 37, 20)',
      },
      {
        level: BandLevel.VERY_HIGH,
        expectedClass: 'arns-scale-marker-wrapper--very-high',
        border: 'rgb(148, 37, 20)',
        background: 'rgb(255, 172, 159)',
        textColor: 'rgb(113, 26, 13)',
      },
    ]

    it.each(levelTestCases)(
      'should render the correct marker style for $level',
      ({ level, expectedClass, border, background, textColor }) => {
        const predictorType: PredictorOption = 'allReoffendingPredictor'

        const riskData = getRiskTestData([
          {
            predictor: predictorType,
            level,
            score: 50,
            staticOrDynamic: 'Static',
          },
        ])

        const predictorObj = (riskData.assessments[0] as any)[predictorType]

        const renderedHtml = getDomFromNjks(
          dom,
          `{% from "predictor-scale-bar/macro.njk" import predictorScaleBar as macro %}
          {{ macro(predictor, key) }}`,
          {
            predictor: predictorObj,
            key: predictorType,
          },
        )

        const { document } = renderedHtml

        // Validate Marker Wrapper Class and border colors
        const markerWrapper = document.querySelector('[data-test-id="scaleMarkerPosition"]')
        expect(markerWrapper?.className).toContain('arns-scale-marker-wrapper')
        expect(markerWrapper?.className).toContain(expectedClass)
        const card = markerWrapper?.querySelector('[data-test-id="scaleMarkerCard"]')
        expectStyleToBe(renderedHtml, card, [
          { tag: 'borderTopColor', value: border },
          { tag: 'borderStyle', value: 'solid' },
          { tag: 'borderWidth', value: '2px' },
        ])

        // Validate Marker Card Content (Low, Medium, High, Very high)
        const formattedText = level.replace('_', ' ').toLowerCase()
        const expectedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1)
        const markerContent = document.querySelector('[data-test-id="scaleMarkerCardContent"]')
        expect(markerContent?.textContent?.trim()).toBe(expectedText)
        expectStyleToBe(renderedHtml, markerContent, [{ tag: 'color', value: textColor }])

        // Validate Score is present (Since showScore is true)
        const scoreLabel = document.querySelector('[data-test-id="scaleMarkerCardBottom"]')
        expect(scoreLabel?.textContent?.trim()).toBe('50%')
        expectStyleToBe(renderedHtml, scoreLabel, [{ tag: 'backgroundColor', value: background }])

        // Check the Card Pointer (Primary Colour)
        // The pointer is a triangle made with borders
        const pointer = document.querySelector('[data-test-id="scaleMarkerCardPointer"]')
        expectStyleToBe(renderedHtml, pointer, [{ tag: 'borderTopColor', value: border }])
      },
    )
  })

  describe('Bar Type Class Logic', () => {
    const barTypeCases = [
      { predictor: 'ogrs3', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
      { predictor: 'ovp', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
      { predictor: 'ogp', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
      { predictor: 'ospdc', expectedClass: 'arns-scale-bar--small arns-scale-bar--small-fourths' },
      { predictor: 'ospiic', expectedClass: 'arns-scale-bar--small' },
      { predictor: 'rsr', expectedClass: 'arns-scale-bar arns-scale-bar--thirds' },
      { predictor: 'allReoffendingPredictor', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
      { predictor: 'violentReoffendingPredictor', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
      { predictor: 'seriousViolentReoffendingPredictor', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
      { predictor: 'directContactSexualReoffendingPredictor', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
      {
        predictor: 'indirectImageContactSexualReoffendingPredictor',
        expectedClass: 'arns-scale-bar--small arns-scale-bar--small-sanctions',
      },
      { predictor: 'combinedSeriousReoffendingPredictor', expectedClass: 'arns-scale-bar arns-scale-bar--fourths' },
    ]

    it.each(barTypeCases)('should apply class $expectedClass for $predictor', ({ predictor, expectedClass }) => {
      const predictorType = predictor as PredictorOption
      const riskData = getRiskTestData([
        { predictor: predictorType, level: BandLevel.LOW, score: 5, staticOrDynamic: 'Static' },
      ])

      const predictorObj = (riskData.assessments[0] as any)[predictorType]

      const renderedHtml = getDomFromNjks(
        dom,
        `{% from "predictor-scale-bar/macro.njk" import predictorScaleBar as macro %}
       {{ macro(predictor, key) }}`,
        { predictor: predictorObj, key: predictorType },
      )

      const bar = renderedHtml.document.querySelector(`[data-test-id="${predictor}-scale"]`)
      expect(bar?.className).toBe(expectedClass)
    })
  })

  it('should hide the score and show "No Score" pointer when config.showScore is false', () => {
    const predictorType: PredictorOption = 'ospdc'
    const riskData = getRiskTestData([
      { predictor: predictorType, level: BandLevel.VERY_HIGH, score: 1.07, staticOrDynamic: 'Static' },
    ])
    const predictorObj = (riskData.assessments[0] as any)[predictorType]

    const renderedHtml = getDomFromNjks(
      dom,
      `{% from "predictor-scale-bar/macro.njk" import predictorScaleBar as macro %}
     {{ macro(predictor, key) }}`,
      { predictor: predictorObj, key: predictorType },
    )

    const { document } = renderedHtml

    // Should NOT find the score card bottom
    expect(document.querySelector('[data-test-id="scaleMarkerCardBottom"]')).toBeNull()
    // SHOULD find the white pointer
    const noScorePointer = document.querySelector('[data-test-id="scaleMarkerNoScore"]')
    expect(noScorePointer).not.toBeNull()
    expect(noScorePointer?.className).toContain('arns-scale-marker__card-pointer--white')
  })

  describe('Accessibility Striped Patterns', () => {
    it('should apply striped pattern to the MEDIUM band', () => {
      const predictorType: PredictorOption = 'allReoffendingPredictor'
      const riskData = getRiskTestData([
        { predictor: predictorType, level: BandLevel.MEDIUM, score: 50, staticOrDynamic: 'Static' },
      ])
      const predictorObj = (riskData.assessments[0] as any)[predictorType]

      const renderedHtml = getDomFromNjks(
        dom,
        `{% from "predictor-scale-bar/macro.njk" import predictorScaleBar as macro %}
        {{ macro(predictor, key) }}`,
        { predictor: predictorObj, key: predictorType },
      )

      const mediumBandSpan = renderedHtml.document.querySelector('[data-test-id="mediumBand"] span')
      expectStyleToBe(renderedHtml, mediumBandSpan, [{ tag: 'backgroundColor', value: 'rgb(244, 119, 56)' }])

      const computedStyle = renderedHtml.window.getComputedStyle(mediumBandSpan!)
      expect(computedStyle.backgroundImage).toContain('repeating-linear-gradient')
      expect(computedStyle.backgroundImage).toContain('rgba(255, 255, 255, 0.25)')
    })

    it('should apply striped pattern to the VERY HIGH band', () => {
      const predictorType: PredictorOption = 'allReoffendingPredictor'
      const riskData = getRiskTestData([
        { predictor: predictorType, level: BandLevel.VERY_HIGH, score: 95, staticOrDynamic: 'Static' },
      ])
      const predictorObj = (riskData.assessments[0] as any)[predictorType]

      const renderedHtml = getDomFromNjks(
        dom,
        `{% from "predictor-scale-bar/macro.njk" import predictorScaleBar as macro %}
        {{ macro(predictor, key) }}`,
        { predictor: predictorObj, key: predictorType },
      )

      const veryHighBandSpan = renderedHtml.document.querySelector('[data-test-id="veryHighBand"] span')
      expectStyleToBe(renderedHtml, veryHighBandSpan, [{ tag: 'backgroundColor', value: 'rgb(148, 37, 20)' }])

      const computedStyle = renderedHtml.window.getComputedStyle(veryHighBandSpan!)
      expect(computedStyle.backgroundImage).toContain('repeating-linear-gradient')
      expect(computedStyle.backgroundImage).toContain('rgba(0, 0, 0, 0.15)')
    })
  })
})
