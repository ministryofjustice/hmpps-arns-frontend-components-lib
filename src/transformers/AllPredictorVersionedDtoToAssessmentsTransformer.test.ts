import { transformAllPredictorVersionedDtoToAssessments } from './AllPredictorVersionedDtoToAssessmentsTransformer'
import { AllPredictorVersionedDto } from '../types/dtos/AllPredictorVersionedDto'

function getRawInputData(): AllPredictorVersionedDto[] {
  return [
    {
      completedDate: '2024-01-02T18:23:20',
      status: 'COMPLETE',
      outputVersion: '1',
      assessmentType: 'LAYER1',
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
      assessmentType: 'LAYER3',
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
    expect(result).toEqual([
      {
        completedDate: '01 January 2025',
        completedDateTime: '01 January 2025 at 15:21',
        outputVersion: '2',
        assessmentType: 'layer 3',
        allReoffendingPredictor: {
          name: 'All reoffending predictor',
          band: 'LOW',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: '01 January 2025',
        },
        violentReoffendingPredictor: {
          name: 'Violent reoffending predictor',
          band: 'LOW',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: '01 January 2025',
        },
        seriousViolentReoffendingPredictor: {
          name: 'Serious violent reoffending predictor',
          band: 'MEDIUM',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: '01 January 2025',
        },
        directContactSexualReoffendingPredictor: {
          name: 'Direct contact \u2013 sexual reoffending predictor',
          band: 'VERY HIGH',
          staticOrDynamic: null,
          score: 2.81,
          completedDate: '01 January 2025',
        },
        indirectImageContactSexualReoffendingPredictor: {
          name: 'Images and indirect contact \u2013 sexual reoffending predictor',
          band: 'HIGH',
          staticOrDynamic: null,
          score: 1.07,
          completedDate: '01 January 2025',
        },
        combinedSeriousReoffendingPredictor: {
          name: 'Combined serious reoffending predictor',
          band: 'HIGH',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: '01 January 2025',
        },
      },
      {
        outputVersion: '1',
        completedDate: '02 January 2024',
        completedDateTime: '02 January 2024 at 18:23',
        assessmentType: 'layer 1',
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
          name: 'OSP\u2013DC',
          band: 'VERY HIGH',
          staticOrDynamic: null,
          score: 1.07,
          completedDate: '02 January 2024',
        },
        ospiic: {
          name: 'OSP\u2013IIC',
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
      },
    ])
  })

  it('should error when version not 1 or 2', () => {
    const badVersionData: AllPredictorVersionedDto[] = [
      {
        completedDate: '2022-06-10T18:23:20',
        status: 'COMPLETE',
        outputVersion: '3',
        assessmentType: 'LAYER3',
        output: {},
      },
    ]
    expect(() => transformAllPredictorVersionedDtoToAssessments(badVersionData)).toThrow(
      'Unsupported output version: 3',
    )
  })

  it('should handle null predictor & predictor containing null fields', () => {
    const nullPredictorsData: AllPredictorVersionedDto[] = [
      {
        completedDate: '2025-01-01T15:21:20',
        status: 'COMPLETE',
        outputVersion: '2',
        assessmentType: 'LAYER3',
        output: {
          allReoffendingPredictor: {
            staticOrDynamic: null,
            score: null,
            band: null,
          },
          violentReoffendingPredictor: undefined,
          seriousViolentReoffendingPredictor: undefined,
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
    const result = transformAllPredictorVersionedDtoToAssessments(nullPredictorsData)
    expect(result).toEqual([
      {
        completedDate: '01 January 2025',
        completedDateTime: '01 January 2025 at 15:21',
        outputVersion: '2',
        assessmentType: 'layer 3',
        allReoffendingPredictor: {
          name: 'All reoffending predictor',
          band: null,
          staticOrDynamic: null,
          score: null,
          completedDate: '01 January 2025',
        },
        violentReoffendingPredictor: {
          name: 'Violent reoffending predictor',
          band: null,
          staticOrDynamic: null,
          score: null,
          completedDate: '01 January 2025',
        },
        seriousViolentReoffendingPredictor: {
          name: 'Serious violent reoffending predictor',
          band: null,
          staticOrDynamic: null,
          score: null,
          completedDate: '01 January 2025',
        },
        directContactSexualReoffendingPredictor: {
          name: 'Direct contact \u2013 sexual reoffending predictor',
          band: 'VERY HIGH',
          staticOrDynamic: null,
          score: 2.81,
          completedDate: '01 January 2025',
        },
        indirectImageContactSexualReoffendingPredictor: {
          name: 'Images and indirect contact \u2013 sexual reoffending predictor',
          band: 'HIGH',
          staticOrDynamic: null,
          score: 1.07,
          completedDate: '01 January 2025',
        },
        combinedSeriousReoffendingPredictor: {
          name: 'Combined serious reoffending predictor',
          band: 'HIGH',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: '01 January 2025',
        },
      },
    ])
  })

  it('should handle malformed completedDate', () => {
    const nullPredictorsData: AllPredictorVersionedDto[] = [
      {
        completedDate: 'NOT_A_DATE',
        status: 'COMPLETE',
        outputVersion: '2',
        assessmentType: 'LAYER3',
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
    const result = transformAllPredictorVersionedDtoToAssessments(nullPredictorsData)
    expect(result).toEqual([
      {
        completedDate: null,
        completedDateTime: null,
        outputVersion: '2',
        assessmentType: 'layer 3',
        allReoffendingPredictor: {
          name: 'All reoffending predictor',
          band: 'LOW',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: null,
        },
        violentReoffendingPredictor: {
          name: 'Violent reoffending predictor',
          band: 'LOW',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: null,
        },
        seriousViolentReoffendingPredictor: {
          name: 'Serious violent reoffending predictor',
          band: 'MEDIUM',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: null,
        },
        directContactSexualReoffendingPredictor: {
          name: 'Direct contact \u2013 sexual reoffending predictor',
          band: 'VERY HIGH',
          staticOrDynamic: null,
          score: 2.81,
          completedDate: null,
        },
        indirectImageContactSexualReoffendingPredictor: {
          name: 'Images and indirect contact \u2013 sexual reoffending predictor',
          band: 'HIGH',
          staticOrDynamic: null,
          score: 1.07,
          completedDate: null,
        },
        combinedSeriousReoffendingPredictor: {
          name: 'Combined serious reoffending predictor',
          band: 'HIGH',
          staticOrDynamic: 'Static',
          score: 1.23,
          completedDate: null,
        },
      },
    ])
  })
})
