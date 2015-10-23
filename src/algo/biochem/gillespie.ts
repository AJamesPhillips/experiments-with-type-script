import {
  Algorithm,
  IterationResult,
} from '../algorithm'
import {
  Reaction,
  sumPropensities,
  allPropensities,
} from './utils'


var VERY_SMALL = 1e-10;


interface GillespieIterationParameters {
  minTimeUntilNextReaction?: number;
  maxTimeUntilNextReaction?: number;
}


interface GillespieIterationResult extends IterationResult {
  timeUntilNextStep: number;
  reaction: Reaction;
}


class BoundedGillespie extends Algorithm {
  /*
   * If minTimeUntilNextReaction and maxTimeUntilNextReaction are undefined then it is unbounded.
   */
  private reactions: Reaction[];
  protected iterationResult: GillespieIterationResult;

  constructor(args: {reactions: Reaction[]}) {
    super();
    this.reactions = args.reactions;
  }

  public iterate(args: GillespieIterationParameters): GillespieIterationResult {
    return <GillespieIterationResult> super.iterate(args);
  }

  protected _iterate(args: GillespieIterationParameters): GillespieIterationResult {
    var finished = true;
    var timeUntilNextStep: number;
    var reaction: Reaction;

    var totalPropensities = sumPropensities(this.reactions);
    if(totalPropensities === 0) {
      // pass
    } else {
      finished = false;

      // Stochastically model `timeUntilNextStep`
      var randomPt = Math.random() + VERY_SMALL;
      timeUntilNextStep = (1/totalPropensities) * Math.log(1/randomPt);
      if(args.minTimeUntilNextReaction !== undefined) {
        timeUntilNextStep = Math.max(args.minTimeUntilNextReaction, timeUntilNextStep);
      }
      if(args.maxTimeUntilNextReaction !== undefined) {
        timeUntilNextStep = Math.min(args.maxTimeUntilNextReaction, timeUntilNextStep);
      }

      // Stochastically model which reaction occured
      var propensities = allPropensities(this.reactions);
      var randomPropensity = Math.random();
      var cumulertiveNormalisedPropensity = 0;
      var i = 0;
      do {
        reaction = this.reactions[i++];
        cumulertiveNormalisedPropensity += (reaction.propensity / totalPropensities);
      } while(cumulertiveNormalisedPropensity < randomPropensity);
      reaction.react(1);
    }
    this.iterationResult = {finished, timeUntilNextStep, reaction};
    return this.iterationResult;
  }

  destroy(): void {
    // Remove references, may aid GC
    this.reactions = undefined;
    super.destroy();
  }
}

export {
  BoundedGillespie,
  GillespieIterationParameters,
  GillespieIterationResult,
}
