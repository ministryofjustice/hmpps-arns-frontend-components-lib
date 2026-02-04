import { Predictor } from './Predictor'

export interface AssessmentV1 {
  outputVersion: '1'
  completedDateTime: string
  ogrs3?: Predictor
  ovp?: Predictor
  ogp?: Predictor
  rsr: Predictor
  ospdc: Predictor
  ospiic: Predictor
}
