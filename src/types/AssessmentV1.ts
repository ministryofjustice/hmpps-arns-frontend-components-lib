import { Predictor } from './Predictor'

export interface AssessmentV1 {
  outputVersion: '1'
  completedDateTime: string
  ogrs3PredictorScore?: Predictor
  ovpPredictorScore?: Predictor
  ogpPredictorScore?: Predictor
  rsrPredictorScore: Predictor
  ospdcPredictorScore: Predictor
  ospiicPredictorScore: Predictor
}
