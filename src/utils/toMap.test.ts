import { toMap } from './toMap'
import { RiskLevelDto } from '../types/dtos/RiskLevelDto'

const mockRisk: Partial<Record<RiskLevelDto, string[]>> = {
  Low: ['Children'],
  Medium: ['Known Adult'],
  High: ['Public'],
  'Very High': ['Staff'],
}

const expected = {
  Children: 'Low',
  'Known Adult': 'Medium',
  Public: 'High',
  Staff: 'Very High',
}

describe('utils/toMap', () => {
  it('should return a mapped risk object', () => {
    expect(toMap(mockRisk)).toEqual(expected)
  })
})
