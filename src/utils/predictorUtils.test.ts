import {
  convertScoreToScaleMarkerPosition,
  convertBandToScaleMarkerPosition,
  Band,
  containsCompletedAssessment,
  isBefore,
  probabilityStatement,
} from './predictorUtils'
import { RiskData } from '../types/RiskData'

describe('predictorUtils', () => {
  describe('convertScoreToScalePosition', () => {
    it.each([
      [13, [], 'Thresholds must contain at least two values'],
      [78, [0], 'Thresholds must contain at least two values'],
      [9, [17, 51, 100], 'The lowest threshold must be 0'],
      [0, ['NaN'], 'Invalid threshold value: NaN'],
    ])(
      'Error cases - convertScoreToScaleMarkerPosition(%s, %s) - %s',
      (score: number, thresholds: (number | string)[], errorMessage: string) => {
        expect(() => {
          convertScoreToScaleMarkerPosition(score, thresholds)
        }).toThrow(Error(errorMessage))
      },
    )

    it.each([
      [60, ['0%', '30%', '60%', '80%', '100%'], '50.00'],
      [6.9, ['0%', '1%', '3%', '6.9%', '25%+'], '75.00'],
      [25, ['0d%', '2bx5%@', '50%_', '7}5%', '100%()'], '25.00'],
    ])(
      'Sanitise & parse threshold strings - convertScoreToScalePosition(%s, %s) -> %s',
      (score: number, thresholds: string[], expectedPosition: string) => {
        expect(convertScoreToScaleMarkerPosition(score, thresholds)).toBe(expectedPosition)
      },
    )

    it.each([
      [0, [0, 100], '0.00'],
      [73, [0, 100], '73.00'],
      [0, [0, 25, 50, 75, 100], '0.00'],
      [10, [0, 25, 50, 75, 100], '10.00'],
      [10.72, [0, 25, 50, 75, 100], '10.72'],
      [25, [0, 25, 50, 75, 100], '25.00'],
      [33.376, [0, 25, 50, 75, 100], '33.38'],
      [50, [0, 25, 50, 75, 100], '50.00'],
      [50.1, [0, 25, 50, 75, 100], '50.10'],
      [75, [0, 25, 50, 75, 100], '75.00'],
      [88.12, [0, 25, 50, 75, 100], '88.12'],
      [100, [0, 25, 50, 75, 100], '100.00'],
      [134, [0, 25, 50, 75, 100], '100.00'],
      [0, [0, 10, 20, 81, 100], '0.00'],
      [10, [0, 10, 20, 81, 100], '25.00'],
      [10.72, [0, 10, 20, 81, 100], '26.80'],
      [25, [0, 10, 20, 81, 100], '52.05'],
      [33.376, [0, 10, 20, 81, 100], '55.48'],
      [50, [0, 10, 20, 81, 100], '62.30'],
      [50.1, [0, 10, 20, 81, 100], '62.34'],
      [75, [0, 10, 20, 81, 100], '72.54'],
      [88.12, [0, 10, 20, 81, 100], '84.37'],
      [100, [0, 10, 20, 81, 100], '100.00'],
      [134, [0, 10, 20, 81, 100], '100.00'],
      [0, [0, 33, 66, 100], '0.00'],
      [10, [0, 33, 66, 100], '10.10'],
      [10.72, [0, 33, 66, 100], '10.83'],
      [25, [0, 33, 66, 100], '25.25'],
      [33.376, [0, 33, 66, 100], '33.71'],
      [50, [0, 33, 66, 100], '50.51'],
      [50.1, [0, 33, 66, 100], '50.61'],
      [75, [0, 33, 66, 100], '75.49'],
      [88.12, [0, 33, 66, 1000], '67.46'],
      [100, [0, 33, 66, 100], '100.00'],
      [134, [0, 33, 66, 100], '100.00'],
      [0, [0, 10, 25, 80], '0.00'],
      [10, [0, 10, 25, 80], '33.33'],
      [10.72, [0, 10, 25, 80], '34.93'],
      [25, [0, 10, 25, 80], '66.67'],
      [33.376, [0, 10, 25, 80], '71.74'],
      [50, [0, 10, 25, 80], '81.82'],
      [50.1, [0, 10, 25, 80], '81.88'],
      [75, [0, 10, 25, 80], '96.97'],
      [88.12, [0, 10, 25, 80], '100.00'],
      [100, [0, 10, 25, 80], '100.00'],
      [134, [0, 10, 25, 80], '100.00'],
    ])(
      'Happy path cases - convertScoreToScalePosition(%s, %s) -> %s',
      (score: number, thresholds: number[], expectedPosition: string) => {
        expect(convertScoreToScaleMarkerPosition(score, thresholds)).toBe(expectedPosition)
      },
    )
  })

  describe('convertBandToScaleMarkerPosition', () => {
    it.each([['VERY HIGH', false, 'Band cannot be set to VERY HIGH if hasVeryHighBand=false']])(
      'Error cases - convertBandToScaleMarkerPosition(%s, %s) - %s',
      (band: string, hasVeryHighBand: boolean, errorMessage: string) => {
        expect(() => {
          convertBandToScaleMarkerPosition(band as Band, hasVeryHighBand)
        }).toThrow(Error(errorMessage))
      },
    )

    it.each([
      ['LOW', false, 16.66],
      ['LOW', true, 12.5],
      ['MEDIUM', false, 50],
      ['MEDIUM', true, 37.5],
      ['HIGH', false, 83.33],
      ['HIGH', true, 62.5],
      ['VERY HIGH', true, 87.5],
    ])(
      'Happy path cases - convertBandToScaleMarkerPosition(%s, %s) -> %s',
      (band: string, includeVeryHigh: boolean, expectedPosition: number) => {
        expect(convertBandToScaleMarkerPosition(band as Band, includeVeryHigh)).toBe(expectedPosition)
      },
    )
  })

  describe('containsCompletedAssessment', () => {
    it('should return true when httpStatus is 200 and assessments exist', () => {
      const data: RiskData = {
        httpStatus: 200,
        assessments: [
          {
            outputVersion: '2',
            completedDate: '01 January 2026',
            completedDateTime: '01 January 2026 at 12:00',
            assessmentType: 'layer 3',
          },
        ],
      }
      expect(containsCompletedAssessment(data)).toBe(true)
    })

    it('should return false when httpStatus is not 200', () => {
      const data: RiskData = {
        httpStatus: 404,
        assessments: [
          {
            outputVersion: '2',
            completedDate: '01 January 2026',
            completedDateTime: '01 January 2026 at 12:00',
            assessmentType: 'layer 3',
          },
        ],
      }
      expect(containsCompletedAssessment(data)).toBe(false)
    })

    it('should return false when assessments array is empty', () => {
      const data: RiskData = {
        httpStatus: 200,
        assessments: [],
      }
      expect(containsCompletedAssessment(data)).toBe(false)
    })

    it('should return false when data is null or undefined', () => {
      expect(containsCompletedAssessment(null)).toBe(false)
      expect(containsCompletedAssessment(undefined)).toBe(false)
    })

    it('should return false if httpStatus property is null', () => {
      const data: RiskData = {
        httpStatus: null,
        assessments: [
          {
            outputVersion: '2',
            completedDate: '01 January 2026',
            completedDateTime: '01 January 2026 at 12:00',
            assessmentType: 'layer 3',
          },
        ],
      }
      expect(containsCompletedAssessment(data)).toBe(false)
    })

    it('should return false if assessments property is null', () => {
      const data: RiskData = { httpStatus: 200, assessments: null }
      expect(containsCompletedAssessment(data)).toBe(false)
    })
  })
})

describe('isBefore', () => {
  it('should return true when the first date is chronologically before the target date', () => {
    const date = '23 February 2026 at 09:00'
    const target = '23 February 2026 at 10:00'
    expect(isBefore(date, target)).toBe(true)
  })

  it('should return false when the first date is chronologically after the target date', () => {
    const date = '24 February 2026 at 09:00'
    const target = '23 February 2026 at 09:00'
    expect(isBefore(date, target)).toBe(false)
  })

  it('should return false if the dates are identical', () => {
    const date = '23 February 2026 at 09:00'
    expect(isBefore(date, date)).toBe(false)
  })
})

describe('probabilityStatement', () => {
  const cases: [number, string][] = [
    // Guardrails
    [0, 'Less than 1 in 100 people (0%)'],
    [0.99, 'Less than 1 in 100 people (0.99%)'],
    [1, '1 in 100 people (1%)'],
    [99, '99 in 100 people (99%)'],
    [99.01, 'More than 99 in 100 people (99.01%)'],

    // 1.01% to 19.99%
    [1.01, 'About 1 in 100 people (1.01%)'],
    [1.49, 'About 1 in 100 people (1.49%)'],
    [1.5, 'About 1 in 50 people (1.5%)'],
    [2.0, '1 in 50 people (2%)'],
    [2.5, 'About 1 in 50 people (2.5%)'],
    [2.51, 'About 3 in 100 people (2.51%)'],
    [3.0, '3 in 100 people (3%)'],
    [3.5, 'About 1 in 25 people (3.5%)'],
    [4.0, '1 in 25 people (4%)'],
    [4.5, 'About 1 in 20 people (4.5%)'],
    [5.0, '1 in 20 people (5%)'],
    [5.5, 'About 1 in 20 people (5.5%)'],
    [5.51, 'About 3 in 50 people (5.51%)'],
    [6.0, '3 in 50 people (6%)'],
    [6.99, 'About 7 in 100 people (6.99%)'],
    [7.0, '7 in 100 people (7%)'],
    [7.5, 'About 2 in 25 people (7.5%)'],
    [8.0, '2 in 25 people (8%)'],
    [8.99, 'About 9 in 100 people (8.99%)'],
    [9.0, '9 in 100 people (9%)'],
    [9.5, 'About 1 in 10 people (9.5%)'],
    [10.0, '1 in 10 people (10%)'],
    [10.99, 'About 11 in 100 people (10.99%)'],
    [11.0, '11 in 100 people (11%)'],
    [11.99, 'About 3 in 25 people (11.99%)'],
    [12.0, '3 in 25 people (12%)'],
    [12.25, 'About 1 in 8 people (12.25%)'],
    [12.5, '1 in 8 people (12.5%)'],
    [12.99, 'About 13 in 100 people (12.99%)'],
    [13.0, '13 in 100 people (13%)'],
    [14.0, '7 in 50 people (14%)'],
    [14.49, 'About 7 in 50 people (14.49%)'],
    [14.5, 'About 3 in 20 people (14.5%)'],
    [15.0, '3 in 20 people (15%)'],
    [15.99, 'About 4 in 25 people (15.99%)'],
    [16.0, '4 in 25 people (16%)'],
    [16.99, 'About 17 in 100 people (16.99%)'],
    [17.0, '17 in 100 people (17%)'],
    [17.51, 'About 9 in 50 people (17.51%)'],
    [18.0, '9 in 50 people (18%)'],
    [18.99, 'About 19 in 100 people (18.99%)'],
    [19.0, '19 in 100 people (19%)'],
    [19.51, 'About 1 in 5 people (19.51%)'],
    [19.99, 'About 1 in 5 people (19.99%)'],

    // 20.00% to 80.00%
    [20.0, '1 in 5 people (20%)'],
    [22.49, 'About 1 in 5 people (22.49%)'],
    [22.5, 'About 1 in 4 people (22.5%)'],
    [25.0, '1 in 4 people (25%)'],
    [27.49, 'About 1 in 4 people (27.49%)'],
    [27.5, 'About 3 in 10 people (27.5%)'],
    [30.0, '3 in 10 people (30%)'],
    [30.83, 'About 3 in 10 people (30.83%)'],
    [30.84, 'About 1 in 3 people (30.84%)'],
    [33.33, 'About 1 in 3 people (33.33%)'],
    [36.5, 'About 3 in 8 people (36.5%)'],
    [37.5, '3 in 8 people (37.5%)'],
    [39.0, 'About 2 in 5 people (39%)'],
    [40.0, '2 in 5 people (40%)'],
    [44.0, 'About 9 in 20 people (44%)'],
    [45.0, '9 in 20 people (45%)'],
    [47.5, 'About 12 in 25 people (47.5%)'],
    [47.51, 'About 1 in 2 people (47.51%)'],
    [50.0, '1 in 2 people (50%)'],
    [52.5, 'About 13 in 25 people (52.5%)'],
    [54.0, 'About 11 in 20 people (54%)'],
    [55.0, '11 in 20 people (55%)'],
    [57.5, 'About 14 in 25 people (57.5%)'],
    [59.0, 'About 3 in 5 people (59%)'],
    [60.0, '3 in 5 people (60%)'],
    [62.5, '5 in 8 people (62.5%)'],
    [63.5, 'About 5 in 8 people (63.5%)'],
    [66.67, 'About 2 in 3 people (66.67%)'],
    [71.0, 'About 7 in 10 people (71%)'],
    [70.0, '7 in 10 people (70%)'],
    [72.5, 'About 18 in 25 people (72.5%)'],
    [74.0, 'About 3 in 4 people (74%)'],
    [75.0, '3 in 4 people (75%)'],
    [77.5, 'About 19 in 25 people (77.5%)'],
    [80.0, '4 in 5 people (80%)'],

    // 80.01% to 98.99%
    [80.01, 'About 4 in 5 people (80.01%)'],
    [80.5, 'About 4 in 5 people (80.5%)'],
    [80.51, 'About 81 in 100 people (80.51%)'],
    [81.0, '81 in 100 people (81%)'],
    [81.49, 'About 81 in 100 people (81.49%)'],
    [81.5, 'About 41 in 50 people (81.5%)'],
    [82.0, '41 in 50 people (82%)'],
    [82.99, 'About 83 in 100 people (82.99%)'],
    [83.0, '83 in 100 people (83%)'],
    [84.0, '21 in 25 people (84%)'],
    [84.1, 'About 21 in 25 people (84.1%)'],
    [85.0, '17 in 20 people (85%)'],
    [85.1, 'About 17 in 20 people (85.1%)'],
    [86.0, '43 in 50 people (86%)'],
    [86.1, 'About 43 in 50 people (86.1%)'],
    [87.0, '87 in 100 people (87%)'],
    [87.1, 'About 87 in 100 people (87.1%)'],
    [87.5, '7 in 8 people (87.5%)'],
    [87.6, 'About 7 in 8 people (87.6%)'],
    [88.0, '22 in 25 people (88%)'],
    [88.1, 'About 22 in 25 people (88.1%)'],
    [89.0, '89 in 100 people (89%)'],
    [89.1, 'About 89 in 100 people (89.1%)'],
    [90.0, '9 in 10 people (90%)'],
    [90.1, 'About 9 in 10 people (90.1%)'],
    [91.0, '91 in 100 people (91%)'],
    [91.1, 'About 91 in 100 people (91.1%)'],
    [92.0, '23 in 25 people (92%)'],
    [92.1, 'About 23 in 25 people (92.1%)'],
    [93.0, '93 in 100 people (93%)'],
    [93.1, 'About 93 in 100 people (93.1%)'],
    [94.0, '47 in 50 people (94%)'],
    [94.1, 'About 47 in 50 people (94.1%)'],
    [95.0, '19 in 20 people (95%)'],
    [95.1, 'About 19 in 20 people (95.1%)'],
    [96.0, '24 in 25 people (96%)'],
    [96.1, 'About 24 in 25 people (96.1%)'],
    [97.0, '97 in 100 people (97%)'],
    [97.1, 'About 97 in 100 people (97.1%)'],
    [98.0, '49 in 50 people (98%)'],
    [98.5, 'About 49 in 50 people (98.5%)'],
    [98.51, 'About 99 in 100 people (98.51%)'],
    [98.99, 'About 99 in 100 people (98.99%)'],
  ]

  it('should perfectly match the expected statements with no missing or extra outputs', () => {
    const generatedStatements = new Set<string>()

    // Strip the percentage suffix: "About 1 in 5 people (19.51%)" -> "About 1 in 5 people"
    const stripPercentage = (s: string) => s.replace(/\s\(\d+(\.\d+)?%\)$/, '')

    // Generate everything from 0.01 to 99.99
    // eslint-disable-next-line no-plusplus
    for (let i = 1; i <= 9999; i++) {
      const rawResult = probabilityStatement(i / 100)
      generatedStatements.add(stripPercentage(rawResult))
    }

    // Extract unique expected statements from cases
    const expectedSet = new Set(cases.map(c => stripPercentage(c[1])))

    // check for any expected statements missing
    const missingFromGenerated = [...expectedSet].filter(s => !generatedStatements.has(s))

    // check if all generated statements covered in cases
    const unexpectedInGenerated = [...generatedStatements].filter(s => !expectedSet.has(s))

    // Debugging logs if things go wrong
    /* eslint-disable */
    if (missingFromGenerated.length > 0) {
      console.warn('These expected statements were never reached:', missingFromGenerated)
    }

    if (unexpectedInGenerated.length > 0) {
      console.warn('The filter produced these unexpected statements:', unexpectedInGenerated)
    }

    // Assertions
    expect(missingFromGenerated).toHaveLength(0)
    expect(unexpectedInGenerated).toHaveLength(0)
  })

  it('should return an empty string for null, undefined, or non-numeric inputs', () => {
    expect(probabilityStatement(null)).toBe('Error: score is null or undefined.')
    expect(probabilityStatement(undefined)).toBe('Error: score is null or undefined.')
  })

  describe('Score to Statement Mapping', () => {
    test.each(cases)('given score %p, should return "%s"', (score, expected) => {
      const result = probabilityStatement(score)

      // Check string match
      expect(result).toBe(expected)

      // Check error rate
      const getDecimalFromStatement = (statement: string): number => {
        const match = statement.match(/(\d+)\s+in\s+(\d+)/)
        if (!match) return 0
        return parseInt(match[1], 10) / parseInt(match[2], 10)
      }

      const inputDecimal = score / 100
      const resultDecimal = getDecimalFromStatement(result)
      const errorRate = Math.abs(resultDecimal - inputDecimal)

      const isHumanZone = inputDecimal >= 0.2 && inputDecimal <= 0.8
      const allowedTolerance = isHumanZone ? 0.025 : 0.01

      expect(errorRate).toBeLessThanOrEqual(allowedTolerance)
    })
  })
})
