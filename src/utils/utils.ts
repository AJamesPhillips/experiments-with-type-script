
var isInteger = function(num: number, loud: boolean = false): boolean {
  var isInt = num === 0 || (Math.round(num)/num) === 1;
  if(!isInt && loud) throw new Error(`Not integer: ${num}`);
  return isInt;
}

var is0OrGreater = function(num: number, loud: boolean = false): boolean {
  var is0OrMore = num >= 0;
  if(!is0OrMore && loud) throw new Error(`Not >= 0: ${num}`);
  return is0OrMore;
}

var isPositiveInteger = function(num: number, loud: boolean = false): boolean {
  var isPosInt = isInteger(num, false) && num > 0;
  if(!isPosInt && loud) throw new Error(`Not positive integer: ${num}`);
  return isPosInt;
}

var is0OrGreaterInteger = function(num: number, loud: boolean = false): boolean {
  var is0OrMoreInt = isInteger(num, false) && is0OrGreater(num, false);
  if(!is0OrMoreInt && loud) throw new Error(`Not integer >= 0: ${num}`);
  return is0OrMoreInt;
}

var capitalizeFirstLetter = (val: string) => {
  return val.charAt(0).toUpperCase() + val.slice(1);
}


interface toStringInterface {
  toString: () => string;
}


export {
  isInteger,
  is0OrGreater,
  isPositiveInteger,
  is0OrGreaterInteger,
  capitalizeFirstLetter,
  toStringInterface,
}
