import "./style.css";
import { createRef, render } from "preact";
import { useEffect, useState } from "preact/hooks"
import initGame from "./game";
import { ScoreboardState } from "./game/ui/scoreboard";

const Ui = ({ state: { combo, accuracy } }: { state: ScoreboardState }) => (
    <div class="fillScreen" style="position: absolute">
        <p style="float: right; color:white">
            <p>{combo}</p>
            <p>{accuracy.toFixed(4)}%</p>
        </p>
    </div>
);

const WebglGame = () => {
    const canvasRef = createRef<HTMLCanvasElement>();
    const [uiState, setUiState] = useState<ScoreboardState>({ combo: 0, accuracy: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas !== null)
            initGame(canvas, setUiState);
    }, [])

    return (
        <div class="fillScreen">
            <canvas class="fillScreen" style="position: absolute" ref={canvasRef} />
            <Ui
                state={uiState}
            />
        </div>
    );
}

const App = () => {


    return (
        <>
            <WebglGame/>
        </>
    );
}

render(<App/>, document.body);
