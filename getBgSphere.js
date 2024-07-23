import * as THREE from "three"

export default function getBgSphere() {
    const bgSphereGeo = new THREE.IcosahedronGeometry(4, 3);
    const bgSphereMat = new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        vertexColors: true,
        fog: false
    });
    // create an array of colors per vertex
    const bgSphereColors = [];
    const len = bgSphereGeo.attributes.position.count;
    for (let i = 0; i < len; i++) {
        const hue = 0.565;
        const z = -bgSphereGeo.attributes.position.getZ(i);
        const { r, g, b } = new THREE.Color().setHSL(hue, 0.5, z * 0.05);
        bgSphereColors.push(r, g, b);
    }
    bgSphereGeo.setAttribute('color', new THREE.Float32BufferAttribute(bgSphereColors, 3));
    const bgSphere = new THREE.Mesh(bgSphereGeo, bgSphereMat);

    return bgSphere;
}