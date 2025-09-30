import { Component, OnInit } from '@angular/core';
import { SecurityService } from '../security.service';
import { CommonModule } from '@angular/common';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { Chart } from 'chart.js';
import { ChoroplethController, GeoFeature, ColorScale, ProjectionScale } from 'chartjs-chart-geo';
import { FeatureCollection, Geometry, GeoJsonProperties, Feature} from 'geojson';



import * as topojson from 'topojson-client';
import * as iso from 'iso-3166-1';



Chart.register(ChoroplethController, GeoFeature, ColorScale, ProjectionScale);

@Component({
  selector: 'app-security',
  imports: [CommonModule, OrganizationChartModule, ButtonModule, CardModule, ChartModule],
  templateUrl: './security.html',
  styleUrls: ['./security.scss']
})
export class SecurityComponent implements OnInit {
  constructor(private securityService: SecurityService) {}

  logs: any[] = [];
  abuseLogs: any[] = [];
  chartData: any;
  chartOptions: any;

  ngOnInit(): void {
    this.securityService.getSecurity().subscribe({
      next: (data) => {
        this.logs = data.sessionLogs || [];
        this.abuseLogs = data.abuseLogs || [];
        this.prepareChartData();
        this.prepareMap();
      },
      error: (err) => console.error(err),
    });
  }

  prepareChartData() {
    const sessionCounts: { [day: string]: number } = {};

    this.logs.forEach(log => {
      const date = new Date(log.time);
      const day = date.toISOString().split('T')[0];
      sessionCounts[day] = (sessionCounts[day] || 0) + 1;
    });

    const sortedDays = Object.keys(sessionCounts).sort((a, b) =>
      new Date(a).getTime() - new Date(b).getTime()
    );

    this.chartData = {
      labels: sortedDays,
      datasets: [
        {
          label: 'Sessions per Day',
          data: sortedDays.map(day => sessionCounts[day]),
          borderColor: '#42A5F5',
          tension: 0.4,
          fill: false
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Sessions' }, beginAtZero: true }
      }
    };
  }

  async prepareMap() {
  const world = await fetch('../../assets/maps/countries-110m.json').then(res => res.json());
  const countries = topojson.feature(world, world.objects.countries) as any;

  const mappedLogs = this.abuseLogs.map(log => {
    const isoEntry = iso.whereAlpha2(log.abuse_country);
    return { country_id: isoEntry?.numeric, abuse_score: log.abuse_score || 0 };
  });

  const countryScores: { [id: string]: number } = {};
  mappedLogs.forEach(log => {
    if (log.country_id) {
      countryScores[log.country_id] = (countryScores[log.country_id] || 0) + log.abuse_score;
    }
  });

const data: { feature: Feature<Geometry, GeoJsonProperties>; value: number }[] =
  countries.features.map((f: Feature<Geometry, GeoJsonProperties>) => ({
    feature: f,
    value: f.id ? countryScores[f.id] || 0 : 0
  }));

  const ctx = document.getElementById('worldMapCanvas') as HTMLCanvasElement;
  if (ctx) {
    new Chart(ctx, {
      type: 'choropleth' as any,
      data: {
        labels: data.map((d: { feature: any; value: number }) => d.feature.properties.name),
        datasets: [{
          label: 'Abuse Score by Country',
          data,
          backgroundColor: (ctx: any) => {
            const val = ctx.feature?.properties?.value ?? ctx.raw?.value ?? 0;
            if (!val) return '#2c2c2c';
            const intensity = Math.min(1, val / 1000);
            return `rgba(128,0,128,${0.2 + intensity * 0.8})`;
          },
          borderColor: '#333',
          borderWidth: 0.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
         aspectRatio: 2,
        scales: {
          projection: {
            type: 'projection',
            projection: 'equalEarth',
            axis: 'x'
          },
          color: {
            type: 'color',
            axis: 'y',
            quantize: 5,
            legend: { position: 'bottom-right' }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const val = ctx.raw?.value ?? 0;
                return `${ctx.label}: ${val} abuse score`;
              }
            }
          }
        }
      }
    });
  }
}
}
