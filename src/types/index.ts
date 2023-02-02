export interface MetalitixLoggerOptions {
  pollInterval?: number;
  userMeta?: Partial<XRAnalytics.UserMetadata>;
  showSurvey?: boolean;
  surveyTheme?: SurveyTheme;
  inactivityInterval?: number;
}

export type SurveyTheme = 'white' | 'black';

export interface AddSurveyProps {
  appkey: string;
  sessionId: string;
  /** If user trigger the survey manually - it will always show the survey popup even if user already submitted it once */
  force?: boolean;
  theme?: SurveyTheme;
}

export interface MetricSurveysData {
  sessionId: string;
  appkey: string;
  rating: number;
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface DataStreamCredentials {
  sessionId: string;
  dataStream: string;
  accessKeyId: string;
  secretKey: string;
  instanceRegion: string;
}

export namespace XRAnalytics {
  export enum PointStates {
    Pressed = 'state.pressed',
    Updated = 'state.updated',
    Released = 'state.released',
    Stationary = 'state.stationary',
  }

  export const KnownPointStates = Object.values(PointStates);

  export enum UserInteractionTypes {
    KeyDown = 'user.interaction.key_down',
    KeyPress = 'user.interaction.key_press',
    KeyUp = 'user.interaction.key_down',
    MouseEnter = 'user.interaction.mouse_enter',
    MouseLeave = 'user.interaction.mouse_leave',
    MouseOver = 'user.interaction.mouse_over',
    MouseOut = 'user.interaction.mouse_out',
    MouseDown = 'user.interaction.mouse_down',
    MouseUp = 'user.interaction.mouse_up',
    MouseMove = 'user.interaction.mouse_move',
    MousePress = 'user.interaction.mouse_press',
    TouchTap = 'user.interaction.touch_tap',
    TouchStart = 'user.interaction.touch_start',
    TouchMove = 'user.interaction.touch_move',
    TouchEnd = 'user.interaction.touch_end',
    ZoomStart = 'user.interaction.zoom_start',
    ZoomUpdate = 'user.interaction.zoom_update',
    ZoomEnd = 'user.interaction.zoom_end',
    Custom = 'user.interaction.custom',
  }

  export const KnownUserInteractionTypes = Object.values(UserInteractionTypes);

  export enum UserInteractionNames {
    KeyDown = 'Key Down',
    KeyPress = 'Key Press',
    KeyUp = 'Key Up',
    MouseEnter = 'Mouse Enter',
    MouseLeave = 'Mouse Leave',
    MouseOver = 'Mouse Over',
    MouseOut = 'Mouse Out',
    MouseDown = 'Mouse Down',
    MouseUp = 'Mouse Up',
    MouseMove = 'Mouse Move',
    MousePress = 'Mouse Press',
    TouchTap = 'Touch Tap',
    TouchStart = 'Touch Start',
    TouchMove = 'Touch Move',
    TouchEnd = 'Touch End',
    ZoomStart = 'Zoom Start',
    ZoomUpdate = 'Zoom Update',
    ZoomEnd = 'Zoom End',
  }

  export const KnownUserInteractionNames = Object.values(UserInteractionNames);

  /**
   * XR Analytic Log Record Event Point
   * - describes event point params
   * @typedef {object} XRAnalyticEventPoint
   * @property {string} state - point state
   * @property {number} timestamp - timestamp in msec or ISO string
   * @property {oneOf|Vector2D|Vector3D} timestamp - timestamp in msec or ISO string
   */
  export interface EventPoint {
    state: PointStates;
    timestamp: number;
    position: Vector2D | Vector3D;
  }

  /**
   * XR Analytic Log Record User Event
   * - describes user events params
   * @typedef {object} XRAnalyticUserEvent
   * @property {string} eventName - human-readable event name
   * @property {string} eventType - event type identifier
   * @property {string} target - optional field which describes target of this event
   * @property {array<XRAnalyticEventPoint>} points - multiple points (for multi-touch) or single point
   * @property {object} params - any additional params
   */
  export interface UserEvent {
    eventName: string;
    eventType: UserInteractionTypes | string;
    target?: string | EventPoint | any;
    points?: EventPoint[];
    params?: object;
  }

  export enum EventTypes {
    UserPosition = 'event.user.position',
    UserInteraction = 'event.user.interaction',
    SessionStart = 'event.session.start',
    SessionUpdate = 'event.session.update',
    SessionEnd = 'event.session.end',
  }

  export const KnownEventTypes = Object.values(EventTypes);

  /**
   * XR Analytic Log Record User Camera
   * - describes user camera params
   * @typedef {object} XRAnalyticUserCamera
   * @property {number} fieldOfView
   * @property {number} aspectRatio
   * @property {number} zNearPlane
   * @property {number} zFarPlane
   */
  export interface UserCamera {
    fieldOfView: number;
    aspectRatio: number;
    zNearPlane: number;
    zFarPlane: number;
  }

  /**
   * XR Analytic Log Record User Metadata
   * - can contain different fields related to user client.
   * These list of fields is approximate and all fields are optional.
   * @typedef {object} XRAnalyticUserMetadata
   * @property {string} ipAddress - user ip address
   * @property {string} geolocation - user geolocation
   * @property {string} userAgent - user client user-agent string
   * @property {string} pagePath - current page
   * @property {string} pageQuery - current query params
   * @property {string} sceneName - current scene name
   * @property {string} gameLocation - current map / in-game location
   * @property {object} systemInfo - free dictionary of sys info (like OS ver or etc.)
   * @property {object} params - any additional params
   */
  export interface UserMetadata {
    ipAddress: string;
    geolocation: string;
    userAgent: string;
    pagePath: string;
    pageQuery: string;
    sceneName: string;
    gameLocation: string;
    systemInfo: MetadataSystemInfo;
    params: object;
  }

  /**
   * XR Analytic Log Record Metadata System Info
   * - can contain different fields related to user client.
   * These list of fields is approximate and all fields are optional.
   * @typedef {object} XRAnalyticUserMetadata
   * @property {string} deviceModel - user device model
   * @property {string} deviceName - user device name
   * @property {string} deviceType - user device type
   * @property {string} operatingSystemName - name of the user operating system
   * @property {string} operatingSystemVersion - version of the user operating system
   */
  export interface MetadataSystemInfo {
    deviceModel?: string;
    deviceName?: string;
    deviceType?: string;
    operatingSystemName?: string;
    operatingSystemVersion?: string;
  }

  /**
   * XR Analytic Log Record User Position
   * - contain position, direction and optionally any additional custom fields
   * @typedef {object} XRAnalyticRecordData
   * @property {Vector3D} position - user position
   * @property {Vector3D} direction - look at direction
   */
  export interface Data {
    position: Vector3D;
    direction: Vector3D;
    [k: string]: any;
  }

  /**
   * XR Analytic Log Animations
   * @typedef {object} XRAnalyticAnimation
   * @property {string} name - animation name
   * @property {number} progress - animation progress
   * @property {boolean} loop - should loop?
   */
  export interface Animation {
    name: string;
    progress: number;
    weight: number;
    loop?: boolean;
  }

  /**
   * XR Analytic Log RecordBase
   * @typedef {object} XRAnalyticRecord
   * @property {string} apiver - expected to be `'v2'`
   * @property {string} sessionId - session uuid
   * @property {number} timestamp - timestamp in msec or ISO string date
   * @property {XRAnalyticAnimation} animations - array of all active animations with their progresses and loop params
   * @property {XRAnalyticRecordData} data - user position and direction on the scene. Can contain any additional custom fields.
   * @property {XRAnalyticUserMetadata} userMeta - required field describing client metadata.
   */
  export interface RecordBase {
    sessionId: string;
    timestamp: number;
    apiver: string;
    animations?: Animation[];
    metrics?: {
      fps?: number;
    };
    data: Data;
    userMeta: Partial<UserMetadata>;
  }

  /**
   * XR Analytic Log RecordDataFields
   * @typedef {object} XRAnalyticRecord
   * @property {XRAnalyticUserCamera} camera - field describing user camera, actual for `event.user.session.start` and `event.user.session.update` events
   * @property {XRAnalyticUserEvent} userEvent - field describing event, actual for `event.user.interaction` events
   */
  export interface RecordDataFields {
    camera?: UserCamera;
    userEvent?: UserEvent;
  }

  /**
   * XR Analytic Log SessionStartRecord
   * @typedef {object} XRAnalyticRecord
   * @property {string} eventType - EventTypes.SessionStart event type
   * @property {string} apiver - expected to be `'v2'`
   * @property {string} sessionId - session uuid
   * @property {number} timestamp - timestamp in msec or ISO string date
   * @property {XRAnalyticUserCamera} camera - required field describing user camera, actual for `event.user.session.start` and `event.user.session.update` events
   * @property {XRAnalyticRecordData} data - user position and direction on the scene. Can contain any additional custom fields.
   */
  export interface SessionStartRecord extends RecordBase {
    eventType: EventTypes.SessionStart;
    camera: UserCamera;
  }

  /**
   * XR Analytic Log SessionUpdateRecord
   * @typedef {object} XRAnalyticRecord
   * @property {string} eventType - EventTypes.SessionUpdate event type
   * @property {string} apiver - expected to be `'v2'`
   * @property {string} sessionId - session uuid
   * @property {number} timestamp - timestamp in msec or ISO string date
   * @property {XRAnalyticUserCamera} camera - optional field describing user camera, actual for `event.user.session.start` and `event.user.session.update` events
   * @property {XRAnalyticRecordData} data - user position and direction on the scene. Can contain any additional custom fields.
   */
  export interface SessionUpdateRecord extends RecordBase {
    eventType: EventTypes.SessionUpdate;
    camera?: UserCamera;
  }

  /**
   * XR Analytic Log SessionEndRecord
   * @typedef {object} XRAnalyticRecord
   * @property {string} eventType - EventTypes.SessionEnd event type
   * @property {string} apiver - expected to be `'v2'`
   * @property {string} sessionId - session uuid
   * @property {number} timestamp - timestamp in msec or ISO string date
   * @property {XRAnalyticUserCamera} camera - optional field describing user camera, actual for `event.user.session.start` and `event.user.session.update` events
   * @property {XRAnalyticRecordData} data - user position and direction on the scene. Can contain any additional custom fields.
   */
  export interface SessionEndRecord extends RecordBase {
    eventType: EventTypes.SessionEnd;
    camera?: UserCamera;
  }

  /**
   * XR Analytic Log UserPositionRecord
   * @typedef {object} XRAnalyticRecord
   * @property {string} eventType - EventTypes.UserPosition event type
   * @property {string} apiver - expected to be `'v2'`
   * @property {string} sessionId - session uuid
   * @property {number} timestamp - timestamp in msec or ISO string date
   * @property {XRAnalyticRecordData} data - user position and direction on the scene. Can contain any additional custom fields.
   */
  export interface UserPositionRecord extends RecordBase {
    eventType: EventTypes.UserPosition;
  }

  /**
   * XR Analytic Log UserInteractionRecord
   * @typedef {object} XRAnalyticRecord
   * @property {string} eventType - EventTypes.UserPosition event type
   * @property {string} apiver - expected to be `'v2'`
   * @property {string} sessionId - session uuid
   * @property {number} timestamp - timestamp in msec or ISO string date
   * @property {XRAnalyticUserEvent} userEvent - required field describing event, actual for `event.user.interaction` events
   * @property {XRAnalyticRecordData} data - user position and direction on the scene. Can contain any additional custom fields.
   */
  export interface UserInteractionRecord extends RecordBase {
    eventType: EventTypes.UserInteraction;
    userEvent: UserEvent;
  }

  /**
   * XR Analytic Log Record
   * @typedef {object} XRAnalyticRecord
   * @property {string} eventType - supported event types
   * @property {string} apiver - expected to be `'v2'`
   * @property {string} sessionId - session uuid
   * @property {number} timestamp - timestamp in msec or ISO string date
   * @property {XRAnalyticUserEvent} userEvent - field describing event, actual for `event.user.interaction` events
   * @property {XRAnalyticUserMetadata} userMeta - field describing client metadata, actual for `event.user.session.start` and `event.user.session.update` events
   * @property {XRAnalyticUserCamera} camera - field describing user camera, actual for `event.user.session.start` and `event.user.session.update` events
   * @property {XRAnalyticRecordData} data - user position and direction on the scene. Can contain any additional custom fields.
   */
  export type Record =
    | SessionStartRecord
    | SessionUpdateRecord
    | SessionEndRecord
    | UserPositionRecord
    | UserInteractionRecord;

  /**
   * XR Analytic Log Batch Records
   * @typedef {object} XRAnalyticBatchRecord
   * @property {string} appkey - project API key
   * @property {string} apiver - expected to be `'v2'`
   * @property {array<XRAnalyticRecord>} items - array of individual events
   */
  export interface BatchRecord {
    appkey: string;
    apiver: string;
    items: Record[];
  }
}
