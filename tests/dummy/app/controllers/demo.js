import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ["perPage", "page"],
  perPage: 10,
  page: 3
});
