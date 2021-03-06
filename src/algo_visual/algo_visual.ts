import {timings} from './timings';
import {Drawing} from '../data_visual/canvas';
import {Algorithm} from '../algo/algorithm';
import {
  SubjectBase,
  EventResult,
} from '../utils/events';


interface NewStatusEvent extends EventResult {
  running: boolean;
  finished: boolean;
}


interface Parameters {
  key: string;
  attribute?: string;
  parser: (value: string) => number;
  cssClass?: string;
}


interface AlgoVisualiser extends SubjectBase {
  name: string;
  description: string;
  className: string;
  parametersForHuman: Parameters[];
  getParameter: (parameter: string) => number;
  setParameter: (parameter: string, value: number) => void;
  setup: () => boolean;
  run: () => boolean;
  stop: () => boolean;
  restart: () => boolean;
  destroy: () => boolean;
  running: boolean;
}


class AbstractAlgoVisualiser extends SubjectBase {
  protected canvas: Drawing;
  protected size: number;
  protected dataPointRadius: number;
  protected algo: Algorithm;
  private _running: boolean;
  private _finished: boolean;
  private nextIterationToken: number;

  constructor(canvas: Drawing, size: number, dataPointRadius: number) {
    super();
    this.canvas = canvas;
    this.size = size;
    this.dataPointRadius = dataPointRadius;
    this.iterateHandler = this.iterateHandler.bind(this);
  }

  // This code smells
  getParameter(parameter: string): number {
    var ParameterAlgoVisual: {[idx: string]: number;} = <any>this;
    return ParameterAlgoVisual[parameter];
  }

  // This code smells
  setParameter(parameter: string, value: number): void {
    var ParameterAlgoVisual: {[idx: string]: number;} = <any>this;
    ParameterAlgoVisual[parameter] = value;
    this._parameterChanged(parameter);
  }

  protected get animationDuration() {
    return timings.animationTime();
  }

  get running(): boolean {
    if(!this.algo) return false;
    return this._running;
  }

  set running(val: boolean) {
    this._running = val;
    var event: NewStatusEvent = {
      running: this.running,
      finished: this._finished,
    };
    this.informObservers(event);
  }

  informObservers(event: NewStatusEvent) {
    return super.informObservers(event);
  }

  setup(args: any = {}): boolean {
    if(!this.algo) {
      this._finished = false;
      this.algo = this._setup(args);
      return true;
    }
    return false;
  }

  run(): boolean {
    if(this.running || this._finished) return false;
    this.setup();
    this.running = true;
    this.iterateHandler();
    return true;
  }

  private iterateHandler(): void {
    var delay: number = this._iterate();
    if(delay !== undefined) {
      this.nextIterationToken = setTimeout(this.iterateHandler, delay);
    } else {
      this._finished = true;
      this.stop();
    }
  }

  stop(): boolean {
    if(!this.algo || !this.running) return false;
    this.running = false;
    window.clearTimeout(this.nextIterationToken);
    this.nextIterationToken = undefined;
    return true;
  }

  restart(): boolean {
    if(!this.algo) return false;
    this.stop();
    this._restart();
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

  protected visualClearup() {
    this.canvas.removePoints();
    this._visualClearup();
  }

  protected _setup(args: any): Algorithm {
    throw new Error('Subclasses must implement "_setup"');
  }

  /*
   * Time to run in milliseconds when the `_iterate` function should be called again.
   */
  protected _iterate(): number {
    throw new Error('Subclasses must implement "_iterate"');
  }

  protected _restart(): void {
    throw new Error('Subclasses must implement "_restart"');
  }

  protected _destroy(): void {
    throw new Error('Subclasses must implement "_destroy"');
  }

  protected _visualClearup(): void {
    throw new Error('Subclasses must implement "_visualClearup"');
  }

  protected _parameterChanged(parameter: string): void {
    throw new Error('Subclasses must implement "_parameterChanged"');
  }
}


var fullRestart = (algoVisual: AlgoVisualiser) => {
  var wasRunning = algoVisual.running;
  algoVisual.destroy();
  algoVisual.setup();
  if(wasRunning) algoVisual.run();
}


export {
  Parameters,
  AlgoVisualiser,
  AbstractAlgoVisualiser,
  NewStatusEvent,
  fullRestart,
}