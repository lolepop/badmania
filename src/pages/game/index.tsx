import { Howl } from "howler";
import { createRef } from "preact";
import { useState, useEffect } from "preact/hooks";
import { useLocation, useNavigate } from "react-router-dom";
import Skin from "../../game/skin";
import { ScoreboardState } from "../../game/ui/scoreboard";
import OsuMap from "../../parser/osu";
import { useAppSelector } from "../../store/hooks";
import { pathSplit, gotoDir } from "../../util/file";
import initGame from "../../game";
import routes from "../routes";

const Ui = ({ state: { combo, accuracy } }: { state: ScoreboardState }) => (
    <div class="fillScreen" style="position: absolute">
        <p style="float: right; color:white">
            <p>{combo}</p>
            <p>{accuracy.toFixed(4)}%</p>
        </p>
    </div>
);

const WebglGame = () => {
    const { state } = useLocation();

    const canvasRef = createRef<HTMLCanvasElement>();
    const [uiState, setUiState] = useState<ScoreboardState>({ combo: 0, accuracy: 0 });
    const files = useAppSelector(state => state.files);
    const navigate = useNavigate();

    useEffect(() => {
        if (!state?.filePath)
            return navigate(routes.index.route);

        const canvas = canvasRef.current;
        if (canvas !== null)
        {
            const readAsDataURLAsync = async (file: File) => new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                
                reader.onload = () => {
                    resolve(reader.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });

            (async () => {
                try
                {
                    const sp = pathSplit(state.filePath);
                    const dir = gotoDir(files.songDirectory, sp[0]);
                    console.log(sp);
                    
                    const chart = new OsuMap();
                    chart.fromString(await (dir[sp[1]] as File).text());
    
                    const af = dir[chart.General.AudioFilename] as File;
                    const audio = new Howl({
                        src: await readAsDataURLAsync(af),
                        volume: 0.1
                    });
    
                    initGame(canvas, setUiState, chart.toChart(), audio, {baseSpeed: 1, skin: new Skin()});
                    
                }
                catch (error)
                {
                    console.error(error);
                    return navigate(routes.index.route);
                }
            })();
        }
    }, [])

    return (
        <div class="fillScreen">
            <canvas class="fillScreen" style="position: absolute" ref={canvasRef} />
            <Ui
                state={uiState}
            />
        </div>
    );
};

export default WebglGame;
