// import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
// import { PowerConsumption } from '../../models/power-consumption';
// import * as d3 from 'd3';

// @Component({
//   selector: 'app-power-graph',
//   imports: [],
//   templateUrl: './power-graph.html',
//   styleUrl: './power-graph.scss',
// })
// export class PowerGraph implements AfterViewInit, OnChanges, OnDestroy {
//   @Input() historicalData: PowerConsumption[] = [];
//   @Input() realtimeData: PowerConsumption | null = null;
//   @ViewChild('graphContainer', { static: false }) container!: ElementRef;

//   private svg: any;
//   private g: any;
//   private xScale: any;
//   private yScale: any;
//   private xAxis: any;
//   private yAxis: any;
//   private line: any;
//   private historicalPath: any;
//   private realtimePath: any;
//   private tooltip: any;

//   private margin = { top: 20, right: 30, bottom: 50, left: 60 };
//   private width: number = 800;
//   private height: number = 400;
//   private innerWidth: number = 0;
//   private innerHeight: number = 0;

//   private realtimePoints: PowerConsumption[] = [];
//   private resizeListener?: () => void;

//   ngAfterViewInit(): void {
//     this.calculateDimensions();
//     this.createChart();
    
//     this.resizeListener = () => this.onResize();
//     window.addEventListener('resize', this.resizeListener);
//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     if (changes['historicalData'] && this.svg) {
//       this.realtimePoints = [];
//       this.updateChart();
//     }
    
//     if (changes['realtimeData'] && this.realtimeData && this.svg) {
//       this.appendRealtimeData(this.realtimeData);
//     }
//   }

//   ngOnDestroy(): void {
//     if (this.resizeListener) {
//       window.removeEventListener('resize', this.resizeListener);
//     }
//     d3.select(this.container.nativeElement).selectAll('*').remove();
//   }

//   private calculateDimensions(): void {
//     const containerWidth = this.container.nativeElement.offsetWidth;
//     this.width = containerWidth > 0 ? containerWidth : 800;
//     this.innerWidth = this.width - this.margin.left - this.margin.right;
//     this.innerHeight = this.height - this.margin.top - this.margin.bottom;
//   }

//   private createChart(): void {
//     d3.select(this.container.nativeElement).select('svg').remove();

//     this.svg = d3.select(this.container.nativeElement)
//       .append('svg')
//       .attr('width', this.width)
//       .attr('height', this.height);

//     this.g = this.svg.append('g')
//       .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

//     this.xScale = d3.scaleTime()
//       .range([0, this.innerWidth]);

//     this.yScale = d3.scaleLinear()
//       .range([this.innerHeight, 0]);

//     // ✅ FIXED: Proper typing for D3 axis
//     this.xAxis = d3.axisBottom<Date>(this.xScale)
//       .ticks(10)
//       .tickFormat(d3.timeFormat('%H:%M') as any);

//     this.yAxis = d3.axisLeft(this.yScale)
//       .ticks(10);

//     this.g.append('g')
//       .attr('class', 'x-axis')
//       .attr('transform', `translate(0,${this.innerHeight})`);

//     this.g.append('g')
//       .attr('class', 'y-axis');

//     this.g.append('text')
//       .attr('class', 'x-axis-label')
//       .attr('text-anchor', 'middle')
//       .attr('x', this.innerWidth / 2)
//       .attr('y', this.innerHeight + 40)
//       .text('Time');

//     this.g.append('text')
//       .attr('class', 'y-axis-label')
//       .attr('text-anchor', 'middle')
//       .attr('transform', 'rotate(-90)')
//       .attr('x', -this.innerHeight / 2)
//       .attr('y', -45)
//       .text('Power (kW)');

//     this.line = d3.line<PowerConsumption>()
//       .x((d: PowerConsumption) => this.xScale(d.timestamp))
//       .y((d: PowerConsumption) => this.yScale(d.globalActivePower))
//       .curve(d3.curveMonotoneX);

//     this.historicalPath = this.g.append('path')
//       .attr('class', 'line historical-line')
//       .attr('fill', 'none')
//       .attr('stroke', '#3498db')
//       .attr('stroke-width', 2);

//     this.realtimePath = this.g.append('path')
//       .attr('class', 'line realtime-line')
//       .attr('fill', 'none')
//       .attr('stroke', '#e74c3c')
//       .attr('stroke-width', 3);

//     this.tooltip = d3.select(this.container.nativeElement)
//       .append('div')
//       .attr('class', 'tooltip')
//       .style('opacity', 0)
//       .style('position', 'absolute')
//       .style('background-color', 'white')
//       .style('border', '1px solid #ddd')
//       .style('border-radius', '5px')
//       .style('padding', '10px')
//       .style('pointer-events', 'none');

//     this.addLegend();
//   }

//   private updateChart(): void {
//     if (!this.historicalData || this.historicalData.length === 0) {
//       return;
//     }

//     const allData = [...this.historicalData, ...this.realtimePoints];
    
//     // ✅ FIXED: Proper type handling for d3.extent
//     const timeExtent = d3.extent(allData, d => d.timestamp as Date);
//     if (timeExtent[0] && timeExtent[1]) {
//       this.xScale.domain([timeExtent[0], timeExtent[1]]);
//     }

//     const maxPower = d3.max(allData, d => d.globalActivePower);
//     this.yScale.domain([0, (maxPower || 0) * 1.1]);

//     this.g.select('.x-axis')
//       .transition()
//       .duration(500)
//       .call(this.xAxis);

//     this.g.select('.y-axis')
//       .transition()
//       .duration(500)
//       .call(this.yAxis);

//     this.historicalPath
//       .datum(this.historicalData)
//       .transition()
//       .duration(500)
//       .attr('d', this.line);

//     this.addHoverInteraction();
//   }

//   private appendRealtimeData(data: PowerConsumption): void {
//     this.realtimePoints.push(data);

//     if (this.realtimePoints.length > 100) {
//       this.realtimePoints.shift();
//     }

//     const allData = [...this.historicalData, ...this.realtimePoints];
    
//     // ✅ FIXED: Proper type handling for d3.extent
//     const timeExtent = d3.extent(allData, d => d.timestamp as Date);
//     if (timeExtent[0] && timeExtent[1]) {
//       this.xScale.domain([timeExtent[0], timeExtent[1]]);
//     }

//     const maxPower = d3.max(allData, d => d.globalActivePower);
//     this.yScale.domain([0, (maxPower || 0) * 1.1]);

//     this.g.select('.x-axis')
//       .transition()
//       .duration(300)
//       .call(this.xAxis);

//     this.g.select('.y-axis')
//       .transition()
//       .duration(300)
//       .call(this.yAxis);

//     this.realtimePath
//       .datum(this.realtimePoints)
//       .transition()
//       .duration(300)
//       .attr('d', this.line);

//     this.addRealtimeMarker(data);
//   }

//   private addRealtimeMarker(data: PowerConsumption): void {
//     const x = this.xScale(data.timestamp);
//     const y = this.yScale(data.globalActivePower);

//     this.g.selectAll('.realtime-marker').remove();

//     const marker = this.g.append('circle')
//       .attr('class', 'realtime-marker')
//       .attr('cx', x)
//       .attr('cy', y)
//       .attr('r', 5)
//       .attr('fill', '#e74c3c');

//     marker.transition()
//       .duration(1000)
//       .attr('r', 8)
//       .style('opacity', 0)
//       .remove();
//   }

//   private addHoverInteraction(): void {
//     const bisect = d3.bisector((d: PowerConsumption) => d.timestamp as Date).left;

//     this.g.selectAll('.overlay').remove();

//     this.g.append('rect')
//       .attr('class', 'overlay')
//       .attr('width', this.innerWidth)
//       .attr('height', this.innerHeight)
//       .style('fill', 'none')
//       .style('pointer-events', 'all')
//       .on('mouseover', () => this.tooltip.style('opacity', 1))
//       .on('mouseout', () => {
//         this.tooltip.style('opacity', 0);
//         this.g.selectAll('.hover-line').remove();
//         this.g.selectAll('.hover-circle').remove();
//       })
//       .on('mousemove', (event: MouseEvent) => {
//         const [mouseX] = d3.pointer(event);
//         const x0 = this.xScale.invert(mouseX);
//         const i = bisect(this.historicalData, x0, 1);
//         const d0 = this.historicalData[i - 1];
//         const d1 = this.historicalData[i];
        
//         if (!d0 || !d1) return;

//         const d = (x0.getTime() - (d0.timestamp as Date).getTime()) > 
//                   ((d1.timestamp as Date).getTime() - x0.getTime()) ? d1 : d0;

//         const x = this.xScale(d.timestamp);
//         const y = this.yScale(d.globalActivePower);

//         this.g.selectAll('.hover-line').remove();
//         this.g.selectAll('.hover-circle').remove();

//         this.g.append('line')
//           .attr('class', 'hover-line')
//           .attr('x1', x)
//           .attr('x2', x)
//           .attr('y1', 0)
//           .attr('y2', this.innerHeight)
//           .attr('stroke', '#95a5a6')
//           .attr('stroke-width', 1)
//           .attr('stroke-dasharray', '3,3');

//         this.g.append('circle')
//           .attr('class', 'hover-circle')
//           .attr('cx', x)
//           .attr('cy', y)
//           .attr('r', 5)
//           .attr('fill', '#3498db')
//           .attr('stroke', 'white')
//           .attr('stroke-width', 2);

//         const time = d3.timeFormat('%H:%M:%S')(d.timestamp as Date);
//         this.tooltip
//           .html(`
//             <strong>Time:</strong> ${time}<br/>
//             <strong>Power:</strong> ${d.globalActivePower.toFixed(3)} kW<br/>
//             <strong>Voltage:</strong> ${d.voltage.toFixed(2)} V<br/>
//             <strong>Current:</strong> ${d.globalIntensity.toFixed(2)} A
//           `)
//           .style('left', (event.pageX + 10) + 'px')
//           .style('top', (event.pageY - 28) + 'px');
//       });
//   }

//   private addLegend(): void {
//     const legend = this.g.append('g')
//       .attr('class', 'legend')
//       .attr('transform', `translate(${this.innerWidth - 150}, 10)`);

//     legend.append('line')
//       .attr('x1', 0)
//       .attr('x2', 30)
//       .attr('y1', 0)
//       .attr('y2', 0)
//       .attr('stroke', '#3498db')
//       .attr('stroke-width', 2);

//     legend.append('text')
//       .attr('x', 35)
//       .attr('y', 5)
//       .text('Historical')
//       .style('font-size', '12px');

//     legend.append('line')
//       .attr('x1', 0)
//       .attr('x2', 30)
//       .attr('y1', 20)
//       .attr('y2', 20)
//       .attr('stroke', '#e74c3c')
//       .attr('stroke-width', 3);

//     legend.append('text')
//       .attr('x', 35)
//       .attr('y', 25)
//       .text('Real-time')
//       .style('font-size', '12px');
//   }

//   private onResize(): void {
//     this.calculateDimensions();
//     this.createChart();
//     this.updateChart();
//   }
// }

// // import { 
// //   Component, 
// //   Input, 
// //   OnChanges, 
// //   SimpleChanges, 
// //   ElementRef, 
// //   ViewChild, 
// //   AfterViewInit,
// //   OnDestroy 
// // } from '@angular/core';
// // import { CommonModule } from '@angular/common';
// // import * as d3 from 'd3';
// // import { PowerConsumption } from '../../models/power-consumption.model';

// // @Component({
// //   selector: 'app-power-graph',
// //   standalone: true,
// //   imports: [CommonModule],
// //   templateUrl: './power-graph.component.html',
// //   styleUrls: ['./power-graph.component.scss']
// // })
// // export class PowerGraphComponent implements AfterViewInit, OnChanges, OnDestroy {
// //   @Input() historicalData: PowerConsumption[] = [];
// //   @Input() realtimeData: PowerConsumption | null = null;
// //   @ViewChild('graphContainer', { static: false }) container!: ElementRef;

// //   private svg: any;
// //   private g: any;
// //   private xScale: any;
// //   private yScale: any;
// //   private xAxis: any;
// //   private yAxis: any;
// //   private line: any;
// //   private historicalPath: any;
// //   private realtimePath: any;
// //   private tooltip: any;

// //   private margin = { top: 20, right: 30, bottom: 50, left: 60 };
// //   private width: number = 800;
// //   private height: number = 400;
// //   private innerWidth: number = 0;
// //   private innerHeight: number = 0;

// //   private realtimePoints: PowerConsumption[] = [];
// //   private resizeListener?: () => void;

// //   ngAfterViewInit(): void {
// //     this.calculateDimensions();
// //     this.createChart();
    
// //     this.resizeListener = () => this.onResize();
// //     window.addEventListener('resize', this.resizeListener);
// //   }

// //   ngOnChanges(changes: SimpleChanges): void {
// //     if (changes['historicalData'] && this.svg) {
// //       this.realtimePoints = [];
// //       this.updateChart();
// //     }
    
// //     if (changes['realtimeData'] && this.realtimeData && this.svg) {
// //       this.appendRealtimeData(this.realtimeData);
// //     }
// //   }

// //   ngOnDestroy(): void {
// //     if (this.resizeListener) {
// //       window.removeEventListener('resize', this.resizeListener);
// //     }
// //     d3.select(this.container.nativeElement).selectAll('*').remove();
// //   }

// //   private calculateDimensions(): void {
// //     const containerWidth = this.container.nativeElement.offsetWidth;
// //     this.width = containerWidth > 0 ? containerWidth : 800;
// //     this.innerWidth = this.width - this.margin.left - this.margin.right;
// //     this.innerHeight = this.height - this.margin.top - this.margin.bottom;
// //   }

// //   private createChart(): void {
// //     d3.select(this.container.nativeElement).select('svg').remove();

// //     this.svg = d3.select(this.container.nativeElement)
// //       .append('svg')
// //       .attr('width', this.width)
// //       .attr('height', this.height);

// //     this.g = this.svg.append('g')
// //       .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

// //     this.xScale = d3.scaleTime()
// //       .range([0, this.innerWidth]);

// //     this.yScale = d3.scaleLinear()
// //       .range([this.innerHeight, 0]);

// //     // ✅ FIXED: Proper typing for D3 axis
// //     this.xAxis = d3.axisBottom<Date>(this.xScale)
// //       .ticks(10)
// //       .tickFormat(d3.timeFormat('%H:%M') as any);

// //     this.yAxis = d3.axisLeft(this.yScale)
// //       .ticks(10);

// //     this.g.append('g')
// //       .attr('class', 'x-axis')
// //       .attr('transform', `translate(0,${this.innerHeight})`);

// //     this.g.append('g')
// //       .attr('class', 'y-axis');

// //     this.g.append('text')
// //       .attr('class', 'x-axis-label')
// //       .attr('text-anchor', 'middle')
// //       .attr('x', this.innerWidth / 2)
// //       .attr('y', this.innerHeight + 40)
// //       .text('Time');

// //     this.g.append('text')
// //       .attr('class', 'y-axis-label')
// //       .attr('text-anchor', 'middle')
// //       .attr('transform', 'rotate(-90)')
// //       .attr('x', -this.innerHeight / 2)
// //       .attr('y', -45)
// //       .text('Power (kW)');

// //     this.line = d3.line<PowerConsumption>()
// //       .x((d: PowerConsumption) => this.xScale(d.timestamp))
// //       .y((d: PowerConsumption) => this.yScale(d.globalActivePower))
// //       .curve(d3.curveMonotoneX);

// //     this.historicalPath = this.g.append('path')
// //       .attr('class', 'line historical-line')
// //       .attr('fill', 'none')
// //       .attr('stroke', '#3498db')
// //       .attr('stroke-width', 2);

// //     this.realtimePath = this.g.append('path')
// //       .attr('class', 'line realtime-line')
// //       .attr('fill', 'none')
// //       .attr('stroke', '#e74c3c')
// //       .attr('stroke-width', 3);

// //     this.tooltip = d3.select(this.container.nativeElement)
// //       .append('div')
// //       .attr('class', 'tooltip')
// //       .style('opacity', 0)
// //       .style('position', 'absolute')
// //       .style('background-color', 'white')
// //       .style('border', '1px solid #ddd')
// //       .style('border-radius', '5px')
// //       .style('padding', '10px')
// //       .style('pointer-events', 'none');

// //     this.addLegend();
// //   }

// //   private updateChart(): void {
// //     if (!this.historicalData || this.historicalData.length === 0) {
// //       return;
// //     }

// //     const allData = [...this.historicalData, ...this.realtimePoints];
    
// //     // ✅ FIXED: Proper type handling for d3.extent
// //     const timeExtent = d3.extent(allData, d => d.timestamp as Date);
// //     if (timeExtent[0] && timeExtent[1]) {
// //       this.xScale.domain([timeExtent[0], timeExtent[1]]);
// //     }

// //     const maxPower = d3.max(allData, d => d.globalActivePower);
// //     this.yScale.domain([0, (maxPower || 0) * 1.1]);

// //     this.g.select('.x-axis')
// //       .transition()
// //       .duration(500)
// //       .call(this.xAxis);

// //     this.g.select('.y-axis')
// //       .transition()
// //       .duration(500)
// //       .call(this.yAxis);

// //     this.historicalPath
// //       .datum(this.historicalData)
// //       .transition()
// //       .duration(500)
// //       .attr('d', this.line);

// //     this.addHoverInteraction();
// //   }

// //   private appendRealtimeData(data: PowerConsumption): void {
// //     this.realtimePoints.push(data);

// //     if (this.realtimePoints.length > 100) {
// //       this.realtimePoints.shift();
// //     }

// //     const allData = [...this.historicalData, ...this.realtimePoints];
    
// //     // ✅ FIXED: Proper type handling for d3.extent
// //     const timeExtent = d3.extent(allData, d => d.timestamp as Date);
// //     if (timeExtent[0] && timeExtent[1]) {
// //       this.xScale.domain([timeExtent[0], timeExtent[1]]);
// //     }

// //     const maxPower = d3.max(allData, d => d.globalActivePower);
// //     this.yScale.domain([0, (maxPower || 0) * 1.1]);

// //     this.g.select('.x-axis')
// //       .transition()
// //       .duration(300)
// //       .call(this.xAxis);

// //     this.g.select('.y-axis')
// //       .transition()
// //       .duration(300)
// //       .call(this.yAxis);

// //     this.realtimePath
// //       .datum(this.realtimePoints)
// //       .transition()
// //       .duration(300)
// //       .attr('d', this.line);

// //     this.addRealtimeMarker(data);
// //   }

// //   private addRealtimeMarker(data: PowerConsumption): void {
// //     const x = this.xScale(data.timestamp);
// //     const y = this.yScale(data.globalActivePower);

// //     this.g.selectAll('.realtime-marker').remove();

// //     const marker = this.g.append('circle')
// //       .attr('class', 'realtime-marker')
// //       .attr('cx', x)
// //       .attr('cy', y)
// //       .attr('r', 5)
// //       .attr('fill', '#e74c3c');

// //     marker.transition()
// //       .duration(1000)
// //       .attr('r', 8)
// //       .style('opacity', 0)
// //       .remove();
// //   }

// //   private addHoverInteraction(): void {
// //     const bisect = d3.bisector((d: PowerConsumption) => d.timestamp as Date).left;

// //     this.g.selectAll('.overlay').remove();

// //     this.g.append('rect')
// //       .attr('class', 'overlay')
// //       .attr('width', this.innerWidth)
// //       .attr('height', this.innerHeight)
// //       .style('fill', 'none')
// //       .style('pointer-events', 'all')
// //       .on('mouseover', () => this.tooltip.style('opacity', 1))
// //       .on('mouseout', () => {
// //         this.tooltip.style('opacity', 0);
// //         this.g.selectAll('.hover-line').remove();
// //         this.g.selectAll('.hover-circle').remove();
// //       })
// //       .on('mousemove', (event: MouseEvent) => {
// //         const [mouseX] = d3.pointer(event);
// //         const x0 = this.xScale.invert(mouseX);
// //         const i = bisect(this.historicalData, x0, 1);
// //         const d0 = this.historicalData[i - 1];
// //         const d1 = this.historicalData[i];
        
// //         if (!d0 || !d1) return;

// //         const d = (x0.getTime() - (d0.timestamp as Date).getTime()) > 
// //                   ((d1.timestamp as Date).getTime() - x0.getTime()) ? d1 : d0;

// //         const x = this.xScale(d.timestamp);
// //         const y = this.yScale(d.globalActivePower);

// //         this.g.selectAll('.hover-line').remove();
// //         this.g.selectAll('.hover-circle').remove();

// //         this.g.append('line')
// //           .attr('class', 'hover-line')
// //           .attr('x1', x)
// //           .attr('x2', x)
// //           .attr('y1', 0)
// //           .attr('y2', this.innerHeight)
// //           .attr('stroke', '#95a5a6')
// //           .attr('stroke-width', 1)
// //           .attr('stroke-dasharray', '3,3');

// //         this.g.append('circle')
// //           .attr('class', 'hover-circle')
// //           .attr('cx', x)
// //           .attr('cy', y)
// //           .attr('r', 5)
// //           .attr('fill', '#3498db')
// //           .attr('stroke', 'white')
// //           .attr('stroke-width', 2);

// //         const time = d3.timeFormat('%H:%M:%S')(d.timestamp as Date);
// //         this.tooltip
// //           .html(`
// //             <strong>Time:</strong> ${time}<br/>
// //             <strong>Power:</strong> ${d.globalActivePower.toFixed(3)} kW<br/>
// //             <strong>Voltage:</strong> ${d.voltage.toFixed(2)} V<br/>
// //             <strong>Current:</strong> ${d.globalIntensity.toFixed(2)} A
// //           `)
// //           .style('left', (event.pageX + 10) + 'px')
// //           .style('top', (event.pageY - 28) + 'px');
// //       });
// //   }

// //   private addLegend(): void {
// //     const legend = this.g.append('g')
// //       .attr('class', 'legend')
// //       .attr('transform', `translate(${this.innerWidth - 150}, 10)`);

// //     legend.append('line')
// //       .attr('x1', 0)
// //       .attr('x2', 30)
// //       .attr('y1', 0)
// //       .attr('y2', 0)
// //       .attr('stroke', '#3498db')
// //       .attr('stroke-width', 2);

// //     legend.append('text')
// //       .attr('x', 35)
// //       .attr('y', 5)
// //       .text('Historical')
// //       .style('font-size', '12px');

// //     legend.append('line')
// //       .attr('x1', 0)
// //       .attr('x2', 30)
// //       .attr('y1', 20)
// //       .attr('y2', 20)
// //       .attr('stroke', '#e74c3c')
// //       .attr('stroke-width', 3);

// //     legend.append('text')
// //       .attr('x', 35)
// //       .attr('y', 25)
// //       .text('Real-time')
// //       .style('font-size', '12px');
// //   }

// //   private onResize(): void {
// //     this.calculateDimensions();
// //     this.createChart();
// //     this.updateChart();
// //   }
// // }

import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { PowerConsumption } from '../../models/power-consumption';
import * as d3 from 'd3';

@Component({
  selector: 'app-power-graph',
  imports: [],
  templateUrl: './power-graph.html',
  styleUrl: './power-graph.scss',
})
export class PowerGraph implements AfterViewInit, OnChanges, OnDestroy {
  @Input() historicalData: PowerConsumption[] = [];
  @Input() realtimeData: PowerConsumption | null = null;
  @ViewChild('graphContainer', { static: false }) container!: ElementRef;

  private svg: any;
  private g: any;
  private xScale: any;
  private yScale: any;
  private xAxis: any;
  private yAxis: any;
  private line: any;
  private historicalPath: any;
  private realtimePath: any;
  private tooltip: any;

  private margin = { top: 20, right: 30, bottom: 50, left: 60 };
  private width: number = 800;
  private height: number = 400;
  private innerWidth: number = 0;
  private innerHeight: number = 0;

  private realtimePoints: PowerConsumption[] = [];
  private resizeListener?: () => void;
  private isRealtimeMode: boolean = false;

  ngAfterViewInit(): void {
    this.calculateDimensions();
    this.createChart();
    
    this.resizeListener = () => this.onResize();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['historicalData'] && this.svg) {
      this.realtimePoints = [];
      this.isRealtimeMode = false;
      this.updateChart();
    }
    
    if (changes['realtimeData'] && this.realtimeData && this.svg) {
      this.isRealtimeMode = true;
      this.appendRealtimeData(this.realtimeData);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    d3.select(this.container.nativeElement).selectAll('*').remove();
  }

  private calculateDimensions(): void {
    const containerWidth = this.container.nativeElement.offsetWidth;
    this.width = containerWidth > 0 ? containerWidth : 800;
    this.innerWidth = this.width - this.margin.left - this.margin.right;
    this.innerHeight = this.height - this.margin.top - this.margin.bottom;
  }

  private ensureDate(timestamp: any): Date {
    if (timestamp instanceof Date) return timestamp;
    return new Date(timestamp);
  }

  private createChart(): void {
    d3.select(this.container.nativeElement).select('svg').remove();

    this.svg = d3.select(this.container.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.xScale = d3.scaleTime()
      .range([0, this.innerWidth]);

    this.yScale = d3.scaleLinear()
      .range([this.innerHeight, 0]);

    this.xAxis = d3.axisBottom<Date>(this.xScale)
      .ticks(8)
      .tickFormat(d3.timeFormat('%H:%M') as any);

    this.yAxis = d3.axisLeft(this.yScale)
      .ticks(10);

    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${this.innerHeight})`);

    this.g.append('g')
      .attr('class', 'y-axis');

    this.g.append('text')
      .attr('class', 'x-axis-label')
      .attr('text-anchor', 'middle')
      .attr('x', this.innerWidth / 2)
      .attr('y', this.innerHeight + 40)
      .text('Time');

    this.g.append('text')
      .attr('class', 'y-axis-label')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -this.innerHeight / 2)
      .attr('y', -45)
      .text('Power (kW)');

    this.line = d3.line<PowerConsumption>()
      .x((d: PowerConsumption) => this.xScale(this.ensureDate(d.timestamp)))
      .y((d: PowerConsumption) => this.yScale(d.globalActivePower))
      .curve(d3.curveMonotoneX);

    this.historicalPath = this.g.append('path')
      .attr('class', 'line historical-line')
      .attr('fill', 'none')
      .attr('stroke', '#3498db')
      .attr('stroke-width', 2);

    this.realtimePath = this.g.append('path')
      .attr('class', 'line realtime-line')
      .attr('fill', 'none')
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 3);

    this.tooltip = d3.select(this.container.nativeElement)
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '5px')
      .style('padding', '10px')
      .style('pointer-events', 'none')
      .style('z-index', '1000');

    this.addLegend();
  }

  private updateChart(): void {
    if (!this.historicalData || this.historicalData.length === 0) {
      return;
    }

    const normalizedHistorical = this.historicalData.map(d => ({
      ...d,
      timestamp: this.ensureDate(d.timestamp)
    }));

    console.log('📊 Historical data:', {
      count: normalizedHistorical.length,
      first: normalizedHistorical[0]?.timestamp.toLocaleString(),
      last: normalizedHistorical[normalizedHistorical.length - 1]?.timestamp.toLocaleString()
    });

    const timeExtent = d3.extent(normalizedHistorical, d => this.ensureDate(d.timestamp)) as [Date, Date];
    
    if (timeExtent[0] && timeExtent[1]) {
      const timeSpan = timeExtent[1].getTime() - timeExtent[0].getTime();
      const padding = timeSpan * 0.05;
      
      this.xScale.domain([
        new Date(timeExtent[0].getTime() - padding),
        new Date(timeExtent[1].getTime() + padding)
      ]);
    }

    const maxPower = d3.max(normalizedHistorical, d => d.globalActivePower) || 10;
    this.yScale.domain([0, maxPower * 1.1]);

    this.g.select('.x-axis').call(this.xAxis);
    this.g.select('.y-axis').call(this.yAxis);

    this.historicalPath
      .datum(normalizedHistorical)
      .attr('d', this.line);

    this.addHoverInteraction(normalizedHistorical);
  }

  private appendRealtimeData(data: PowerConsumption): void {
    const normalizedData = {
      ...data,
      timestamp: this.ensureDate(data.timestamp)
    };
    
    this.realtimePoints.push(normalizedData);

    console.log('📡 Real-time point added:', {
      timestamp: normalizedData.timestamp.toLocaleString(),
      power: normalizedData.globalActivePower.toFixed(3),
      totalPoints: this.realtimePoints.length
    });

    if (this.realtimePoints.length > 120) {
      this.realtimePoints.shift();
    }

    // Update domain
    if (this.realtimePoints.length >= 10) {
      this.updateRealtimeWindow();
    } else {
      this.updateTransitionWindow();
    }

    // ✅ CRITICAL: Force immediate visual update
    this.forceRedraw();
    this.addRealtimeMarker(normalizedData);
  }

  private updateRealtimeWindow(): void {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 7200000);
    const paddingMs = 600000;
    
    this.xScale.domain([
      new Date(twoHoursAgo.getTime() - paddingMs),
      new Date(now.getTime() + paddingMs)
    ]);
    
    const visibleData = this.realtimePoints.filter(d => 
      this.ensureDate(d.timestamp).getTime() > twoHoursAgo.getTime()
    );
    
    const maxPower = d3.max(visibleData, d => d.globalActivePower) || 10;
    this.yScale.domain([0, maxPower * 1.1]);
    
    console.log('📈 Real-time window:', {
      from: twoHoursAgo.toLocaleTimeString(),
      to: now.toLocaleTimeString(),
      visiblePoints: visibleData.length,
      totalPoints: this.realtimePoints.length
    });
  }

  private updateTransitionWindow(): void {
    const normalizedHistorical = this.historicalData.map(d => ({
      ...d,
      timestamp: this.ensureDate(d.timestamp)
    }));
    
    const allData = [...normalizedHistorical, ...this.realtimePoints];
    
    const timeExtent = d3.extent(allData, d => this.ensureDate(d.timestamp)) as [Date, Date];
    
    if (timeExtent[0] && timeExtent[1]) {
      const timeSpan = timeExtent[1].getTime() - timeExtent[0].getTime();
      const minSpan = 600000;
      const actualSpan = Math.max(timeSpan, minSpan);
      const padding = actualSpan * 0.1;
      
      this.xScale.domain([
        new Date(timeExtent[0].getTime() - padding),
        new Date(timeExtent[1].getTime() + padding)
      ]);

      console.log('🔄 Transition window:', {
        start: this.xScale.domain()[0].toLocaleString(),
        end: this.xScale.domain()[1].toLocaleString(),
        historicalPoints: normalizedHistorical.length,
        realtimePoints: this.realtimePoints.length
      });
    }
    
    const maxPower = d3.max(allData, d => d.globalActivePower) || 10;
    this.yScale.domain([0, maxPower * 1.1]);
  }

  // ✅ NEW: Force complete redraw of all visual elements
  private forceRedraw(): void {
    console.log('🎨 Forcing redraw...');
    
    // Update axes
    this.g.select('.x-axis').call(this.xAxis);
    this.g.select('.y-axis').call(this.yAxis);

    // Update historical path
    const normalizedHistorical = this.historicalData.map(d => ({
      ...d,
      timestamp: this.ensureDate(d.timestamp)
    }));
    
    if (normalizedHistorical.length > 0 && this.realtimePoints.length < 10) {
      const [minTime, maxTime] = this.xScale.domain();
      const visibleHistorical = normalizedHistorical.filter(d => {
        const t = this.ensureDate(d.timestamp).getTime();
        return t >= minTime.getTime() && t <= maxTime.getTime();
      });
      
      if (visibleHistorical.length > 0) {
        // ✅ Remove and re-add path to force update
        this.historicalPath
          .datum(visibleHistorical)
          .attr('d', this.line)
          .attr('opacity', 1);
      } else {
        this.historicalPath.attr('opacity', 0);
      }
    } else {
      this.historicalPath.attr('opacity', 0);
    }

    // ✅ Update real-time path - CRITICAL FIX
    if (this.realtimePoints.length > 0) {
      console.log('  Updating realtime path with', this.realtimePoints.length, 'points');
      
      // Create a copy to ensure D3 sees it as new data
      const realtimeDataCopy = [...this.realtimePoints];
      
      // ✅ Force D3 to recognize data change
      this.realtimePath
        .datum(realtimeDataCopy)
        .attr('d', this.line)
        .attr('opacity', 1)
        .attr('stroke', '#e74c3c')
        .attr('stroke-width', 3);
      
      // ✅ Debug: Check if path has d attribute
      const pathD = this.realtimePath.attr('d');
      console.log('  Path d attribute:', pathD ? pathD.substring(0, 50) + '...' : 'NULL');
    }
  }

  private addRealtimeMarker(data: PowerConsumption): void {
    const x = this.xScale(this.ensureDate(data.timestamp));
    const y = this.yScale(data.globalActivePower);

    console.log('📍 Adding marker at:', { x, y });

    if (x < 0 || x > this.innerWidth) {
      console.log('⚠️ Marker outside visible range');
      return;
    }

    this.g.selectAll('.realtime-marker').remove();

    const marker = this.g.append('circle')
      .attr('class', 'realtime-marker')
      .attr('cx', x)
      .attr('cy', y)
      .attr('r', 6)
      .attr('fill', '#e74c3c')
      .attr('opacity', 1);

    marker.transition()
      .duration(1000)
      .attr('r', 14)
      .style('opacity', 0)
      .remove();
  }

  private addHoverInteraction(data: PowerConsumption[]): void {
    const bisect = d3.bisector((d: PowerConsumption) => this.ensureDate(d.timestamp)).left;

    this.g.selectAll('.overlay').remove();

    this.g.append('rect')
      .attr('class', 'overlay')
      .attr('width', this.innerWidth)
      .attr('height', this.innerHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => this.tooltip.style('opacity', 1))
      .on('mouseout', () => {
        this.tooltip.style('opacity', 0);
        this.g.selectAll('.hover-line').remove();
        this.g.selectAll('.hover-circle').remove();
      })
      .on('mousemove', (event: MouseEvent) => {
        const [mouseX] = d3.pointer(event);
        const x0 = this.xScale.invert(mouseX);
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        
        if (!d0 || !d1) return;

        const t0 = this.ensureDate(d0.timestamp);
        const t1 = this.ensureDate(d1.timestamp);
        const d = (x0.getTime() - t0.getTime()) > (t1.getTime() - x0.getTime()) ? d1 : d0;

        const x = this.xScale(this.ensureDate(d.timestamp));
        const y = this.yScale(d.globalActivePower);

        this.g.selectAll('.hover-line').remove();
        this.g.selectAll('.hover-circle').remove();

        this.g.append('line')
          .attr('class', 'hover-line')
          .attr('x1', x)
          .attr('x2', x)
          .attr('y1', 0)
          .attr('y2', this.innerHeight)
          .attr('stroke', '#95a5a6')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '3,3');

        this.g.append('circle')
          .attr('class', 'hover-circle')
          .attr('cx', x)
          .attr('cy', y)
          .attr('r', 5)
          .attr('fill', '#3498db')
          .attr('stroke', 'white')
          .attr('stroke-width', 2);

        const time = d3.timeFormat('%H:%M:%S')(this.ensureDate(d.timestamp));
        this.tooltip
          .html(`
            <strong>Time:</strong> ${time}<br/>
            <strong>Power:</strong> ${d.globalActivePower.toFixed(3)} kW<br/>
            <strong>Voltage:</strong> ${d.voltage.toFixed(2)} V<br/>
            <strong>Current:</strong> ${d.globalIntensity.toFixed(2)} A
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      });
  }

  private addLegend(): void {
    const legend = this.g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${this.innerWidth - 150}, 10)`);

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#3498db')
      .attr('stroke-width', 2);

    legend.append('text')
      .attr('x', 35)
      .attr('y', 5)
      .text('Historical')
      .style('font-size', '12px');

    legend.append('line')
      .attr('x1', 0)
      .attr('x2', 30)
      .attr('y1', 20)
      .attr('y2', 20)
      .attr('stroke', '#e74c3c')
      .attr('stroke-width', 3);

    legend.append('text')
      .attr('x', 35)
      .attr('y', 25)
      .text('Real-time')
      .style('font-size', '12px');
  }

  private onResize(): void {
    this.calculateDimensions();
    this.createChart();
    this.updateChart();
    
    // ✅ Redraw real-time data after resize
    if (this.realtimePoints.length > 0) {
      if (this.realtimePoints.length >= 10) {
        this.updateRealtimeWindow();
      } else {
        this.updateTransitionWindow();
      }
      this.forceRedraw();
    }
  }
}