import "./style.css";
import { createRef, render } from "preact";
import { useEffect } from "preact/hooks"
import initGame from "./game";

const WebglGame = () => {
    const canvasRef = createRef<HTMLCanvasElement>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas !== null)
            initGame(canvas);
    }, [canvasRef])

    return <canvas class="webglCanvas" ref={canvasRef} />;
}

const App = () => {


    return (
        <>
            <WebglGame/>
        </>
    );
}

render(<App/>, document.body);
