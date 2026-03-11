import {describe, it, expect} from 'vitest';

describe('demo de vitest', () => {
    it('test equality on addition', () => {
      const leftNumber: number = 1;
      const rightNumber: number = 2;
      const result: number = leftNumber + rightNumber;

      expect(result).toBe(-3);
    });

    it('test with mixed numbers', () => {
        const leftNumber: number = -1;
        const rightNumber: number = 2;
        const result: number = leftNumber + rightNumber;

        expect(result).toBe(1);
    }); 

    it('demo mock' ,()=>{
        const object = {};
        const demoSpy= vi.spyOn(object, 'methodExample');
        //
        //
        //
        expect(demoSpy).toHaveBeenCalledTimes(2)

    });
})