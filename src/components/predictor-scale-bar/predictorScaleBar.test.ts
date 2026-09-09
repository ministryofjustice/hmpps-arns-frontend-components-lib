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
        score: 42.13,
        expectedPointerPosition: 21,
      },
      {
        level: BandLevel.MEDIUM,
        expectedClass: 'arns-scale-marker-wrapper--medium',
        border: 'rgb(244, 119, 56)',
        background: 'rgb(249, 232, 189)',
        textColor: 'rgb(163, 78, 0)',
        score: 52.89,
        expectedPointerPosition: 28,
      },
      {
        level: BandLevel.HIGH,
        expectedClass: 'arns-scale-marker-wrapper--high',
        border: 'rgb(212, 53, 28)',
        background: 'rgb(246, 215, 210)',
        textColor: 'rgb(148, 37, 20)',
        score: 78,
        expectedPointerPosition: 55,
      },
      {
        level: BandLevel.VERY_HIGH,
        expectedClass: 'arns-scale-marker-wrapper--very-high',
        border: 'rgb(148, 37, 20)',
        background: 'rgb(255, 172, 159)',
        textColor: 'rgb(113, 26, 13)',
        score: 92.56,
        expectedPointerPosition: 81,
      },
    ]

    it.each(levelTestCases)(
      'should render the correct marker style for $level',
      ({ level, expectedClass, border, background, textColor, score, expectedPointerPosition }) => {
        const predictorType: PredictorOption = 'allReoffendingPredictor'

        const riskData = getRiskTestData([
          {
            predictor: predictorType,
            level,
            score,
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
        const card = markerWrapper?.querySelector('[data-test-id="scaleMarkerCard"]') || null
        expectStyleToBe(renderedHtml, card, [
          { tag: 'borderTopColor', value: border },
          { tag: 'borderStyle', value: 'solid' },
          { tag: 'borderWidth', value: '2px' },
        ])

        // Check the left styling is correct to move pointer to the correct position
        expect(markerWrapper?.className).toContain(`arns-scale-marker-wrapper-position-${expectedPointerPosition}`)
        expectStyleToBe(renderedHtml, markerWrapper, [
          { tag: 'left', value: `calc(-40px + 0.${expectedPointerPosition} * (100% - 1px))` },
        ])

        // Validate Marker Card Content (Low, Medium, High, Very high)
        const formattedText = level.replace('_', ' ').toLowerCase()
        const expectedText = formattedText.charAt(0).toUpperCase() + formattedText.slice(1)
        const markerContent = document.querySelector('[data-test-id="scaleMarkerCardContent"]')
        expect(markerContent?.textContent?.trim()).toBe(expectedText)
        expectStyleToBe(renderedHtml, markerContent, [{ tag: 'color', value: textColor }])

        // Validate Score is present (Since showScore is true)
        const scoreLabel = document.querySelector('[data-test-id="scaleMarkerCardBottom"]')
        expect(scoreLabel?.textContent?.trim()).toBe(`${score}%`)
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
      {
        predictor: 'ogrs3',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the OGRS score is 5%. This is in the LOW band. Below 50% is low, 50% to below 75% is medium, 75% to below 90% is high, 90% to 100% is very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'ovp',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the OVP score is 5%. This is in the LOW band. Below 30% is low, 30% to below 60% is medium, 60% to below 80% is high, 80% to 100% is very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'ogp',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the OGP score is 5%. This is in the LOW band. Below 34% is low, 34% to below 67% is medium, 67% to below 85% is high, 85% to 100% is very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'ospdc',
        expectedClass: 'arns-scale-bar--small arns-scale-bar--small-fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the OSP–DC in the LOW band. There are four bands, low, medium, high, very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'ospiic',
        expectedClass: 'arns-scale-bar--small',
        expectedAriaLabel:
          'A linear gauge chart showing the OSP–IIC in the LOW band. There are three bands, low, medium, high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'rsr',
        expectedClass: 'arns-scale-bar arns-scale-bar--thirds',
        expectedAriaLabel:
          'A linear gauge chart showing the RSR score is 5%. This is in the LOW band. Below 3% is low, 3% to below 6.9% is medium, 6.9% to 25%+ is high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'allReoffendingPredictor',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the All reoffending predictor score is 5%. This is in the LOW band. Below 50% is low, 50% to below 75% is medium, 75% to below 90% is high, 90% to 100% is very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'violentReoffendingPredictor',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the Violent reoffending predictor score is 5%. This is in the LOW band. Below 30% is low, 30% to below 60% is medium, 60% to below 80% is high, 80% to 100% is very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'seriousViolentReoffendingPredictor',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the Serious violent reoffending predictor score is 5%. This is in the LOW band. Below 1% is low, 1% to below 3% is medium, 3% to below 6.9% is high, 6.9% to 25%+ is very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'directContactSexualReoffendingPredictor',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the Direct contact – sexual reoffending predictor score is 5%. This is in the LOW band. Below 0.6% is low, 0.6% to below 2.1% is medium, 2.1% to below 5.3% is high, 5.3% to 83.1% is very high. This was last updated 02 January 2024.',
      },
      {
        predictor: 'indirectImageContactSexualReoffendingPredictor',
        expectedClass: 'arns-scale-bar--small arns-scale-bar--small-sanctions',
        expectedAriaLabel:
          'A linear gauge chart showing the Images and indirect contact – sexual reoffending predictor in the LOW band. There are three bands, low when zero sanctions, medium when one sanction, high when two or more sanctions. This was last updated 02 January 2024.',
      },
      {
        predictor: 'combinedSeriousReoffendingPredictor',
        expectedClass: 'arns-scale-bar arns-scale-bar--fourths',
        expectedAriaLabel:
          'A linear gauge chart showing the Combined serious reoffending predictor score is 5%. This is in the LOW band. Below 1% is low, 1% to below 3% is medium, 3% to below 6.9% is high, 6.9% to 25%+ is very high. This was last updated 02 January 2024.',
      },
    ]

    it.each(barTypeCases)(
      'should apply class $expectedClass for $predictor',
      ({ predictor, expectedClass, expectedAriaLabel }) => {
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

        const ariaLabel = renderedHtml.document.querySelector(`[data-test-id="scaleBarContainer"]`)
        expect(ariaLabel?.ariaLabel).toBe(expectedAriaLabel)
      },
    )
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
      expect(computedStyle.backgroundImage).toContain('rgb(243, 202, 185)')
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
      expect(computedStyle.backgroundImage).toContain('rgb(195, 144, 136)')
    })
  })
})
