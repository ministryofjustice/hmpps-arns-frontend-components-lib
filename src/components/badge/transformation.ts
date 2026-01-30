import { AllPredictorVersionedDto } from '../../types/dtos/allPredictorVersionedDto'
import { BadgeEntry } from '../../types/badgeData'

export function transformBadgeData(dto: AllPredictorVersionedDto[]): BadgeEntry[] {
  const badgeEntries: BadgeEntry[] = []

  const latestEntry = dto.reduce((latest, current) => (current.completedDate > latest.completedDate ? current : latest))

  if (latestEntry.outputVersion === '1') {
    // OGRS3-gen
    const ogrs3 = latestEntry.output.groupReconvictionScore
    const ovp = latestEntry.output.violencePredictorScore
    const ogp = latestEntry.output.generalPredictorScore
    const rsr = latestEntry.output.riskOfSeriousRecidivismScore
    const osp = latestEntry.output.sexualPredictorScore

    if (ogrs3) {
      const entry: BadgeEntry = {
        ogrs3PredictorScore: {
          level: ogrs3.scoreLevel,
          score: ogrs3.twoYears,
          type: 'OGRS3',
          staticOrDynamic: null,
          completedDate: latestEntry.completedDate.toString(),
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
          completedDate: latestEntry.completedDate.toString(),
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
          completedDate: latestEntry.completedDate.toString(),
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
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }

    if (osp) {
      const entry: BadgeEntry = {
        ospdcPredictorScore: {
          level: osp.ospContactScoreLevel,
          score: osp.ospContactPercentageScore,
          type: 'OSP/DC',
          staticOrDynamic: null,
          completedDate: latestEntry.completedDate.toString(),
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
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }
  } else if (latestEntry.outputVersion === '2') {
    // OGRS4-gen
    const arp = latestEntry.output.allReoffendingPredictor
    const vrp = latestEntry.output.violentReoffendingPredictor
    const svrp = latestEntry.output.seriousViolentReoffendingPredictor
    const dcsrp = latestEntry.output.directContactSexualReoffendingPredictor
    const iicsrp = latestEntry.output.indirectImageContactSexualReoffendingPredictor
    const csrp = latestEntry.output.combinedSeriousReoffendingPredictor

    if (arp) {
      const entry: BadgeEntry = {
        allReoffendingPredictor: {
          level: arp.band,
          score: arp.score,
          type: 'ARP',
          staticOrDynamic: arp.staticOrDynamic,
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }

    if (vrp) {
      const entry: BadgeEntry = {
        violentReoffendingPredictor: {
          level: vrp.band,
          score: vrp.score,
          type: 'VRP',
          staticOrDynamic: vrp.staticOrDynamic,
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }

    if (svrp) {
      const entry: BadgeEntry = {
        seriousViolentReoffendingPredictor: {
          level: svrp.band,
          score: svrp.score,
          type: 'SVRP',
          staticOrDynamic: svrp.staticOrDynamic,
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }

    if (dcsrp) {
      const entry: BadgeEntry = {
        directContactSexualReoffendingPredictor: {
          level: dcsrp.band,
          score: dcsrp.score,
          type: 'DC/SRP',
          staticOrDynamic: null,
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }

    if (iicsrp) {
      const entry: BadgeEntry = {
        indirectImageContactSexualReoffendingPredictor: {
          level: iicsrp.band,
          score: iicsrp.score,
          type: 'IIC/SRP',
          staticOrDynamic: null,
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }

    if (csrp) {
      const entry: BadgeEntry = {
        combinedSeriousReoffendingPredictor: {
          level: csrp.band,
          score: csrp.score,
          type: 'CSRP',
          staticOrDynamic: csrp.staticOrDynamic,
          completedDate: latestEntry.completedDate.toString(),
        },
      }
      badgeEntries.push(entry)
    }
  } else throw new Error('unexpected version')

  return badgeEntries
}
