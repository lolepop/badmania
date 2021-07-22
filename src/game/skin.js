import * as THREE from "three";

export default class Skin
{
    constructor(renderer)
    {
        this.noteScale = 0.23;
        this.receptorOffset = 0.1;

        this.renderer = renderer;

        this.noteGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.noteGeometry.translate(0, 1/2, 0);
        this.noteGeometry.scale(this.noteScale, this.noteScale, 1);

        this.holdBodyGeometry = new THREE.BoxGeometry(1, 1, 1);
        this.holdBodyGeometry.translate(0, 1/2, 0);
        this.holdBodyGeometry.scale(this.noteScale, 1, 1);


        const textureLoader = new THREE.TextureLoader();

        this.noteMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/note.png")), transparent: true });
        this.holdBodyMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/holdbody.png")), transparent: true });
        this.holdCapMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/holdcap.png")), transparent: true });
        this.noteReceptorMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/receptor.png")), transparent: true});
        this.noteReceptorActiveMaterial = new THREE.MeshBasicMaterial({ map: this.applyTextureSettings(textureLoader.load("/textures/receptoractive.png")), transparent: true});
    }

    applyTextureSettings(map)
    {
        map.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        map.minFilter = THREE.NearestFilter;
        map.magFilter = THREE.NearestFilter;
        return map;
    }

    meshFrom(geometry, material, z = -1)
    {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.z = z;
        return mesh;
    }

    get noteMesh() { return this.meshFrom(this.noteGeometry, this.noteMaterial, -2); }
    get lnCapMesh() { return this.meshFrom(this.noteGeometry, this.holdCapMaterial, -2); }
    get lnMesh() { return this.meshFrom(this.holdBodyGeometry, this.holdBodyMaterial, -3); }
    get noteReceptorMesh() { return this.meshFrom(this.noteGeometry, this.noteReceptorMaterial, -4); }


}