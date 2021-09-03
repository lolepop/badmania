
export const erf = (x: number) => {
    const p = 0.3275911;
    const coefficients = [0.254829592, -0.284496736, 1.421413741, -1.453152027, 1.061405429];

    const s = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    const t = 1 / (1 + p * x);
    const y = 1 - coefficients.reduceRight((acc, a) => acc * t + a) * t * Math.exp(-x * x);
    
    return s * y;
};
