import { AllRoshRiskDto } from '../types/dtos/AllRoshRiskDto'
import { RoshAssessment } from '../types/RoshAssessment'
import { toMap } from '../utils/toMap'

export function transformAllRoshRiskDtoToRoshData(dto: AllRoshRiskDto): RoshAssessment {
  let dateFormatDayMonthYear: string | null
  if (dto.summary?.assessedOn) {
    const date = new Date(dto.summary?.assessedOn)
    dateFormatDayMonthYear = !Number.isNaN(date.getTime())
      ? new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(date)
      : null
  } else {
    dateFormatDayMonthYear = null
  }

  const riskInCommunity = dto.summary?.riskInCommunity ? toMap(dto.summary.riskInCommunity) : {}
  const riskInCustody = dto.summary?.riskInCustody ? toMap(dto.summary.riskInCustody) : {}

  const risks = Array.from(new Set([...Object.keys(riskInCommunity), ...Object.keys(riskInCustody)])).map(key => {
    return {
      riskTo: key,
      community: riskInCommunity[key]?.toUpperCase() || 'N/A',
      custody: riskInCustody[key]?.toUpperCase() || 'N/A',
    }
  })

  const getOverallRisk = dto.summary?.overallRiskLevel ? dto.summary?.overallRiskLevel.toUpperCase() : null

  return {
    completedDate: dateFormatDayMonthYear,
    overallRisk: getOverallRisk,
    risks,
  }
}
