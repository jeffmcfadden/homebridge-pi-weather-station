var request = require("request");
var Service, Characteristic;

module.exports = function(homebridge){
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-pi-weather-station", "PiWeatherStation", PiThermostatAccessory);
}

function PiWeatherStation(log, config) {
  this.log = log;

  // url info
  this.url         = config["url"];
}

PiWeatherStation.prototype = {

  ctof: function(c){
    return c * 1.8000 + 32.00;
  },

  ftoc: function(f){
    return (f-32.0) / 1.8;
  },

  getCurrentTemperature: function(callback) {
    this.log("getCurrentTemperature");

    //Characteristic.CurrentHeatingCoolingState.OFF = 0;
    //Characteristic.CurrentHeatingCoolingState.HEAT = 1;
    //Characteristic.CurrentHeatingCoolingState.COOL = 2;

    this.httpRequest(this.url, "GET", function(error, response, data) {
      if (error) {
        this.log('getCurrentTemperature: %s', error);
        callback(error);
      }
      else {
        this.log('getCurrentTemperature succeeded!');
        var t = data["sensor"]["latest_value"];

        callback(null, t);
      }
    }.bind(this));
  },

  getName: function(callback) {
    this.log("getName");

    callback(null, this.name);
  },

  identify: function(callback) {
    this.log("Identify requested!");
    callback(); // success
  },

  getServices: function() {

    // you can OPTIONALLY create an information service if you wish to override
    // the default values for things like serial number, model, etc.
    var informationService = new Service.AccessoryInformation();

    informationService
      .setCharacteristic(Characteristic.Manufacturer, "Jeff McFadden")
      .setCharacteristic(Characteristic.Model, "PiWeatherStation")
      .setCharacteristic(Characteristic.SerialNumber, "PI-WS-1");

    var temperatureService = new Service.TemperatureSensor(this.name);

    temperatureService.getCharacteristic( Characteristic.CurrentTemperature ).on( 'get', this.getCurrentTemperature.bind(this) );

    return [informationService, temperatureService];
  }
};