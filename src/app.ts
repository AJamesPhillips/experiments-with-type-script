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


var size = 500;
var dataPointRadius = 10;

var canvas = makeSvgDrawArea(size);

var algoVisualisers: AlgoVisualiser[] = [];
var algoVisual: AlgoVisualiser;
var numberOfStartingA = 30;
var numberOfStartingB = 28;
var approximateMajority = new ApproximateMajorityVisualiser(canvas, size, dataPointRadius, numberOfStartingA, numberOfStartingB);
algoVisualisers.push(approximateMajority);
var multipleApproximateMajority = new ApproximateMajorityMultipleVisualiser(canvas, size, dataPointRadius, numberOfStartingA, numberOfStartingB, 1000);
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
    algoVisual.setup();
    algoVisual.addObserver(algoChangeStateObserver);
    $('#description').text(algoVisual.description);
    var parameters = algoVisual.parametersForHuman.map((param) => {
      return `<tr><td>${param.key}</td><td>${param.value.toString()}</td></tr>`;
    }).join('');
    $('#parameters').html(parameters);
    $('#algoSelect').blur();  // lose focus
  })
  // set initial value
  .trigger('change');


// Speed control UI set up
$('#speedControl').on('input change', (event: JQueryEventObject) => {
  var speed = (1 + parseInt($(event.target).val(), 10)) * 10;
  timings.setAnimationTime(speed);
  $('#speedOut').text(speed * 4);
  $('#speedControl').blur();  // lose focus
});
// set initial speed value
$('#speedControl')
  // .val('19')  // fast (800 ms between iterations)
  .val('49')  // slow (2000 ms between iterations)
  .trigger('change');
