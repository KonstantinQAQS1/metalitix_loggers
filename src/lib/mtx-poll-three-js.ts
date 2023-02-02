import { Vector3 } from 'three/src/math/Vector3';
import { Euler } from 'three/src/math/Euler';
import { Quaternion } from 'three/src/math/Quaternion';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { LoopRepeat } from 'three/src/constants';
import { MetalitixLoggerOptions } from '../types';
import MetalitixLoggerBase from './mtx-poll-base';
import { AnimationAction } from 'three/src/animation/AnimationAction';
import { Object3D } from 'three';

export default class MetalitixLogger extends MetalitixLoggerBase<PerspectiveCamera, Object3D> {
  private vector3: Vector3;
  private euler: Euler;
  private quaternion: Quaternion;
  private animationActions: { [key: string]: AnimationAction } = {};

  constructor(appKey: string, options: MetalitixLoggerOptions = {}) {
    super(appKey, options);

    this.vector3 = new Vector3();
    this.euler = new Euler();
    this.quaternion = new Quaternion();
  }

  protected getPositionData = async (camera: PerspectiveCamera | null, object3D?: Object3D | null) => {
    if (camera === null) {
      return undefined;
    }
    camera.getWorldPosition(this.vector3);
    camera.getWorldQuaternion(this.quaternion);
    this.euler.setFromQuaternion(this.quaternion);

    if (object3D !== undefined && object3D !== null) {
      const vector3 = new Vector3();
      const scale = new Vector3();
      const euler = new Euler();
      const quaternion = new Quaternion();
      object3D.getWorldPosition(vector3);
      object3D.getWorldScale(scale);
      object3D.getWorldQuaternion(quaternion);
      euler.setFromQuaternion(quaternion);

      this.vector3.sub(vector3);
      this.euler.x -= euler.x;
      this.euler.y -= euler.y;
      this.euler.z -= euler.z;
      this.vector3.divide(scale);
    }

    return {
      position: { x: this.vector3.x, y: this.vector3.y, z: this.vector3.z },
      direction: { x: this.euler.x, y: this.euler.y, z: this.euler.z },
    };
  };

  protected getCameraData = async (camera: PerspectiveCamera | null) => {
    if (camera === null) {
      return undefined;
    }
    return {
      fieldOfView: camera.fov,
      aspectRatio: camera.aspect,
      zNearPlane: camera.near,
      zFarPlane: camera.far,
    };
  };

  protected getAnimationsData = () => {
    return Object.values(this.animationActions).map(action => {
      const clip = action.getClip();

      return {
        name: clip.name,
        progress: action.time / clip.duration,
        weight: action.weight,
        loop: action.loop === LoopRepeat,
      };
    });
  };

  public updateCameraObject = (camera: PerspectiveCamera) => {
    this.object3D = camera;
  };

  public addAnimation = (action: AnimationAction) => {
    const clipName = action.getClip().name;
    this.animationActions[clipName] = action;
  };

  public clearAnimations = () => {
    this.animationActions = {};
  };
}
