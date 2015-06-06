import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from '../helpers/start-app';
import Pretender from 'pretender';

var App, server, zoom;

var posts = [
  { id: 1, name: "Squarepusher", category: "a" },
  { id: 2, name: "Aphex Twin", category: "b" },
  { id: 3, name: "Universal Indicator", category: "a" },
  { id: 4, name: "Mike & Rich", category: "b" },
  { id: 5, name: "Alroy Road Tracks", category: "a" },
  { id: 6, name: "AFX", category: "b" }
];

module('Acceptance: Infinity Route', {
  setup() {
    App = startApp();

    $('#ember-testing').css({ zoom: "100%" });

    server = new Pretender(function() {
      this.get('/posts', function(request) {
        var body, subset, perPage, startPage, offset;

        if (request.queryParams.category) {
          subset = posts.filter(post => {
            return post.category === request.queryParams.category;
          });
        } else {
          subset = posts;
        }
        perPage = parseInt(request.queryParams.per_page, 10);
        startPage = parseInt(request.queryParams.page, 10);

        var pageCount = Math.ceil(subset.length / perPage);
        offset = perPage * (startPage - 1);
        subset = subset.slice(offset, offset + perPage);

        body = { posts: subset, meta: { total_pages: pageCount, page: offset } };

        return [200, {"Content-Type": "application/json"}, JSON.stringify(body)];
      });
    });
  },
  teardown() {
    // TODO restore zoom
    Ember.run(App, 'destroy');
    server.shutdown();
  }
});

test('it works when meta is present in payload', assert => {
  visit('/test');

  andThen(() => {
    var postsTitle     = find('#posts-title');
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');

    assert.equal(postsTitle.text(), "Listing Posts");
    assert.equal(postList.find('li').length, 6);
    assert.equal(infinityLoader.hasClass('reached-infinity'), true);
  });
});

test('it works with parameters', assert => {
  visit('/category/a?perPage=2');

  andThen(() => {
    var postsTitle     = find('#posts-title');
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');

    assert.equal(postsTitle.text(), "Listing Posts using Parameters", "Post title text is correct");
    assert.equal(postList.find('li').length, 2, "Two items should be in the list");
    assert.equal(postList.find('li:first-child').text(), "Squarepusher", "First item should be 'Squarepusher'");
    assert.equal(infinityLoader.hasClass('reached-infinity'), false, "Infinity should not yet have been reached");
  });
});

test('it loads more results after scrolling to the bottom', function(assert) {
  var done1 = assert.async();
  var done2 = assert.async();
  var self  = this;

  visit('/category/a?perPage=2');

  andThen(() => {
    var postsTitle     = find('#posts-title');
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');

    assert.equal(postsTitle.text(), "Listing Posts using Parameters");
    assert.equal(postList.find('li').length, 2);
    assert.equal(infinityLoader.hasClass('reached-infinity'), false);

    $("#ember-testing-container").animate({ scrollTop: $("#ember-testing").height() }, 500, done1);
  });

  setTimeout(function() {
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');

    assert.equal(postList.find('li').length, 3);
    assert.equal(infinityLoader.hasClass('reached-infinity'), true);
    done2();
  }, 1000);
});

test('it loads more results after scrolling to the top', function(assert) {
  var done1 = assert.async();
  var done2 = assert.async();
  var done3 = assert.async();
  var self  = this;

  $('#ember-testing').css({ zoom: "100%" });
  visit('/category/a?perPage=2&page=2');

  andThen(() => {
    var postsTitle     = find('#posts-title');
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');
    var topLi          = postList.find('li:first-child');

    assert.equal(topLi.text(), "Alroy Road Tracks");
    assert.equal(postsTitle.text(), "Listing Posts using Parameters");
    assert.equal(postList.find('li').length, 1);

    $("#ember-testing-container").animate({ scrollTop: 50 }, 500, done1);
    $("#ember-testing-container").animate({ scrollTop: 0 },  500, done2);
  });


  setTimeout(function() {
    var postList       = find('ul');
    var infinityLoader = find('.infinity-loader');
    var topLi          = postList.find('li:first-child');

    assert.equal(postList.find('li').length, 3);
    assert.equal(infinityLoader.hasClass('reached-infinity'), true);
    assert.equal(topLi.text(), "Squarepusher");
    done3();
  }, 1000);
});
