import * as THREE from "three";

import note from "../../textures/note.png";
import holdbody from "../../textures/holdbody.png";
import holdcap from "../../textures/holdcap.png";
import receptor from "../../textures/receptor.png";
import receptoractive from "../../textures/receptoractive.png";

export default class Skin
{
    noteScale: number = 0.23;
    receptorOffset: number = 0.1; // vertical offset of hit receptors from edge of screen
    
    // renderer: THREE.WebGLRenderer;

    noteGeometry: THREE.BoxGeometry;
    holdBodyGeometry: THREE.BoxGeometry;

    noteMaterial: THREE.MeshBasicMaterial;
    holdBodyMaterial: THREE.MeshBasicMaterial;
    holdCapMaterial: THREE.MeshBasicMaterial;
    noteReceptorMaterial: THREE.MeshBasicMaterial;
    noteReceptorActiveMaterial: THREE.MeshBasicMaterial;

    // pass in graphics settings?
    constructor()
    {
        this.noteGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.noteGeometry.translate(0, 1/2, 0);
        this.noteGeometry.scale(this.noteScale, this.noteScale, 1);

        this.holdBodyGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.holdBodyGeometry.translate(0, 1/2, 0);
        this.holdBodyGeometry.scale(this.noteScale, 1, 1);


        const textureLoader = new THREE.TextureLoader();

        this.noteMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load(note)), transparent: true });
        this.holdBodyMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load(holdbody)), transparent: true });
        this.holdCapMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load(holdcap)), transparent: true });
        this.noteReceptorMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load(receptor)), transparent: true});
        this.noteReceptorActiveMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load(receptoractive)), transparent: true});

        // this.noteMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("textures/note.png")), transparent: true });
        // this.holdBodyMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/holdbody.png")), transparent: true });
        // this.holdCapMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/holdcap.png")), transparent: true });
        // this.noteReceptorMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/receptor.png")), transparent: true});
        // this.noteReceptorActiveMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/receptoractive.png")), transparent: true});
    }

    applyTextureSettings(map: THREE.Texture)
    {
        map.anisotropy = 8;
        map.minFilter = THREE.NearestFilter;
        map.magFilter = THREE.NearestFilter;
        return map;
    }

    meshFrom(geometry: THREE.BoxGeometry, material: THREE.MeshBasicMaterial, z = -1)
    {
        const mesh = new THREE.Mesh(geometry, material.clone());
        mesh.position.z = z;
        return mesh;
    }

    get noteMesh() { return this.meshFrom(this.noteGeometry, this.noteMaterial, -2); }
    get lnCapMesh() { return this.meshFrom(this.noteGeometry, this.holdCapMaterial, -2); }
    get lnMesh() { return this.meshFrom(this.holdBodyGeometry, this.holdBodyMaterial, -3); }
    get noteReceptorMesh() { return this.meshFrom(this.noteGeometry, this.noteReceptorMaterial, -4); }


}