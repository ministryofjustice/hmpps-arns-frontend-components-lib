import { RestClient } from '@ministryofjustice/hmpps-rest-client'
import { SuppressingRestClient } from './SuppressingRestClient'

jest.mock('@ministryofjustice/hmpps-rest-client')

describe('NotFoundHandler', () => {
  let handler: SuppressingRestClient
  let mockedRestClient: jest.Mocked<RestClient>
  let mockedLogger: any

  beforeEach(() => {
    mockedRestClient = new RestClient('API', {} as any, null as any, null as any) as jest.Mocked<RestClient>
    mockedLogger = { debug: jest.fn() }

    handler = new SuppressingRestClient(mockedRestClient, mockedLogger)
  })

  it('should pass through successful responses', async () => {
    mockedRestClient.get.mockResolvedValue({ data: 'success' })

    const result = await handler.get('/test-path', 'authOptions')

    expect(result).toEqual({ data: 'success' })
    expect(mockedRestClient.get).toHaveBeenCalledWith(expect.objectContaining({ path: '/test-path' }), 'authOptions')
    expect(mockedLogger.debug).not.toHaveBeenCalled()
  })

  it('should suppress 404 errors and return null via the errorHandler', async () => {
    const notFoundResponse = { responseStatus: 404 }

    mockedRestClient.get.mockImplementation(async (req: any) => {
      return req.errorHandler('/test-path', 'GET', notFoundResponse)
    })

    const result = await handler.get('/test-path', 'authToken')

    expect(result).toBeNull()
    expect(mockedLogger.debug).toHaveBeenCalledWith('API returned 404 (Not Found) for GET: /test-path')
  })

  it('should rethrow non-404 errors via the errorHandler', async () => {
    const internalServerErrorResponse = { responseStatus: 500, message: 'Internal Server Error' }

    mockedRestClient.get.mockImplementation(async (req: any) => {
      return req.errorHandler('/test-path', 'GET', internalServerErrorResponse)
    })

    await expect(handler.get('/test-path', 'authToken')).rejects.toEqual(internalServerErrorResponse)
    expect(mockedLogger.debug).not.toHaveBeenCalled()
  })
})
