import {KMeans} from '../algo/k_means_clustering';
import {
  Parameters,
  AlgoVisualiser,
  AbstractAlgoVisualiser,
} from './algo_visual';
import {
  AssignedPoint,
  GroupWithMean,
} from '../data_visual/group';
import {
  bounded,
} from '../utils/random';
import {
  integer0OrMoreParser,
} from '../utils/utils';


class KMeansVisualiser extends AbstractAlgoVisualiser implements AlgoVisualiser {
  name = 'K Means clustering';
  description = ('Clusters points into groups based on the closest group mean to it.  K means is ' +
    'a heuristic algorithm, it can not guarentee the final group positions represent the "best" ' +
    'clustering, i.e. the mean distance between all points and their group is the lowest.  ' +
    'Is N-dimensional but this simple implementation does not support weighting along particular dimensions.');
  numberOfGroups: number = 3;
  numberOfDataPoints: number = 30;

  groups: GroupWithMean[] = [];
  points: AssignedPoint[] = [];
  initialGroups: GroupWithMean[] = [];
  initialPoints: AssignedPoint[] = [];

  get parametersForHuman(): Parameters[] {
    return [
      {
        key: 'Number of clusters',
        attribute: 'numberOfGroups',
        parser: integer0OrMoreParser,
      },
      {
        key: 'Number of data points',
        attribute: 'numberOfDataPoints',
        parser: integer0OrMoreParser,
      },
    ];
  }

  protected _setup(args: {groups?: GroupWithMean[]; points?: AssignedPoint[]}={}) {
    var radiusOfGroupLabel = 10;
    var groupCssClass = 'group';

    var pointBorder = 2;
    var rndCoord = () => bounded(this.dataPointRadius + pointBorder, this.size - this.dataPointRadius - pointBorder);

    args.groups = args.groups || [];
    args.points = args.points || [];

    // Make new randomly placed groups or clone existing groups
    if(args.groups.length) {
      this.groups = args.groups.map((g) => g.clone());
    } else {
      for(var i = 0; i < this.numberOfGroups; ++i) {
        this.groups.push(new GroupWithMean({
          label: String.fromCharCode(65 + i),
          x: rndCoord(),
          y: rndCoord(),
          radiusOfGroupLabel,
          groupCssClass,
          groupId: i,
        }));
      }
    }

    // Make new randomly placed points or clone existing points
    if(args.points.length) {
      this.points = args.points.map((p) => p.clone());
    } else {
      for(var i = 0; i < this.numberOfDataPoints; ++i) {
        this.points.push(new AssignedPoint(rndCoord(), rndCoord(), 'point', 10));
      }
    }

    // Copy groups and points so we can restarted if needed.
    this.initialGroups = this.groups.map((g) => g.clone());
    this.initialPoints = this.points.map((p) => p.clone());

    this.initialVisualise();

    this.algo = new KMeans(this.points, this.groups);
    return this.algo;
  }

  initialVisualise() {
    // Visualise
    this.canvas.createPoints(this.points);
    this.canvas.createPoints(this.groups, '.group');
    this.updateCanvas();
  }

  updateCanvas() {
    this.canvas.updatePoints(this.animationDuration);
    this.canvas.updatePoints(this.animationDuration, '.group');
  }

  protected _iterate(): number {
    var result = this.algo.iterate();
    this.updateCanvas();
    return result.finished ? undefined : this.animationDuration * 2;
  }

  protected _restart(): void {
    this.destroy();
    this.setup({groups: this.initialGroups, points: this.initialPoints});
  }

  protected _destroy(): void {
    this.points.forEach((p) => p.destroy());
    this.points = [];
    this.groups.forEach((g) => g.destroy());
    this.groups = [];
  }

  protected _visualClearup(): void {
    this.canvas.removePoints('.group');
  }
}


export {
  KMeansVisualiser
}
