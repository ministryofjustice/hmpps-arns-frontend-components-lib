import { toMap } from '../utils/toMap'
import { transformAllRoshRiskDtoToRoshData } from './AllRoshRiskDtoToRoshDataTransformer'
import { AllRoshRiskDto } from '../types/dtos/AllRoshRiskDto'

jest.mock('../utils/toMap')
const mockedToMap = toMap as jest.MockedFunction<typeof toMap>

describe('transformAllRoshRiskDtoToRoshData', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle an empty DTO where summary is undefined', () => {
    const dto = {} as AllRoshRiskDto

    const result = transformAllRoshRiskDtoToRoshData(dto)

    expect(result).toEqual({
      completedDate: undefined,
      overallRisk: undefined,
      risks: [],
    })
    expect(mockedToMap).not.toHaveBeenCalled()
  })

  it('should transform data correctly when both community and custody risks exist', () => {
    const dto = {
      summary: {
        assessedOn: '2023-10-24T10:00:00Z',
        overallRiskLevel: 'High',
        riskInCommunity: {
          Low: ['Children'],
          Medium: ['Public'],
          High: ['Known Adult'],
        },
        riskInCustody: {
          Low: ['Public'],
          Medium: ['Prisoners'],
          High: ['Known Adult'],
          'Very High': ['Staff'],
        },
      },
    } as unknown as AllRoshRiskDto

    mockedToMap.mockImplementation(data => {
      if (data === dto.summary?.riskInCommunity) {
        return { Children: 'Low', Public: 'Medium', 'Known Adult': 'High' }
      }
      if (data === dto.summary?.riskInCustody) {
        return { Public: 'Low', 'Known Adult': 'High', Staff: 'Very High', Prisoners: 'Medium' }
      }
      return {}
    })

    const result = transformAllRoshRiskDtoToRoshData(dto)

    expect(mockedToMap).toHaveBeenCalledTimes(2)
    expect(result).toEqual({
      completedDate: '24 October 2023',
      overallRisk: 'HIGH',
      risks: [
        { riskTo: 'Children', community: 'LOW', custody: 'N/A' },
        { riskTo: 'Public', community: 'MEDIUM', custody: 'LOW' },
        { riskTo: 'Known Adult', community: 'HIGH', custody: 'HIGH' },
        { riskTo: 'Staff', community: 'N/A', custody: 'VERY HIGH' },
        { riskTo: 'Prisoners', community: 'N/A', custody: 'MEDIUM' },
      ],
    })
  })

  it('should transform data correctly when only riskInCommunity exists', () => {
    const dto = {
      summary: {
        assessedOn: '2023-10-24T10:00:00Z',
        overallRiskLevel: 'Medium',
        riskInCommunity: {
          Medium: ['Public'],
        },
      },
    } as unknown as AllRoshRiskDto

    mockedToMap.mockImplementation(() => ({ Public: 'Medium' }))

    const result = transformAllRoshRiskDtoToRoshData(dto)

    expect(mockedToMap).toHaveBeenCalledTimes(1)
    expect(mockedToMap).toHaveBeenCalledWith(dto.summary?.riskInCommunity)
    expect(result).toEqual({
      completedDate: '24 October 2023',
      overallRisk: 'MEDIUM',
      risks: [{ riskTo: 'Public', community: 'MEDIUM', custody: 'N/A' }],
    })
  })

  it('should transform data correctly when only riskInCustody exists', () => {
    const dto = {
      summary: {
        assessedOn: '2023-10-24T10:00:00Z',
        overallRiskLevel: 'Low',
        riskInCustody: {
          Low: ['Prisoners'],
        },
      },
    } as unknown as AllRoshRiskDto

    mockedToMap.mockImplementation(() => ({ Prisoners: 'Low' }))

    const result = transformAllRoshRiskDtoToRoshData(dto)

    expect(mockedToMap).toHaveBeenCalledTimes(1)
    expect(mockedToMap).toHaveBeenCalledWith(dto.summary?.riskInCustody)
    expect(result).toEqual({
      completedDate: '24 October 2023',
      overallRisk: 'LOW',
      risks: [{ riskTo: 'Prisoners', community: 'N/A', custody: 'LOW' }],
    })
  })
})
