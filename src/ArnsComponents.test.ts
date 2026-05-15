import { AgentConfig } from '@ministryofjustice/hmpps-rest-client'
import ArnsComponents from './ArnsComponents'
import { SuppressingRestClient } from './SuppressingRestClient'
import { transformAllPredictorVersionedDtoToAssessments } from './transformers/AllPredictorVersionedDtoToAssessmentsTransformer'
import { transformAllRoshRiskDtoToRoshData } from './transformers/AllRoshRiskDtoToRoshDataTransformer'

jest.mock('@ministryofjustice/hmpps-rest-client')
jest.mock('./SuppressingRestClient')
jest.mock('./transformers/AllPredictorVersionedDtoToAssessmentsTransformer')
jest.mock('./transformers/AllRoshRiskDtoToRoshDataTransformer')

describe('ArnsComponents', () => {
  let arnsComponents: ArnsComponents
  const mockedRestClient = SuppressingRestClient as jest.MockedClass<typeof SuppressingRestClient>
  const mockedPredictorTransformer = transformAllPredictorVersionedDtoToAssessments as jest.MockedFunction<
    typeof transformAllPredictorVersionedDtoToAssessments
  >
  const mockedRoshTransformer = transformAllRoshRiskDtoToRoshData as jest.MockedFunction<
    typeof transformAllRoshRiskDtoToRoshData
  >

  const config = {
    url: 'http://localhost/arns-api',
    healthPath: '/health/ping',
    timeout: {
      response: 5000,
      deadline: 5000,
    },
    agent: new AgentConfig(5000),
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    arnsComponents = new ArnsComponents(null as any, config, null as any)
  })

  describe('getRiskData', () => {
    it('should return assessments and status 200 on success', async () => {
      const mockApiResponse = [{ status: 'COMPLETE', outputVersion: '1' }]
      const mockTransformedData = [{ outputVersion: '1' }] as any

      mockedRestClient.prototype.get.mockResolvedValue(mockApiResponse)
      mockedPredictorTransformer.mockReturnValue(mockTransformedData)

      const result = await arnsComponents.getRiskData('authToken', 'CRN', 'X123456')

      expect(result).toEqual({
        assessments: mockTransformedData,
        httpStatus: 200,
      })
      expect(mockedRestClient.prototype.get).toHaveBeenCalledWith('/risks/predictors/all/CRN/X123456', 'authToken')
    })

    it('should return empty assessments list with 404 httpStatus when the handler returns null', async () => {
      mockedRestClient.prototype.get.mockResolvedValue(null)

      const result = await arnsComponents.getRiskData('authToken', 'CRN', 'X123456')

      expect(result).toEqual({
        assessments: [],
        httpStatus: 404,
      })
    })

    it('should return status from error object when the API fails', async () => {
      const error = { status: 401, message: 'Unauthorized' }
      mockedRestClient.prototype.get.mockRejectedValue(error)

      const result = await arnsComponents.getRiskData('authToken', 'CRN', 'X123456')

      expect(result).toEqual({
        assessments: [],
        httpStatus: 401,
      })
    })

    it('should return status 500 if the error object has no status', async () => {
      const error = { message: 'Network Failure' }
      mockedRestClient.prototype.get.mockRejectedValue(error)

      const result = await arnsComponents.getRiskData('authToken', 'CRN', 'X123456')

      expect(result).toEqual({
        assessments: [],
        httpStatus: 500,
      })
    })
  })

  describe('getRoshData', () => {
    it('should return a transformed ROSH assessment and status 200 on success', async () => {
      const mockApiResponse = { summary: { overallRiskLevel: 'High' } }
      const mockTransformedData = { overallRisk: 'HIGH', risks: [] } as any

      mockedRestClient.prototype.get.mockResolvedValue(mockApiResponse)
      mockedRoshTransformer.mockReturnValue(mockTransformedData)

      const result = await arnsComponents.getRoshData('authToken', 'X123456')

      expect(result).toEqual({
        assessment: mockTransformedData,
        httpStatus: 200,
      })
      expect(mockedRestClient.prototype.get).toHaveBeenCalledWith('/risks/crn/X123456', 'authToken')
      expect(mockedRoshTransformer).toHaveBeenCalledWith(mockApiResponse)
    })

    it('should return null assessment with 404 httpStatus when the handler returns null', async () => {
      mockedRestClient.prototype.get.mockResolvedValue(null)

      const result = await arnsComponents.getRoshData('authToken', 'X123456')

      expect(result).toEqual({
        assessment: null,
        httpStatus: 404,
      })
      expect(mockedRoshTransformer).not.toHaveBeenCalled()
    })

    it('should return status from error object when the API fails', async () => {
      const error = { status: 401, message: 'Unauthorized' }
      mockedRestClient.prototype.get.mockRejectedValue(error)

      const result = await arnsComponents.getRoshData('authToken', 'X123456')

      expect(result).toEqual({
        assessment: null,
        httpStatus: 401,
      })
      expect(mockedRoshTransformer).not.toHaveBeenCalled()
    })

    it('should return status 500 if the error object has no status', async () => {
      const error = { message: 'Network Failure' }
      mockedRestClient.prototype.get.mockRejectedValue(error)

      const result = await arnsComponents.getRoshData('authToken', 'X123456')

      expect(result).toEqual({
        assessment: null,
        httpStatus: 500,
      })
      expect(mockedRoshTransformer).not.toHaveBeenCalled()
    })
  })
})
