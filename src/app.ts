/// <reference path="../typings/tsd.d.ts" />
/// <reference path="../typings/jquery/jquery.d.ts" />
/// <reference path="../typings/underscore/underscore.d.ts" />
/// <reference path="../typings/d3/d3.d.ts" />

import {makeSvgDrawArea} from './data_visual/canvas';
import {AlgoVisualiser, NewStatusEvent, fullRestart} from './algo_visual/algo_visual';
import {ApproximateMajorityVisualiser} from './algo_visual/approximate_majority';
import {ApproximateMajorityMultipleVisualiser} from './algo_visual/approximate_majority_multiple';
import {KMeansVisualiser} from './algo_visual/k_means_clustering';
import {timings} from './algo_visual/timings';
import {capitalizeFirstLetter} from './utils/utils';
import {isNumber} from './utils/utils';


var algoNumber = 0;
var size = 500;
var dataPointRadius = 10;
var animationSpeed = '50';  // 50 is slow (2000 ms between iterations), 20 is fast (800 ms between iterations)

var canvas = makeSvgDrawArea(size);

var algoVisualisers: AlgoVisualiser[] = [];
var algoVisual: AlgoVisualiser;
var algoVisualisersClasses = [
  ApproximateMajorityVisualiser,
  ApproximateMajorityMultipleVisualiser,
  KMeansVisualiser,
];
var algoVisualisersMap: {[index: string]: number} = {};
algoVisualisersClasses.forEach((Klass) => {
  var algoVis = new Klass(canvas, size, dataPointRadius);
  algoVisualisersMap[algoVis.className] = algoVisualisers.length;
  algoVisualisers.push(algoVis);
})


// Parse the url hash to extract desired algo, its parameters and other values
var hash = document.location.hash.slice(1).split('&');

hash.forEach((part: string) => {
  var [key, value] = part.split('=');
  if(key === 'algo') {
    algoNumber = isNumber(algoVisualisersMap[value]) ? algoVisualisersMap[value] : algoNumber;
  } else if(key === 'animationSpeed') {
    animationSpeed = value;
  } else {
    algoVisual = algoVisualisers[algoNumber];
    var matchingParam = algoVisual.parametersForHuman.filter((param) => param.attribute === key);
    if(matchingParam.length === 1) {
      var param = matchingParam[0];
      algoVisual.setParameter(key, param.parser(value));
    } else {
      // log it as an error and drop it
      console.error(`Unknown parameter: ${key} with value: ${value} for AlgoVisualiser: ${algoVisual.className}`)
    }
  }
})


// Handle keyboard commands
$('body').on('keydown', function(event) {
  if(event.keyCode === 32) {
    // Pressed 'space'
    if(algoVisual.running) {
      algoVisual.stop();
    } else {
      algoVisual.run();
    }
  }
  if(event.keyCode === 82) {
    if(event.ctrlKey || event.metaKey) return;
    if(!algoVisual) return;
    // Pressed 'r'
    if(!algoVisual.restart()) {
      fullRestart(algoVisual);
    };
  }
  if(event.keyCode === 70) {
    if(event.ctrlKey || event.metaKey) return;
    // Pressed 'f'
    fullRestart(algoVisual);
  }
});


var algoChangeStateObserver = {
  event: (event: NewStatusEvent) => {
    var $el = $('#status');
    var val = event.running ? 'running' : 'stopped';
    $el.prop('class', val).text(capitalizeFirstLetter(val));
  }
}


var setupAlgoVisualParameters = (algoVisual: AlgoVisualiser) => {
  var parameters = $('#parameters').html('');
  algoVisual.parametersForHuman.forEach((param) => {
    var value = algoVisual.getParameter(param.attribute);
    var row = `<tr><td>${param.key}</td><td><input type="number" value="${value.toString()}"></td><td class="${param.cssClass}">&nbsp; &nbsp;</td></tr>`;
    var $row = $(row);
    parameters.append($row);
    var $input = $row.find('input');
    $input.change((event) => {
      var newValue = param.parser($input.val());
      if(newValue !== undefined) {
        value = newValue;
        algoVisual.setParameter(param.attribute, value);
      }
      $input.val(value.toString());
    })
  });
}


// Algorithm selection UI
algoVisualisers.forEach((algoVisual, i) => {
  $('#algoSelect').append(`<option value="${i}">${algoVisual.name}</option>`);
});
$('#algoSelect')
  .prop('selectedIndex', algoNumber)
  .on('change', (event: JQueryEventObject) => {
    var index = parseInt($(event.target).val(), 10);
    if(algoVisual) algoVisual.destroy();
    algoVisual = algoVisualisers[index];

    // Setup AlgoVisual and its UI
    algoVisual.setup();
    algoVisual.addObserver(algoChangeStateObserver);
    $('#description').text(algoVisual.description);
    setupAlgoVisualParameters(algoVisual);
    $('#algoSelect').blur();  // lose focus
  })
  // set initial value
  .trigger('change');


// Speed control UI set up
$('#speedControl').on('input change', (event: JQueryEventObject) => {
  var speed = (0 + parseInt($(event.target).val(), 10)) * 10;
  timings.setAnimationTime(speed);
  $('#speedOut').text(speed * 4);
  $('#speedControl').blur();  // lose focus
});
// set initial speed value
$('#speedControl')
  .val(animationSpeed)
  .trigger('change');
