import "./style.css"
import * as THREE from "three";
import osuMapUrl from "./map.osu?raw"
import parser from "osu-parser";
import * as Stats from "stats.js";
import { Howl, Howler } from 'howler';

function lerp(a, b, t)
{
    return (t - a) / (b - a);
}

function main()
{
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);

    const canvas = document.querySelector('#c');
    const canvasSize = canvas.getBoundingClientRect();
    console.log(canvasSize);

    const renderer = new THREE.WebGLRenderer({
        canvas
    });
    const scene = new THREE.Scene();

    const aspectRatio = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-aspectRatio, aspectRatio, 1, -1, 0.1, 100);
    console.log(camera);

    const boxSize = 0.2;
    const geometry = new THREE.BoxGeometry(boxSize, boxSize * .3, boxSize);
    geometry.translate(-boxSize / 2, boxSize * .3 / 2, 0);
    const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

    renderer.render(scene, camera);

    let speed = .003;
    let updateTime = -1;
    let time = 0;

    const osuMap = parser.parseContent(osuMapUrl);
    console.log(osuMap);

    const hitObjects = osuMap.hitObjects.map(o => Object.assign(new THREE.Mesh(geometry, material), {
        lane: Math.trunc(o.position[0] * 4 / 512),
        startTime: o.startTime
    }));

    hitObjects.forEach(o => {
        o.position.z = -1;
        o.position.x = o.lane / 4;
        scene.add(o);
    });

    const audio = new Howl({
        src: ["song.mp3"]
    });

    function render()
    {
        stats.begin();
        
        const nowTime = new Date().getTime();
        if (updateTime > 0)
            time += nowTime - updateTime;
        updateTime = nowTime;

        const error = time - audio.seek() * 1000;
        if (error > 4)
        {
            console.log(`error over threshold: ${error}`);
            time = audio.seek() * 1000;
        }

        function getPos(startTime)
        {
            return (startTime - time) * speed - 1;
        }
        
        for (const o of hitObjects)
        {
            o.position.y = getPos(o.startTime);
            // if (o.position.y < -1.0001) 
            // {
                // console.log(o);
            //     return;
            // }
        }
        
        renderer.render(scene, camera);
        
        stats.end();
        requestAnimationFrame(render);
    }

    audio.on("play", () => requestAnimationFrame(render));
    audio.play();

}

main();
