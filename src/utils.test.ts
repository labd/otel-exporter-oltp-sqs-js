import { describe, expect, it } from 'vitest'
import { compressData } from './utils'


describe('compressData', () => {
  it('should compress', async () => {
    const data = JSON.stringify({
      resourceSpans: [
        {
          resource: 'data'
        }
      ]
    })
    const result = await compressData(new TextEncoder().encode(data))
    expect(result).toBeDefined()
  })
})
