import {timings} from '../algo_visual/timings';
import {
  SubjectBase,
  EventResult,
  Observer,
} from '../utils/events';
import {
  Entity,
  Reaction,
  ReactionEvent,
} from '../algo/biochem/utils';
import {
  AssignedPoint,
  ParametersForGridArrangedGroup,
  GridArrangedGroup,
} from './group';


class EntityUI extends GridArrangedGroup {
  entity: Entity;

  constructor(parameters: ParametersForGridArrangedGroup, entity: Entity) {
    super(parameters);
    this.entity = entity;
  }

  makePointsForSpecies(pointCssClass: string, pointRadius: number) {
    this.makePoints(this.entity.count, pointCssClass, pointRadius);
  }
}


interface ReactionUIEvent extends EventResult {
}


class ReactionUI extends SubjectBase implements Observer {
  reaction: Reaction;
  entityUIs: EntityUI[];
  reactionEntityToUI: {[index: number]: EntityUI};

  constructor(reaction: Reaction, entityUIs: EntityUI[]) {
    super();
    this.reaction = reaction;
    this.entityUIs = entityUIs;
    this.reactionEntityToUI = {};

    // Check all the entities for the reaction have EntityUI
    // instances included in entityUIs list
    reaction.entities.map((entity) => {
      var matchingEntityUIs = entityUIs.filter((EntityUI) => EntityUI.entity === entity);
      if(matchingEntityUIs.length === 0) {
        throw new Error(`Do not have reaction entity: ${entity} in list of EntityUI.`);
      } else if(matchingEntityUIs.length > 1) {
        throw new Error(`Have multiple EntityUI matching entity: ${entity}.`);
      }
      this.reactionEntityToUI[entity.id] = matchingEntityUIs[0];
    });
    this.reaction.addObserver(this);
  }

  event(event: ReactionEvent) {
    var consumedAssignedEntityPoints: AssignedPoint[] = [];
    event.removals.map((removed) => {
      var entityUI = this.reactionEntityToUI[removed.entity.id];
      var i = -removed.change;
      while(i > 0) {
        consumedAssignedEntityPoints.push(entityUI.removeLastPoint());
        --i;
      }
      entityUI.distributePoints();
    });

    // Move points to reaction area and update visuals
    consumedAssignedEntityPoints.map((point, i) => {
      // TODO refactor to generalise
      point.x = 250;
      point.y = 20 + (30 * i);
    });
    this.informObservers({});

    // Complete reaction by moving points to reaction area and update visuals
    setTimeout(() => {
      event.creations.map((created) => {
        var entityUI = this.reactionEntityToUI[created.entity.id];
        var i = created.change;
        while(i > 0) {
          if(!consumedAssignedEntityPoints.length) throw new Error('Trying to create more entities than destroyed.');
          entityUI.addPoint(consumedAssignedEntityPoints.pop());
          --i;
        }
        if(consumedAssignedEntityPoints.length) throw new Error('More entities destroyed than recreated.');
        this.informObservers({});
      });
    }, timings.animationTime()*2);
  }
}

export {
	EntityUI,
	ReactionUI,
  ReactionUIEvent,
}