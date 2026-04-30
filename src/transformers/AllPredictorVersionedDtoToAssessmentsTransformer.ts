import { AllPredictorVersionedDto } from '../types/dtos/AllPredictorVersionedDto'
import { Assessments } from '../types/Assessments'
import { Predictor } from '../types/Predictor'
import { AssessmentType } from '../types/dtos/AssessmentType'

export function transformAllPredictorVersionedDtoToAssessments(dtos: AllPredictorVersionedDto[]): Assessments[] {
  // Sort DTOs by datetime (newest first)
  const sortedDtos: AllPredictorVersionedDto[] = [...dtos].sort(
    (a: AllPredictorVersionedDto, b: AllPredictorVersionedDto) => {
      return new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime()
    },
  )

  return sortedDtos.map(dto => {
    let dateFormatDayMonthYearTime: string | null
    let dateFormatDayMonthYear: string | null
    const date = new Date(dto.completedDate)
    if (!Number.isNaN(date.getTime())) {
      dateFormatDayMonthYear = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date)
      const time: string = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      dateFormatDayMonthYearTime = `${dateFormatDayMonthYear} at ${time}`
    } else {
      dateFormatDayMonthYear = null
      dateFormatDayMonthYearTime = null
    }

    const { output } = dto

    if (output && dto.outputVersion === '1') {
      return {
        outputVersion: '1',
        completedDate: dateFormatDayMonthYear,
        completedDateTime: dateFormatDayMonthYearTime,
        assessmentType: convertAssessmentType(dto.assessmentType),
        ogrs3: mapPredictor(
          'OGRS',
          output.groupReconvictionScore?.scoreLevel,
          null,
          output.groupReconvictionScore?.twoYears,
          dateFormatDayMonthYear,
        ),
        ovp: mapPredictor(
          'OVP',
          output.violencePredictorScore?.ovpRisk,
          null,
          output.violencePredictorScore?.twoYears,
          dateFormatDayMonthYear,
        ),
        ogp: mapPredictor(
          'OGP',
          output.generalPredictorScore?.ogpRisk,
          null,
          output.generalPredictorScore?.ogp2Year,
          dateFormatDayMonthYear,
        ),
        rsr: mapPredictor(
          'RSR',
          output.riskOfSeriousRecidivismScore?.scoreLevel,
          output.riskOfSeriousRecidivismScore?.staticOrDynamic,
          output.riskOfSeriousRecidivismScore?.percentageScore,
          dateFormatDayMonthYear,
        ),
        ospdc: mapPredictor(
          'OSP\u2013DC',
          output.sexualPredictorScore?.ospContactScoreLevel,
          null,
          output.sexualPredictorScore?.ospContactPercentageScore,
          dateFormatDayMonthYear,
        ),
        ospiic: mapPredictor(
          'OSP\u2013IIC',
          output.sexualPredictorScore?.ospIndecentScoreLevel,
          null,
          output.sexualPredictorScore?.ospIndecentPercentageScore,
          dateFormatDayMonthYear,
        ),
      }
    }

    if (output && dto.outputVersion === '2') {
      return {
        outputVersion: '2',
        completedDate: dateFormatDayMonthYear,
        completedDateTime: dateFormatDayMonthYearTime,
        assessmentType: convertAssessmentType(dto.assessmentType),
        allReoffendingPredictor: mapPredictor(
          'All reoffending predictor',
          output.allReoffendingPredictor?.band,
          output.allReoffendingPredictor?.staticOrDynamic,
          output.allReoffendingPredictor?.score,
          dateFormatDayMonthYear,
        ),
        violentReoffendingPredictor: mapPredictor(
          'Violent reoffending predictor',
          output.violentReoffendingPredictor?.band,
          output.violentReoffendingPredictor?.staticOrDynamic,
          output.violentReoffendingPredictor?.score,
          dateFormatDayMonthYear,
        ),
        seriousViolentReoffendingPredictor: mapPredictor(
          'Serious violent reoffending predictor',
          output.seriousViolentReoffendingPredictor?.band,
          output.seriousViolentReoffendingPredictor?.staticOrDynamic,
          output.seriousViolentReoffendingPredictor?.score,
          dateFormatDayMonthYear,
        ),
        directContactSexualReoffendingPredictor: mapPredictor(
          'Direct contact \u2013 sexual reoffending predictor',
          output.directContactSexualReoffendingPredictor?.band,
          null,
          output.directContactSexualReoffendingPredictor?.score,
          dateFormatDayMonthYear,
        ),
        indirectImageContactSexualReoffendingPredictor: mapPredictor(
          'Images and indirect contact \u2013 sexual reoffending predictor',
          output.indirectImageContactSexualReoffendingPredictor?.band,
          null,
          output.indirectImageContactSexualReoffendingPredictor?.score,
          dateFormatDayMonthYear,
        ),
        combinedSeriousReoffendingPredictor: mapPredictor(
          'Combined serious reoffending predictor',
          output.combinedSeriousReoffendingPredictor?.band,
          output.combinedSeriousReoffendingPredictor?.staticOrDynamic,
          output.combinedSeriousReoffendingPredictor?.score,
          dateFormatDayMonthYear,
        ),
      }
    }

    throw new Error(`Unsupported output version: ${dto.outputVersion}`)
  })
}

function mapPredictor(
  name: string,
  band: string | null | undefined,
  staticOrDynamic: string | null | undefined,
  score: number | null | undefined,
  date: string | null | undefined,
): Predictor {
  return {
    name,
    // Use optional chaining and fallback to null
    band: band ? band.replace(/_/g, ' ').toUpperCase() : null,
    staticOrDynamic: staticOrDynamic
      ? staticOrDynamic.charAt(0).toUpperCase() + staticOrDynamic.slice(1).toLowerCase()
      : null,
    score: score ?? null, // Fallback to null if score is missing
    completedDate: date ?? null,
  }
}

function convertAssessmentType(assessmentType: `${AssessmentType}`): string {
  switch (assessmentType) {
    case 'LAYER1':
      return 'layer 1'
    case 'LAYER3':
      return 'layer 3'
    default:
      return assessmentType
  }
}
