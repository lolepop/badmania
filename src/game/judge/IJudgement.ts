import * as Util from "../../util";


export enum HitJudge
{
    MARVELOUS,
    PERFECT,
    GREAT,
    GOOD,
    MISS,
    NOT_HIT
}

export interface IJudgement
{
    getJudge(time: number, targetTime: number): HitJudge;
    get autoPlayHitTime(): number;
    get missTiming(): number;
    scoreHitDelta(delta: number): number;
    get maxScore(): number
}

// etterna calculations taken from official repo: https://github.com/etternagame/etterna/
// https://www.desmos.com/calculator/qebv9dcoll
export class EtternaJudgement implements IJudgement
{
    private readonly timings = [
        [22, 45, 90, 135, 180], // j4
        [18, 38, 76, 113, 151] // j5
    ];

    private readonly timingScales = [ 1, 1, 1, 1, 0.84, 0.66, 0.50, 0.33, 0.20 ];

    private judgeTiming: number[];
    private timingScale: number;

    constructor(judge: number)
    {
        this.judgeTiming = this.timings[0];
        this.timingScale = this.timingScales[judge - 1];
    }

    // wife3 calculator
    scoreHitDelta(delta: number): number
    {
        const missWeight = -5.5;
        const ridic = 5 * this.timingScale;
        const maxBooWeight = 180 * this.timingScale;
        const tsPow = 0.75;
        const zero = 65 * (this.timingScale ** tsPow);
        const dev = 22.7 * (this.timingScale ** tsPow);

        if (delta <= ridic)
            return this.maxScore;
        else if (delta <= zero)
            return this.maxScore * Util.erf((zero - delta) / dev);
        else if (delta <= maxBooWeight)
            return (delta - zero) * missWeight / (maxBooWeight - zero);
        return this.maxScore;

    }

    get maxScore(): number { return 2; }

    get autoPlayHitTime(): number
    {
        return this.judgeTiming[0];
    }

    getJudge(time: number, targetTime: number): HitJudge
    {
        const timeOff = time - targetTime;
        const timeAbs = Math.abs(timeOff);

        // note within timing window
        if (timeAbs <= this.judgeTiming[HitJudge.MISS])
        {
            return this.judgeTiming.findIndex(window => timeAbs <= window);
            // if (timeAbs <= 60)
            //     return HitJudge.EXCELLENT;
            // return HitJudge.MISSED;
        }
        else if (timeOff > 0)
        {
            // note outside timing window and is after hit time
            // guaranteed to be after hit window due to previous condition
            return HitJudge.MISS;
        }
        return HitJudge.NOT_HIT;
    }

    get missTiming(): number
    {
        return this.judgeTiming[this.judgeTiming.length - 1];
    }
    
}
