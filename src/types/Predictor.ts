export interface Predictor {
  name: string
  band?: string | null
  staticOrDynamic?: string | null
  score?: number | null
  completedDate?: string | null
}
