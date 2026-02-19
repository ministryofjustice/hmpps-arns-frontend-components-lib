import { convertScoreToScaleMarkerPosition, convertBandToScaleMarkerPosition, Band } from './predictorUtils'

describe('predictorUtils', () => {
  describe('convertScoreToScalePosition', () => {
    it.each([
      [13, [], 'Thresholds must contain at least two values'],
      [78, [0], 'Thresholds must contain at least two values'],
      [9, [17, 51, 100], 'The lowest threshold must be 0'],
      [0, ['NaN'], 'Invalid threshold value: NaN'],
    ])('Error cases - convertScoreToScaleMarkerPosition(%s, %s) - %s', (score: number, thresholds: (number | string)[], errorMessage: string) => {
      expect(() => {
        convertScoreToScaleMarkerPosition(score, thresholds)
      }).toThrow(Error(errorMessage))
    })

    it.each([
      [60, ['0%', '30%', '60%', '80%', '100%'], '50.00'],
      [6.9, ['0%', '1%', '3%', '6.9%', '25%+'], '75.00'],
      [25, ['0d%', '2bx5%@', '50%_', '7}5%', '100%()'], '25.00'],
    ])('Sanitise & parse threshold strings - convertScoreToScalePosition(%s, %s) -> %s', (score: number, thresholds: string[], expectedPosition: string) => {
      expect(convertScoreToScaleMarkerPosition(score, thresholds)).toBe(expectedPosition)
    })

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
    ])('Happy path cases - convertScoreToScalePosition(%s, %s) -> %s', (score: number, thresholds: number[], expectedPosition: string) => {
      expect(convertScoreToScaleMarkerPosition(score, thresholds)).toBe(expectedPosition)
      // Uncomment the below to see a visualisation of the calculated position
      // visualiseTestResult(score, thresholds, expectedPosition)
    })
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
    ])('Happy path cases - convertBandToScaleMarkerPosition(%s, %s) -> %s', (band: string, includeVeryHigh: boolean, expectedPosition: number) => {
      expect(convertBandToScaleMarkerPosition(band as Band, includeVeryHigh)).toBe(expectedPosition)
      // Uncomment the below to see a visualisation of the calculated position
      // visualiseTestResult(0, includeVeryHigh ? [0, 25, 50, 75, 100] : [0, 33, 67, 100], expectedPosition)
    })
  })
})

// const visualiseTestResult = (score: number, thresholds: number[], expectedPosition: number) => {
//   const width = 120
//   const numSegments = thresholds.length - 1
//   const segmentWeight = 100 / numSegments
//
//   const pointer = Array(width + 1).fill(' ')
//   const track = Array(width + 1).fill('-')
//   const labelRow = Array(width + 10).fill(' ')
//
//   thresholds.forEach((val, i) => {
//     const milestonePct = i * segmentWeight
//     const pos = Math.round((milestonePct / 100) * width)
//     track[pos] = '|'
//
//     const label = val.toString()
//     let labelStart = pos - Math.floor(label.length / 2)
//
//     if (labelStart < 0) labelStart = 0
//     if (labelStart + label.length > width + 1) {
//       labelStart = width + 1 - label.length
//     }
//
//     for (let charI = 0; charI < label.length; charI += 1) {
//       labelRow[labelStart + charI] = label[charI]
//     }
//   })
//
//   const scorePos = Math.round((expectedPosition / 100) * width)
//   pointer[scorePos] = '↓'
//
//   console.log(
//     `Score: ${score}\nProgress: ${expectedPosition}%\n ${pointer.join('')}\n ${track.join('')}\n ${labelRow.join('')}`,
//   )
// }