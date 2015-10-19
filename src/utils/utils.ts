
var isInteger = function(num: number, loud: boolean = false): boolean {
  var isInt = num === 0 || (Math.round(num)/num) === 1;
  if(!isInt && loud) throw new Error(`Not integer: ${num}`);
  return isInt;
}

var isPositiveInteger = function(num: number, loud: boolean = false): boolean {
  var isPosInt = isInteger(num, false) && num > 0;
  if(!isPosInt && loud) throw new Error(`Not positive integer: ${num}`);
  return isPosInt;
}

var is0OrGreaterInteger = function(num: number, loud: boolean = false): boolean {
  var is0OrMoreInt = isInteger(num, false) && num >= 0;
  if(!is0OrMoreInt && loud) throw new Error(`Not integer >= 0: ${num}`);
  return is0OrMoreInt;
}


// // #######################################################################
// //+ TODO refactor to use a library function (e.g. from underscore / lodash)

// var contains = function(list: any[], item: any): boolean {
//   return !!~list.indexOf(item);
// };


// var unique = function(list: any[]): any {
//   var newList: any[] = [];
//   for(var i = 0; i < list.length; ++i) {
//     var element = list[i];
//     if(!~newList.indexOf(element)) {
//       newList.push(element);
//     }
//   }
//   return newList;
// };


// var remove = function(list: any[], item: any): any {
//   if(~list.indexOf(item)) {
//     var index = list.indexOf(item);
//     list.splice(index, 1);
//     return item;
//   }
//   return undefined;
// };


// var _ = {
//   contains,
//   unique,
//   remove,
// };
// //- TODO refactor to use a library function (e.g. from underscore / lodash)
// // #######################################################################


var capitalizeFirstLetter = (val: string) => {
  return val.charAt(0).toUpperCase() + val.slice(1);
}


interface toStringInterface {
  toString: () => string;
}


export {
  isInteger,
  isPositiveInteger,
  is0OrGreaterInteger,
  capitalizeFirstLetter,
  toStringInterface,
}
