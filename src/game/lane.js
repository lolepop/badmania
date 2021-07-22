import * as THREE from "three";
import Note from "./note";

export default class Lane
{
    constructor(skin)
    {
        this.notes = [];
        this.skin = skin;
        this.laneGroup = new THREE.Group();
        this.isActive = false; // is lane pressed by player
        
        this.noteReceptor = skin.noteReceptorMesh;
        this.noteReceptor.position.y = skin.receptorOffset - 1;
        this.laneGroup.add(this.noteReceptor);
    }

    handleInput(time, isActive)
    {
        if (this.isActive !== isActive)
        {
            this.noteReceptor.material = isActive ? this.skin.noteReceptorActiveMaterial : this.skin.noteReceptorMaterial;
            this.noteReceptor.material.needsUpdate = true;
        }
        this.isActive = isActive;
    }

    // update()
    // {

    // }

    addNote(startTime, endTime = -1)
    {
        const note = new Note(startTime, this.skin);
        if (endTime >= 0)
            note.createLn(endTime);
        
        this.notes.push(note);
        this.laneGroup.add(note.noteGroup);
    }

}