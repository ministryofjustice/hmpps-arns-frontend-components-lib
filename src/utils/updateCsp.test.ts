import { type Response } from 'express'
import updateCsp from './updateCsp'

describe('updateCsp', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should add arns url to csp directives', () => {
    const res = {
      getHeaders: jest.fn().mockReturnValue({
        'content-security-policy':
          "default-src 'self';script-src 'self';style-src 'self';img-src 'self';font-src 'self'",
      }),
      set: jest.fn(),
    } as unknown as Response

    updateCsp(res)

    expect(res.set).toHaveBeenCalledWith(
      'content-security-policy',
      "default-src 'self';script-src 'self' http://arns;style-src 'self' http://arns;img-src 'self' http://arns;font-src 'self' http://arns",
    )
  })

  it('should add required directives that are not present', () => {
    const res = {
      getHeaders: jest.fn().mockReturnValue({
        'content-security-policy': "default-src 'self'",
      }),
      set: jest.fn(),
    } as unknown as Response

    updateCsp(res)

    expect(res.set).toHaveBeenCalledWith(
      'content-security-policy',
      "default-src 'self';script-src 'self' http://arns;style-src 'self' http://arns;img-src 'self' http://arns;font-src 'self' http://arns",
    )
  })

  it('should not change any with existing reference to arns', () => {
    const res = {
      getHeaders: jest.fn().mockReturnValue({
        'content-security-policy':
          "default-src 'self';script-src 'self' http://arns;style-src 'self' http://arns;img-src 'self' http://arns;font-src 'self'",
      }),
      set: jest.fn(),
    } as unknown as Response

    updateCsp(res)

    expect(res.set).toHaveBeenCalledWith(
      'content-security-policy',
      "default-src 'self';script-src 'self' http://arns;style-src 'self' http://arns;img-src 'self' http://arns;font-src 'self' http://arns",
    )
  })
})
