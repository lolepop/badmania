import { IJudgement } from "../judge/IJudgement";

export interface ScoreboardState
{
    combo: number;
    accuracy: number;
}

export default class Scoreboard implements ScoreboardState
{
    combo = 0;
    accuracy = 0;
    
    private noteCounter = 0;
    private accuracyScore = 0;

    setUiState: (a: any) => any;

    constructor(setUiState: (a: any) => any)
    {
        this.setUiState = setUiState;
    }

    recalculateAccuracy(score: number, maxScore: number)
    {
        this.accuracy = ((this.accuracyScore += score) / (++this.noteCounter)) / maxScore * 100;
    }

    update()
    {
        this.setUiState({
            combo: this.combo,
            accuracy: this.accuracy
        });
    }

}