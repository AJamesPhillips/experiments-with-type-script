import {
  Algorithm,
  IterationResult,
} from '../algorithm'
import {
  Entity,
  Reaction,
  sumPropensities,
  allPropensities,
} from './utils'


var VERY_SMALL = 1e-10;


interface GillespieIterationResult extends IterationResult {
  reaction: Reaction
}


class Gillespie extends Algorithm {
  private reactions: Reaction[];
  private minTimeUntilNextReaction: number;
  private maxTimeUntilNextReaction: number;
  protected iterationResult: GillespieIterationResult;

  constructor(args: {reactions: Reaction[], minTimeUntilNextReaction: number, maxTimeUntilNextReaction: number}) {
    super();
    this.reactions = args.reactions;
    this.minTimeUntilNextReaction = args.minTimeUntilNextReaction;
    this.maxTimeUntilNextReaction = args.maxTimeUntilNextReaction;
  }

  protected _iterate(): IterationResult {
    if(this.iterationResult) {
      // this.completeOutstandingReaction();
      this.iterationResult.reaction.react(1);
    }
    var totalPropensities = sumPropensities(this.reactions);

    var maxChange = 2;
    var gillespieIterResult: GillespieIterationResult = {
      reaction: undefined,
      timeUntilNextStep: this.minTimeUntilNextReaction,
    };
    if(totalPropensities === 0) {
      maxChange = 0;
    } else {
      var randomPt = Math.random() + VERY_SMALL;
      var timeUntilNextReaction = (1/totalPropensities) * Math.log(1/randomPt);

      timeUntilNextReaction = Math.max(this.minTimeUntilNextReaction, timeUntilNextReaction);
      timeUntilNextReaction = Math.min(this.maxTimeUntilNextReaction, timeUntilNextReaction);

      var propensities = allPropensities(this.reactions);
      var randomPropensity = Math.random();
      var cumulertiveNormalisedPropensity = 0;
      var i = 0;
      do {
        var reaction = this.reactions[i++];
        cumulertiveNormalisedPropensity += (reaction.propensity / totalPropensities);
      } while(cumulertiveNormalisedPropensity < randomPropensity);

      // console.log('Gillespie iteration:', sumPropensities, randomPt, timeUntilNextReaction, reaction);

      gillespieIterResult.reaction = reaction;
      gillespieIterResult.timeUntilNextStep = timeUntilNextReaction;
      this.iterationResult = gillespieIterResult;
    }
    this.iterateAgain(maxChange, timeUntilNextReaction);
    return this.iterationResult;
  }

  protected finishedIterating() {
    if(this.iterationResult) {
      setTimeout(() => {
        this.completeOutstandingReaction();
        super.finishedIterating();
      }, this.iterationResult.timeUntilNextStep);
    } else {
      super.finishedIterating();
    }
  }

  destroy(): void {
    // Remove references, may aid GC
    this.reactions = undefined;
    super.destroy();
  }

  // protected completeOutstandingReaction() {
  //   this.iterationResult.reaction.react(1);
  //   this.iterationResult = undefined;
  // }
}

export {
  Gillespie,
  GillespieIterationResult
}
