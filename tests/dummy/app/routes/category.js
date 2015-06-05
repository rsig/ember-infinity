import Ember from 'ember';
import InfinityRoute from 'ember-infinity/mixins/route';

export default Ember.Route.extend(InfinityRoute, {
  queryParams: {
    perPage: {},
    page:    {}
  },

  model(params) {
    return this.infinityModel('post', {
      category: params.category,
      perPage:  params.perPage,
      page:     params.page
    });
  }
});
