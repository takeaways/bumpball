export class ResizeControl {
  constructor({ camera, renderer, scene }) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    window.addEventListener("resize", this.setSize);
  }

  setSize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.render(this.scene, this.camera);
  };
}
