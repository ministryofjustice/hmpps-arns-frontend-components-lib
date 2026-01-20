import { type Response } from 'express'
import config from '../config'

export default function updateCsp(res: Response) {
  const csp = res.getHeaders()['content-security-policy']
  const allDirectives = csp?.split(';') ?? []
  const directivesToUpdate = ['script-src', 'style-src', 'img-src', 'font-src']

  const updatedCspDirectives = allDirectives.map(directive => {
    // if directive is not in cspToUpdate or includes fe components url already return as is
    if (directive.includes(config.apis.arns.url) || !directivesToUpdate.some(p => directive.includes(`${p} `)))
      return directive

    // if directive is in cspToUpdate and does not have fe components url, add in
    return `${directive} ${config.apis.arns.url}`
  })

  const requiredAndNotPresent = directivesToUpdate
    .filter(p => !updatedCspDirectives.find(directive => directive.includes(`${p} `)))
    .map(p => `${p} 'self' ${config.apis.arns.url}`)

  res.set('content-security-policy', [...updatedCspDirectives, ...requiredAndNotPresent].join(';'))
}
