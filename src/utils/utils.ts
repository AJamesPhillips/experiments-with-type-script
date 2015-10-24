
var isNumber = (val: any): boolean => {
  return _.isNumber(val) && !_.isNaN(val);
}

var isInteger = (num: number, loud: boolean = false): boolean => {
  var isInt = isNumber(num) && (num === 0 || (Math.round(num)/num) === 1);
  if(!isInt && loud) throw new Error(`Not integer: ${num}`);
  return isInt;
}

var is0OrGreater = (num: number, loud: boolean = false): boolean => {
  var is0OrMore = num >= 0;
  if(!is0OrMore && loud) throw new Error(`Not >= 0: ${num}`);
  return is0OrMore;
}

var isPositiveInteger = (num: number, loud: boolean = false): boolean => {
  var isPosInt = isInteger(num, false) && num > 0;
  if(!isPosInt && loud) throw new Error(`Not positive integer: ${num}`);
  return isPosInt;
}

var is0OrGreaterInteger = (num: number, loud: boolean = false): boolean => {
  var is0OrMoreInt = isInteger(num, false) && is0OrGreater(num, false);
  if(!is0OrMoreInt && loud) throw new Error(`Not integer >= 0: ${num}`);
  return is0OrMoreInt;
}

var capitalizeFirstLetter = (val: string) => {
  return val.charAt(0).toUpperCase() + val.slice(1);
}


var integerParser = (val: string): number => {
  var value = parseInt(val, 10);
  return isInteger(value) ? value : undefined;
}

var floatParser = (val: string): number => {
  var value = parseFloat(val);
  return isNumber(value) ? value : undefined;
}


var integerPositiveParser = (val: string): number => {
  var value = parseInt(val, 10);
  return isPositiveInteger(value) ? value : undefined;
}

var integer0OrMoreParser = (val: string): number => {
  var value = parseInt(val, 10);
  return is0OrGreaterInteger(value) ? value : undefined;
}


interface toStringInterface {
  toString: () => string;
}


export {
  isNumber,
  isInteger,
  is0OrGreater,
  isPositiveInteger,
  is0OrGreaterInteger,
  capitalizeFirstLetter,
  integerParser,
  floatParser,
  integerPositiveParser,
  integer0OrMoreParser,
  toStringInterface,
}
