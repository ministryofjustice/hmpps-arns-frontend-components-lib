import { AssessmentStatusDto } from './AssessmentStatusDto'
import { AllPredictorDto } from './AllPredictorDto'

export interface AllPredictorVersionedDto {
  completedDate: string
  status: `${AssessmentStatusDto}`
  outputVersion: string
  output?: AllPredictorDto
}
