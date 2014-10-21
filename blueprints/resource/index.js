var inflection = require('inflection');
var Promise    = require('ember-cli/lib/ext/promise');
var merge      = require('lodash-node/compat/objects/merge');
var Blueprint  = require('ember-cli/lib/models/blueprint');

module.exports = {
  description: 'Generates a model and route.',

  install: function(options) {
    console.log("Running install");
    return this._process('install', options);
    return this.lookupBlueprint('resource').install(options);
  },

  uninstall: function(options) {
    console.log("Running uninstall");
    return this.lookupBlueprint('resource').uninstall(options);
  },

  _processBlueprint: function(type, name, options) {
    console.log("Running _processBlueprint");
    var mainBlueprint = require('../' + name);
    console.log(mainBlueprint);

    return Promise.resolve()
      .then(function() {
        return mainBlueprint[type](options);
      })
      .then(function() {
        var testBlueprint = require('../' + name + '-test');

        if (!testBlueprint) { return; }

        if (testBlueprint.locals === Blueprint.prototype.locals) {
          testBlueprint.locals = function(options) {
            return mainBlueprint.locals(options);
          }
        }

        return testBlueprint[type](options);
      });
  },

  _process: function(type, options) {
    console.log("Running _process");
    var modelOptions = merge({}, options, {
      entity: {
        name: inflection.singularize(options.entity.name)
      }
    });

    var routeOptions = merge({}, options, { type: 'resource' });

    return Promise.all([
      this._processBlueprint(type, 'model', modelOptions),
      this._processBlueprint(type, 'route', routeOptions)
    ]);
  }
};
