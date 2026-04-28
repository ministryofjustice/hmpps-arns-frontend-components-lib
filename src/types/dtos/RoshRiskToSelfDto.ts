import { RiskDto } from './RiskDto'

export interface RoshRiskToSelfDto {
  suicide?: RiskDto
  selfHarm?: RiskDto
  custody?: RiskDto
  hostelSetting?: RiskDto
  vulnerability?: RiskDto
  assessedOn?: string
}
