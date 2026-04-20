import { JSDOM } from 'jsdom'
import { expectStyleToBe, getInitialDom, getRenderedHtml, getRiskTestData } from '../test-utils/testEnvironmentHelper'

describe('predictor-timeline', () => {
  let dom: JSDOM

  beforeEach(() => {
    dom = getInitialDom()
  })

  describe('Section IDs and accessibility', () => {
    it('should correctly link the "Open All" button to every assessment section via aria-controls', () => {
      const riskData = getRiskTestData([])
      const renderHtml = getRenderedHtml(dom, 'PREDICTOR_TIMELINE', '', riskData)

      const toggleAllBtn = renderHtml.document.getElementById('predictor-timeline__toggle-all')
      const ariaControls = toggleAllBtn.getAttribute('aria-controls').split(' ')

      expect(ariaControls.length).toBe(riskData.assessments.length)

      riskData.assessments.forEach(assessment => {
        const expectedId = `predictor-section-${assessment.completedDateTime.replace(/ /g, '-').replace(/:/g, '-').toLowerCase()}`
        const sectionElement = renderHtml.document.getElementById(expectedId)

        expect(ariaControls).toContain(expectedId)
        expect(sectionElement).not.toBeNull()
        expect(sectionElement.className).toContain('predictor-timeline-section')
      })
    })
  })

  describe('Timeline styles', () => {
    const riskData = getRiskTestData([])

    it('should render the timeline and check styles', () => {
      const renderedHtml = getRenderedHtml(dom, 'PREDICTOR_TIMELINE', '', riskData)

      const timeline = renderedHtml.document.querySelector('[data-test-id="predictor-timeline"]')
      expectStyleToBe(renderedHtml, timeline, [
        { tag: 'position', value: 'relative' },
        { tag: 'overflow', value: 'hidden' },
        { tag: 'marginBottom', value: '20px' },
      ])

      const byline = renderedHtml.document.querySelector('[data-test-id="timeline-byline"]')
      expectStyleToBe(renderedHtml, byline, [
        { tag: 'fontSize', value: '1.1875rem' },
        { tag: 'margin', value: '0px' },
        { tag: 'display', value: 'inline' },
      ])

      const item = renderedHtml.document.querySelector('[data-test-id="timeline-item"]')
      expectStyleToBe(renderedHtml, item, [
        { tag: 'position', value: 'relative' },
        { tag: 'paddingBottom', value: '20px' },
        { tag: 'paddingLeft', value: '20px' },
      ])

      const heading = renderedHtml.document.querySelector('[data-test-id="timeline-heading"]')
      expectStyleToBe(renderedHtml, heading, [{ tag: 'marginBottom', value: '30px' }])
    })

    describe('Toggle Button Typography', () => {
      it('should render the "Open" buttons with correct link-style font and spacing', () => {
        const renderedHtml = getRenderedHtml(dom, 'PREDICTOR_TIMELINE', '', riskData)
        const toggleBtn = renderedHtml.document.querySelector(
          '[data-test-id="button-predictor-section-01-january-2025-at-15-21"]',
        )

        expectStyleToBe(renderedHtml, toggleBtn, [
          { tag: 'fontSize', value: '1.1875rem' },
          { tag: 'background', value: 'rgba(0, 0, 0, 0)' },
          { tag: 'padding', value: '0px' },
          { tag: 'textDecoration', value: 'underline' },
          { tag: 'marginBottom', value: '10px' },
        ])
      })
    })
  })

  describe('Timeline warning', () => {
    describe('Timeline Warning Logic', () => {
      it('should show the warning BEFORE an assessment if it is before the release date', () => {
        const renderHtml = getRenderedHtml(
          dom,
          'PREDICTOR_TIMELINE',
          `ogrs4ReleaseDate: "02 July 2024 at 18:23"`,
          getRiskTestData([]),
        )
        const items = renderHtml.document.querySelectorAll('[data-test-id="timeline-item"]')
        expect(items[1].querySelector('[data-test-id="warning-text"]').textContent).not.toBeNull()
      })

      it('should show the warning at the bottom if no assessments are before the release date', () => {
        const renderHtml = getRenderedHtml(
          dom,
          'PREDICTOR_TIMELINE',
          'ogrs4ReleaseDate: "02 July 2023 at 18:23"',
          getRiskTestData([]),
        )
        const items = renderHtml.document.querySelectorAll('[data-test-id="timeline-item"]')
        expect(items[items.length - 1].querySelector('[data-test-id="warning-text"]')).not.toBeNull()
      })

      it('should show the warning at the top if no assessments are before the release date', () => {
        const renderHtml = getRenderedHtml(dom, 'PREDICTOR_TIMELINE', '', getRiskTestData([]))
        const items = renderHtml.document.querySelectorAll('[data-test-id="timeline-item"]')
        expect(items[0].querySelector('[data-test-id="warning-text"]').textContent).not.toBeNull()
      })
    })

    it('should check timeline Warning Styles', () => {
      const renderedHtml = getRenderedHtml(dom, 'PREDICTOR_TIMELINE', '', getRiskTestData([]))

      const warning = renderedHtml.document.querySelector('.govuk-warning-text')
      expectStyleToBe(renderedHtml, warning, [{ tag: 'marginBottom', value: '10px' }])

      const details = renderedHtml.document.querySelector('.govuk-details')
      expectStyleToBe(renderedHtml, details, [{ tag: 'marginBottom', value: '0px' }])
    })
  })

  describe('Timeline item', () => {
    describe('Legacy vs New Predictor Rendering', () => {
      const riskData = getRiskTestData([])

      it('should render OGRS3 using the legacy badge and uppercase name', () => {
        const renderedHtml = getRenderedHtml(dom, 'PREDICTOR_TIMELINE', '', riskData)

        const legacyElement = renderedHtml.document.querySelector('[data-predictor-badge="RSR HIGH"]')
        expect(legacyElement).not.toBeNull()
        expect(legacyElement.querySelector('[data-test-id="nameAndBand"]').textContent).toBe('RSR HIGH')
        expect(legacyElement.querySelector('[data-test-id="score"]').textContent).toBe('50.1234%')
        expect(legacyElement.querySelector('[data-test-id="staticOrDynamic"]').textContent).toBe('Dynamic')
      })

      it('should render All Reoffending Predictor using the expanded badge and title case name', () => {
        const renderedHtml = getRenderedHtml(dom, 'PREDICTOR_TIMELINE', '', riskData)

        const newItem = renderedHtml.document.querySelector(
          '[data-expanded-predictor-badge="All reoffending predictor LOW"]',
        )
        expect(newItem).not.toBeNull()
        expect(newItem.querySelector('[data-test-id="name"]').textContent).toBe('All reoffending predictor')
        expect(newItem.querySelector('[data-test-id="band"]').textContent).toBe('LOW')
        expect(newItem.querySelector('[data-test-id="score"]').textContent).toBe('1.23%')
        expect(newItem.querySelector('[data-test-id="staticOrDynamic"]').textContent).toBe('Static')
      })
    })
  })
})
