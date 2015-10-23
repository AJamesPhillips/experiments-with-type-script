
import {
  isPositiveInteger,
} from '../utils/utils';


interface PointInterface {
  x: number;
  y: number;
}


class Coord implements PointInterface {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}


interface IsDrawable extends PointInterface {
  radius: number;
  cssClass: string;
  label: string;
  index: number;
}


class ColoredCoord extends Coord implements IsDrawable {
  radius: number;
  index: number;
  protected labelValue: string;
  protected instanceCssClass: string;

  constructor(x: number, y: number, cssClass: string, radius: number, label: string = "") {
    super(x, y);
    this.instanceCssClass = cssClass;
    this.radius = radius;
    this.labelValue = label;
    this.index = 0;
  }

  get cssClass(): string {
    return this.instanceCssClass;
  }

  get label(): string {
    return this.labelValue;
  }
}


var euclideanDistance = function(point1: PointInterface, point2: PointInterface) {
  var squareSum = Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2);
  return Math.pow(squareSum, 0.5);
}


var randomiseCoords = function(coords: Coord[], rnd: {(): number;}) {
  for (var i = 0; i < coords.length; ++i) {
    coords[i].x = rnd()
    coords[i].y = rnd();
  }
}


var generateRndCoords = function(nummberOfCoords: number, rnd: {(): number;}) {
  var coords: Coord[] = [];
  for (var i = 0; i < nummberOfCoords; ++i) {
    coords.push(new Coord(0, 0));
  }
  randomiseCoords(coords, rnd);
  return coords;
}


export {
  PointInterface,
  IsDrawable,
  Coord,
  ColoredCoord,
  euclideanDistance,
  randomiseCoords,
  generateRndCoords,
};
