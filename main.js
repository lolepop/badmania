import "./style.css"
import * as THREE from "three";
import osuMapUrl from "./map1.osu?raw"
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
    const geometry = new THREE.BoxGeometry(boxSize, boxSize * .3, 1);
    geometry.translate(0, boxSize * .3 / 2, 0);
    
    const lnGeometry = new THREE.BoxGeometry(boxSize * .75, 1, 1);
    lnGeometry.translate(0, 1/2, 0);
    
    const material = new THREE.MeshBasicMaterial({color: 0x44aa88});

    renderer.render(scene, camera);

    let speed = .0035;
    const keys = 4;
    let updateTime = -1;
    let time = 0;

    const osuMap = parser.parseContent(osuMapUrl);
    console.log(osuMap);

    // const hitObjects = osuMap.hitObjects.map(o => Object.assign(new THREE.Mesh(geometry, material), {
    //     lane: Math.trunc(o.position[0] * keys / 512),
    //     startTime: o.startTime
    // }));

    const hitObjects = osuMap.hitObjects.reduce((acc, o, i) => {
        const lane = Math.trunc(o.position[0] * keys / 512);
        acc.laneObjects[lane] = acc.laneObjects[lane] || [];
        const currLane = acc.laneObjects[lane];

        if (o.objectName !== "circle")
        {
            if (acc.lnState[lane])
            {
                const lnMesh = new THREE.Mesh(lnGeometry, material);
                lnMesh.position.z = -1;
                lnMesh.position.x = lane / 4;
                
                Object.assign(acc.laneObjects[lane][currLane.length - 1], {
                    lnMesh,
                    endTime: o.startTime
                });

                acc.lnState[lane] = !acc.lnState[lane];
                return acc;
            }
            acc.lnState[lane] = !acc.lnState[lane];
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = -1;
        mesh.position.x = lane / 4;

        const meshObj = {
            mesh,
            lane,
            startTime: o.startTime
        };

        acc.laneObjects[lane].push(meshObj);
        return acc;
    }, {
        laneObjects: [],
        lnState: Array.apply(false, Array(keys))
    }).laneObjects;

    console.log(hitObjects);
    // return;

    hitObjects.forEach(l => {
        l.forEach(o => {
            scene.add(o.mesh);
            if ("endTime" in o)
                scene.add(o.lnMesh);
        });
    });

    const audio = new Howl({
        src: ["song1.mp3"],
        volume: 0.5
    });

    function render()
    {
        stats.begin();

        const nowTime = new Date().getTime();
        if (updateTime > 0)
            time += nowTime - updateTime;
        updateTime = nowTime;

        const error = time - audio.seek() * 1000;
        if (Math.abs(error) > 4)
        {
            console.log(`error over threshold: ${error}`);
            time = audio.seek() * 1000;
        }

        const getPos = startTime => (startTime - time) * speed - 1;

        for (const l of hitObjects)
        {
            for (const o of l)
            {
                const startPos = getPos(o.startTime);
                o.mesh.position.y = startPos;

                if ("endTime" in o)
                {
                    const endPos = getPos(o.endTime);
                    o.lnMesh.scale.y = (endPos - startPos) / 2 - (boxSize * 0.3);
                    o.lnMesh.position.y = startPos + (boxSize * 0.3);
                }
                // if (o.mesh.position.y < -1.0001) 
                // {
                //     console.log(o);
                //     return;
                // }
            }
        }

        renderer.render(scene, camera);

        stats.end();
        requestAnimationFrame(render);
    }

    audio.on("play", () => requestAnimationFrame(render));
    audio.play();

}

main();
