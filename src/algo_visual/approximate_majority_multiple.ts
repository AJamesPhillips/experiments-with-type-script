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
import {
  integer0OrMoreParser,
  integerPositiveParser,
} from '../utils/utils';


interface OutcomeData {
  correct: number;
  incorrect: number;
  incomplete: number;
}


class ApproximateMajorityMultipleVisualiser extends AbstractAlgoVisualiser implements AlgoVisualiser {
  className = 'approxMajorityMultiple';
  name = 'Multiple: Approximate Majority biological consensus (Bounded Gillespie)';
  description = ('Runs the "Approximate Majority biological consensus (Bounded Gillespie)" ' +
    'algorithm multiple times and graphs the results.');
  private numberOfStartingA: number = 30;
  private numberOfStartingB: number = 28;
  private numberOfStartingC: number = 0;
  private runsToComplete: number = 250;
  private maxIterationsPerRun: number = 500;

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
  private outcomeData: OutcomeData;

  private verticalGroups = 50;
  private averageDataConverter: (a: number) => {(b: number[], c: number): [number, number]}

  get parametersForHuman(): Parameters[] {
    return [
      {
        key: 'Number of chemical entity A',
        attribute: 'numberOfStartingA',
        parser: integer0OrMoreParser,
        cssClass: 'group_0',
      },
      {
        key: 'Number of chemical entity B',
        attribute: 'numberOfStartingB',
        parser: integer0OrMoreParser,
        cssClass: 'group_1',
      },
      {
        key: 'Number of chemical entity C',
        attribute: 'numberOfStartingC',
        parser: integer0OrMoreParser,
        cssClass: 'group_2',
      },
      {
        key: 'Number of runs',
        attribute: 'runsToComplete',
        parser: integerPositiveParser,
      },
      {
        key: 'Max iterations per runs',
        attribute: 'maxIterationsPerRun',
        parser: integerPositiveParser,
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
    this.algo = new ApproximateMajority(this.numberOfStartingA, this.numberOfStartingB, this.numberOfStartingC);
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
    this.outcomeData = {correct: 0, incorrect: 0, incomplete: 0};
  }

  private setupGraph(): void {
    var margin = {top: 20, right: 20, bottom: 70, left: 50};
    var graphWidth = this.size - margin.left - margin.right;
    var graphHeight = this.size - margin.top - margin.bottom;

    var x = d3.scale.linear().range([0, graphWidth]).domain([0, this.maxIterationsPerRun]).nice();
    var y = d3.scale.linear().range([0, graphHeight]).domain([this.algo.maxEntities, 0]).nice();

    var xAxis = d3.svg.axis().scale(x);//.tickSize(-graphHeight);
    var yAxis = d3.svg.axis().scale(y).orient('left');

    var svg = d3.select('svg').append('g').attr('class', 'graph');
    // Add the x-axis
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', `translate(${margin.left},${graphHeight + margin.top})`)
        .call(xAxis);
    svg.append('text')
        .attr('class', 'axis label')
        .attr('transform', `translate(${margin.left + 40},${graphHeight + margin.top + 40})`)
        .text('Iteration number (of Approximate Majority algorithm)');

    // Add the y-axis
    svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .call(yAxis);
    svg.append('text')
        .attr('class', 'axis label')
        .attr('transform', `translate(${20},${margin.top + graphHeight/1.6})rotate(-90)`)
        .text('Average entity number');

    // Add the line paths
    this.algo.entities.forEach((entity, index) => {
      svg.append('path')
          .attr('class', `line entity_line_${index} entity_line_${entity.name}`)
          .attr('transform', `translate(${margin.left},${margin.top})`);
    });

    // Add percentage correct
    svg.append('text')
        .attr('class', 'text outcome')
        .attr('transform', `translate(${margin.left},${margin.top + graphHeight + margin.bottom - 10})`);

    // Calculate scaling factors for data
    var xScalingFactor = (graphWidth / this.maxIterationsPerRun);
    var yScalingFactor = (graphHeight / this.algo.maxEntities);
    this.averageDataConverter = (index: number) => {
      return (d: number[], i: number) => [i * xScalingFactor, graphHeight - (d[index] * yScalingFactor)]
    }
  }

  private updateGraph(): void {
    // Update lines
    var lineGraph = d3.svg.line()
        .x((d) => d[0])
        .y((d) => d[1])
        .interpolate('linear');

    this.algo.entities.forEach((entity, index) => {
      var data = <[number, number][]> _.map(this.averageData, this.averageDataConverter(index));
      d3.select(`.entity_line_${index}`).attr('d', lineGraph(data))
    });

    // Update % correct and run number
    var total = _.values(this.outcomeData).reduce((memo, c) => memo + c, 0);
    var percent = (n: number) => ((n / total) * 100).toPrecision(3)
    d3.select(`.text.outcome`).text(`${percent(this.outcomeData.correct)}% Correct  ${percent(this.outcomeData.incorrect)}% Incorrect  ${percent(this.outcomeData.incomplete)}% Incomplete.  Run: ${this.runsCompleted}`);
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
      var result = {finished: false, correct: false};
      while(iteration < (this.maxIterationsPerRun + 1)) {
        if(!result.finished) {
          result = this.algo.iterate({});
        }
        this.updateData(iteration);
        iteration += 1;
      }
      if(result.correct) {
        this.outcomeData.correct += 1;
      } else if(result.correct === false) {
        this.outcomeData.incorrect += 1;
      } else {
        this.outcomeData.incomplete += 1;
      }
      this.setupNewAlgo();
      runsToComplete -= 1;
      this.runsCompleted += 1;
      this.updateGraph();
    }
    return (runsLeft > 0) ? this.animationDuration : undefined;
  }

  protected _restart(): void {
    fullRestart(this);
  }

  protected _destroy() {
    // pass
  }

  protected _visualClearup() {
    d3.select('.graph').remove();
  }

  protected _parameterChanged(parameter: string): void {
    // pass
  }
}


export {
  ApproximateMajorityMultipleVisualiser
}