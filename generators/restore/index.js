/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var fs = require("fs-extra");
var path = require("path");
var paths = require("../../util/paths");
var constants = require("../../util/constants");

/*
 * Compose with oraclejet:restore-web or oraclejet:restore-hybrid
 */
var OracleJetRestoreGenerator = generators.Base.extend(
{
  constructor: function() 
  {
    generators.Base.apply(this, arguments);
  },

  initializing: function() 
  {
    // if the project contains cordova's config.xml, consider it to be a hybrid; otherwise web
    const cordovaDir = paths.getConfiguredPaths(this.destinationPath()).stagingHybrid;
    this._hybrid = fs.existsSync(path.resolve(cordovaDir, constants.CORDOVA_CONFIG_XML));
  },

  end: function() 
  {
    var appType = constants.APP_TYPE;
    var restoreType = this._hybrid ? appType.HYBRID : appType.WEB;
    this.options.invokedByRestore = true;

    this.composeWith(
      "oraclejet:restore-" + restoreType,
      {options: this.options, arguments: this.arguments});
  }
});

module.exports = OracleJetRestoreGenerator;
