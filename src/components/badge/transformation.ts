import { AllPredictorVersionedDto } from '../../types/dtos/allPredictorVersionedDto'
import { BadgeEntry } from '../../types/badgeData'

export function transformBadgeData(dto: AllPredictorVersionedDto[]): BadgeEntry[] {
  const badgeEntries: BadgeEntry[] = []

  dto.forEach(listEntry => {
    if (listEntry.outputVersion === '1') {
      const ogrs3 = listEntry.output.groupReconvictionScore
      const ovp = listEntry.output.violencePredictorScore
      const ogp = listEntry.output.generalPredictorScore
      const rsr = listEntry.output.riskOfSeriousRecidivismScore
      const osp = listEntry.output.sexualPredictorScore

      if (ogrs3) {
        const entry: BadgeEntry = {
          ogrs3PredictorScore: {
            level: ogrs3.scoreLevel,
            score: ogrs3.twoYears,
            type: 'OGRS3',
            staticOrDynamic: null,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (ovp) {
        const entry: BadgeEntry = {
          ovpPredictorScore: {
            level: ovp.ovpRisk,
            score: ovp.twoYears,
            type: 'OVP',
            staticOrDynamic: null,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (ogp) {
        const entry: BadgeEntry = {
          ogpPredictorScore: {
            level: ogp.ogpRisk,
            score: ogp.ogp2Year,
            type: 'OGP',
            staticOrDynamic: null,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (rsr) {
        const entry: BadgeEntry = {
          rsrPredictorScore: {
            level: rsr.scoreLevel,
            score: rsr.percentageScore,
            type: 'RSR',
            staticOrDynamic: rsr.staticOrDynamic,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (osp) {
        const entry: BadgeEntry = {
          ospdcPredictorScore: {
            level: osp.ospIndecentScoreLevel,
            score: osp.ospIndecentPercentageScore,
            type: 'OSP/DC',
            staticOrDynamic: null,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (osp) {
        const entry: BadgeEntry = {
          ospiicPredictorScore: {
            level: osp.ospIndecentScoreLevel,
            score: osp.ospIndecentPercentageScore,
            type: 'OSP/IIC',
            staticOrDynamic: null,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }
    } else if (listEntry.outputVersion === '2') {
      const ogrs4 = listEntry.output.allReoffendingPredictor
      const ovp2 = listEntry.output.violentReoffendingPredictor
      const snsv = listEntry.output.seriousViolentReoffendingPredictor
      const ospdc = listEntry.output.directContactSexualReoffendingPredictor
      const ospiic = listEntry.output.indirectImageContactSexualReoffendingPredictor
      const rsr = listEntry.output.combinedSeriousReoffendingPredictor

      if (ogrs4) {
        const entry: BadgeEntry = {
          allReoffendingPredictor: {
            level: ogrs4.band,
            score: ogrs4.score,
            type: 'All reoffending predictor',
            staticOrDynamic: ogrs4.staticOrDynamic,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (ovp2) {
        const entry: BadgeEntry = {
          violentReoffendingPredictor: {
            level: ovp2.band,
            score: ovp2.score,
            type: 'Violent reoffending predictor',
            staticOrDynamic: ovp2.staticOrDynamic,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (snsv) {
        const entry: BadgeEntry = {
          seriousViolentReoffendingPredictor: {
            level: snsv.band,
            score: snsv.score,
            type: 'Serious violent reoffending predictor',
            staticOrDynamic: snsv.staticOrDynamic,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (ospdc) {
        const entry: BadgeEntry = {
          directContactSexualReoffendingPredictor: {
            level: ospdc.band,
            score: ospdc.score,
            type: 'Direct contact sexual reoffending predictor',
            staticOrDynamic: null,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (ospiic) {
        const entry: BadgeEntry = {
          indirectImageContactSexualReoffendingPredictor: {
            level: ospiic.band,
            score: ospiic.score,
            type: 'Indirect image contact sexual reoffending predictor',
            staticOrDynamic: null,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }

      if (rsr) {
        const entry: BadgeEntry = {
          combinedSeriousReoffendingPredictor: {
            level: rsr.band,
            score: rsr.score,
            type: 'Combined serious reoffending predictor',
            staticOrDynamic: rsr.staticOrDynamic,
            completedDate: listEntry.completedDate.toString(),
          },
        }
        badgeEntries.push(entry)
      }
    } else throw new Error('unexpected version')
  })

  return badgeEntries
}
