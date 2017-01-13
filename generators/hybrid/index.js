/**
  Copyright (c) 2015, 2017, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
"use strict";

var generators = require("yeoman-generator");
var paths = require("../../util/paths");
var path = require("path");
var templateHandler = require("../../common/template/");
var common = require("../../common");
var commonHybrid = require("../../hybrid");
var commonMessages = require("../../common/messages");
var cordovaHelper = require("../../hybrid/cordova");
var platformsHelper = require("../../hybrid/platforms");

/*
 * Generator for the create step
 * Mainly to:
 * 1) copy the template in
 * 2) perform cordova create
 * 3) perform cordova add
 */
var OracleJetHybridCreateGenerator = generators.Base.extend({

  constructor: function() 
  {
    generators.Base.apply(this, arguments);

    this.argument(
      "appDir",
      {
        type: String,
        required: false,
        optional: true,
        defaults: ".",
        desc: "Application directory to contain the scaffold content"
      });

    this.option('platforms', {
      desc: 'Specify the platforms to be supported by the scaffolded hybrid app [android, ios, windows]',
    });
    this.option('platform', {
      desc: 'Alias for --platforms if the user wishes to specify a single hybrid platform [android, ios, windows]'
    });
    this.option('template', {
      desc: 'Specify the starter template that is used to scaffold the app [blank, basic[:web|:hybrid], navbar[:web|:hybrid], navdrawer[:web|:hybrid], or <URL to zip file>'
    });
    this.option('appid', {
      desc: 'Specify the app ID for scaffolded hybrid app',
    });
    // Deprecated version
    this.option("appId",{desc:"Deprecated. Use --appid instead."});
    this.option('appname', {
      desc: 'Specify the app name for scaffolded hybrid app'
    });
    // Deprecated vrsion
    this.option("appName", {desc:"Deprecated. Use --appname instead."});
  },

  initializing: function() 
  {
    var done = this.async();
    common.validateArgs(this)
      .then(common.validateFlags)
      .then(common.validateAppDirNotExistsOrIsEmpty)
      .then(function(validAppDir)
      {
        this.appDir = path.basename(validAppDir);
        
        commonHybrid.setupHybridEnv(this);

        done();
      }.bind(this))
      .catch(function(err)
      {
        this.env.error(commonMessages.prefixError(err));
      }.bind(this));
  },

  prompting: function()
  {
    var done = this.async();
    
    platformsHelper.getPlatforms(this)
      .then(function()
      {
        done();
      });
  },

  writing: function() 
  {
    var done = this.async();
    
    _writeTemplate(this)
      .then(common.writeCommonGruntScripts)
      .then(common.switchToAppDirectory.bind(this))
      .then(common.writeGitIgnore)
      .then(cordovaHelper.create)
      .then(commonHybrid.copyResources.bind(this))
      .then(commonHybrid.removeExtraCordovaFiles.bind(this))      
      .then(platformsHelper.addPlatforms.bind(this))                 
      .then(commonHybrid.updateConfigXml.bind(this)) 
      .then(function()
      {
        done();
      })
      .catch(function(err)
      {
        if (err)
        {
          this.env.error(commonMessages.prefixError(err));
        }
      }.bind(this));

  },

  end: function() 
  {    
    this.log(commonMessages.scaffoldComplete());
    if (!this.options.norestore)
    { 
      this.composeWith("oraclejet:restore-hybrid", { options: this.options });
    }
  }
});

module.exports = OracleJetHybridCreateGenerator;

function _writeTemplate(generator)
{
  return new Promise(function(resolve, reject) 
  {
    var appDir = generator.appDir;
    var appSrc = paths.getDefaultPaths().source;

    templateHandler.handleTemplate(generator, generator.destinationPath(appDir + "/" + appSrc + "/"))
      .then(function() 
      {
        resolve(generator);
      })
      .catch(function(err)
      {
        reject(commonMessages.error(err, "writeTemplate"));
      });
  });
}

