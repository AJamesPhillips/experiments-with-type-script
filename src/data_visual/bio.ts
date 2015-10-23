import {
  SubjectBase,
  EventResult,
  Observer,
} from '../utils/events';
import {
  Entity,
  Reaction,
  ReactionEvent,
  ReactedEntityChange,
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


class ReactionUI {
  private reaction: Reaction;
  private entityUIs: EntityUI[];
  private reactionEntityToUI: {[index: number]: EntityUI};

  constructor(reaction: Reaction, entityUIs: EntityUI[]) {
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
  }

  removePoints(removals: ReactedEntityChange[]): AssignedPoint[] {
    var removedAssignedPoints: AssignedPoint[] = [];
    removals.map((removed) => {
      var entityUI = this.reactionEntityToUI[removed.entity.id];
      var i = -removed.change;
      while(i > 0) {
        removedAssignedPoints.push(entityUI.removeLastPoint());
        --i;
      }
      entityUI.distributePoints();
    });

    // Move points to reaction area and update visuals
    removedAssignedPoints.map((point, i) => {
      // TODO refactor to generalise
      point.x = 250;
      point.y = 20 + (30 * i);
    });

    return removedAssignedPoints;
  }

  // Complete reaction by assigning points to created entities
  reassignPoints(availableAssignedPoints: AssignedPoint[], creations: ReactedEntityChange[]): void {
    creations.map((created) => {
      var entityUI = this.reactionEntityToUI[created.entity.id];
      var i = created.change;
      while(i > 0) {
        if(!availableAssignedPoints.length) throw new Error('Trying to reassign more points than initially removed.');
        entityUI.addPoint(availableAssignedPoints.pop());
        --i;
      }
      if(availableAssignedPoints.length) throw new Error('More entities removed than reassigned.');
    });
  }
}

export {
	EntityUI,
	ReactionUI,
}