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

      const showText = window.document.querySelector('.details__show')
      const hideText = window.document.querySelector('.details__hide')

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

      expect(window.document.querySelector('.details__show')?.textContent?.trim()).toBe('Open')
      expect(window.document.getElementById('test-element')).not.toBeNull()
    })
  })

  describe('Computed Styles', () => {
    let window: any

    beforeEach(() => {
      window = getDomFromNjks(dom, `${componentImport}{{ detailsChevron(params) }}`, { params: { html: 'content' } })
    })

    it('should apply the correct typography and color to the toggle text', () => {
      const toggleText = window.document.querySelector('.details__toggle-text')

      expectStyleToBe(window, toggleText, [
        { tag: 'color', value: 'rgb(29, 112, 184)' },
        { tag: 'fontSize', value: '1.1875rem' },
        { tag: 'fontFamily', value: '"GDS Transport", arial, sans-serif' },
      ])
    })

    it('should style the chevron circle correctly', () => {
      const chevron = window.document.querySelector('.details__chevron')

      expectStyleToBe(window, chevron, [
        { tag: 'width', value: '1.25rem' },
        { tag: 'height', value: '1.25rem' },
        { tag: 'borderRadius', value: '50%' },
        { tag: 'display', value: 'inline-flex' },
      ])
    })

    it('should remove default browser markers from the summary', () => {
      const summary = window.document.querySelector('.govuk-details__summary')

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

      const details = window.document.querySelector('.details--chevron-style')
      const showSpan = window.document.querySelector('.details__show')
      const hideSpan = window.document.querySelector('.details__hide')

      // Initially closed
      expectStyleToBe(window, hideSpan, [{ tag: 'display', value: 'none' }])

      // Simulate the details being opened
      details.setAttribute('open', '')

      // Verify the [open] attribute triggers the CSS display changes
      expectStyleToBe(window, showSpan, [{ tag: 'display', value: 'none' }])
      expectStyleToBe(window, hideSpan, [{ tag: 'display', value: 'inline' }])
    })
  })
})
