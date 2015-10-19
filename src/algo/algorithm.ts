

class IterationResult {
  finished: boolean;
  maxChange: number;
  timeUntilNextStep: number;

  constructor(finished: boolean, maxChange?: number, timeUntilNextStep?: number) {
    this.finished = finished;
    this.maxChange = maxChange;
    this.timeUntilNextStep = timeUntilNextStep;
  }
}


class Algorithm {
  protected iterationResult: IterationResult;

  public iterate(): IterationResult {
    if(!this.iterationResult || this.iterationResult.maxChange > 1) {
      this.iterationResult = this._iterate();
    } else {
      this.iterationResult = new IterationResult(true);
    }
    return this.iterationResult;
  }

  protected _iterate(): IterationResult {
    throw new Error('Subclasses must implement "_iterate"');
  }

  destroy(): void {}
}

export {
  Algorithm,
  IterationResult,
}
