import {
  isPositiveInteger,
} from '../utils/utils';
import {
  PointInterface,
  IsDrawable,
  ColoredCoord,
  euclideanDistance,
} from './coord';


interface ParametersForGroup {
  label: string;
  groupCssClass: string;
  groupId: number;
}


class Group {
  coordsInCluster: AssignedPoint[];
  id: number;
  labelValue: string;
  protected _groupCssClass: string;

  constructor(parameters: ParametersForGroup) {
    this._groupCssClass = parameters.groupCssClass;
    this.labelValue = parameters.label;
    this.id = parameters.groupId;
    this.coordsInCluster = [];
    this.addPoint = this.addPoint.bind(this);
  }

  makePoints(num: number, cssClass: string, radius: number, label: string = '?') {
    for(var i = 0; i < num; ++i) {
      this.addPoint(new AssignedPoint(0, 0, cssClass, radius, label));
    }
  }

  get cssClass(): string {
    return `${this._groupCssClass} ${this._groupCssClass}${this.id}`;
  };

  get label(): string {
    return this.labelValue;
  }

  addPoint(point: AssignedPoint) {
    if(point.group !== this) {
      // Remove point from existing group if it's not this group
      if(point.group) {
        point.group.removePoint(point);
      }
      point.group = this;
      // Sanity check it's not already in the coords for the group (can
      // remove once this.coordsInCluster is a `set`)
      if(_.contains(this.coordsInCluster, point)) {
        throw new Error('Already have point: ' + AssignedPoint + ' in group: ' + this);
      }
      this.coordsInCluster.push(point);
    } else {
      throw new Error('Already have assigned point: ' + AssignedPoint + ' to group: ' + this);
    }
  }

  removePoint(point: AssignedPoint): AssignedPoint {
    // TODO OPTIMISE, replace this.coordsInCluster with a `set` to avoid this call to _.partition.
    // TODO can we remove the cast?
    var [removedPoints, points] = <[AssignedPoint[], AssignedPoint[]]> _.partition(this.coordsInCluster, (p) => p === point);
    this.coordsInCluster = points;
    // Sanity check
    if(removedPoints.length !== 1) throw new Error(`Have removed "${removedPoints.length}" points like "${point}" but expected 1.`);
    removedPoints[0].group = undefined;
    return removedPoints[0];
  }

  removeLastPoint(): AssignedPoint {
    if(this.coordsInCluster.length > 0) {
      var lastPoint = this.coordsInCluster[this.coordsInCluster.length - 1]
      return this.removePoint(lastPoint);
    } else {
      throw new Error(`No more assigned points can be removed from: ${this}`);
    }
  }

  toString(): string {
    return `Group ${this.labelValue} (id: ${this.id})`;
  }

  destroy(): void {
    this.coordsInCluster.forEach((p) => p.groupDestroyed());
    this.coordsInCluster = [];
  }
}


class AssignedPoint extends ColoredCoord {
  private assignedToGroup: Group;
  private previouslyAssignedGroup: Group;

  get group(): Group {
    return this.assignedToGroup;
  }

  set group(newGroup: Group) {
    this.previouslyAssignedGroup = this.group;
    this.assignedToGroup = newGroup;
  }

  get cssClass(): string {
    var groupCss = '';
    if(this.group) {
      groupCss = this.group.cssClass;
    } else if (this.lastGroup) {
      groupCss = `previously ${this.lastGroup.cssClass}`;
    }
    if(groupCss) groupCss = ' ' + groupCss;
    return this.instanceCssClass + groupCss;
  }

  get lastGroup(): Group {
    return this.previouslyAssignedGroup;
  }

  get label(): string {
    return this.group ? this.group.label : (this.lastGroup ? this.lastGroup.label : this.labelValue);
  }

  toString(): string {
    return `${this.label} in group ${this.assignedToGroup.toString()}`;
  }

  removeAllGroupReferences(): void {
    this.previouslyAssignedGroup = undefined;
    this.assignedToGroup = undefined;
  }

  destroy(): void {
    this.removeAllGroupReferences();
  }

  groupDestroyed(): void {
    this.assignedToGroup = undefined;
  }

  clone(): AssignedPoint {
    var p = new AssignedPoint(this.x, this.y, this.cssClass, this.radius, this.label)
    p.group = this.lastGroup;
    p.group = this.group;
    return p;
  }
}


class ArrangedGroup extends Group {
  distributePoints() {
    var i = 1;
    this.coordsInCluster.map((p) => p.index = i++);
  }
}


interface ParametersForGridArrangedGroup extends ParametersForGroup {
  x: number;
  y: number;
  width: number;
  rows: number;
}


class GridArrangedGroup extends ArrangedGroup {
  // Convenience attribute for positioning other Organised Groups of Points
  displayBase: number;
  parameters: ParametersForGridArrangedGroup;

  constructor(parameters: ParametersForGridArrangedGroup) {
    super(parameters);
    this.parameters = parameters;
  }

  distributePoints(parameters: ParametersForGridArrangedGroup = undefined) {
    super.distributePoints();
    var pointsToProcess = this.coordsInCluster.length;
    if(!pointsToProcess) return;

    var {x, y, width, rows} = parameters || this.parameters;

    var rowGap = 0.8;
    var columnGap = 0.5;
    isPositiveInteger(rows, true);
    // Assume all points are the same radius
    var pointRadius = this.coordsInCluster[0].radius;
    var columns = Math.ceil(this.coordsInCluster.length / rows);

    // Calculate xIncrement
    var xDiff = width - (pointRadius * 2);
    if(xDiff < 0) console.error(`Insufficent width: ${width} for pointRadius: ${pointRadius}`);
    var xIncrement = (width - (2 * pointRadius)) / ((columns > 1) ? (columns - 1) : 1);
    var maxXIncrement = pointRadius * (2 + columnGap);
    xIncrement = Math.min(xIncrement, maxXIncrement);

    var i = 0;
    for(var row = 0; row < rows; ++row) {
      var pointY = y + pointRadius + (row * (2 + rowGap) * pointRadius);
      for(var column = 0; column < columns; ++column) {
        var pointX = x + pointRadius + (column * xIncrement);
        var point = this.coordsInCluster[i];
        point.x = pointX;
        point.y = pointY;
        ++i;
        if(i >= pointsToProcess) break;
      }
      this.displayBase = pointY + pointRadius;
      if(i >= pointsToProcess) break;
    }
  }
}


interface ParametersForGroupWithMean extends ParametersForGroup {
  x: number;
  y: number;
  radiusOfGroupLabel: number;
}


class GroupWithMean extends Group implements IsDrawable {
  x: number;
  y: number;
  radius: number;
  index: number;

  constructor(parameters: ParametersForGroupWithMean) {
    super(parameters);
    this.x = parameters.x;
    this.y = parameters.y;
    this.radius = parameters.radiusOfGroupLabel;
    this.index = 10;
  }

  calculateNewMean() {
    var oldPoint: PointInterface = {x: this.x, y: this.y};

    var newX = 0;
    var newY = 0;
    var len = this.coordsInCluster.length;
    if(len) {
      var sumX = 0;
      var sumY = 0;
      this.coordsInCluster.forEach((point) => {
        sumX += point.x;
        sumY += point.y;
      });
      newX = sumX/len;
      newY = sumY/len;
    }
    this.x = newX;
    this.y = newY;

    return euclideanDistance(oldPoint, this);
  }

  // First target to refactor.  Perhaps make a JSONifiable iterface and a clonable stamp,
  // the later of which requires a JSONifiable iterface.  The each class implements a
  // toJSON function and the appropriate constructor which `clone` can use.
  // Would also allow for `protected _groupCssClass` to return to being private.
  clone(): GroupWithMean {
    return new GroupWithMean({
      label: this.label,
      x: this.x,
      y: this.y,
      radiusOfGroupLabel: this.radius,
      groupCssClass: this._groupCssClass,
      groupId: this.id,
    })
  }
}


export {
  Group,
  AssignedPoint,
  GridArrangedGroup,
  ParametersForGridArrangedGroup,
  GroupWithMean,
}
