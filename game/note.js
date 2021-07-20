import * as THREE from "three";

export default class Note
{
    static boxSize = 0.2;
    static noteGeometry = new THREE.BoxGeometry(Note.boxSize, Note.boxSize * .3, 1);
    static lnGeometry = new THREE.BoxGeometry(Note.boxSize * .75, 1, 1);

    static material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });

    static isInit = false;

    constructor(startTime)
    {
        if (!Note.isInit)
        {
            Note.noteGeometry.translate(0, Note.boxSize * .3 / 2, 0);
            Note.lnGeometry.translate(0, 1/2, 0);
            Note.isInit = true;
        }

        this.mesh = new THREE.Mesh(Note.noteGeometry, Note.material);
        this.mesh.position.z = -1;
        this.startTime = startTime;

        this.noteGroup = new THREE.Group(); // groups note, ln body and ln cap
        this.noteGroup.add(this.mesh);
    }

    createLn(endTime)
    {
        // set to ln visual origin to middle of the note
        this.lnMesh = new THREE.Mesh(Note.lnGeometry, Note.material);
        this.lnMesh.position.set(0, Note.boxSize * .3 / 2, -1);
        this.endTime = endTime;

        this.noteGroup.add(this.lnMesh);
    }

    getYFromTime(targetTime, time, speed)
    {
        const targetBase = -1;
        return (targetTime - time) * speed + targetBase;
    }

    update(time, speed)
    {
        const startPos = this.getYFromTime(this.startTime, time, speed);
        this.noteGroup.position.y = startPos;

        if (this.isLn)
        {
            const endPos = this.getYFromTime(this.endTime, time, speed);
            this.lnMesh.scale.y = (endPos - startPos) / 2 - (Note.boxSize * 0.3) / 2;
        }
    }

    get isLn()
    {
        return "endTime" in this;
    }

}