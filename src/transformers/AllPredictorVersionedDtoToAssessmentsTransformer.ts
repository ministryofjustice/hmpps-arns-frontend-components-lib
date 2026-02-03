import { AllPredictorVersionedDto } from '../types/dtos/AllPredictorVersionedDto'
import { Assessments } from '../types/Assessments'
import { Predictor } from '../types/Predictor'

export function transformAllPredictorVersionedDtoToAssessments(dtos: AllPredictorVersionedDto[]): Assessments[] {

  // Sort DTOs by datetime (newest first)
  const sortedDtos = [...dtos].sort((a, b) => {
    return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime();
  });

  return sortedDtos.map(dto => {
    const completedDate = dto.completedDate.toString()
    const date = new Date(completedDate)
    const dateFormatDayMonthYear = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date)
    const time = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    const dateFormatDayMonthYearTime = `${dateFormatDayMonthYear} at ${time}`

    const output = dto.output

    if (dto.outputVersion === '1') {
      return {
        outputVersion: '1',
        completedDateTime: dateFormatDayMonthYearTime,
        ogrs3PredictorScore: mapPredictor('OGRS', output.groupReconvictionScore.scoreLevel, null, output.groupReconvictionScore.twoYears, dateFormatDayMonthYear),
        ovpPredictorScore: mapPredictor('OVP', output.violencePredictorScore.ovpRisk, null, output.violencePredictorScore.twoYears, dateFormatDayMonthYear),
        ogpPredictorScore: mapPredictor('OGP', output.generalPredictorScore.ogpRisk, null, output.generalPredictorScore.ogp2Year, dateFormatDayMonthYear),
        rsrPredictorScore: mapPredictor('RSR', output.riskOfSeriousRecidivismScore.scoreLevel, output.riskOfSeriousRecidivismScore.staticOrDynamic, output.riskOfSeriousRecidivismScore.percentageScore, dateFormatDayMonthYear),
        ospdcPredictorScore: mapPredictor('OSP-DC', output.sexualPredictorScore.ospContactScoreLevel, null, output.sexualPredictorScore.ospContactPercentageScore, dateFormatDayMonthYear),
        ospiicPredictorScore: mapPredictor('OSP-IIC', output.sexualPredictorScore.ospIndecentScoreLevel, null, output.sexualPredictorScore.ospIndecentPercentageScore, dateFormatDayMonthYear),
      }
    }

    if (dto.outputVersion === '2') {
      return {
        outputVersion: '2',
        completedDateTime: dateFormatDayMonthYearTime,
        allReoffendingPredictor: mapPredictor('All Reoffending Predictor', output.allReoffendingPredictor.band, output.allReoffendingPredictor.staticOrDynamic, output.allReoffendingPredictor.score, dateFormatDayMonthYear),
        violentReoffendingPredictor: mapPredictor('Violent Reoffending Predictor', output.violentReoffendingPredictor.band, output.violentReoffendingPredictor.staticOrDynamic, output.violentReoffendingPredictor.score, dateFormatDayMonthYear),
        seriousViolentReoffendingPredictor: mapPredictor('Serious Violent Reoffending Predictor', output.seriousViolentReoffendingPredictor.band, output.seriousViolentReoffendingPredictor.staticOrDynamic, output.seriousViolentReoffendingPredictor.score, dateFormatDayMonthYear),
        directContactSexualReoffendingPredictor: mapPredictor('Direct Contact - Sexual Reoffending Predictor', output.directContactSexualReoffendingPredictor.band, null, output.directContactSexualReoffendingPredictor.score, dateFormatDayMonthYear),
        indirectImageContactSexualReoffendingPredictor: mapPredictor('Images and Indirect Contact – Sexual Reoffending Predictor', output.indirectImageContactSexualReoffendingPredictor.band, null, output.indirectImageContactSexualReoffendingPredictor.score, dateFormatDayMonthYear),
        combinedSeriousReoffendingPredictor: mapPredictor('Combined Serious Reoffending Predictor', output.combinedSeriousReoffendingPredictor.band, output.combinedSeriousReoffendingPredictor.staticOrDynamic, output.combinedSeriousReoffendingPredictor.score, dateFormatDayMonthYear),
      }
    }

    throw new Error(`Unsupported output version: ${dto.outputVersion}`)
  })
}

function mapPredictor(name: string, band: string, staticOrDynamic: string, score: number, date: string): Predictor {
  return {
    name: name,
    band: band.replace(/_/g, ' ').toUpperCase(),
    staticOrDynamic: staticOrDynamic
      ? staticOrDynamic.charAt(0).toUpperCase() + staticOrDynamic.slice(1).toLowerCase()
      : null,
    score: score,
    completedDate: date,
  }
}
