import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ["perPage", "page"],
  perPage: 2,
  page: 1
});
