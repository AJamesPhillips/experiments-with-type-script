import {
  is0OrGreaterInteger,
} from '../../utils/utils';
import {
  SubjectBase,
  EventResult,
} from '../../utils/events';


var nextEntityId = 0;


class Entity {
  name: string;
  private _id: number;
  private _count: number;

  constructor(name: string, count: number = 0) {
    this.name = name;
    this.count = count;
    this._id = nextEntityId++;
  }

  get id() {
    return this._id;
  }

  get count() {
    return this._count;
  }

  set count(val: number) {
    is0OrGreaterInteger(val, true);
    // var event: EntityChangeEvent = {
    //   oldCount: this._count,
    //   newCount: val,
    // };
    this._count = val;
    // this.informObservers(event);
  }

  toString(): string {
    return `Entity '${this.name}'`;
  }
}


interface ReactionEvent extends EventResult {
  removals: {entity: Entity, change: number}[];
  creations: {entity: Entity, change: number}[];
}


class Reaction extends SubjectBase {
  entity1: Entity;
  entity2: Entity;
  endEntity: Entity;  // assumes 2 of this entity is produced
  rateConstant: number;

  constructor(entity1: Entity, entity2: Entity, endEntity: Entity, rateConstant: number) {
    super();
    this.entity1 = entity1;
    this.entity2 = entity2;
    this.endEntity = endEntity;
    this.rateConstant = rateConstant;
  }

  get entities(): Entity[] {
    return [
      this.entity1,
      this.entity2,
      this.endEntity
    ];
  }

  get propensity(): number {
    return this.rateConstant * this.entity1.count * this.entity2.count;
  }

  react(num: number) {
    this.entity1.count -= 1;
    this.entity2.count -= 1;
    this.endEntity.count += 2;
    var event: ReactionEvent = {
      removals: [
        {entity: this.entity1, change: -1},
        {entity: this.entity2, change: -1},
      ],
      creations: [
        {entity: this.endEntity, change: +2},
      ]
    };
    this.informObservers(event);
  }
}


var allPropensities = (reactions: Reaction[]): number[] => {
  return reactions.map((reaction) => reaction.propensity);
}

var sumPropensities = (reactions: Reaction[]): number => {
  return allPropensities(reactions).reduce((e, memo) => e + memo, 0);
}


export {
	Entity,
	Reaction,
  ReactionEvent,
	allPropensities,
  sumPropensities,
}
