import Ember from 'ember';
import { normalizeCombined } from '../utils/normalize';

// TODO - find a better way of hooking up the ability to the view scope
// currently we set a unique property on the context/controller, which is rather nasty

var get = Ember.get;
var set = Ember.set;

var _guid = 0;
function guid() {
  return "_ability-"+(++_guid);
}

function makeHelper(isUnless) {
  return function ifHelper(abilityName, resourceName, options) {
    if (arguments.length === 2) {
      options      = resourceName;
      resourceName = null;
    }

    var data      = options.data;
    var container = this.container || (data && data.view && data.view.container);
    var context   = (options.contexts && options.contexts.length) ? options.contexts[0] : this;

    var names   = normalizeCombined(abilityName);
    var ability = container.lookup("ability:"+names.type);

    Ember.assert("No ability type found for "+names.type, ability);

    if (resourceName) {
      var stream = data.view.getStream(resourceName);
      ability.set("model", stream.value());

      stream.subscribe(function(str) {
        ability.set("model", str.value());
      });
    }

    var fn = function(result) {
      return result;
    };

    if (isUnless) {
      var inverse     = options.inverse || function(){ return ''; };
      options.inverse = options.fn;
      options.fn      = inverse;
    }

    // sets the ability to a unique property on the context (controller)
    // so that we can bind to it
    var holder = get(context, "_abilities");
    if (!holder) {
      holder = Ember.Object.create();
      set(context, "_abilities", holder);
    }

    var id = guid();
    set(holder, id, ability);

    // binds to abilities._ability-xxx.canYYY
    // where xxx is the ability instance and YYY is the property on that
    var propName = ["_abilities", id, names.ability].join(".");

    return Ember.Handlebars.bind.call(this, propName, options, true, fn);
  };
}

export var ifHelper     = makeHelper();
export var unlessHelper = makeHelper(true);