import * as THREE from "three";
import parser from "osu-parser";
import Lane from "./lane";

export default class Playfield
{
    constructor(speed)
    {
        this.baseSpeed = speed;
        this.lanes = [];
    }

    loadOsuMap(obj)
    {
        const keys = 4;

        const osuMap = parser.parseContent(obj);
        console.log(osuMap);

        this.lanes = osuMap.hitObjects.reduce((acc, o) => {
            const lane = Math.trunc(o.position[0] * keys / 512);
            acc.laneObjects[lane] = acc.laneObjects[lane] || new Lane();
            const currLane = acc.laneObjects[lane];

            if (o.objectName !== "circle")
            {
                const lnState = acc.lnState[lane];
                acc.lnState[lane] = !lnState;
                if (lnState)
                {
                    currLane.notes[currLane.notes.length - 1].createLn(o.startTime);
                    return acc;
                }
            }

            currLane.addNote(o.startTime);
            return acc;
        }, {
            laneObjects: [],
            lnState: Array.apply(false, Array(keys))
        }).laneObjects;

    }

}