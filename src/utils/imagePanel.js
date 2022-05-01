import { MeshBasicMaterial, DoubleSide, Mesh } from "three";
export class ImagePanel {
  constructor({ textureLoader, scene, geometry, imageSrc, x, y, z }) {
    const texture = textureLoader.load(imageSrc);
    const material = new MeshBasicMaterial({
      map: texture,
      side: DoubleSide,
    });

    this.mesh = new Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    this.mesh.lookAt(0, 0, 0);

    // 회전각
    this.sphereRotationX = this.mesh.rotation.x;
    this.sphereRotationY = this.mesh.rotation.y;
    this.sphereRotationZ = this.mesh.rotation.z;

    scene.add(this.mesh);
  }
}
