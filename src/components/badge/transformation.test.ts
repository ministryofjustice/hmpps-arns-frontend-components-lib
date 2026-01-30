import { transformBadgeData } from './transformation'
import { AllPredictorVersionedDto } from '../../types/dtos/allPredictorVersionedDto'

function getDataWithDate(v1Date: string, v2Date: string): AllPredictorVersionedDto[] {
  return [
    {
      completedDate: v1Date,
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
          ogpRisk: 'LOW',
        },
        riskOfSeriousRecidivismScore: {
          percentageScore: 50.1234,
          staticOrDynamic: 'DYNAMIC',
          source: 'OASYS',
          algorithmVersion: '5',
          scoreLevel: 'MEDIUM',
        },
        sexualPredictorScore: {
          ospIndecentPercentageScore: 2.81,
          ospContactPercentageScore: 1.07,
          ospIndecentScoreLevel: 'MEDIUM',
          ospContactScoreLevel: 'MEDIUM',
        },
      },
    },
    {
      completedDate: v2Date,
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
          band: 'LOW',
        },
        directContactSexualReoffendingPredictor: {
          score: 2.81,
          band: 'MEDIUM',
        },
        indirectImageContactSexualReoffendingPredictor: {
          score: 1.07,
          band: 'MEDIUM',
        },
        combinedSeriousReoffendingPredictor: {
          algorithmVersion: '6',
          staticOrDynamic: 'STATIC',
          score: 1.23,
          band: 'LOW',
        },
      },
    },
  ]
}

describe('Badge transformation layer', () => {
  it('should map raw dto fields to badgeData type for version 1', () => {
    const result = transformBadgeData(getDataWithDate('2025-01-01T18:23:20', '2024-01-01T18:23:20'))
    expect(result).toEqual([
      {
        ogrs3PredictorScore: {
          completedDate: '2025-01-01T18:23:20',
          level: 'LOW',
          score: 5,
          staticOrDynamic: null,
          type: 'OGRS3',
        },
      },
      {
        ovpPredictorScore: {
          completedDate: '2025-01-01T18:23:20',
          level: 'LOW',
          score: 7,
          staticOrDynamic: null,
          type: 'OVP',
        },
      },
      {
        ogpPredictorScore: {
          completedDate: '2025-01-01T18:23:20',
          level: 'LOW',
          score: 8,
          staticOrDynamic: null,
          type: 'OGP',
        },
      },
      {
        rsrPredictorScore: {
          completedDate: '2025-01-01T18:23:20',
          level: 'MEDIUM',
          score: 50.1234,
          staticOrDynamic: 'DYNAMIC',
          type: 'RSR',
        },
      },
      {
        ospdcPredictorScore: {
          completedDate: '2025-01-01T18:23:20',
          level: 'MEDIUM',
          score: 1.07,
          staticOrDynamic: null,
          type: 'OSP/DC',
        },
      },
      {
        ospiicPredictorScore: {
          completedDate: '2025-01-01T18:23:20',
          level: 'MEDIUM',
          score: 2.81,
          staticOrDynamic: null,
          type: 'OSP/IIC',
        },
      },
    ])
  })

  it('should map raw dto fields to badgeData type for version 2', () => {
    const result = transformBadgeData(getDataWithDate('2024-01-01T18:23:20', '2025-01-01T18:23:20'))
    expect(result).toEqual([
      {
        allReoffendingPredictor: {
          completedDate: '2025-01-01T18:23:20',
          level: 'LOW',
          score: 1.23,
          staticOrDynamic: 'STATIC',
          type: 'ARP',
        },
      },
      {
        violentReoffendingPredictor: {
          completedDate: '2025-01-01T18:23:20',
          level: 'LOW',
          score: 1.23,
          staticOrDynamic: 'STATIC',
          type: 'VRP',
        },
      },
      {
        seriousViolentReoffendingPredictor: {
          completedDate: '2025-01-01T18:23:20',
          level: 'LOW',
          score: 1.23,
          staticOrDynamic: 'STATIC',
          type: 'SVRP',
        },
      },
      {
        directContactSexualReoffendingPredictor: {
          completedDate: '2025-01-01T18:23:20',
          level: 'MEDIUM',
          score: 2.81,
          staticOrDynamic: null,
          type: 'DC/SRP',
        },
      },
      {
        indirectImageContactSexualReoffendingPredictor: {
          completedDate: '2025-01-01T18:23:20',
          level: 'MEDIUM',
          score: 1.07,
          staticOrDynamic: null,
          type: 'IIC/SRP',
        },
      },
      {
        combinedSeriousReoffendingPredictor: {
          completedDate: '2025-01-01T18:23:20',
          level: 'LOW',
          score: 1.23,
          staticOrDynamic: 'STATIC',
          type: 'CSRP',
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
        output: {},
      },
    ]
    expect(() => transformBadgeData(badVersionData)).toThrow('unexpected version')
  })
})
