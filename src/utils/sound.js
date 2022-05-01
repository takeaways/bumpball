export class CollideSound {
  constructor(soundSrc) {
    this.audio = new Audio(soundSrc);
  }

  callback = (e) => {
    if (e.contact.getImpactVelocityAlongNormal() > 4) {
      this.audio.currentTime = 0;
      this.audio.play();
    }
  };
}
