import { ResponseDto } from './ResponseDto'

export interface RiskDto {
  risk?: `${ResponseDto}`
  previous?: `${ResponseDto}`
  previousConcernsText?: string
  current?: `${ResponseDto}`
  currentConcernsText?: string
}
