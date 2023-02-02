import MetalitixLoggerBase from './mtx-poll-base';
import { Vector3 } from 'three/src/math/Vector3';
import { MetalitixLoggerOptions } from '../types';
import { AnimationAction } from 'three/src/animation/AnimationAction';
import { LoopRepeat } from 'three/src/constants';

interface Object3D {
  getPosition: () => Vector3;
  getRotation: () => { getEulerAngles: () => Vector3 };
  getLocalScale: () => Vector3;
}

interface CameraEntity {
  getPosition: () => Vector3;
  getRotation: () => { getEulerAngles: () => Vector3 };
  camera: {
    nearClip: number;
    farClip: number;
    fov: number;
    aspectRatio: number;
  };
}

class MetalitixLogger extends MetalitixLoggerBase<CameraEntity, Object3D> {
  private animationActions: { [key: string]: AnimationAction } = {};

  constructor(appKey: string, options: MetalitixLoggerOptions = {}) {
    super(appKey, options);
  }

  protected getPositionData = async (cameraEntity: CameraEntity | null, object3D: Object3D | null) => {
    if (cameraEntity === null) {
      return undefined;
    }
    const cameraPosition = cameraEntity.getPosition();
    const cameraDirection = cameraEntity.getRotation().getEulerAngles();

    const position = { x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z };
    const direction = { x: cameraDirection.x, y: cameraDirection.y, z: cameraDirection.z };

    if (object3D !== null) {
      const object3DPosition = object3D.getPosition();
      const object3DDirection = object3D.getRotation().getEulerAngles();
      const object3DScale = object3D.getLocalScale();

      position.x -= object3DPosition.x;
      position.y -= object3DPosition.y;
      position.z -= object3DPosition.z;
      direction.x -= object3DDirection.x;
      direction.y -= object3DDirection.y;
      direction.z -= object3DDirection.z;
      position.x /= object3DScale.x;
      position.y /= object3DScale.y;
      position.z /= object3DScale.z;
    }

    return { position, direction };
  };

  protected getCameraData = async (cameraEntity: CameraEntity | null) => {
    if (cameraEntity === null) {
      return undefined;
    }
    return {
      fieldOfView: cameraEntity.camera.fov,
      aspectRatio: cameraEntity.camera.aspectRatio,
      zNearPlane: cameraEntity.camera.nearClip,
      zFarPlane: cameraEntity.camera.farClip,
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

  public addAnimation = (action: AnimationAction) => {
    const clipName = action.getClip().name;
    this.animationActions[clipName] = action;
  };

  public clearAnimations = () => {
    this.animationActions = {};
  };
}

export default MetalitixLogger;
