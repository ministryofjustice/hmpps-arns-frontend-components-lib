import { RoshRisk } from './RoshRisk'

export interface RoshAssessment {
  completedDate: string | null
  overallRisk: string | null
  risks: RoshRisk[]
}
