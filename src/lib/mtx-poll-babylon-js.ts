import { Scene, AnimationGroup, TransformNode } from 'babylonjs';
import { radToDeg } from 'three/src/math/MathUtils';
import { MetalitixLoggerOptions } from '../types';
import MetalitixLoggerBase from './mtx-poll-base';

export default class MetalitixLogger extends MetalitixLoggerBase<Scene, TransformNode> {
  private animationGroups: { [key: string]: AnimationGroup } = {};

  constructor(appKey: string, options: MetalitixLoggerOptions = {}) {
    super(appKey, options);
  }

  protected getPositionData = async (scene: Scene | null, object3D: TransformNode | null) => {
    const camera = scene?.activeCamera ?? null;
    if (camera === null) {
      return undefined;
    }

    const euler = camera.absoluteRotation.toEulerAngles().normalize();
    const position = { x: camera.position.x, y: camera.position.y, z: camera.position.z };
    const direction = { x: euler.x, y: euler.y * -1, z: euler.z };

    if (object3D !== null) {
      position.x -= object3D.position.x;
      position.y -= object3D.position.y;
      position.z -= object3D.position.z;

      const object3DEuler = object3D.rotationQuaternion?.toEulerAngles() || { x: 0, y: 0, z: 0 };
      direction.x -= object3DEuler.x;
      direction.y -= object3DEuler.y * -1;
      direction.z -= object3DEuler.y;

      position.x /= object3D.scaling.x;
      position.y /= object3D.scaling.y;
      position.z /= object3D.scaling.z;
    }

    return { position, direction };
  };

  protected getCameraData = async (scene: Scene | null) => {
    const camera = scene?.activeCamera ?? null;
    if (camera === null) {
      return undefined;
    }

    return {
      fieldOfView: Math.round(radToDeg(camera.fov)),
      aspectRatio: camera.viewport.width / camera.viewport.height,
      zNearPlane: camera.minZ,
      zFarPlane: camera.maxZ,
    };
  };

  protected getAnimationsData = () => {
    return Object.values(this.animationGroups).map(animationGroup => {
      const animation = animationGroup.targetedAnimations[0].animation;
      const runtimeAnimation = animation.runtimeAnimations[0];
      const keys = animation.getKeys();
      const numFrames = keys[keys.length - 1].frame;
      const currentFrame = runtimeAnimation.currentFrame;
      const progress = currentFrame / numFrames;

      return {
        name: animationGroup.name,
        progress,
        weight: runtimeAnimation.weight,
        loop: animationGroup.loopAnimation,
      };
    });
  };

  public addAnimation = (animationGroup: AnimationGroup) => {
    this.animationGroups[animationGroup.name] = animationGroup;
  };

  public clearAnimations = () => {
    this.animationGroups = {};
  };
}
