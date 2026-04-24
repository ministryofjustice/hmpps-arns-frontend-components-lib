import { AllRoshRiskDto } from '../types/dtos/AllRoshRiskDto'
import { RoshAssessment } from '../types/RoshAssessment'
import { toMap } from '../utils/toMap'

export function transformAllRoshRiskDtoToRoshData(dto: AllRoshRiskDto): RoshAssessment {
  let dateFormatDayMonthYear: string
  if (dto.summary?.assessedOn) {
    const date = new Date(dto.summary?.assessedOn)
    if (!Number.isNaN(date.getTime())) {
      dateFormatDayMonthYear = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(date)
    }
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

  return { completedDate: dateFormatDayMonthYear, overallRisk: dto.summary?.overallRiskLevel.toUpperCase(), risks }
}
