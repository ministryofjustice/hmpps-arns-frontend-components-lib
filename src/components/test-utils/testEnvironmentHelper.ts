import * as sass from 'sass'
import path from 'path'
import { DOMWindow, JSDOM } from 'jsdom'
import nunjucks from 'nunjucks'
import { RiskData } from '../../types/RiskData'
import { AssessmentV1 } from '../../types/AssessmentV1'
import { AssessmentV2 } from '../../types/AssessmentV2'
import { Predictor } from '../../types/Predictor'
import { BandLevel } from '../../types/dtos/BandLevel'
import { arnsNunjucksSetup, predictorConfig } from '../../NunjucksSetup'

const cachedCss = sass.compileString(
  `
    @import "govuk-frontend/dist/govuk/index";
    @import "_all.scss";
    `,
  {
    loadPaths: [path.resolve(__dirname, '../../../node_modules'), path.resolve(__dirname, '../../assets/scss')],
    style: 'expanded',
    quietDeps: true,
  },
)

const njksEnv = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([
    path.resolve(__dirname, '../'),
    path.resolve(__dirname, '../../../node_modules/govuk-frontend/dist'),
  ]),
  { autoescape: true },
)
arnsNunjucksSetup(njksEnv)

export const getInitialDom = () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="container"></div></body></html>')
  const styleElement = dom.window.document.createElement('style')
  styleElement.textContent = cachedCss.css
  dom.window.document.head.appendChild(styleElement)
  return dom
}

export const getDomFromNjks = (dom: JSDOM, njks: string, context: object) => {
  const html = njksEnv.renderString(njks, context)
  const container = dom.window.document.getElementById('container')!
  container.innerHTML = html

  return dom.window
}

export const getRenderedHtml = (dom: JSDOM, component: Component, options: string, riskData: RiskData) => {
  const optionsString = options ? `, ${options}` : ''
  const njks = `{% from "${components[component].directory}/macro.njk" import ${components[component].macro} as macro %}{{ macro({data: riskData${optionsString}}) }}`
  return getDomFromNjks(dom, njks, { riskData })
}

export const expectStyleToBe = (
  renderedHtml: DOMWindow,
  element: Element | null,
  styles?: { tag: keyof CSSStyleDeclaration; value: string }[],
  innerHtml?: string,
) => {
  if (!element) {
    throw new Error('Element not found for style validation')
  }

  if (innerHtml) {
    expect(element.innerHTML).toBe(innerHtml)
  }

  if (styles) {
    const computedStyle = renderedHtml.getComputedStyle(element)
    styles.forEach(style => {
      expect(computedStyle[style.tag]).toBe(style.value)
    })
  }
}

export const expectElementMissing = (container: ParentNode, selector: string) => {
  expect(container.querySelector(selector)).toBeNull()
}

type ComponentDetail = {
  readonly directory: string
  readonly macro: string
}

export const components: Record<string, ComponentDetail> = {
  PREDICTOR_BADGE: {
    directory: 'predictor-badge',
    macro: 'predictorBadge',
  },
  EXPANDED_PREDICTOR_BADGE: {
    directory: 'expanded-predictor-badge',
    macro: 'expandedPredictorBadge',
  },
  PREDICTOR_SCALE: {
    directory: 'predictor-scale',
    macro: 'predictorScale',
  },
  PREDICTOR_SCALE_BAR: {
    directory: 'predictor-scale-bar',
    macro: 'predictorScaleBar',
  },
  RISK_PREDICTOR_SCORES_CONTENT: {
    directory: 'risk-predictor-scores-content',
    macro: 'riskPredictorScoresContent',
  },
  PREDICTOR_TIMELINE: {
    directory: 'predictor-timeline',
    macro: 'predictorTimeline',
  },
}

export type Component = keyof typeof components

export const expectedPredictorNameMappings: Record<string, PredictorNameProperties> = {
  allReoffendingPredictor: {
    name: 'All Reoffending Predictor',
    badgeContent: 'ALL REOFFENDING PREDICTOR',
    showStaticDynamic: true,
    completedDate: '02 January 2024',
  },
  violentReoffendingPredictor: {
    name: 'Violent Reoffending Predictor',
    badgeContent: 'VIOLENT REOFFENDING PREDICTOR',
    showStaticDynamic: true,
    completedDate: '02 January 2024',
  },
  seriousViolentReoffendingPredictor: {
    name: 'Serious Violent Reoffending Predictor',
    badgeContent: 'SERIOUS VIOLENT REOFFENDING PREDICTOR',
    showStaticDynamic: true,
    completedDate: '02 January 2024',
  },
  directContactSexualReoffendingPredictor: {
    name: 'Direct Contact - Sexual Reoffending Predictor',
    badgeContent: 'DIRECT CONTACT - SEXUAL REOFFENDING PREDICTOR',
    showStaticDynamic: false,
    completedDate: '02 January 2024',
  },
  indirectImageContactSexualReoffendingPredictor: {
    name: 'Images and Indirect Contact – Sexual Reoffending Predictor',
    badgeContent: 'IMAGES AND INDIRECT CONTACT – SEXUAL REOFFENDING PREDICTOR',
    showStaticDynamic: false,
    completedDate: '02 January 2024',
  },
  combinedSeriousReoffendingPredictor: {
    name: 'Combined Serious Reoffending Predictor',
    badgeContent: 'COMBINED SERIOUS REOFFENDING PREDICTOR',
    showStaticDynamic: true,
    completedDate: '02 January 2024',
  },
  ogrs3: {
    name: 'OGRS',
    badgeContent: 'OGRS',
    showStaticDynamic: false,
    completedDate: '02 January 2024',
  },
  ovp: {
    name: 'OVP',
    badgeContent: 'OVP',
    showStaticDynamic: false,
    completedDate: '02 January 2024',
  },
  ogp: {
    name: 'OGP',
    badgeContent: 'OGP',
    showStaticDynamic: false,
    completedDate: '02 January 2024',
  },
  ospdc: {
    name: 'OSP-DC',
    badgeContent: 'OSP-DC',
    showStaticDynamic: false,
    completedDate: '02 January 2024',
  },
  ospiic: {
    name: 'OSP-IIC',
    badgeContent: 'OSP-IIC',
    showStaticDynamic: false,
    completedDate: '02 January 2024',
  },
  rsr: {
    name: 'RSR',
    badgeContent: 'RSR',
    showStaticDynamic: true,
    completedDate: '02 January 2024',
  },
}

export type PredictorOption = keyof AssessmentV1 | keyof AssessmentV2

type PredictorNameProperties = {
  name: string
  badgeContent: string
  showStaticDynamic: boolean
  completedDate?: string
}

export type StaticOrDynamicContent = 'Static' | 'Dynamic'

export type RiskTestDataOptions = {
  predictor: PredictorOption
  level?: BandLevel
  score?: number
  staticOrDynamic?: StaticOrDynamicContent
  completedDate?: string
  allowFalseyCompletedDate?: boolean
}

export const getRiskTestData = (predictors: RiskTestDataOptions[]): RiskData => {
  const v1assessment: AssessmentV1 = {
    outputVersion: '1',
    completedDateTime: '02 January 2024 at 18:23',
    completedDate: '02 January 2024',
    assessmentType: 'layer 3',
    ogrs3: {
      name: 'OGRS',
      band: 'LOW',
      staticOrDynamic: null,
      score: 5,
      completedDate: '02 January 2024',
    },
    ovp: {
      name: 'OVP',
      band: 'LOW',
      staticOrDynamic: null,
      score: 7,
      completedDate: '02 January 2024',
    },
    ogp: {
      name: 'OGP',
      band: 'MEDIUM',
      staticOrDynamic: null,
      score: 8,
      completedDate: '02 January 2024',
    },
    ospdc: {
      name: 'OSP-DC',
      band: 'VERY HIGH',
      staticOrDynamic: null,
      score: 1.07,
      completedDate: '02 January 2024',
    },
    ospiic: {
      name: 'OSP-IIC',
      band: 'HIGH',
      staticOrDynamic: null,
      score: 2.81,
      completedDate: '02 January 2024',
    },
    rsr: {
      name: 'RSR',
      band: 'HIGH',
      staticOrDynamic: 'Dynamic',
      score: 50.1234,
      completedDate: '02 January 2024',
    },
  }

  const v2assessment: AssessmentV2 = {
    outputVersion: '2',
    completedDateTime: '01 January 2025 at 15:21',
    completedDate: '01 January 2025',
    assessmentType: 'layer 3',
    allReoffendingPredictor: {
      name: 'All Reoffending Predictor',
      band: 'LOW',
      staticOrDynamic: 'Static',
      score: 1.23,
      completedDate: '01 January 2025',
    },
    violentReoffendingPredictor: {
      name: 'Violent Reoffending Predictor',
      band: 'LOW',
      staticOrDynamic: 'Static',
      score: 1.23,
      completedDate: '01 January 2025',
    },
    seriousViolentReoffendingPredictor: {
      name: 'Serious Violent Reoffending Predictor',
      band: 'MEDIUM',
      staticOrDynamic: 'Static',
      score: 1.23,
      completedDate: '01 January 2025',
    },
    directContactSexualReoffendingPredictor: {
      name: 'Direct Contact - Sexual Reoffending Predictor',
      band: 'VERY HIGH',
      staticOrDynamic: null,
      score: 2.81,
      completedDate: '01 January 2025',
    },
    indirectImageContactSexualReoffendingPredictor: {
      name: 'Images and Indirect Contact – Sexual Reoffending Predictor',
      band: 'HIGH',
      staticOrDynamic: null,
      score: 1.07,
      completedDate: '01 January 2025',
    },
    combinedSeriousReoffendingPredictor: {
      name: 'Combined Serious Reoffending Predictor',
      band: 'HIGH',
      staticOrDynamic: 'Static',
      score: 1.23,
      completedDate: '01 January 2025',
    },
  }

  if (predictors === null || predictors.length === 0) {
    return {
      httpStatus: 200,
      assessments: [v2assessment, v1assessment],
    }
  }

  // Assume the first predictor will tell us the version of the assessment required
  const assessmentToUpdate = predictors[0].predictor in v1assessment ? v1assessment : v2assessment

  predictors.forEach(options => {
    const predictor = assessmentToUpdate[options.predictor as keyof typeof assessmentToUpdate] as unknown as Predictor
    predictor.score = options.score
    predictor.band = options.level?.replace('_', ' ')
    predictor.name = expectedPredictorNameMappings[options.predictor].name
    predictor.staticOrDynamic = expectedPredictorNameMappings[options.predictor].showStaticDynamic
      ? options.staticOrDynamic
      : null
    predictor.completedDate =
      options.completedDate || (options.allowFalseyCompletedDate ? options.completedDate : '02 January 2024')
  })

  return { assessments: [assessmentToUpdate, v1assessment, v2assessment], httpStatus: 200 }
}

type Inputs = Record<string, any[]>

export function getCombinations<T extends Inputs>(inputs: T): Record<keyof T, any>[] {
  const keys = Object.keys(inputs) as (keyof T)[]

  return keys.reduce(
    (acc, key) => {
      const values = inputs[key]
      const newAcc: Record<keyof T, any>[] = []

      acc.forEach(existingCombo => {
        values.forEach(value => {
          newAcc.push({
            ...existingCombo,
            [key]: value,
          })
        })
      })

      return newAcc
    },
    [{}] as Record<keyof T, any>[],
  )
}

export const legacyFallbackTestCases = [
  // When legacy predictor in assessment and requested, return legacy predictor
  ['ogrs3', 'ogrs3', 'ogrs3'],
  ['ovp', 'ovp', 'ovp'],
  ['ogp', 'ogp', 'ogp'],
  ['ospdc', 'ospdc', 'ospdc'],
  ['ospiic', 'ospiic', 'ospiic'],
  ['rsr', 'rsr', 'rsr'],
  // When legacy predictor in assessment and new predictor is requested, return legacy predictor, apart from CSRP which has no fallback
  ['ogrs3', 'allReoffendingPredictor', 'ogrs3'],
  ['ovp', 'violentReoffendingPredictor', 'ovp'],
  ['rsr', 'seriousViolentReoffendingPredictor', null],
  ['ospdc', 'directContactSexualReoffendingPredictor', 'ospdc'],
  ['ospiic', 'indirectImageContactSexualReoffendingPredictor', 'ospiic'],
  ['rsr', 'combinedSeriousReoffendingPredictor', 'rsr'],
  // When new predictor in assessment and requested, return new predictor
  ['allReoffendingPredictor', 'allReoffendingPredictor', 'allReoffendingPredictor'],
  ['violentReoffendingPredictor', 'violentReoffendingPredictor', 'violentReoffendingPredictor'],
  ['seriousViolentReoffendingPredictor', 'seriousViolentReoffendingPredictor', 'seriousViolentReoffendingPredictor'],
  [
    'directContactSexualReoffendingPredictor',
    'directContactSexualReoffendingPredictor',
    'directContactSexualReoffendingPredictor',
  ],
  [
    'indirectImageContactSexualReoffendingPredictor',
    'indirectImageContactSexualReoffendingPredictor',
    'indirectImageContactSexualReoffendingPredictor',
  ],
  ['combinedSeriousReoffendingPredictor', 'combinedSeriousReoffendingPredictor', 'combinedSeriousReoffendingPredictor'],
  // When new predictor in assessment and legacy predictor requested, nothing is displayed
  ['allReoffendingPredictor', 'ogrs3', null],
  ['violentReoffendingPredictor', 'ovp', null],
  ['seriousViolentReoffendingPredictor', 'rsr', null],
  ['directContactSexualReoffendingPredictor', 'ospdc', null],
  ['indirectImageContactSexualReoffendingPredictor', 'ospiic', null],
  ['combinedSeriousReoffendingPredictor', 'rsr', null],
]

export { predictorConfig }
