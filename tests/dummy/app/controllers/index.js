import Ember from 'ember';
import { computed } from 'ember-can';

var Post = Ember.Object.extend();

var editablePost = Post.create({
  author: 42,
  title: "Something"
});

var otherPost = Post.create({
  author: 99,
  title: "Something Else"
});

export default Ember.ObjectController.extend({
  ability:      computed.ability("post"),
  canWritePost: Ember.computed.alias("ability.canWrite"),
  post: editablePost,

  actions: {
    selectEditable: function() {
      this.set("post", editablePost);
    },
    selectOther:    function() {
      this.set("post", otherPost);
    }
  }
});