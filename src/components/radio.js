import For, { Loop } from './for.js';
import Akili from '../akili.js';

/**
 * Component to work with radio group.
 * 
 * {@link https://akilijs.com/docs/components#docs_radio_group}
 * 
 * @tag radio
 * @selector radio[name]
 * @attr {string} name - name of the group
 * @attr {string|null} value - selected value
 * @attr [in] @see For
 * @message {string} radio - sent on value change
 */
export default class Radio extends For {
  static matches = '[name]';
  static events = ['radio'].concat(For.events);

  static define() {
    Akili.component('radio', this);
    Akili.component('radio-button', this.RadioButton);
  }

  constructor(...args) {
    super(...args);
    this.iterable = this.el.hasAttribute('in');
  }

  created() {
    this.el.addEventListener('change', () => { 
      if(this._disableInternalEvents) {
        return;
      }
      
      let value = this.getRadioValue();

      if (value === this.prevValue) {
        return;
      }

      this.prevValue = value;

      if(this.attrs.value === undefined || this.__isResolved) {
        this.attrs.onRadio.trigger(value, { bubbles: true });
      }      
    });

    if(this.iterable) {
      return super.created.apply(this, arguments);
    }
  }

  compiled() {
    if(this.iterable) {
      const res = super.compiled.apply(this, arguments);
      this.unattr('in', this.draw);
      return res;
    }
  }

  resolved() {
    this.attr('value', this.setValue);
    this.attr('name', this.setNames);
    return this.attr('in', this.setIn, { callOnStart: false });
  }

  setIn(data) {
    return this.draw(data).then(this.redrawRadio.bind(this));
  }

  redrawRadio() {
    this.setNames();    
    const value = this.isProperValue(this.prevValue)? this.prevValue: null;
    const children = this.children('input[type=radio]');
    let checkedValue = value;

    for (let i = 0, l = children.length; i < l; i++) {
      let radioEl = children[i].el;      
      let selection = !!radioEl.getAttribute('checked');
      
      if(value && radioEl.value !== value) {
        radioEl.checked = false;
        continue;
      } 

      if(value) {
        radioEl.checked = true;
        checkedValue = radioEl.value;
        continue;
      }      
      
      radioEl.checked = selection;
      selection && (checkedValue = radioEl.value);
    }

    if(checkedValue === null && children.length) {
      checkedValue = children[0].el.value;
    }

    this.setValue(checkedValue);
  }

  isProperValue(value) { 
    const children = this.children('input[type=radio]');

    for (let i = 0, l = children.length; i < l; i++) {
      if(children[i].el.value === value) {
        return true;
      }
    }

    return false;
  }

  setNames(name) {
    let children = this.children('input[type=radio]');

    for (let i = 0, l = children.length; i < l; i++) {
      children[i].el.setAttribute('name', name || this.attrs.name);
    }
  }

  setValue(value) {    
    if (value === this.prevValue) {
      return;
    }
    
    let children = this.children('input[type=radio]');    
    this._disableInternalEvents = true;
    
    for (let i = 0, l = children.length; i < l; i++) {
      let radio = children[i];
      radio.setChecked(radio.el.value === value);
    }

    this._disableInternalEvents = false;
    this.prevValue = value;
    this.attrs.onRadio.trigger(value, { bubbles: true });    
  }

  getRadioValue() {
    let children = this.children('input[type=radio]');

    for (let i = 0, l = children.length; i < l; i++) {
      let radio = children[i];

      if (radio.el.checked) {
        return radio.el.value;
      }
    }

    return null;
  }
}

/**
 * Component to work with radio group item.
 * 
 * {@link https://akilijs.com/docs/components#docs_radio_group}
 * 
 * @tag radio-button
 * @attr {string} value - value
 */
export class RadioButton extends Loop {
  static template = '<label><input type="radio" value="${this.value}"/>${this.__content}</label>';

  constructor(...args) {
    super(...args);
  }

  compiled() {
    this.attr('value', 'value');
    return super.compiled.apply(this, arguments);
  }
}

Radio.RadioButton = RadioButton;