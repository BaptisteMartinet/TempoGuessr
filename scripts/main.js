/*
#
# HEADER
#
*/

var canvas;

var draggables = new Array(3);

var dragged = null;
var offsetX;
var offsetY;
var draggedOrigin;

var backgroundImage;

var JSONviews = null;

var currentView;

var btnStart;
var HUDContainer;
var HUDbtnNext;
var HUDnbImage;
var HUDScore;

var citationContainer;

var nbImage = 1;
var score = 0;

const STATES = Object.freeze({"WAITING":'waiting', "DRAGGING":'dragging', "CHECKED":'checked'});
var playerState = STATES.WAITING;

const citations = [`"Le temps adoucit tout."<br>Voltaire, 1778.`, `"En tout temps, en tous lieux, le public est injuste."<br>Voltaire, 1776`,
                    `"Il faut laisser le temps au temps."<br>Auteur inconu, 21e siècle.`, `"Le temps n'est qu'imagination."<br>Auteur du futur, date inconue.`];

var viewMemory = [];

function loadImages()
{
  do {
    currentView = floor(random(JSONviews.views.length));
  } while (viewMemory.indexOf(currentView) != -1);
  viewMemory.push(currentView);
  var indexs = [0, 1, 2];

  shuffle(indexs, true);

  for (let i = 0; i < 3; ++i) {
    //draggables[i].setPos(width * 0.01 + width / 3.1 * i + (10 * i), height * 0.22);
    draggables[i].setImage(JSONviews.views[currentView].paths[indexs[i]]);
    draggables[i].setDate(JSONviews.views[currentView].dates[indexs[i]]);
    draggables[i].setIndex(indexs[i]);
  }
}

function btnStartCallback()
{
  loadImages();
  btnStart.style.display = 'none';
  HUDContainer.style.display = 'block';
  playerState = STATES.DRAGGING;
}

function btnNextCallback()
{
  if (playerState == STATES.DRAGGING) {
    playerState = STATES.CHECKED;
    if (nbImage == 7)
      HUDbtnNext.textContent = 'Finish';
    else
      HUDbtnNext.textContent = 'Next';

    let nbGoogAnswers = 0;
    for (let i = 0; i < 3; ++i) {
      if (width * 0.025 + width / 3.2 * draggables[i].idx + (10 * draggables[i].idx) - 2 < draggables[i].pos.x && draggables[i].pos.x < width * 0.025 + width / 3.2 * draggables[i].idx + (10 * draggables[i].idx) + 2) {
        draggables[i].isCorrectlyPlaced = true;
        nbGoogAnswers++;
      } else {
        draggables[i].isCorrectlyPlaced = false;
      }
    }
    if (nbGoogAnswers == 3) {
      score++;
      HUDScore.textContent = score;
    }
  } else if (playerState == STATES.CHECKED) {
    if (++nbImage > 7) {
      playerState = STATES.WAITING;
      HUDContainer.style.display = 'none';
      canvas.hide();
      theCitation.innerHTML = citations[floor(random(citations.length))] + '<br>(Score: ' + score  + '/7)';
      citationContainer.style.display = 'block';
      return;
    } 
    HUDnbImage.textContent = nbImage;
    loadImages();
    playerState = STATES.DRAGGING;
    HUDbtnNext.textContent = 'Check';
  }
}

/* P5 */
function preload() {
  JSONviews = loadJSON('./views.json');

  backgroundImage = loadImage('./images/background.jpg');
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);

  for (let i = 0; i < 3; ++i) {
    draggables[i] = new Draggable(createVector(width * 0.025 + width / 3.2 * i + (10 * i), height * 0.28), width / 3.2, width / 3.2 * 9 / 16);
  }

  btnStart = document.getElementById('btn-start');
  HUDContainer = document.getElementById('HUD-container');
  HUDbtnNext = document.getElementById('HUD-container-next-button');
  HUDnbImage = document.getElementById('HUD-nb-image');
  HUDScore = document.getElementById('HUD-score');
  citationContainer = document.getElementById('citation-container');
  theCitation = document.getElementById('citation');
}

function draw() {
  background(220);

  image(backgroundImage, 0, 0, width, height);

  draggables.forEach(draggable => {
    draggable.draw();
    if (playerState == STATES.CHECKED)
      draggable.displayDate();
  });

  if (dragged !== null) {
    dragged.setPos(mouseX + offsetX, mouseY + offsetY);
    dragged.draw();
  }
}

function keyReleased()
{
  switch (keyCode) {
    case 80:
      print('PLAY')
      loadImages();
      break;
    default:
      break;
  }
}

function mousePressed()
{
  if (playerState != STATES.DRAGGING)
    return;
  if (dragged !== null)
    return;
  for (let i = 2; i >= 0; i--) {
    if (draggables[i].isMouseInteracting(mouseX, mouseY)) {
      dragged = draggables[i];
      offsetX = draggables[i].pos.x - mouseX;
      offsetY = draggables[i].pos.y - mouseY;
      draggedOriginX = draggables[i].pos.x;
      draggedOriginY = draggables[i].pos.y;
      break;
    }
  }
}

function mouseReleased()
{
  if (dragged === null)
    return;
  for (let i = 2; i >= 0; i--) {
    if (draggables[i] != dragged && draggables[i].isMouseInteracting(mouseX, mouseY)) {
      dragged.setPos(draggables[i].pos.x, draggables[i].pos.y);
      dragged = null;
      draggables[i].setPos(draggedOriginX, draggedOriginY);
      return;
    }
  }
  dragged.setPos(draggedOriginX, draggedOriginY);
  dragged = null;
}