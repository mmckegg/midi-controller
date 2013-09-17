
module.exports = function(options, filter, onDown, onUp){

  var lightStack = []
  var currentLight = 0

  var offLight = 0

  var turnOff = null

  var button = {
    controlType: 'button',

    light: function(color){
      var item = {light: color}
      lightStack.push(item)
      refresh()

      return function(shouldRefresh){
        var index = lightStack.indexOf(item)
        lightStack.splice(index, 1)
        if (shouldRefresh !== false) refresh()
      }
    },

    flash: function(color, duration){
      var turnOff = button.light(color)
      setTimeout(turnOff, duration || 50)
    },

    setOff: function(color){
      offLight = color
      refresh()
    },

    turnOn: function(color){
      turnOff&&turnOff(false)
      turnOff = button.light(color)
    },

    turnOff: function(color){
      if (turnOff){
        turnOff()
        turnOff = null
      }
    },

    grab: function(onGrabDown, onGrabUp){
      return options.grabber.grab(filter, function(data){
        if (data[2]){
          onGrabDown&&onGrabDown.apply(button, [data])
        } else {
          onGrabUp&&onGrabUp.apply(button, [data])
        }
      })
    },

    destroy: function(){
      release()
    }
  }


  function refresh(){
    var light = (lightStack[lightStack.length-1] || {}).light
    
    if (light == null){
      light = offLight
    }

    if (light != currentLight){
      currentLight = light
      options.port.write([filter[0], filter[1], light || 0])
    }
  }

  var release = options.grabber.grab(filter, function(data){
    if (data[2]){
      onDown&&onDown.apply(button, [data])
    } else {
      onUp&&onUp.apply(button, [data])
    }
  })

  return button
}