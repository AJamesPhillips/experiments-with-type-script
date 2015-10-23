
var animationTime = 300;

var timings = {
  animationTime: function() {
    return animationTime;
  },
  setAnimationTime: function(milliSeconds: number) {
    animationTime = milliSeconds;
  }
}

export {
  timings
}
