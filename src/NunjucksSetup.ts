import { Environment } from 'nunjucks'

export const arnsNunjucksSetup = (env: Environment) => {
  // TODO update with required globals and filters
  env.addGlobal('testGlobal', 'This is a test global')
  env.addFilter('testFilter', (inputString: string) => {
    return inputString.toUpperCase()
  })
}
