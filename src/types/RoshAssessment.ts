import { RoshRisk } from './RoshRisk'

export interface RoshAssessment {
  completedDate: string
  overallRisk: string
  risks: RoshRisk[]
}
