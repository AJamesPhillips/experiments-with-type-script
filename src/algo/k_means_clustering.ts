import {
  Algorithm,
  IterationResult,
} from './algorithm'
import {
  euclideanDistance as distance,
} from '../data_visual/coord';
import {
  AssignedPoint,
  GroupWithMean,
} from '../data_visual/group';


var findDistanceAndAssignPointsToGroups = function(points: AssignedPoint[], groups: GroupWithMean[]) {
  var pointsChangingGroup = 0;
  points.forEach((point) => {
    var currentNewDistance: number;
    var closestGroup: GroupWithMean;
    groups.forEach((group) => {
      var dis = distance(point, group);
      if(currentNewDistance === undefined || dis < currentNewDistance) {
        currentNewDistance = dis;
        closestGroup = group;
      }
    });

    if(point.group !== closestGroup) {
      closestGroup.addPoint(point);
      pointsChangingGroup += 1;
    }
  });

  var maxChange = 0;
  groups.forEach((group) => {
    var distanceChanged = group.calculateNewMean();
    maxChange = Math.max(maxChange, distanceChanged);
  });

  return {
    maxChange,
    pointsChangingGroup,
  }
};


class KMeans extends Algorithm {
  running: boolean;
  pointsData: AssignedPoint[];
  groupsData: GroupWithMean[];

  constructor(pointsData: AssignedPoint[], groupsData: GroupWithMean[]) {
    super();
    this.pointsData = pointsData;
    this.groupsData = groupsData;
  }

  protected _iterate(): IterationResult {
    var {maxChange} = findDistanceAndAssignPointsToGroups(this.pointsData, this.groupsData);
    var iterationResult = {
      finished: (maxChange < 1),
      maxChange,
      timeUntilNextStep: 0,
    };
    return iterationResult;
  }
}

export {
  KMeans
}
