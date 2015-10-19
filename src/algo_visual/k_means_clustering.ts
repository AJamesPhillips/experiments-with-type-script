import {
  Parameters,
  AlgorithmEvent,
  IterationResult,
  NewStatusResult,
} from '../algo/algorithm';
import {
  KMeans,
} from '../algo/k_means_clustering';
import {
  AlgoVisualiser,
  AbstractAlgoVisualiser,
} from './algo_visual';
import {
  AssignedPoint,
  GroupWithMean,
} from '../data_visual/group';
import {
  randomiseCoords,
} from '../data_visual/coord';
import {
  bounded,
} from '../utils/random';


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
        value: this.numberOfGroups,
      },
      {
        key: 'Number of data points',
        value: this.numberOfDataPoints,
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

    if(args.groups.length) {
      this.groups = args.groups.map((g) => g.clone());
    } else {
      for(var i = 0; i < this.numberOfGroups; ++i) {
        this.groups.push(new GroupWithMean({
          label: String.fromCharCode(65 + i),
          x: 0,
          y: 0,
          radiusOfGroupLabel,
          groupCssClass,
          groupId: i,
        }));
      }
      randomiseCoords(this.groups, rndCoord);
    }

    if(args.points.length) {
      this.points = args.points.map((p) => p.clone());
    } else {
      for(var i = 0; i < this.numberOfDataPoints; ++i) {
        this.points.push(new AssignedPoint(0, 0, 'point', 10));
      }
      randomiseCoords(this.points, rndCoord);
    }

    // Now copy groups and points so we can restarted if needed.
    this.initialGroups = this.groups.map((g) => g.clone());
    this.initialPoints = this.points.map((p) => p.clone());

    this.initialVisualise();

    this.algo = new KMeans(this.points, this.groups);
    this.algo.addObserver(this);
  }

  initialVisualise() {
    // Visualise
    this.canvas.createPoints(this.points);
    this.canvas.createPoints(this.groups, '.group');
    this.updateCanvas();
  }

  updateCanvas() {
    this.canvas.updatePoints();
    this.canvas.updatePoints('.group');
  }

  event(event: IterationResult): void;
  event(event: NewStatusResult): void;
  event(event: AlgorithmEvent): void {
    if(event instanceof IterationResult) {
      this.updateCanvas();
    } else if(event instanceof NewStatusResult) {
      // pass on the algorithm's NewStatusResult
      this.informObservers(event);
    }
  }

  protected _restart() {
    this.destroy();
    this.setup({groups: this.initialGroups, points: this.initialPoints});
    return true;
  }

  protected _destroy() {
    // TODO figure out if there are any circular references we need to remove to aid GC
    this.points.forEach((p) => p.destroy());
    this.points = [];
    this.groups.forEach((g) => g.destroy());
    this.groups = [];
  }

  protected _visualClearup() {
    this.canvas.removePoints('.group');
  }
}


export {
	KMeansVisualiser
}
