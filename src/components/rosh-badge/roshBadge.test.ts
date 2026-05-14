import { JSDOM } from 'jsdom'
import { getInitialDom, getRenderedHtml, roshAssessmentTestData } from '../test-utils/testEnvironmentHelper'
import { BandLevel } from '../../types/dtos/BandLevel'

// Reuse same JSDOM object to improve performance
let dom: JSDOM = null

describe('rosh-badge', () => {
  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('should test name and band', () => {
    it.each([BandLevel.LOW, BandLevel.MEDIUM, BandLevel.HIGH, BandLevel.VERY_HIGH, null])(
      'should render correct name and band: %s',
      level => {
        const name = `Risk of serious harm`
        const { document } = getRenderedHtml(dom, 'ROSH_BADGE', '', roshAssessmentTestData(level))
        const displayBand = !level ? 'UNKNOWN' : level?.replace('_', ' ')
        const badgeSelector = `[data-badge-base="${name} ${displayBand}"]`
        const badgeContainer = document.querySelector(badgeSelector)

        if (!badgeContainer) {
          throw new Error(`Could not find badge with selector: ${badgeSelector}`)
        }

        const nameAndBand = badgeContainer.querySelector('[data-test-id="nameAndBand"]')

        expect(nameAndBand?.textContent.trim()).toBe(`${name} ${displayBand}`)
      },
    )
  })
})
