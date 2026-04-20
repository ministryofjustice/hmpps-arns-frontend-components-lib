import { AssessmentStatusDto } from './AssessmentStatusDto'
import { AllPredictorDto } from './AllPredictorDto'
import { AssessmentType } from './AssessmentType'

export interface AllPredictorVersionedDto {
  completedDate: string
  status: `${AssessmentStatusDto}`
  assessmentType: `${AssessmentType}`
  outputVersion: string
  output?: AllPredictorDto
}
