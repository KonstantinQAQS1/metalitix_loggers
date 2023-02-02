import MetalitixLoggerBase from './mtx-poll-base';
import { MetalitixLoggerOptions, Vector3D } from '../types';

interface Object3D {
  position: Vector3D;
  rotation: { eulerAngles: Vector3D };
}

class MetalitixLogger extends MetalitixLoggerBase<Object3D, Object3D> {
  constructor(appKey: string, options: MetalitixLoggerOptions = {}) {
    super(appKey, options);
  }

  protected getPositionData = async (cameraInstance: Object3D | null) => {
    if (cameraInstance === null) {
      return undefined;
    }
    const position = cameraInstance.position;
    const direction = cameraInstance.rotation.eulerAngles;

    return {
      position: { x: position.x, y: position.y, z: position.z },
      direction: { x: direction.x, y: direction.y, z: direction.z },
    };
  };

  protected getCameraData = async (cameraEntity: Object3D | null) => {
    if (cameraEntity === null) {
      return undefined;
    }
    return {
      fieldOfView: 45,
      aspectRatio: window.innerWidth / window.innerHeight,
      zNearPlane: 0.05,
      zFarPlane: 2000,
    };
  };

  protected getAnimationsData = () => {
    // TODO: add animations support
    return [];
  };
}

export default MetalitixLogger;
