import { JSDOM } from 'jsdom'
import { getInitialDom, getDomFromNjks, expectStyleToBe } from '../test-utils/testEnvironmentHelper'

describe('details-chevron', () => {
  let dom: JSDOM
  const componentImport = '{% from "details-chevron/macro.njk" import detailsChevron %}'

  beforeAll(() => {
    dom = getInitialDom()
  })

  describe('Rendering Logic', () => {
    it('should render default labels when no text params are provided', () => {
      const window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, {
        params: { html: '<p>Some content</p>' },
      })

      const showText = window.document.querySelector('[data-test-id="details-show"]')
      const hideText = window.document.querySelector('[data-test-id="details-hide"]')

      expect(showText?.textContent?.trim()).toBe('Show details')
      expect(hideText?.textContent?.trim()).toBe('Hide details')
    })

    it('should render custom text and unescaped HTML content', () => {
      const params = {
        showText: 'Open',
        hideText: 'Close',
        html: '<div id="test-element">Secret Content</div>',
      }

      const window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, { params })

      expect(window.document.querySelector('[data-test-id="details-show"]')?.textContent?.trim()).toBe('Open')
      expect(window.document.getElementById('test-element')).not.toBeNull()
    })
  })

  describe('Computed Styles', () => {
    let window: any

    beforeEach(() => {
      window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, { params: { html: 'content' } })
    })

    it('should apply the correct typography and color to the toggle text', () => {
      const toggleText = window.document.querySelector('[data-test-id="details-toggle-text"]')

      expectStyleToBe(window, toggleText, [
        { tag: 'color', value: 'rgb(29, 112, 184)' },
        { tag: 'fontSize', value: '1.1875rem' },
        { tag: 'fontFamily', value: '"GDS Transport", arial, sans-serif' },
      ])
    })

    it('should style the chevron circle correctly', () => {
      const chevron = window.document.querySelector('[data-test-id="details-chevron"]')

      expectStyleToBe(window, chevron, [
        { tag: 'width', value: '1.25rem' },
        { tag: 'height', value: '1.25rem' },
        // Commented out due to issue with latest version of jsdom
        // { tag: 'borderRadius', value: '50%' },
        { tag: 'display', value: 'inline-flex' },
      ])
    })

    it('should remove default browser markers from the summary', () => {
      const summary = window.document.querySelector('[data-test-id="details-summary"]')

      expectStyleToBe(window, summary, [
        { tag: 'listStyle', value: 'none' },
        { tag: 'display', value: 'flex' },
      ])
    })
  })

  describe('State Transitions', () => {
    it('should toggle text visibility based on the [open] attribute', () => {
      const window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, {
        params: { html: 'content' },
      })

      const details = window.document.querySelector('[data-test-id="details-wrapper"]')
      const showSpan = window.document.querySelector('[data-test-id="details-show"]')
      const hideSpan = window.document.querySelector('[data-test-id="details-hide"]')

      // Initially closed
      expectStyleToBe(window, hideSpan, [{ tag: 'display', value: 'none' }])

      // Simulate the details being opened
      details.setAttribute('open', '')

      // Verify the [open] attribute triggers the CSS display changes
      expectStyleToBe(window, showSpan, [{ tag: 'display', value: 'none' }])
      expectStyleToBe(window, hideSpan, [{ tag: 'display', value: 'inline' }])
    })
  })

  describe('Accessibility elements', () => {
    it('should generate matching IDs for summary and region, and hidden text based on ariaContext', () => {
      const context = 'All reoffending predictor'
      const window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, {
        params: { html: 'content', ariaContext: context },
      })

      const expectedId = 'details-summary-all-reoffending-predictor'
      const summary = window.document.querySelector('[data-test-id="details-summary"]')
      const section = window.document.querySelector('[data-test-id="details-section"]')

      expect(summary.getAttribute('id')).toBe(expectedId)
      expect(section.getAttribute('aria-labelledby')).toBe(expectedId)

      const showSpan = window.document.querySelector('[data-test-id="details-show"]')
      const showHiddenSpans = showSpan.querySelector('[data-test-id="details-show-hidden-text"]')
      const hideSpan = window.document.querySelector('[data-test-id="details-hide"]')
      const hideHiddenSpans = hideSpan.querySelector('[data-test-id="details-hide-hidden-text"]')

      expect(showSpan.textContent + showHiddenSpans.textContent).toContain(`for the ${context}`)
      expect(showHiddenSpans.getAttribute('class')).toBe('govuk-visually-hidden')

      expect(hideSpan.textContent + hideHiddenSpans.textContent).toContain(`for the ${context}`)
      expect(hideHiddenSpans.getAttribute('class')).toBe('govuk-visually-hidden')
    })

    it('should not render visually hidden spans if ariaContext is missing', () => {
      const window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, {
        params: { html: 'content' },
      })

      const showHiddenSpan = window.document.querySelector('[data-test-id="details-show-hidden-text"]')
      const hideHiddenSpan = window.document.querySelector('[data-test-id="details-hide-hidden-text"]')

      expect(showHiddenSpan).toBeNull()
      expect(hideHiddenSpan).toBeNull()
    })
  })

  describe('Test ids for app insights', () => {
    it('should set id on details component', () => {
      const context = 'All reoffending predictor'
      const window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, {
        params: { html: 'content', ariaContext: context },
      })

      const expectedSuffix = '-all-reoffending-predictor'
      const details = window.document.querySelector(`[data-test-id="details-wrapper${expectedSuffix}"]`)

      expect(details.id).toBe(`details${expectedSuffix}`)
    })
  })
})
