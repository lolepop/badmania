
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
