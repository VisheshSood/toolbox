//We need to initialize a mic, oscillation and the soundfile variables for the code to use.
var mic, osc, soundFile;
//We would also like to label the current source as the user has the option to change sources.
//Since we have a backup audio file (in case user does not allow for mic access), we will name
//the source as 'thehills' as that is what the file is called.
var currentSource = 'thehills';
//We will be carrying out fourier transforms (dont worry, Google is our friend, and he will help us here!)
var fft;
//binCount is the number of bars we wish to use to visualize the music. 
//Due to math operations, it has to be a power of 2, and greater than 200.
var binCount = 512;
//We need to create an array of bins for easier control.
var bins = new Array(binCount);

/*
  To follow good style, we have a preload function that is there if we need to 
  do anything before running any code. In this situation, we are not going to 
  use it for anything so we ll leave it blank.
*/
function preload() {

}

/*
  This is the setup function. We will use this to initialize all the values in our file,
  and set anything up that is required. 

  Mainly we need to do the following:
  - Set up a canvas that we will use to draw bins on and also color on and add text to.
  - We want to initiate a way to drag and drop files onto the webpage (just audio) so that 
    it can visualise them too.
  - We need to load the back up audio file if the mic is not accessible 
  - After that, we want to get mic access
  - After that, we need to start the oscillator provided by P5 allowing for data visualization.
    This will allow us to change the amplitude of the waves along with the latency at which we 
    want to output the bars of the visualization.
  - We will need to make the number of bars required using the Bin class as given by P5.
*/
function setup() {
  var cnv = createCanvas(windowWidth, windowHeight);
  noStroke();
  colorMode(HSB, 90);

  // make canvas drag'n'dropable with gotFile as the callback
  makeDragAndDrop(cnv, gotFile);
  //Initially, we want the soundfile to be a mp3 file stored in our back up music.
  soundFile = loadSound('js/thehills.mp3')
  //P5 has a way to use the microphone as an audio input.
  mic = new p5.AudioIn();
  osc = new p5.Oscillator();
  osc.amp(0.9); // amplitude
  var smoothing = 0.8; // latency of refreshes
  fft = new p5.FFT(smoothing, binCount); //p5 carries out a fourier transform with the values and
                                         // returns as a new variable that we already initialized
  //We are given the Bin class from P5, and we use that to create a bin for the number of bins we 
  //want. 
  for (var i = 0; i < binCount; i++) {
    bins[i] = new Bin(i, binCount);
  }
  toggleInput(1); //Allow to listen from, by using index 1. Change to 0 for mp3 source.s
}

/*
  Now the fun part. We want to draw on the canvas all the elements required to visualize the music.
  We will set the background to black to make it look nice. We will be creating labels as well,
  along with all the bar lines.
*/
function draw() {
  //set the background to black. Background accepts from 0 to 100, 0 being black, 100 being white.
  background(0);
  //get the output of the fourier transform and set as a variable.
  var spectrum = fft.analyze();
  //
  for (var i = 0; i < binCount; i++) {
    bins[i].drawBar(i, binCount, spectrum[i]);
  }
  //We also want to show which bar is being selected, but only if it is defined (or not undefined)
  if (typeof selectedBin !== 'undefined') {
    createLabels(); //Call the function that creates the labels
    osc.freq(selectedBin.freq);
  }
}

/*
  We want to show the user specific details. 
  We create a createLabels function that displays as text the current source, instructions for the 
  user and of course the title.
  Text takes in a string, and the coordinates you want to place it in. It also has color and size
  attributes, but they need to be declared beforehand.
*/
function createLabels() {
  fill(100); //Set the font color to be white
  textSize(28);
  text('Audio Visualization Using P5', (width*3/4), 40);
  textSize(20); //Set the font size to be 20
  text('v'+ selectedBin.freq + 'Hz', mouseX, mouseY); //Add a label where the mouse is to show the frequency.
  //If a user has loaded a custom file, or if we are playing our own sound track, we want to show the time 
  //And this is done by adding a text if soundfile is currently playing.
  if (soundFile.isPlaying()) {
    text('Current Time: ' + soundFile.currentTime().toFixed(2) + ' s', 10, 20);
  }
  //We need to show the user the current source of the visualization.
  text('Current Source: ' + currentSource, 10, 40);
  //We want to show the use the instructions to toggle between sources and also if they want, they can drop a 
  //audio file to play! 
  textSize(12);
  text('Press T to toggle source', 10, 60);
  text('Drag a soundfile here to play it', 10, 100);
}

/*
  We need a function that allows users to drop files into the canvas. This is simply done 
  by getting the canvas element and then allowing anything dropped to return a value. This
  simply activates the dropping files feature of the canvas, nothing else.
*/
function makeDragAndDrop(canvas, callback) {
  var domEl = getElement(canvas.elt.id);
  domEl.drop(callback);
}


/*
  Now, we need to actually get the file the user dropped. 
  P5 makes it easy for us because all you have to do is drop the previous file and replace it with 
  the new file, and then call the loadsound method to set the soundfile to be the new file.
*/
function gotFile(file) {
  soundFile.dispose();
  soundFile = loadSound(file, function() {
    toggleInput(0);
  });
}

/*
  If the main window is resized, we need to adjust the canvas so it takes up the browser window.
  Sadly P5 does not take care of that for us, and we have to do it manually by passing in the 
  new values of the windowWidth and windowHeight into the resizeCanvas function.
  We also want to overwrite any background color changes that could occur.
*/
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

/*
  We need to take the user inputs and carry out the required tasks. P5 does not have case sensitive
  key inputs, and it is called by key.
*/
function keyPressed() {
  if (key == 'T') {
    toggleInput();
  }
}

//Start with the Microphone as input
var inputMode = 1;

/*
  We need to make sure that when the user presses the letter T on their keyboard, we can toggle
  the different audio sources. 
  We start by using a counter, and if the counter is even then use the custom source, or if the 
  counter is odd, use mic. 
  We start by asking if the mode passed in to the method is of type number. If it is, then we can set
  the input to be that number. If not, we want to increment our initial counter and then mod by 2
  to see if its even or not.
*/
function toggleInput(mode) {
  if (typeof(mode) === 'number') {
    inputMode = mode;
  } else {
    inputMode += 1;
    inputMode = inputMode % 2;
  }
  /*
    Now we need to choose the source by using a case system. If its even, we stop the mic input
    and play the sound file. Else we want to use the microphone's input.
    The code is pretty self explanatory and this is because p5 takes care of most stuff for us.
  */
  switch (inputMode) {
    case 0: // soundFile mode
      soundFile.play();
      osc.stop();
      mic.stop();
      fft.setInput(soundFile);
      currentSource = 'Sound File';
      break;
    case 1: // mic mode
      mic.start();
      soundFile.pause();
      fft.setInput(mic);
      currentSource = 'Microphone';
      break;
  }
}

/*
  We need a function to call when the mouse moves so that we can update the colors of the bars
  that the mouse if overlaping and also for the labels. We only want this if there is a source of audio.
*/
function mouseMoved() {
  if (soundFile.isLoaded()) {
    for (var i = 0; i < bins.length; i++) {
      if ( (bins[i].x + bins[i].width) <= mouseX && mouseX <= bins[i].x) {
        bins[i].isTouching = true;
      }
      else {
        bins[i].isTouching = false;
      }
    }
  }
}

// ==========
// Bin Class - This was found online on the P5 website and is part of their data visualization packages.
// ==========

var Bin = function(index, totalBins) {
  // maybe redundant
  this.index = index;
  this.totalBins = totalBins;
  this.color = color( map(this.index, 0, this.totalBins, 0, 255), 255, 255 );

  this.isTouching = false;
  this.x;
  this.width;
  this.value;
}

Bin.prototype.drawLog = function(i, totalBins, value, prev) {
  this.x = map(Math.log(i+2), 0, Math.log(totalBins), 0, width - 200);
  var h = map(value, 0, 255, height, 0)- height;
  this.width = prev - this.x;
  this.value = value;
  this.draw(h);
  return this.x;
}

Bin.prototype.drawBar = function(i, totalBins, value) {
  this.x = map(i, 0, totalBins, 0, width - 200);
  this.width = -width/totalBins;
  this.value = value;
  var h = map(value, 0, 255, height, 0)- height;
  this.draw(h);
}

var selectedBin;

Bin.prototype.draw = function(h) {
  if (this.isTouching) {
    selectedBin = bins[this.index];
    this.freq = Math.round( this.index * 22050 / this.totalBins );
    fill(100)
  } else {
    fill( this.color);
  }
  rect(this.x, height, this.width, h );
}
