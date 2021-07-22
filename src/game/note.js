import * as THREE from "three";

export default class Note
{
    constructor(startTime, skin)
    {
        this.skin = skin;
        this.mesh = skin.noteMesh;
        this.startTime = startTime;

        this.noteGroup = new THREE.Group(); // groups note, ln body and ln cap
        this.noteGroup.add(this.mesh);
    }

    createLn(endTime)
    {
        // set to ln visual origin to middle of the note
        this.lnMesh = this.skin.lnMesh;
        this.lnMesh.position.y = this.skin.noteScale / 2;

        this.lnCap = this.skin.lnCapMesh;

        this.endTime = endTime;

        this.noteGroup.add(this.lnMesh);
        this.noteGroup.add(this.lnCap);
    }

    getYFromTime(targetTime, time, speed)
    {
        return (targetTime - time) * speed - 1 + this.skin.receptorOffset;
    }

    update(time, speed)
    {
        const startPos = this.getYFromTime(this.startTime, time, speed);
        this.noteGroup.position.y = startPos;

        if (this.isLn)
        {
            const endPos = this.getYFromTime(this.endTime, time, speed);
            const relativeEnd = endPos - startPos;
            this.lnMesh.scale.y = relativeEnd - this.skin.noteScale / 2;
            this.lnCap.position.y = relativeEnd;
        }
    }

    get isLn()
    {
        return "endTime" in this;
    }

}