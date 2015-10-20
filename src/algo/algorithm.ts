

interface IterationResult {
  finished: boolean;
}


class Algorithm {
  protected iterationResult: IterationResult;

  public iterate(): IterationResult {
    if(!this.iterationResult || !this.iterationResult.finished) {
      this.iterationResult = this._iterate();
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
