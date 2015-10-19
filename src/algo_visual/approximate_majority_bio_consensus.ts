import {timings} from './timings';
import {
  Parameters,
  IterationResult,
  NewStatusResult,
} from '../algo/algorithm';
import {
  ApproximateMajority,
} from '../algo/biochem/approximate_majority';
import {
  AlgoVisualiser,
  AbstractAlgoVisualiser,
} from './algo_visual';
import {
  Entity,
  Reaction,
} from '../algo/biochem/utils';
import {
  EntityUI,
  ReactionUI,
  ReactionUIEvent,
} from '../data_visual/bio';
import {Drawing} from '../data_visual/canvas';


class ApproximateMajorityVisualiser extends AbstractAlgoVisualiser implements AlgoVisualiser {
  // TODO refactor GillespieVisualiser so that the reaction (biological consensus) and
  // the reaction mechanics simulation (Gillespie) are separate concerns.
  name = 'Approximate Majority biological consensus (Bounded Gillespie)';
  description = ('Simulates how biology might find which chemical entity is in the ' +
    'majority.  It uses three reactions between entities A, B and C which results in ' +
    'either A or B being left as the only entity.  This is an approximate method ' +
    'whose probabilty of producing the correct answer will increase as the difference ' +
    'between the two starting populations of A and B increases.');

  private entityA_UI: EntityUI;
  private entityB_UI: EntityUI;
  private entityC_UI: EntityUI;
  numberOfStartingA: number;
  numberOfStartingB: number;

  constructor(canvas: Drawing, size: number, dataPointRadius: number, numberOfStartingA: number, numberOfStartingB: number) {
    super(canvas, size, dataPointRadius);
    this.numberOfStartingA = numberOfStartingA;
    this.numberOfStartingB = numberOfStartingB;
  }

  get parametersForHuman(): Parameters[] {
    return [
      {
        key: 'Number of chemical entity A',
        value: this.numberOfStartingA,
      },
      {
        key: 'Number of chemical entity B',
        value: this.numberOfStartingB,
      },
    ]
  }

  protected _setup() {
    // Hack.  Timings to allow animations to complete successfully and visual UI state
    // to match algo data state before running next iteration but also proceed reasonably quickly.
    // TODO remove.  Perhaps replace with Algorithm being a generator.
    var algo = new ApproximateMajority(this.numberOfStartingA, this.numberOfStartingB, timings.animationTime() * 3, timings.animationTime() * 4);
    algo.addObserver(this);
    this.algo = algo;

    // Set up the visualisation
    // Parameters for visualising
    var margin = 12;
    var rows = 1;
    var verticleSpaceForA = this.dataPointRadius * rows * 2;
    var third = this.size/3 - (margin * 2);
    // Instances containing visual representation of data models
    this.entityA_UI = new EntityUI(
      {
        label: algo.entityA.name,
        x: margin,
        y: margin,
        width: third,
        rows,
        groupCssClass: 'group',
        groupId: 0,
      }, algo.entityA);
    this.entityB_UI = new EntityUI(
      {
        label: algo.entityB.name,
        x: margin,
        y: margin + this.dataPointRadius * 3,
        width: third,
        rows,
        groupCssClass: 'group',
        groupId: 1,
      }, algo.entityB);
    this.entityC_UI = new EntityUI(
      {
        label: algo.entityC.name,
        x: margin + this.size * (2/3),
        y: margin,
        width: third,
        rows,
        groupCssClass: 'group',
        groupId: 2,
      }, algo.entityC);
    var entityUIs = [
      this.entityA_UI,
      this.entityB_UI,
      this.entityC_UI,
    ];
    entityUIs.map((species_UI) => species_UI.makePointsForSpecies('point', this.dataPointRadius));

    algo.reactions.forEach((reaction) => {
      var reactionUI = new ReactionUI(reaction, entityUIs);
      reactionUI.addObserver(this);
    });

    // Visualise
    this.distributePoints();
    this.canvas.createPoints(this.allUIPoints);
    this.canvas.updatePoints();
  }

  get allUIPoints() {
    return this.entityA_UI.coordsInCluster.concat(
      this.entityB_UI.coordsInCluster).concat(
      this.entityC_UI.coordsInCluster);
  }

  distributePoints() {
    this.entityA_UI.distributePoints();
    this.entityB_UI.distributePoints();
    this.entityC_UI.distributePoints();
  }

  event(event: IterationResult): void;
  event(event: NewStatusResult): void;
  event(event: ReactionUIEvent): void;
  event(event: any): void {
    if(event instanceof IterationResult) {
      // pass
    } else if(event instanceof NewStatusResult) {
      // pass on the algorithm's NewStatusResult
      this.informObservers(event);
    // TODO fix import error / circular reference with `ReactionUIEvent`
    } else { // if(event instanceof ReactionUIEvent) {
      this.distributePoints();
      this.canvas.updatePoints();
    }
  }

  protected _restart() {
    return false;
  }

  destroy(): boolean {
    // TODO figure out if there are any circular references we need to remove to aid GC
    return super.destroy();
  }
}


export {
	ApproximateMajorityVisualiser
}
