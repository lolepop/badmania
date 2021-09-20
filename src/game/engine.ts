import { Howl } from "howler";
import Stats from "stats.js";

export default class GameEngine
{
    updateTime: number = -1;
    time: number = 0;

    audio: Howl;
    render: (delta: number) => void;

    isRenderRunning = false;
    stats?: Stats;

    constructor(audio: Howl, render: (delta: number) => void)
    {
        this.render = render;
        this.audio = audio;

        // audio.on("play", () => requestAnimationFrame(this.update.bind(this)));
    }

    start()
    {
        if (!this.isRenderRunning)
            this.startEngine();
        this.audio.play();
    }

    pause()
    {
        this.audio.pause();
    }

    private startEngine()
    {
        const stats = new Stats();
        stats.showPanel(1);
        document.body.appendChild(stats.dom);
        this.stats = stats;

        this.isRenderRunning = true;

        requestAnimationFrame(this.update.bind(this));
    }

    private update()
    {
        this.stats?.begin();

        // const nowTime = new Date().getTime();
        const nowTime = performance.now();

        if (this.audio.playing())
        {
            if (this.updateTime > 0)
                this.time += nowTime - this.updateTime;
    
            const error = this.time - (this.audio.seek() as number) * 1000;
            if (Math.abs(error) > 10)
            {
                // console.log(`error over threshold: ${error}`);
                this.time = (this.audio.seek() as number) * 1000;
            }
        }
        this.updateTime = nowTime;

        this.render.call(this, this.time);

        this.stats?.end();

        requestAnimationFrame(this.update.bind(this));
    }

}