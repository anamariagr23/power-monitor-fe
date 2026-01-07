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
  @Input() data: PowerConsumption[] = [];
  @Input() color: string = 'steelblue';
  @Input() title: string = 'Power Consumption';

  @ViewChild('graphContainer', { static: false }) container!: ElementRef;

  private svg: any;
  private g: any;
  private width: number = 800;
  private height: number = 300; // Reduced height to fit two
  private margin = { top: 30, right: 30, bottom: 40, left: 60 };
  
  private resizeListener?: () => void;

  ngAfterViewInit(): void {
    this.createChart();
    this.resizeListener = () => this.updateChart();
    window.addEventListener('resize', this.resizeListener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.svg) {
      this.updateChart();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private createChart(): void {
    const element = this.container.nativeElement;
    d3.select(element).select('svg').remove();

    this.width = element.offsetWidth || 800;
   
    this.svg = d3.select(element)
      .append('svg')
      .attr('width', '100%')
      .attr('height', this.height);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Title
    this.svg.append('text')
        .attr('x', (this.width / 2))             
        .attr('y', 20)
        .attr('text-anchor', 'middle')  
        .style('font-size', '16px') 
        .style('font-weight', 'bold')
        .text(this.title);

    this.updateChart();
  }

  private updateChart(): void {
    if (!this.svg || !this.data) return;

    const width = (this.container.nativeElement.offsetWidth || 800) - this.margin.left - this.margin.right;
    const height = this.height - this.margin.top - this.margin.bottom;
    
    // Clear previous contents
    this.g.selectAll('*').remove();
    this.svg.select('text').text(this.title).attr('x', (width + this.margin.left + this.margin.right) / 2);

    // Scales
    const xScale = d3.scaleTime()
      .range([0, width])
      .domain(d3.extent(this.data, (d: PowerConsumption) => d.timestamp) as [Date, Date] || [new Date(), new Date()]);

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(this.data, (d: PowerConsumption) => d.globalActivePower) || 10]);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat('%H:%M') as any);
    const yAxis = d3.axisLeft(yScale);

    this.g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    this.g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

    // Labels
    this.g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - this.margin.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Active Power (kW)');

    // Line
    const line = d3.line<PowerConsumption>()
      .x((d: PowerConsumption) => xScale(d.timestamp))
      .y((d: PowerConsumption) => yScale(d.globalActivePower))
      .curve(d3.curveMonotoneX);

    this.g.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', this.color)
      .attr('stroke-width', 2)
      .attr('d', line);
  }
}

