import * as THREE from "three";
import { Howl } from "howler";
import Stats from "stats.js";

export default class GameEngine
{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.OrthographicCamera;

    updateTime: number = -1;
    time: number = 0;

    audio: Howl;
    render: (delta: number) => void;

    isRenderRunning = false;
    stats?: Stats;

    constructor(canvas: HTMLCanvasElement, audio: Howl, render: (delta: number) => void)
    {
        this.render = render;
        this.audio = audio;

        this.renderer = new THREE.WebGLRenderer({
            canvas
        });
        this.scene = new THREE.Scene();
        // const aspectRatio = window.innerWidth / window.innerHeight;
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);

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

    private handleResize(renderer: THREE.WebGLRenderer, camera: THREE.OrthographicCamera)
    {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height)
        {
            renderer.setSize(width, height, false);
            const aspect = width / height;
            camera.left = -aspect;
            camera.right = aspect;
            camera.updateProjectionMatrix();
        }
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

        this.handleResize(this.renderer, this.camera);

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

        this.renderer.renderLists.dispose();
        this.renderer.render(this.scene, this.camera);

        this.stats?.end();

        requestAnimationFrame(this.update.bind(this));
    }

}