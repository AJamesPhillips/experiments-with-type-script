import {
  GillespieIterationResult,
} from '../algo/biochem/gillespie';
import {
  ApproximateMajority,
} from '../algo/biochem/approximate_majority';
import {
  Parameters,
  AlgoVisualiser,
  AbstractAlgoVisualiser,
  fullRestart,
} from './algo_visual';
import {
  EntityUI,
  ReactionUI,
} from '../data_visual/bio';
import {Drawing} from '../data_visual/canvas';


class ApproximateMajorityMultipleVisualiser extends AbstractAlgoVisualiser implements AlgoVisualiser {
  name = 'Multiple: Approximate Majority biological consensus (Bounded Gillespie)';
  description = ('Runs the "Approximate Majority biological consensus (Bounded Gillespie)" ' +
    'algorithm multiple times and graphs the results.');

  numberOfStartingA: number;
  numberOfStartingB: number;
  runsToComplete: number;
  protected algo: ApproximateMajority;
  private runsPerIterationGroup = 10;
  private runsCompleted: number;
  // Structure of the `distributionData` attribute:
  // The first dimension represents the iterations axis
  // The second dimension respresents the vertical axis with buckets for the proportion of A, B and C versus the total
  // The third dimension has only 3 entries, the total of A, B and C so far.
  private distributionData: number[][][];
  // Structure of the `averageData` attribute:
  // The first dimension represents the iterations axis
  // The third dimension represents the average value of A, B and C so far.
  private averageData: number[][];
  private maxIterationsPerRun: number;
  private verticalGroups = 50;
  private averageDataConverter: (a: number) => {(b: number[], c: number): [number, number]}

  constructor(canvas: Drawing, size: number, dataPointRadius: number, numberOfStartingA: number, numberOfStartingB: number, runsToComplete: number, maxIterationsPerRun: number) {
    super(canvas, size, dataPointRadius);
    this.numberOfStartingA = numberOfStartingA;
    this.numberOfStartingB = numberOfStartingB;
    this.runsToComplete = runsToComplete;
    this.maxIterationsPerRun = maxIterationsPerRun;
  }

  get parametersForHuman(): Parameters[] {
    return [
      {
        key: 'Number of chemical entity A',
        value: this.numberOfStartingA,
        cssClass: 'group0',
      },
      {
        key: 'Number of chemical entity B',
        value: this.numberOfStartingB,
        cssClass: 'group1',
      },
      {
        key: 'Number of chemical entity C',
        value: 0,
        cssClass: 'group2',
      },
      {
        key: 'Number of runs',
        value: this.runsToComplete,
      },
    ]
  }

  protected _setup() {
    this.runsCompleted = 0;
    this.setupNewAlgo();
    this.setupDataStore();
    // Set up the visualisation
    this.setupGraph();

    return this.algo;
  }

  private setupNewAlgo() {
    if(this.algo) this.algo.destroy();
    this.algo = new ApproximateMajority(this.numberOfStartingA, this.numberOfStartingB);
  }

  private setupDataStore() {
    this.distributionData = [];
    this.averageData = [];
    var x = 0;
    var y = 0;
    while(x < (this.maxIterationsPerRun + 1)) {
      var vert: number[][] = [];
      while(y < this.verticalGroups) {
        vert.push([0,0,0]);
        y += 1;
      }
      this.distributionData.push(vert);

      this.averageData.push([0,0,0]);
      x += 1;
    }
  }

  private setupGraph(): void {
    var margin = {top: 20, right: 20, bottom: 20, left: 30};
    var graphWidth = this.size - margin.left - margin.right;
    var graphHeight = this.size - margin.top - margin.bottom;

    var x = d3.scale.linear().range([0, graphWidth]).domain([0, this.maxIterationsPerRun]).nice();
    var y = d3.scale.linear().range([0, graphHeight]).domain([this.algo.maxEntities, 0]).nice();

    var xAxis = d3.svg.axis().scale(x).tickSize(-graphHeight);
    var yAxis = d3.svg.axis().scale(y).orient('left');

    var svg = d3.select('svg').append('g').attr('class', 'graph');
    // Add the x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(${margin.left},${graphHeight+margin.top})`)
        .call(xAxis);

    // Add the y-axis
    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(yAxis);

    // Add the line paths
    this.algo.entities.forEach((entity, index) => {
      d3.select('.graph').append('path')
          .attr('class', `line entity_line_${index} entity_line_${entity.name}`)
          .attr('transform', `translate(${margin.left},${margin.top})`);
    });

    // Calculate scaling factors for data
    var xScalingFactor = (graphWidth / this.maxIterationsPerRun);
    var yScalingFactor = (graphHeight / this.algo.maxEntities);
    this.averageDataConverter = (index: number) => {
      return (d: number[], i: number) => [i * xScalingFactor, graphHeight - (d[index] * yScalingFactor)]
    }
  }

  private updateGraph(): void {
    var lineGraph = d3.svg.line()
        .x((d) => d[0])
        .y((d) => d[1])
        .interpolate('linear');

    this.algo.entities.forEach((entity, index) => {
      var data = <[number, number][]> _.map(this.averageData, this.averageDataConverter(index));
      d3.select(`.entity_line_${index}`).attr('d', lineGraph(data))
    });
  }

  private updateData(iteration: number) {
    var total = this.runsCompleted + 1;
    var partial = this.runsCompleted / total;
    this.algo.entities.forEach((entity, j) => {
      this.averageData[iteration][j] = (this.averageData[iteration][j] * partial) + (entity.count / total);
    })
  }

  protected _iterate(): number {
    var runsLeft = this.runsToComplete - this.runsCompleted;
    var runsToComplete = Math.min(runsLeft, this.runsPerIterationGroup);
    this.updateData(0);  // Set the initial values
    while(runsToComplete > 0) {
      var iteration = 1;
      var result = {finished: false};
      while(iteration < (this.maxIterationsPerRun + 1)) {
        if(!result.finished) {
          result = this.algo.iterate({});
        }
        this.updateData(iteration);
        iteration += 1;
      }
      this.setupNewAlgo();
      runsToComplete -= 1;
      this.runsCompleted += 1;
      this.updateGraph();
    }
    return (runsLeft > 0) ? 200 : undefined;
  }

  protected _restart(): void {
    fullRestart(this);
  }

  protected _destroy() {
    // pass
  }

  protected _visualClearup() {
    // pass
  }
}


export {
  ApproximateMajorityMultipleVisualiser
}