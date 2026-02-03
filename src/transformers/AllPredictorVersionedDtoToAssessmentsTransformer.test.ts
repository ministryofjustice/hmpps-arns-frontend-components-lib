import { transformAllPredictorVersionedDtoToAssessments } from './AllPredictorVersionedDtoToAssessmentsTransformer'
import { AllPredictorVersionedDto } from '../types/dtos/AllPredictorVersionedDto'

function getRawInputData(): AllPredictorVersionedDto[] {
  return [
    {
      completedDate: '2024-01-02T18:23:20',
      status: 'COMPLETE',
      outputVersion: '1',
      output: {
        groupReconvictionScore: {
          oneYear: 3,
          twoYears: 5,
          scoreLevel: 'LOW',
        },
        violencePredictorScore: {
          ovpStaticWeightedScore: 14,
          ovpDynamicWeightedScore: 3,
          ovpTotalWeightedScore: 17,
          oneYear: 4,
          twoYears: 7,
          ovpRisk: 'LOW',
        },
        generalPredictorScore: {
          ogpStaticWeightedScore: 3,
          ogpDynamicWeightedScore: 7,
          ogpTotalWeightedScore: 10,
          ogp1Year: 4,
          ogp2Year: 8,
          ogpRisk: 'MEDIUM',
        },
        sexualPredictorScore: {
          ospIndecentPercentageScore: 2.81,
          ospContactPercentageScore: 1.07,
          ospIndecentScoreLevel: 'HIGH',
          ospContactScoreLevel: 'VERY_HIGH',
        },
        riskOfSeriousRecidivismScore: {
          percentageScore: 50.1234,
          staticOrDynamic: 'DYNAMIC',
          source: 'OASYS',
          algorithmVersion: '5',
          scoreLevel: 'HIGH',
        },
      },
    },
    {
      completedDate: '2025-01-01T15:21:20',
      status: 'COMPLETE',
      outputVersion: '2',
      output: {
        allReoffendingPredictor: {
          staticOrDynamic: 'STATIC',
          score: 1.23,
          band: 'LOW',
        },
        violentReoffendingPredictor: {
          staticOrDynamic: 'STATIC',
          score: 1.23,
          band: 'LOW',
        },
        seriousViolentReoffendingPredictor: {
          staticOrDynamic: 'STATIC',
          score: 1.23,
          band: 'MEDIUM',
        },
        directContactSexualReoffendingPredictor: {
          score: 2.81,
          band: 'VERY_HIGH',
        },
        indirectImageContactSexualReoffendingPredictor: {
          score: 1.07,
          band: 'HIGH',
        },
        combinedSeriousReoffendingPredictor: {
          algorithmVersion: '6',
          staticOrDynamic: 'STATIC',
          score: 1.23,
          band: 'HIGH',
        },
      },
    },
  ]
}

describe('All Predictor Versioned DTO To Assessments Transformer', () => {
  it('should map raw DTO fields to Assessments type for versions 1 & 2 and sort by completedDate (newest first)', () => {
    const result = transformAllPredictorVersionedDtoToAssessments(getRawInputData())
    expect(result).toEqual(
      [
        {
          'completedDateTime': '01 January 2025 at 15:21',
          'outputVersion': '2',
          'allReoffendingPredictor': {
            'name': 'All Reoffending Predictor',
            'band': 'LOW',
            'staticOrDynamic': 'Static',
            'score': 1.23,
            'completedDate': '01 January 2025',
          },
          'violentReoffendingPredictor': {
            'name': 'Violent Reoffending Predictor',
            'band': 'LOW',
            'staticOrDynamic': 'Static',
            'score': 1.23,
            'completedDate': '01 January 2025',
          },
          'seriousViolentReoffendingPredictor': {
            'name': 'Serious Violent Reoffending Predictor',
            'band': 'MEDIUM',
            'staticOrDynamic': 'Static',
            'score': 1.23,
            'completedDate': '01 January 2025',
          },
          'directContactSexualReoffendingPredictor': {
            'name': 'Direct Contact - Sexual Reoffending Predictor',
            'band': 'VERY HIGH',
            'staticOrDynamic': null,
            'score': 2.81,
            'completedDate': '01 January 2025',
          },
          'indirectImageContactSexualReoffendingPredictor': {
            'name': 'Images and Indirect Contact – Sexual Reoffending Predictor',
            'band': 'HIGH',
            'staticOrDynamic': null,
            'score': 1.07,
            'completedDate': '01 January 2025',
          },
          'combinedSeriousReoffendingPredictor': {
            'name': 'Combined Serious Reoffending Predictor',
            'band': 'HIGH',
            'staticOrDynamic': 'Static',
            'score': 1.23,
            'completedDate': '01 January 2025',
          }
        },
        {
          'outputVersion': '1',
          'completedDateTime': '02 January 2024 at 18:23',
          'ogrs3PredictorScore': {
            'name': 'OGRS',
            'band': 'LOW',
            'staticOrDynamic': null,
            'score': 5,
            'completedDate': '02 January 2024',
          },
          'ovpPredictorScore': {
            'name': 'OVP',
            'band': 'LOW',
            'staticOrDynamic': null,
            'score': 7,
            'completedDate': '02 January 2024',
          },
          'ogpPredictorScore': {
            'name': 'OGP',
            'band': 'MEDIUM',
            'staticOrDynamic': null,
            'score': 8,
            'completedDate': '02 January 2024',
          },
          'ospdcPredictorScore': {
            'name': 'OSP-DC',
            'band': 'VERY HIGH',
            'staticOrDynamic': null,
            'score': 1.07,
            'completedDate': '02 January 2024',
          },
          'ospiicPredictorScore': {
            'name': 'OSP-IIC',
            'band': 'HIGH',
            'staticOrDynamic': null,
            'score': 2.81,
            'completedDate': '02 January 2024',
          },
          'rsrPredictorScore': {
            'name': 'RSR',
            'band': 'HIGH',
            'staticOrDynamic': 'Dynamic',
            'score': 50.1234,
            'completedDate': '02 January 2024',
          }
        }
      ])
  })

  it('should error when version not 1 or 2', () => {
    const badVersionData: AllPredictorVersionedDto[] = [
      {
        completedDate: '2022-06-10T18:23:20',
        status: 'COMPLETE',
        outputVersion: '3',
        output: {},
      },
    ]
    expect(() => transformAllPredictorVersionedDtoToAssessments(badVersionData)).toThrow('Unsupported output version: 3')
  })
})
