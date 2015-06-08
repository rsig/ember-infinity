import Ember from 'ember';
import layout from '../templates/components/infinity-loader';

export default Ember.Component.extend({
  layout: layout,
  classNames: ["infinity-loader"],
  classNameBindings: ["infinityModel.reachedInfinity"],
  guid: null,
  scrollDebounce: 10,
  loadMoreUpAction: 'infinityLoadUp',
  loadMoreAction: 'infinityLoad',
  loadingText: 'Loading Infinite Model...',
  loadedText: 'Infinite Model Entirely Loaded.',
  destroyOnInfinity: false,
  developmentMode: false,
  scrollable: null,
  topScrollOffset: 30,

  didInsertElement() {
    this._super(...arguments);
    this._setupScrollable();
    this.set('guid', Ember.guidFor(this));
    this._bindScroll();
    this._checkIfBottomInView();
    console.log(this.get("scrollable"))
  },

  willDestroyElement() {
    this._super(...arguments);
    this._unbindScroll();
  },

  _bindScroll() {
    this.get("scrollable").on(`scroll.${this.get('guid')}`, () => {
      Ember.run.debounce(this, this._checkIfInView, this.get('scrollDebounce'));
    });
  },

  _unbindScroll() {
    this.get("scrollable").off(`scroll.${this.get('guid')}`);
  },

  _checkIfInView() {
    this._checkIfBottomInView();
    this._checkIfTopInView();
  },

  _checkIfTopInView() {
    var scrollable = this.get("scrollable");
    var inView     = scrollable.scrollTop() <= 0 //<= this.get("topScrollOffset");

    if(inView && !this.get('developmentMode')) {
      this.sendAction('loadMoreUpAction');
      return true;
    }
    return false;
  },

  _checkIfBottomInView() {
    var selfOffset       = this.$().offset().top;
    var scrollable       = this.get("scrollable");
    var scrollableBottom = scrollable.height() + scrollable.scrollTop();

    var inView = selfOffset < scrollableBottom;

    if (inView && !this.get('developmentMode')) {
      this.sendAction('loadMoreAction');
      return true;
    }
    return false;
  },

  _setupScrollable() {
    var scrollable = this.get('scrollable');
    if (Ember.typeOf(scrollable) === 'string') {
      var items = Ember.$(scrollable);
      if (items.length === 1) {
        this.set('scrollable', items.eq(0));
      } else if (items.length > 1) {
        throw new Error("Multiple scrollable elements found for: " + scrollable);
      } else {
        throw new Error("No scrollable element found for: " + scrollable);
      }
    } else {
      this.set('scrollable', Ember.$(window));
    }
  },

  loadedStatusDidChange: Ember.observer('infinityModel.reachedInfinity', 'destroyOnInfinity', function () {
    if (this.get('infinityModel.reachedInfinity') && this.get('destroyOnInfinity')) {
      this.destroy();
    }
  })
});
