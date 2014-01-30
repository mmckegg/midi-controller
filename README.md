midi-controller
===

Create buttons and note matrices from duplex midi streams for midi controllers such as Launchpad.

## Install

```bash
$ npm install midi-controller
```

## Example

```js
var MidiStream = require('midi-stream')
var MidiController = require('midi-controller')

var duplexStream = MidiStream('Launchpad')
var launchpad = MidiController(duplexStream)

// clear launchpad
duplexStream.write([176, 0, 0])

var colors = {
  green: 60,
  red: 13,
  amber: 63,
  amberLow: 29
}

var learnButton = launchpad.createButton([176, 104], function down(){
  this.turnOn(colors.green)
}, function up(){
  this.turnOff()
})

// after 10 seconds change the button's off color to amberLow
setTimeout(function(){
  learnButton.setOff(colors.amberLow)
}, 10000)

// flash the learn button red every second (with 100ms duration)
setInterval(function(){
  learnButton.flash(colors.red, 100)
}, 1000)


// map launchpad grid to chromatic midi notes (starting at 30)
var mapping = []
var offset = 30
for (var y=0;y<8;y++){
  for (var x=0;x<8;x++){
    var id = (y*16) + x
    mapping.push([
      [144, id],       // input midi message
      [144, offset++]  // output midi message
    ])
  }
}

var noteMatrix = launchpad.createNoteMatrix(mapping, colors.amber)
noteMatrix.on('data', function(midiNote){
  if (midiNote[2]){ // note on
    noteOn(midiNote[1])
  } else { // note off
    noteOff(midiNote[1])
  }
})

noteMatrix.pipe(noteMatrix) // echo the notes back to light up buttons

// screen synth
var onNotes = {}
function noteOn(note){
  onNotes[note] = setInterval(function(){
    console.log(note)
  }, 50)
}
function noteOff(note){
  if (onNotes[note]){
    clearInterval(onNotes[note])
    onNotes[note] = null
  }
}


// highlight pressed notes when mixer button held down
var selectionReleases = []
var selecting = false

noteMatrix.on('data', function(note){
  if (note[2] && selecting){
    var button = noteMatrix.getButton(note)
    var release = button.light(colors.red)
    selectionReleases.push(release)
  }
})

var mixerButton = launchpad.createButton([176, 111], function down(){
  selecting = true
}, function up(){
  selectionReleases.forEach(function(f){f()})
  selectionReleases = []
  selecting = false
})
```