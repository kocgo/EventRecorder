import eventsToRecord from './dom-events-to-record'
import {finder} from '@medv/finder'

const DEFAULT_MOUSE_CURSOR = 'default'

declare var window: any;
declare var chrome: any;

export default class EventRecorder {
  _boundedMessageListener: any;
  _eventLog : any[];
  _previousEvent: any;
  _dataAttribute: any;
  _uiController: any;
  _screenShotMode: boolean;
  _isTopFrame : boolean;
  _isRecordingClicks: boolean;
  
  constructor () {
    this._boundedMessageListener = null
    this._eventLog = []
    this._previousEvent = null
    this._dataAttribute = null
    this._uiController = null
    this._screenShotMode = false
    this._isTopFrame = (window.location === window.parent.location)
    this._isRecordingClicks = true
  }

  _initializeRecorder () {
    const events = Object.values(eventsToRecord)
    if (!window.pptRecorderAddedControlListeners) {
      this._addAllListeners(events)
      this._boundedMessageListener = this._boundedMessageListener;
      window.pptRecorderAddedControlListeners = true

    }
  }

  _addAllListeners (events) {
    const boundedRecordEvent = this._recordEvent.bind(this)
    events.forEach(type => {
      window.addEventListener(type, boundedRecordEvent, true)
    })
  }

  _recordEvent (e) {
    if (this._previousEvent && this._previousEvent.timeStamp === e.timeStamp) return
    this._previousEvent = e

    // we explicitly catch any errors and swallow them, as none node-type events are also ingested.
    // for these events we cannot generate selectors, which is OK
    try {
      this._eventLog.push({
        selector: this._getSelector(e),
        value: e.target.value,
        tagName: e.target.tagName,
        action: e.type,
        keyCode: e.keyCode ? e.keyCode : null,
        href: e.target.href ? e.target.href : null,
        coordinates: EventRecorder._getCoordinates(e)
      })
    } catch (e) {}
  }

  _getEventLog () {
    return this._eventLog
  }

  _clearEventLog () {
    this._eventLog = []
  }

  _disableClickRecording () {
    this._isRecordingClicks = false
  }

  _enableClickRecording () {
    this._isRecordingClicks = true
  }

  _getSelector (e) {
    if (this._dataAttribute && e.target.getAttribute(this._dataAttribute)) {
      return `[${this._dataAttribute}="${e.target.getAttribute(this._dataAttribute)}"]`
    }

    if (e.target.id) {
      return `#${e.target.id}`
    }

    return finder(e.target, {
      seedMinLength: 5,
      optimizedMinLength: (e.target.id) ? 2 : 10,
      attr: (name, _value) => name === this._dataAttribute
    })
  }

  static _getCoordinates (evt) {
    const eventsWithCoordinates = {
      mouseup: true,
      mousedown: true,
      mousemove: true,
      mouseover: true
    }
    return eventsWithCoordinates[evt.type] ? { x: evt.clientX, y: evt.clientY } : null
  }
}