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


var size = 500;
var dataPointRadius = 10;

var canvas = makeSvgDrawArea(size);

var algoVisualisers: AlgoVisualiser[] = [];
var algoVisual: AlgoVisualiser;
var numberOfStartingA = 30;
var numberOfStartingB = 28;
var approximateMajority = new ApproximateMajorityVisualiser(canvas, size, dataPointRadius, numberOfStartingA, numberOfStartingB);
algoVisualisers.push(approximateMajority);

var runsToComplete = 250;
var maxIterationsPerRun = 500;
var multipleApproximateMajority = new ApproximateMajorityMultipleVisualiser(canvas, size, dataPointRadius, numberOfStartingA, numberOfStartingB, runsToComplete, maxIterationsPerRun);
algoVisualisers.push(multipleApproximateMajority);

var kMeans = new KMeansVisualiser(canvas, size, dataPointRadius);
algoVisualisers.push(kMeans);


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
  .prop('selectedIndex', 0)
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
  // .val('20')  // fast (800 ms between iterations)
  .val('50')  // slow (2000 ms between iterations)
  .trigger('change');
