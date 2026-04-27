import { RoshRiskToSelfDto } from './RoshRiskToSelfDto'
import { OtherRoshRisksDto } from './OtherRoshRisksDto'
import { RiskRoshSummaryDto } from './RiskRoshSummaryDto'

export interface AllRoshRiskDto {
  riskToSelf: RoshRiskToSelfDto
  otherRisks: OtherRoshRisksDto
  summary: RiskRoshSummaryDto
  assessedOn?: string
}
