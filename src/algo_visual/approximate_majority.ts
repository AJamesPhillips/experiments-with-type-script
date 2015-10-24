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
} from '../utils/utils';


class ApproximateMajorityVisualiser extends AbstractAlgoVisualiser implements AlgoVisualiser {
  name = 'Approximate Majority biological consensus (Bounded Gillespie)';
  description = ('Simulates how biology might find which chemical entity is in the ' +
    'majority.  It uses three reactions between entities A, B and C which results in ' +
    'either A or B being left as the only entity.  This is an approximate method ' +
    'whose probabilty of producing the correct answer will increase as the difference ' +
    'between the two starting populations of A and B increases.');

  private entityUIs: EntityUI[];
  numberOfStartingA: number = 10;
  numberOfStartingB: number = 5;
  numberOfStartingC: number = 0;
  protected algo: ApproximateMajority;
  private reactionIdToUI: {[index: number]: ReactionUI} = {};
  private lastResult: GillespieIterationResult;

  get parametersForHuman(): Parameters[] {
    return [
      {
        key: 'Number of chemical entity A',
        attribute: 'numberOfStartingA',
        parser: integer0OrMoreParser,
        cssClass: 'group0',
      },
      {
        key: 'Number of chemical entity B',
        attribute: 'numberOfStartingB',
        parser: integer0OrMoreParser,
        cssClass: 'group1',
      },
      {
        key: 'Number of chemical entity C',
        attribute: 'numberOfStartingC',
        parser: integer0OrMoreParser,
        cssClass: 'group2',
      },
    ]
  }

  protected _setup() {
    var algo = new ApproximateMajority(this.numberOfStartingA, this.numberOfStartingB, this.numberOfStartingC);
    this.algo = algo;

    // Set up the visualisation
    // Parameters for visualising
    var margin = 12;
    var rows = 1;
    var verticleSpaceForA = this.dataPointRadius * rows * 2;
    var third = this.size/3 - (margin * 2);
    // Instances containing visual representation of data models
    var entityA_UI = new EntityUI(
      {
        label: algo.entityA.name,
        x: margin,
        y: margin,
        width: third,
        rows,
        groupCssClass: 'group',
        groupId: 0,
      }, algo.entityA);
    var entityB_UI = new EntityUI(
      {
        label: algo.entityB.name,
        x: margin,
        y: margin + this.dataPointRadius * 3,
        width: third,
        rows,
        groupCssClass: 'group',
        groupId: 1,
      }, algo.entityB);
    var entityC_UI = new EntityUI(
      {
        label: algo.entityC.name,
        x: margin + this.size * (2/3),
        y: margin,
        width: third,
        rows,
        groupCssClass: 'group',
        groupId: 2,
      }, algo.entityC);
    this.entityUIs = [
      entityA_UI,
      entityB_UI,
      entityC_UI,
    ];
    this.entityUIs.map((species_UI) => species_UI.makePointsForSpecies('point', this.dataPointRadius));

    algo.reactions.forEach((reaction) => {
      var reactionUI = new ReactionUI(reaction, this.entityUIs);
      this.reactionIdToUI[reaction.id] = reactionUI;
    });

    // Visualise
    var allUIPoints = _.flatten(this.entityUIs.map((ui) => ui.coordsInCluster));
    this.canvas.createPoints(allUIPoints);
    this.updateVisual(this.animationDuration);

    return algo;
  }

  private updateVisual(animationDuration: number): void {
    this.entityUIs.forEach((ui) => ui.distributePoints());
    this.canvas.updatePoints(animationDuration);
  }

  /*
   * Time to run in milliseconds when the `_iterate` function should be called again.
   */
  protected _iterate(): number {
    var animationDuration = this.animationDuration;
    if(this.lastResult && this.lastResult.reaction) {
      var lastResult = this.lastResult;
      var reactionUI = this.reactionIdToUI[lastResult.reaction.id];
      var availablePoints = reactionUI.removePoints(lastResult.reaction.lastReactionEvent.removals);
      this.updateVisual(animationDuration);

      setTimeout(() => {
        reactionUI.reassignPoints(availablePoints, lastResult.reaction.lastReactionEvent.creations);
        this.updateVisual(animationDuration);
      // The `* 2` in `animationDuration * 2` is to allow for the reacted components to pause in
      // the reaction location before continuing their animation
      }, animationDuration * 2);
    }

    // Timings to allow animations to complete successfully and visual UI state
    // to match algo data state before running next iteration but also proceed reasonably quickly.
    var args = {
      minTimeUntilNextReaction: animationDuration * 3,
      maxTimeUntilNextReaction: animationDuration * 4,
    }
    this.lastResult = this.algo.iterate(args);
    return this.lastResult.timeUntilNextStep;
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
  ApproximateMajorityVisualiser
}