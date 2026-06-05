import { describe, expect, it } from 'vitest'
import { parseCircularFeatures } from './stepFeatures'

describe('parseCircularFeatures', () => {
  it('extracts circle centers from STEP axis placements', () => {
    const step = `
      #10 = CARTESIAN_POINT('',(12.5, -4., 7.25));
      #11 = DIRECTION('',(0.,0.,1.));
      #12 = AXIS2_PLACEMENT_3D('',#10,#11,#11);
      #13 = CIRCLE('',#12,2.4);
    `

    expect(parseCircularFeatures(step)).toEqual([
      {
        id: 'circle-13',
        label: 'Circle #13',
        sourceEntity: '#13',
        kind: 'circle',
        centerMm: [12.5, -4, 7.25],
        normal: [0, 0, 1],
        radiusMm: 2.4,
      },
    ])
  })

  it('extracts cylindrical surfaces as circular features', () => {
    const step = `
      #1=CARTESIAN_POINT('',(0.,0.,0.));
      #2=DIRECTION('',(1.,0.,0.));
      #3=AXIS2_PLACEMENT_3D('',#1,#2,#2);
      #4=CYLINDRICAL_SURFACE('',#3,1.5);
    `

    expect(parseCircularFeatures(step)[0]).toMatchObject({
      id: 'cylindrical-surface-4',
      kind: 'cylindrical-surface',
      centerMm: [0, 0, 0],
      normal: [1, 0, 0],
      radiusMm: 1.5,
    })
  })
})
