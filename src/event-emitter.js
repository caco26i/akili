import utils from './utils';

export default class EventEmitter {
  constructor(name, el, component) {
    this.name = name;
    this.el = el;
    this.component = component;
    this.elComponent = this.el.__akili || null;
  }

  /**
   * Trigger the event
   *
   * @param {*} data - sending data. Will be in the event.detail
   * @param {object} [options]
   * @param {boolean} [force]
   * @returns {Promise}
   */
  trigger(data, options = {}, force = false) {
    if (force || !this.inEvaluating()) {
      this.el.dispatchEvent(new CustomEvent(this.name, this.prepareOptions({ detail: data,  ...options })));
    }   
  }

  /**
   * Dispatch the event
   *
   * @param {Event} _Event - class of the event
   * @param {object} [options]
   * @param {boolean} [force]
   * @returns {Promise}
   */
  dispatch(_Event, options = {}, force = false) {
    if (force || !this.inEvaluating()) {
      this.el.dispatchEvent(new _Event(this.name, this.prepareOptions(options)));
    }
  }

  prepareOptions(options) {
    options = { bubbles: true, ...options };  
    this.elComponent && !this.elComponent.__saveAttributeProxyOut && (options.detail = utils.copy(options.detail));
    return options;
  }

  /**
   * Check event callback doesn't run recursive
   *
   * @returns {boolean}
   */
  inEvaluating() {
    let data = this.component.__evaluatingEvent;

    if (!data) {
      return false;
    }

    return data.el === this.el && data.event.type === this.name && data.component === this.component;
  }

  /**
   * Bind the function
   *
   * @param {function} fn
   */
  bind(fn) {
    this.el.addEventListener(this.name, this.fn = fn);
  }

  /**
   * Unbind the function
   */
  unbind() {
    this.fn && this.el.removeEventListener(this.name, this.fn);
  }
}