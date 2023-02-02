import { getXRAnalyticsDataStream, sendXRAnalyticsData } from '../services';
import {
  DEFAULT_INTERVAL_VALUE,
  DEFAULT_INACTIVITY_INTERVAL,
  MAX_INTERVAL_VALUE,
  MAXIMUM_BATCH_RECORDS_LENGTH,
  MAXIMUM_BATCH_SENDING_INTERVAL,
  MAXIMUM_SESSION_KEEPALIVE_TIME,
  MIN_INTERVAL_VALUE,
} from '../constants';
import { MetalitixLoggerOptions, SurveyTheme, XRAnalytics } from '../types';
import { deepEqual, delay, systemInfo } from '../utils';
import { addSurvey } from './mtx-engagement-survey';
import { DataStream } from './mtx-data-stream';

export default abstract class MetalitixLoggerBase<T, K> {
  private appKey: string;
  private apiVersion: string = 'v2'; // TODO: update when server side will be updated
  private interval: number = DEFAULT_INTERVAL_VALUE;
  private inactivityInterval: number;
  protected sessionId: string | null;
  private dataStream: DataStream | null;
  private pollRecords: XRAnalytics.Record[];
  private lastPollTimestamp: number;
  private nextPoll: number;
  private pollInProgress: boolean;
  private previousCameraData: XRAnalytics.UserCamera | null;
  private customData: { [key: string]: any } = {};
  private previousData: { [key: string]: any } = {};
  private previousDataChanged: number;
  private userMeta: Partial<XRAnalytics.UserMetadata>;
  private showSurveyAutomatically: boolean;
  private surveyTheme?: SurveyTheme;
  private autoSurveyShowInMs: number;
  private surveyTimer: number;
  private prevFPSTime: number;
  private frames: number;
  private currentFPS: number;
  private loopFPSRequestId: number;
  private previousAnimations: { [key: string]: XRAnalytics.Animation } = {};
  private inactivityListeners: Array<() => void> = [];
  protected cameraOrScene: T | null = null;
  protected object3D: K | null = null;

  constructor(appKey: string, options: MetalitixLoggerOptions = {}) {
    const {
      pollInterval = DEFAULT_INTERVAL_VALUE,
      userMeta = {},
      showSurvey = true,
      surveyTheme,
      inactivityInterval = DEFAULT_INACTIVITY_INTERVAL,
    } = options;
    this.appKey = appKey;
    this.userMeta = userMeta;
    this.setPollInterval(pollInterval);
    this.inactivityInterval = inactivityInterval;
    this.sessionId = null;
    this.dataStream = null;
    this.previousCameraData = null;
    this.pollRecords = [];
    this.lastPollTimestamp = -1;
    this.pollInProgress = false;
    this.nextPoll = -1;
    this.previousDataChanged = Date.now();
    this.pollInProgress = false;
    this.showSurveyAutomatically = showSurvey;
    this.surveyTheme = surveyTheme;
    /** Show survey automatically in range between 30 seconds and 3 minutes */
    this.autoSurveyShowInMs = (30 + 150 * Math.random()) * 1000;
    this.surveyTimer = -1;
    this.prevFPSTime = Date.now();
    this.frames = 0;
    this.currentFPS = 0;
    this.loopFPSRequestId = -1;
  }

  public setPollInterval = (pollInterval: number) => {
    this.interval = Math.min(MAX_INTERVAL_VALUE, Math.max(MIN_INTERVAL_VALUE, pollInterval));
  };

  private updateFPS = () => {
    this.frames++;

    let time = Date.now();

    if (time >= this.prevFPSTime + 1000) {
      this.currentFPS = (this.frames * 1000) / (time - this.prevFPSTime);

      this.prevFPSTime = time;
      this.frames = 0;
    }
  };

  private loopFPS = () => {
    this.loopFPSRequestId = requestAnimationFrame(() => {
      this.updateFPS();
      this.loopFPS();
    });
  };

  private stopFPSLoop = () => {
    cancelAnimationFrame(this.loopFPSRequestId);
  };

  public setCustomField = (key: string, value: any) => {
    this.customData[key] = value;
  };

  public removeCustomField = (key: string) => {
    delete this.customData[key];
  };

  public clearAllCustomFields = () => {
    this.customData = {};
  };

  public addInactivityListener = (cb: () => void) => {
    this.inactivityListeners.push(cb);
  };

  public clearInactivityListeners = () => {
    this.inactivityListeners = [];
  };

  private fireAllInactivityListeners = () => {
    this.inactivityListeners.forEach(inactivityListener => inactivityListener());
  };

  private getRecord = async (
    eventType: XRAnalytics.EventTypes,
    sessionId: string,
    { userEvent, camera }: XRAnalytics.RecordDataFields,
  ) => {
    const data = await this.getPositionData(this.cameraOrScene, this.object3D);
    const userMeta = this.getUserMeta();

    if (data === undefined) {
      throw new Error('Data is required field!');
    }

    if (!deepEqual(this.previousData, data)) {
      this.previousData = data;
      this.previousDataChanged = Date.now();
    }

    const resultData = Object.assign({}, this.customData, data);

    const currentAnimations = this.getAnimationsData();
    const animations: XRAnalytics.Animation[] = [];
    currentAnimations.forEach(animation => {
      const previousAnimation = this.previousAnimations[animation.name];

      if (previousAnimation === undefined || !deepEqual(previousAnimation, animation)) {
        animations.push(animation);
      }

      this.previousAnimations[animation.name] = animation;
    });

    const base: XRAnalytics.RecordBase = {
      apiver: this.apiVersion,
      sessionId,
      timestamp: Date.now(),
      animations,
      data: resultData,
      userMeta,
    };

    if (this.currentFPS > 0) {
      base.metrics = base.metrics ?? {};
      base.metrics.fps = Math.round(this.currentFPS);
    }

    if (eventType === XRAnalytics.EventTypes.SessionStart) {
      console.assert(camera !== undefined, '"camera" is required for session start!');
      return Object.assign({}, base, { eventType, camera }) as XRAnalytics.SessionStartRecord;
    }

    if (eventType === XRAnalytics.EventTypes.SessionUpdate) {
      return Object.assign({}, base, { eventType, camera }) as XRAnalytics.SessionUpdateRecord;
    }

    if (eventType === XRAnalytics.EventTypes.SessionEnd) {
      return Object.assign({}, base, { eventType, camera }) as XRAnalytics.SessionEndRecord;
    }

    if (eventType === XRAnalytics.EventTypes.UserPosition) {
      return Object.assign({}, base, { eventType }) as XRAnalytics.UserPositionRecord;
    }

    if (eventType === XRAnalytics.EventTypes.UserInteraction) {
      console.assert(userEvent !== undefined, '"userEvent" is required for user interaction!');
      return Object.assign({}, base, { eventType, userEvent }) as XRAnalytics.UserInteractionRecord;
    }

    throw new Error('Unknown eventType: ' + eventType);
  };

  private addRecord = async (
    eventType: XRAnalytics.EventTypes,
    { userEvent, camera }: XRAnalytics.RecordDataFields,
  ) => {
    if (this.sessionId === null) {
      return;
    }

    const record = await this.getRecord(eventType, this.sessionId, { userEvent, camera });

    this.pollRecords.push(record);
  };

  private sendPosition = async (sendAll = false): Promise<void> => {
    if (this.pollRecords.length === 0) {
      return;
    }

    this.pollInProgress = true;

    try {
      const records = this.pollRecords.slice(0, MAXIMUM_BATCH_RECORDS_LENGTH);

      if (process.env.KINESIS?.toLowerCase() === 'false') {
        const batchRecordsData = {
          appkey: this.appKey,
          apiver: this.apiVersion,
          items: records,
        };

        await sendXRAnalyticsData(batchRecordsData);
      } else {
        await this.dataStream?.sendData(records);
      }

      this.pollRecords = this.pollRecords.slice(MAXIMUM_BATCH_RECORDS_LENGTH);

      if (sendAll) {
        return this.sendPosition(true);
      }

      this.lastPollTimestamp = Date.now();
    } catch (error) {
      if (error instanceof Error && error.message === 'The security token included in the request is invalid.') {
        // Small delay to not spam the Kinesis server until session will be ready to start
        await delay(2000);
        return;
      }
      this.forceStopLoop();
    } finally {
      this.pollInProgress = false;
    }
  };

  protected abstract getPositionData: (
    cameraOrScene: T | null,
    object3D: K | null,
  ) => Promise<XRAnalytics.Data | undefined>;
  protected abstract getCameraData: (cameraOrScene: T | null) => Promise<XRAnalytics.UserCamera | undefined>;
  protected abstract getAnimationsData: () => XRAnalytics.Animation[];

  private getUserMeta = (): Partial<XRAnalytics.UserMetadata> => {
    return Object.assign({}, this.userMeta, {
      userAgent: window.navigator.userAgent,
      pagePath: location.pathname,
      pageQuery: location.search,
      systemInfo,
    });
  };

  private addSessionStart = async () => {
    const camera = await this.getCameraData(this.cameraOrScene);
    this.previousCameraData = camera || null;

    await this.addRecord(XRAnalytics.EventTypes.SessionStart, { camera });
  };
  private addSessionEnd = async () => {
    let camera = await this.getCameraData(this.cameraOrScene);

    if (deepEqual(camera, this.previousCameraData)) {
      /** Don't send the camera object if it was not changed */
      camera = undefined;
    }

    await this.addRecord(XRAnalytics.EventTypes.SessionEnd, { camera });
  };
  private addUserPosition = async () => {
    await this.addRecord(XRAnalytics.EventTypes.UserPosition, {});
  };
  private addSessionUpdate = async (camera?: XRAnalytics.UserCamera) => {
    await this.addRecord(XRAnalytics.EventTypes.SessionUpdate, { camera });
  };

  private addNextUserPositionAndUpdateCameraIfNeeded = async () => {
    const camera = await this.getCameraData(this.cameraOrScene);

    if (camera === undefined || deepEqual(camera, this.previousCameraData)) {
      this.addUserPosition();
    } else {
      this.addSessionUpdate(camera);
      this.previousCameraData = camera;
      this.previousDataChanged = Date.now();
    }
  };

  private sendPositionLoop = async (start = false) => {
    if (Date.now() - this.previousDataChanged > this.inactivityInterval) {
      const camera = await this.getCameraData(this.cameraOrScene);
      const data = await this.getPositionData(this.cameraOrScene, this.object3D);
      if (deepEqual(data, this.previousData) && deepEqual(camera, this.previousCameraData)) {
        if (this.sessionId !== null) {
          this.fireAllInactivityListeners();
          await this.addSessionEnd();
          await this.pauseSession();
          this.sessionId = null;
        }
      } else {
        this.previousDataChanged = Date.now();
        await this.resumeSession();
      }
    } else {
      /** Don't push position twice on session start */
      if (!start) {
        this.addNextUserPositionAndUpdateCameraIfNeeded();
      }

      if (
        !this.pollInProgress &&
        (this.pollRecords.length >= MAXIMUM_BATCH_RECORDS_LENGTH ||
          Date.now() - this.lastPollTimestamp >= MAXIMUM_BATCH_SENDING_INTERVAL)
      ) {
        this.sendPosition();
      }
    }

    /** Stop polling data if `this.cameraOrScene` is `null`  session was ended */
    if (this.cameraOrScene === null && this.sessionId === null) {
      return;
    }

    this.nextPoll = window.setTimeout(() => this.sendPositionLoop(), this.interval);
  };

  private forceStopLoop = () => clearTimeout(this.nextPoll);

  private clearSessionPollRecords = () => {
    this.pollRecords = [];
  };

  private handleVisibilityChange = async () => {
    /**
     *  If user close or switch the browser tab - we need to pause the session
     *  Then if user came back to the browser - we need to try to resume the session if it's possible or start new one
     **/
    return document.visibilityState === 'hidden' ? this.pauseSession() : await this.resumeSession();
  };

  /**
   * In case with platform where position and direction of the camera didn't change
   * user will need to provide 3D object from the scene to calculate position of camera relative to this object
   **/
  public setObject3D = (object3D: K | null) => {
    this.object3D = object3D;
  };

  public startSession = async (cameraOrScene: T, object3D: K | null = null) => {
    if (cameraOrScene === null || cameraOrScene === undefined) {
      console.log('[Metalitix] Parameter is undefined or null when calling startSession()');
      return;
    }

    this.cameraOrScene = cameraOrScene;
    this.setObject3D(object3D);
    const dataStreamCredentials = await getXRAnalyticsDataStream(this.appKey);
    const sessionId = dataStreamCredentials.sessionId;
    this.sessionId = sessionId;
    this.dataStream = new DataStream(dataStreamCredentials);
    this.previousDataChanged = Date.now();
    await this.addSessionStart();
    this.sendPositionLoop(true);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    this.loopFPS();

    if (this.showSurveyAutomatically) {
      this.surveyTimer = window.setTimeout(
        () => addSurvey({ appkey: this.appKey, sessionId, theme: this.surveyTheme }),
        this.autoSurveyShowInMs,
      );
    }
  };

  public pauseSession = () => {
    /** If the session was paused we need to send all our data and stop collecting new items */
    this.forceStopLoop();
    this.stopFPSLoop();
    return this.sendPosition(true);
  };

  public resumeSession = async () => {
    if (Date.now() - this.lastPollTimestamp <= MAXIMUM_SESSION_KEEPALIVE_TIME && this.sessionId !== null) {
      /** If the session was resumed on time - we need to continue collect current session data */
      this.forceStopLoop(); // in case if session was not paused
      this.stopFPSLoop();
      this.loopFPS();
      this.sendPositionLoop();
    } else if (this.cameraOrScene !== null) {
      /** If the session was resumed when server already has closed the session - we need to start new session */
      const cameraOrScene = this.cameraOrScene;
      await this.endSession();
      this.startSession(cameraOrScene);
    }
  };

  public endSession = async (forceClearCustomData = false) => {
    if (this.sessionId === null) {
      /** The session was already ended */
      return;
    }

    if (Date.now() - this.lastPollTimestamp < MAXIMUM_SESSION_KEEPALIVE_TIME) {
      /** Don't send record with session end in case if server already close this session */
      await this.addSessionEnd();
    }
    this.cameraOrScene = null;
    this.sessionId = null;
    this.previousCameraData = null;
    if (forceClearCustomData) {
      this.clearAllCustomFields();
    }
    this.forceStopLoop();
    this.stopFPSLoop();
    await this.sendPosition(true);
    this.dataStream = null;
    this.clearSessionPollRecords();
    this.lastPollTimestamp = -1;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  };

  public isRunning = () => {
    const isPolledRecently = Date.now() - this.lastPollTimestamp < this.interval * 2;
    return this.sessionId !== null && (this.pollInProgress || this.pollRecords.length > 0 || isPolledRecently);
  };

  private updateUserMeta = (userMeta: Partial<XRAnalytics.UserMetadata>) => {
    if (userMeta === undefined) {
      return;
    }

    this.userMeta = userMeta;

    return this.addSessionUpdate();
  };

  private sendUserEvent = async (
    eventName: XRAnalytics.UserInteractionNames | string,
    eventType: XRAnalytics.UserInteractionTypes | string,
    target?: string | XRAnalytics.EventPoint | any,
    points?: XRAnalytics.EventPoint[],
    params?: object,
  ) => {
    const userEvent: XRAnalytics.UserEvent = {
      eventName,
      eventType,
      target,
      points,
      params,
    };

    await this.addRecord(XRAnalytics.EventTypes.UserInteraction, { userEvent });
  };

  public logCustomEvent = (eventName: string, params: object) => {
    this.sendUserEvent(eventName, XRAnalytics.UserInteractionTypes.Custom, undefined, undefined, params);
  };

  public logKeyDownEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.KeyDown,
      XRAnalytics.UserInteractionTypes.KeyDown,
      {
        state: XRAnalytics.PointStates.Pressed,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logKeyPressEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.KeyPress,
      XRAnalytics.UserInteractionTypes.KeyPress,
      {
        state: XRAnalytics.PointStates.Stationary,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logKeyUpEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.KeyUp,
      XRAnalytics.UserInteractionTypes.KeyUp,
      {
        state: XRAnalytics.PointStates.Released,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMouseEnterEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MouseEnter,
      XRAnalytics.UserInteractionTypes.MouseEnter,
      {
        state: XRAnalytics.PointStates.Stationary,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMouseLeaveEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MouseLeave,
      XRAnalytics.UserInteractionTypes.MouseLeave,
      {
        state: XRAnalytics.PointStates.Stationary,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMouseOverEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MouseOver,
      XRAnalytics.UserInteractionTypes.MouseOver,
      {
        state: XRAnalytics.PointStates.Stationary,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMouseOutEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MouseOut,
      XRAnalytics.UserInteractionTypes.MouseOut,
      {
        state: XRAnalytics.PointStates.Stationary,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMouseDownEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MouseDown,
      XRAnalytics.UserInteractionTypes.MouseDown,
      {
        state: XRAnalytics.PointStates.Pressed,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMouseUpEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MouseUp,
      XRAnalytics.UserInteractionTypes.MouseUp,
      {
        state: XRAnalytics.PointStates.Released,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMouseMoveEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MouseMove,
      XRAnalytics.UserInteractionTypes.MouseMove,
      {
        state: XRAnalytics.PointStates.Updated,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logMousePressEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.MousePress,
      XRAnalytics.UserInteractionTypes.MousePress,
      {
        state: XRAnalytics.PointStates.Stationary,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logTouchTapEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.TouchTap,
      XRAnalytics.UserInteractionTypes.TouchTap,
      {
        state: XRAnalytics.PointStates.Stationary,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logTouchStartEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.TouchStart,
      XRAnalytics.UserInteractionTypes.TouchStart,
      {
        state: XRAnalytics.PointStates.Pressed,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logTouchMoveEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.TouchMove,
      XRAnalytics.UserInteractionTypes.TouchMove,
      {
        state: XRAnalytics.PointStates.Updated,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logTouchEndEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.TouchEnd,
      XRAnalytics.UserInteractionTypes.TouchEnd,
      {
        state: XRAnalytics.PointStates.Released,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logZoomStartEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.ZoomStart,
      XRAnalytics.UserInteractionTypes.ZoomStart,
      {
        state: XRAnalytics.PointStates.Pressed,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logZoomUpdateEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.ZoomUpdate,
      XRAnalytics.UserInteractionTypes.ZoomUpdate,
      {
        state: XRAnalytics.PointStates.Updated,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public logZoomEndEvent = (x: number, y: number, params?: object) => {
    this.sendUserEvent(
      XRAnalytics.UserInteractionNames.ZoomEnd,
      XRAnalytics.UserInteractionTypes.ZoomEnd,
      {
        state: XRAnalytics.PointStates.Released,
        timestamp: Date.now(),
        position: { x, y },
      },
      undefined,
      params,
    );
  };

  public showSurvey = (surveyTheme?: SurveyTheme) => {
    clearTimeout(this.surveyTimer);

    if (this.sessionId === null) {
      return;
    }

    addSurvey({ appkey: this.appKey, sessionId: this.sessionId, theme: surveyTheme ?? this.surveyTheme, force: true });
  };
}
