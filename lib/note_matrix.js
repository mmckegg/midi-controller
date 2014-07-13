var MidiGrabber = require('midi-grabber')
var Button = require('./button')
var Through = require('through')

module.exports = function(options, mapping, color){

  var lightReleases = {}
  var buttonLookup = {}

  var buttonMatrix = Through(function(data){
    var key = data[0] + '/' + data[1]
    if (data[2]){
      lightReleases[key]&&lightReleases[key](false)

      var button = buttonLookup[key]
      if (button){
        lightReleases[key] = button.light(color)
      }
    } else if (lightReleases[key]){
      lightReleases[key]()
      lightReleases[key] = null
    }
  })

  buttonMatrix.controlType = 'noteMatrix'

  var buttonGrabber = MidiGrabber()
  buttonGrabber.on('data', function(data){
    buttonMatrix.queue(data)
  })


  buttonMatrix.getButton = function(key){
    if (Array.isArray(key)){
      key = key[0] + '/' + key[1]
    }
    return buttonLookup[key]
  }

  buttonMatrix.grab = function(onGrabDown, onGrabUp){
    return buttonGrabber.grab(function(data){
      if (data[2] || onGrabUp == null){
        return onGrabDown&&onGrabDown.call(buttonMatrix, data)
      } else {
        return onGrabUp&&onGrabUp.call(buttonMatrix, data)
      }
    })
  }

  mapping.forEach(function(map){
    var key = map[1][0] + '/' + map[1][1]
    var cb = function(data){
      buttonGrabber.write([map[1][0], map[1][1], data[2]])
    }
    buttonLookup[key] = Button(options, map[0], cb, cb)
  })

  return buttonMatrix
}