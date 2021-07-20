import * as THREE from "three";
import Note from "./note";

export default class Lane
{
    constructor()
    {
        this.notes = [];
        this.laneGroup = new THREE.Group();
    }

    addNote(startTime)
    {
        const note = new Note(startTime);
        
        this.notes.push(note);
        this.laneGroup.add(note.noteGroup);
    }
}