import { RiskLevelDto } from '../types/dtos/RiskLevelDto'

export const toMap = (partial: Partial<Record<RiskLevelDto, string[]>>): { [key: string]: string } => {
  const x: { [key: string]: string } = {}
  Object.entries(partial).forEach(item => {
    item[1].forEach(v => {
      // eslint-disable-next-line prefer-destructuring
      x[v] = item[0]
    })
  })
  return x
}
