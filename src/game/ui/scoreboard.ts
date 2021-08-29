
export interface ScoreboardState
{
    combo: number;
}

export default class Scoreboard implements ScoreboardState
{
    combo = 0;

    setUiState: (a: any) => any;

    constructor(scene: THREE.Scene, setUiState: (a: any) => any)
    {
        this.setUiState = setUiState;
    }

    update()
    {
        this.setUiState({
            combo: this.combo
        });
    }

}