import * as THREE from "three";
import Skin from "./skin";

export default class Note
{
    startTime: number;
    endTime?: number;

    skin: Skin;

    mesh: THREE.Mesh; // base note
    lnMesh?: THREE.Mesh // ln body
    lnCap?: THREE.Mesh // end ln (goes after the ln body)

    noteGroup: THREE.Group = new THREE.Group(); // groups note, ln body and ln cap

    constructor(startTime: number, skin: Skin)
    {
        this.skin = skin;
        this.mesh = skin.noteMesh;
        this.startTime = startTime;

        this.noteGroup.add(this.mesh);
    }

    createLn(endTime: number)
    {
        // set to ln visual origin to middle of the note
        this.lnMesh = this.skin.lnMesh;
        this.lnMesh.position.y = this.skin.noteScale / 2;

        this.lnCap = this.skin.lnCapMesh;

        this.endTime = endTime;

        this.noteGroup.add(this.lnMesh);
        this.noteGroup.add(this.lnCap);
    }

    getYFromTime(targetTime: number, time: number, speed: number)
    {
        return (targetTime - time) * speed - 1 + this.skin.receptorOffset;
    }

    update(time: number, speed: number)
    {
        const startPos = this.getYFromTime(this.startTime, time, speed);
        this.noteGroup.position.y = startPos;

        if (this.isLn)
        {
            const endPos = this.getYFromTime(this.endTime!, time, speed);
            const relativeEnd = endPos - startPos;
            this.lnMesh!.scale.y = relativeEnd - this.skin.noteScale / 2;
            this.lnCap!.position.y = relativeEnd;
        }
    }

    get isLn()
    {
        return this.endTime ?? false;
    }

}