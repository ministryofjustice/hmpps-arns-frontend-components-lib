import { AssessmentStatusDto } from './assessmentStatusDto'
import { AllPredictorDto } from './allPredictorDto'

export interface AllPredictorVersionedDto {
  completedDate: string
  status: `${AssessmentStatusDto}`
  outputVersion: string
  output?: AllPredictorDto
}
