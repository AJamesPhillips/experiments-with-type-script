import {
  Algorithm,
} from '../algorithm';
import {
  BoundedGillespie,
  GillespieIterationResult,
} from './gillespie';
import {
  Entity,
  Reaction,
} from './utils';


// TODO Rewrite as factory around BoundedGillespie
class ApproximateMajority extends Algorithm {
  name = 'Approximate Majority biological consensus (Bounded Gillespie)';
  description = ('Simulates how biology might find which chemical entity is in the ' +
    'majority.  It uses three reactions between entities A, B and C which results in ' +
    'either A or B being left as the only entity.  This is an approximate method ' +
    'whose probabilty of producing the correct answer will increase as the difference ' +
    'between the two starting populations of A and B increases.');

  entityA: Entity;
  entityB: Entity;
  entityC: Entity;
  reactionABtoC2: Reaction;
  reactionACtoA2: Reaction;
  reactionBCtoB2: Reaction;

  numberOfStartingA: number;
  numberOfStartingB: number;
  numberOfStartingC: number = 0;
  reactionRate: number = 1e-5;

  private gillespie: BoundedGillespie;

  constructor(numberOfStartingA: number, numberOfStartingB: number, minTimeUntilNextReaction: number, maxTimeUntilNextReaction: number) {
    super();
    this.numberOfStartingA = numberOfStartingA;
    this.numberOfStartingB = numberOfStartingB;

    // Set up entities and reaction network for a Biological consensus Algorithm
    this.entityA = new Entity('A', this.numberOfStartingA);
    this.entityB = new Entity('B', this.numberOfStartingB);
    this.entityC = new Entity('C', this.numberOfStartingC);
    this.reactionABtoC2 = new Reaction(this.entityA, this.entityB, this.entityC, this.reactionRate);
    this.reactionACtoA2 = new Reaction(this.entityA, this.entityC, this.entityA, this.reactionRate);
    this.reactionBCtoB2 = new Reaction(this.entityB, this.entityC, this.entityB, this.reactionRate);
    var reactions = [
      this.reactionABtoC2,
      this.reactionACtoA2,
      this.reactionBCtoB2,
    ];

    // Hack.  Timings to allow animations to complete successfully and visual UI state
    // to match algo data state before running next iteration but also proceed reasonably quickly.
    // TODO remove.  Perhaps replace with Algorithm being a generator.
    this.gillespie = new BoundedGillespie({
      reactions,
      minTimeUntilNextReaction,
      maxTimeUntilNextReaction,
    });
  }

  get reactions(): Reaction[] {
    return [
      this.reactionABtoC2,
      this.reactionACtoA2,
      this.reactionBCtoB2,
    ];
  }

  // Could write an `_iterate` but would then have to cast return value
  // from `super.iterate()`.
  public iterate(): GillespieIterationResult {
    return this.gillespie.iterate();
  }

  destroy() {
    // Remove references, may aid GC
    this.entityA = undefined;
    this.entityB = undefined;
    this.entityC = undefined;
    this.reactionABtoC2 = undefined;
    this.reactionACtoA2 = undefined;
    this.reactionBCtoB2 = undefined;

    this.gillespie.destroy();
    super.destroy();
  }
}


export {
	ApproximateMajority
}
