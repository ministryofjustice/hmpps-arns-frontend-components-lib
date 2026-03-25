/* eslint-disable */

// Call this function from your app insights setup script, providing the initialised appInsights object
export function init(appInsights) {

  const containingDiv = document.querySelector('[data-module="arns-custom-app-insights"]')

  // Only run this on pages with the data module
  if (!containingDiv) {
    return
  }

  containingDiv.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', (event) => {
      const isExpanded = event.target.open
      if (details.id) {
        appInsights.trackEvent({ name: details.id, properties: { isExpanded: isExpanded } })
      }
    })
  })
}
