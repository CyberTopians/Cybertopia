import { Component, OnInit  } from '@angular/core';
import {SecurityService} from '../security.service';
import { CommonModule } from '@angular/common';
import { HomeService } from '../home.service';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-security',
                     
  imports: [ CommonModule, OrganizationChartModule, ButtonModule, CardModule ],
  templateUrl: './security.html',
styleUrls: ['./security.scss'] })
export class SecurityCompponent implements OnInit {
  constructor(private securityService: SecurityService){}

  logs:any[] = [];
    ngOnInit(): void {
    this.securityService.getSecurity().subscribe({
      next: (data) => {
        this.logs = data.logs || [];
      },
      error: (err) => console.error(err),
    });
  }

}
