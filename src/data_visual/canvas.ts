/// <reference path="../../typings/tsd.d.ts" />

import {IsDrawable} from '../data_visual/coord';
import {Group} from '../data_visual/group';


var translatePoint = function(point: IsDrawable): string {
  return "translate(" + point.x + "," + point.y + ")";
}


class Drawing {
  svg: d3.Selection<any>;

  constructor(svg: d3.Selection<any>) {
    this.svg = svg;
  }

  createPoints(data: IsDrawable[], cssSelector: string = '.point'): void {
    if(data.length === 0) return;

    var points = this.svg.selectAll(cssSelector)
      .data(data);

    // add previously non-existance points
    var newPoints = points.enter().append('g')
      .attr('class', (d) => d.cssClass)
      .attr('transform', translatePoint);
    newPoints.append('circle')
        .attr('r', (d) => d.radius)
        .attr('class', 'point_circle');
    newPoints.append('text')
        .attr('dx', (d) => -d.radius/3)
        .attr('dy', (d) => d.radius/2)
        .text((d) => d.label);
  }

  updatePoints(animationDuration: number, cssSelector: string = '.point'): void {
    var points = <d3.Selection<IsDrawable>> this.svg.selectAll(cssSelector);

    // update existing
    points.selectAll('text')
        .text((d) => d.label);
    points
      .attr('class', (d) => d.cssClass)
      .transition()
        .attr('transform', translatePoint)
        .duration(animationDuration);
    // Move to correct index value
    points.sort((a: IsDrawable, b: IsDrawable) => a.index < b.index ? -1 : 1);
  }

  removePoints(cssSelector: string = '.point'): void {
    this.svg.selectAll(cssSelector).data([]).exit().remove();
  }
}


var makeSvgDrawArea = function(size: number): Drawing {
	var svg = d3.select("body").append("svg")
    .attr("width", size)
    .attr("height", size)
    .attr("class", "space");
	return new Drawing(svg);
};


export {
	makeSvgDrawArea,
  Drawing
};
