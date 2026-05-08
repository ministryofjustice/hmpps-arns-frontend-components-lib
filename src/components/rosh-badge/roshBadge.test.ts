import { DOMWindow, JSDOM } from 'jsdom'
import {
  expectElementMissing,
  expectStyleToBe,
  getInitialDom,
  getRenderedHtml,
  roshAssessmentTestData,
} from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

// Reuse same JSDOM object to improve performance
let dom: JSDOM = null

describe('rosh-badge', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('should test band styles only', () => {
    it.each([BandLevel.LOW, BandLevel.MEDIUM, BandLevel.HIGH, BandLevel.VERY_HIGH, null])(
      'should render correct colors for band: %s',
      level => {
        const name = `Risk of serious harm`
        const renderedHtml = getRenderedHtml(dom, 'ROSH_BADGE', '', roshAssessmentTestData(level))

        validateBadge(renderedHtml, name, level, undefined, false)
      },
    )
  })
})

const validateBadge = (
  renderedHtml: DOMWindow,
  name: string,
  band: BandLevel,
  score: number | undefined,
  showScore: boolean | undefined,
) => {
  const { document } = renderedHtml

  // Resolve 'shouldShowScore' logic (mirroring the .njk template)
  const expectedShouldShowScore = showScore

  // Resolve unknown band logic (mirroring the .njk template)
  const shouldBeUnkownBand = !band || (expectedShouldShowScore === true && !score)
  const properties = shouldBeUnkownBand ? nullBandMapping : expectedBandMappings[band]

  // Reconstruct the dynamic attribute used .njk template
  const displayBand = shouldBeUnkownBand ? 'UNKNOWN' : band?.replace('_', ' ')
  const badgeSelector = `[data-badge-base="${name} ${displayBand}"]`

  const badgeContainer = document.querySelector(badgeSelector)
  if (!badgeContainer) {
    throw new Error(`Could not find badge with selector: ${badgeSelector}`)
  }

  // Validate Main Container Styles
  expectStyleToBe(renderedHtml, badgeContainer, [
    { tag: 'display', value: 'inline-flex' },
    { tag: 'outline', value: `2px solid ${properties.borderColour}` },
  ])

  // Validate Name and Band (Scoped search using data-test-id)
  const nameAndBand = badgeContainer.querySelector('[data-test-id="nameAndBand"]')
  expectStyleToBe(
    renderedHtml,
    nameAndBand,
    [
      { tag: 'color', value: properties.typeAndLevelColour },
      { tag: 'backgroundColor', value: 'rgba(0, 0, 0, 0)' },
    ],
    `${name} <strong>${displayBand}</strong>`,
  )

  expectElementMissing(badgeContainer, '[data-test-id="score"]')
  expectElementMissing(badgeContainer, '[data-test-id="staticOrDynamic"]')
}

const expectedBandMappings: Record<BandLevel, PredictorProperties> = {
  LOW: {
    borderColour: '#85994b',
    typeAndLevelColour: 'rgb(72, 91, 16)',
    scoreBackgroundColour: 'rgb(222, 233, 189)',
  },
  MEDIUM: {
    borderColour: '#f47738',
    typeAndLevelColour: 'rgb(163, 78, 0)',
    scoreBackgroundColour: 'rgb(249, 232, 189)',
  },
  HIGH: {
    borderColour: '#d4351c',
    typeAndLevelColour: 'rgb(148, 37, 20)',
    scoreBackgroundColour: 'rgb(246, 215, 210)',
  },
  VERY_HIGH: {
    borderColour: '#942514',
    typeAndLevelColour: 'rgb(113, 26, 13)',
    scoreBackgroundColour: 'rgb(255, 172, 159)',
  },
}

const nullBandMapping: PredictorProperties = {
  borderColour: '#cecece',
  typeAndLevelColour: 'rgb(11, 12, 12)',
  scoreBackgroundColour: null,
}

type PredictorProperties = {
  borderColour: string
  typeAndLevelColour: string
  scoreBackgroundColour: string
}
