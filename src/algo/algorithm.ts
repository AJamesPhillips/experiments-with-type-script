

interface IterationResult {
  finished: boolean;
}


class Algorithm {
  protected iterationResult: IterationResult;

  public iterate(args: any = {}): IterationResult {
    if(!this.iterationResult || !this.iterationResult.finished) {
      this.iterationResult = this._iterate(args);
    }
    return this.iterationResult;
  }

  protected _iterate(args: any): IterationResult {
    throw new Error('Subclasses must implement "_iterate"');
  }

  destroy(): void {}
}

export {
  Algorithm,
  IterationResult,
}
