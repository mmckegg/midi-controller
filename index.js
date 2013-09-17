var MidiGrabber = require('midi-grabber')
var Button = require('./lib/button')
var NoteMatrix = require('./lib/note_matrix')

module.exports = function(duplexPort){
  var grabber = MidiGrabber()
  duplexPort.pipe(grabber)

  return {
    createButton: function(filter, onDown, onUp){
      return Button({
        port: duplexPort, 
        grabber: grabber
      }, filter, onDown, onUp)
    },
    createNoteMatrix: function(mapping, color){
      return NoteMatrix({
        port: duplexPort,
        grabber: grabber
      }, mapping, color)
    }
  }
}