import { ANode, Component } from 'aframe';
import { PerspectiveCamera } from 'three/src/cameras/PerspectiveCamera';
import { DEFAULT_INTERVAL_VALUE } from '../constants';
import MetalitixLoggerBase from './mtx-poll-base';
import { Vector3 } from 'three/src/math/Vector3';
import { Euler } from 'three/src/math/Euler';
import { Quaternion } from 'three/src/math/Quaternion';
import { MetalitixLoggerOptions } from '../types';
import { AnimationAction } from 'three/src/animation/AnimationAction';
import { LoopRepeat } from 'three/src/constants';
import { Object3D } from 'three';

class MetalitixLogger extends MetalitixLoggerBase<ANode, Object3D> {
  private vector3: Vector3;
  private euler: Euler;
  private quaternion: Quaternion;
  private animationActions: { [key: string]: AnimationAction } = {};
  private loadingOrder: number;

  constructor(appKey: string, options: MetalitixLoggerOptions = {}) {
    super(appKey, options);

    this.vector3 = new Vector3();
    this.euler = new Euler();
    this.quaternion = new Quaternion();
    this.loadingOrder = 0;
  }

  private getCamera = (scene: ANode | null): Promise<PerspectiveCamera | null> => {
    return new Promise(resolve => {
      const camera = (scene?.closestScene().camera as unknown as PerspectiveCamera) ?? null;

      if (camera !== null) {
        return resolve(camera);
      }

      scene?.addEventListener('loaded', () => {
        setTimeout(() => {
          resolve((scene?.closestScene().camera as unknown as PerspectiveCamera) ?? null);
        }, this.loadingOrder);
      });

      this.loadingOrder = 50;
    });
  };

  protected getPositionData = async (scene: ANode | null, object3D: Object3D | null) => {
    const camera = await this.getCamera(scene);
    if (camera === null) {
      return undefined;
    }
    camera.getWorldPosition(this.vector3);
    camera.getWorldQuaternion(this.quaternion);
    this.euler.setFromQuaternion(this.quaternion);

    const resultObject3D = object3D ?? (scene?.closestScene().object3D as unknown as Object3D) ?? null;

    if (resultObject3D !== null) {
      const vector3 = new Vector3();
      const scale = new Vector3();
      const euler = new Euler();
      const quaternion = new Quaternion();
      resultObject3D.getWorldPosition(vector3);
      resultObject3D.getWorldScale(scale);
      resultObject3D.getWorldQuaternion(quaternion);
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

  protected getCameraData = async (scene: ANode | null) => {
    const camera = await this.getCamera(scene);
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

  public addAnimation = (action: AnimationAction) => {
    const clipName = action.getClip().name;
    this.animationActions[clipName] = action;
  };

  public clearAnimations = () => {
    this.animationActions = {};
  };
}

const MetalitixLoggerAFRAME: Partial<Component> & { logger?: MetalitixLogger } = {
  schema: {
    interval: { default: DEFAULT_INTERVAL_VALUE },
    appkey: { default: 'test-appkey-1234-qwertyuiop' },
    showSurvey: { type: 'boolean', default: false },
    surveyTheme: { default: 'white' },
  },
  init() {
    this.logger = new MetalitixLogger(this.data.appkey, {
      pollInterval: this.data.interval,
      showSurvey: this.data.showSurvey,
      surveyTheme: this.data.surveyTheme,
    });
    this.logger.startSession(this.el as ANode);
  },
  pause() {
    this.logger?.pauseSession();
  },
  play() {
    this.logger?.resumeSession();
  },
  remove() {
    this.logger?.endSession();
  },
};

AFRAME.registerComponent('metalitix-logger', MetalitixLoggerAFRAME);

export default MetalitixLogger;
