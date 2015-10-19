import {Drawing} from '../data_visual/canvas';
import {Algorithm} from '../algo/algorithm';
import {
  Observer,
  SubjectBase,
} from '../utils/events';
import {toStringInterface} from '../utils/utils';


interface Parameters {
  key: string;
  value: toStringInterface;
}


interface AlgoVisualiser extends SubjectBase {
	name: string;
	description: string;
	parametersForHuman: Parameters[];
	setup: () => boolean;
	run: () => boolean;
	stop: () => boolean;
	restart: () => boolean;
	destroy: () => boolean;
	running: boolean;
}


class AbstractAlgoVisualiser extends SubjectBase {
	name: string = 'Need to set Algorithm name';
	description: string = 'Need to set Algorithm description';
	canvas: Drawing;
	size: number;
	dataPointRadius: number;
	algo: Algorithm;

	constructor(canvas: Drawing, size: number, dataPointRadius: number) {
		super();
		this.canvas = canvas;
		this.size = size;
		this.dataPointRadius = dataPointRadius;
	}

	setup(args: any = {}): boolean {
		if(!this.algo) {
			this._setup(args);
			return true;
		}
		return false;
	}

	protected _setup(args: any) {}

	run(): boolean {
		this.setup();
		return this.algo.run();
	}

	stop(): boolean {
		if(!this.algo) return false;
		return this.algo.stop();
	}

	restart(): boolean {
		if(!this.algo) return false;
		this.algo.stop();
		return this._restart();
	}

	protected _restart(): boolean {
		return true;
	}

	destroy(): boolean {
		if(!this.algo) return false;
		this._destroy();
		this.stop();
		this.visualClearup();
		this.algo.destroy();
		this.algo = undefined;
		return false;
	}

	protected _destroy() {}

	get running(): boolean {
		if(!this.algo) return false;
		return this.algo.running;
	}

  protected visualClearup() {
    this.canvas.removePoints();
		this._visualClearup();
  }

	protected _visualClearup() {}
}


var fullRestart = (algoVisual: AlgoVisualiser) => {
	var wasRunning = algoVisual.running;
	algoVisual.destroy();
	algoVisual.setup();
	if(wasRunning) algoVisual.run();
}


export {
	AlgoVisualiser,
	AbstractAlgoVisualiser,
	fullRestart,
}
