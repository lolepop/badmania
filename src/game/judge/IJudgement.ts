
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
}

export class EtternaJudgement implements IJudgement
{
    private readonly timings = [
        [22, 45, 90, 135, 180], // j4
        [18, 38, 76, 113, 151] // j5
    ];

    private judgeTiming: number[];

    constructor(judge: number)
    {
        this.judgeTiming = this.timings[0];
    }

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
    
}
