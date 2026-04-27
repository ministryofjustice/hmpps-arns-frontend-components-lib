import { RiskLevelDto } from './RiskLevelDto'

export interface RiskRoshSummaryDto {
  whoIsAtRisk?: string
  natureOfRisk?: string
  riskImminence?: string
  riskIncreaseFactors?: string
  riskMitigationFactors?: string
  analysisOfRiskFactors?: string
  riskInCommunity?: Partial<Record<RiskLevelDto, string[]>>
  riskInCustody?: Partial<Record<RiskLevelDto, string[]>>
  assessedOn?: string
  overallRiskLevel?: `${RiskLevelDto}`
}
