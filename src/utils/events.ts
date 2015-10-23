/// <reference path="../../typings/underscore/underscore.d.ts" />


interface EventResult {}


interface Observer {
  event: (eventResult: EventResult) => void
}


interface Subject {
  addObserver: (observer: Observer) => void;
  removeObserver: (observer: Observer) => void;
}


class SubjectBase implements Subject {
  private observers: Observer[] = [];

  addObserver(observer: Observer) {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer) {
    // TODO can we remove the cast?
    this.observers = <Observer[]> _.reject(this.observers, (o) => o === observer);
  }

  protected informObservers(eventResult: EventResult) {
    this.observers.map((observer) => observer.event(eventResult));
  }

  destroy(): void {
    // Remove references to listeners incase they also have a reference
    // to this instance (and therefore a circular reference).  Maybe
    // important for helping GC.
    this.observers = [];
  }
}


export {
	EventResult,
	Observer,
	Subject,
	SubjectBase,
}
