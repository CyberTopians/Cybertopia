import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../home.service';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { TreeNode } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,                         // ✅ standalone component
  imports: [CommonModule, OrganizationChartModule, ButtonModule, CardModule],
  templateUrl: './home.html',
 styleUrls: ['./home.scss'] 
})
export class Home implements OnInit {
  services: any[] = [];
  router = inject(Router);

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.homeService.getHome().subscribe({
      next: (data) => {
        this.services = data.services || [];
      },
      error: (err) => console.error(err),
    });
  }

goToSecurity(){
    this.router.navigate(['/security']);
}








 data: TreeNode[] = [
        {
          expanded: true,
 
            
            
            children: [
                {
                    expanded: true,
                    type: 'person',
                    styleClass: 'my-node child',
                    data: {
                        image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/annafali.png',
                        name: 'Ahmed Mostafa',
                        title: 'executive',
                    },
                    children: [
                        {
                            //child of the first child
                        },
                        {
                            //child of the first child
                        },
                    ],
                },

                { 
                   expanded: true,
            type: 'person',
            styleClass: 'my-node child',
            data: {
                image: 'assets/images/pp.jpg',
                name: 'Michael ',
                title: 'executive',
            },

              children: [
                        {
                            //child of the second child
                        },
                        {
                            //child of the second child
                        },
                    ],


          },


           { 
                   expanded: true,
            type: 'person',
            styleClass: 'my-node child',
            data: {
                image: 'assets/images/pp.jpg',
                name: 'Youssef Hussein ',
                title: 'executive',
            },

              children: [
                        {
                            //child of the third child
                        },
                        {
                            //child of the third child
                        },
                    ],


          },
                {
                    expanded: true,
                    type: 'person',
                    styleClass: 'my-node child',
                    data: {
                        image: 'https://primefaces.org/cdn/primeng/images/demo/avatar/stephenshaw.png',
                        name: 'Diaa',
                        title: 'executive',
                    },
                    children: [
                        {
                          //child of the fourth child
                        },
                        {
                         //second child of the fourth child
                        },
                    ],
                },

{ 
                   expanded: true,
            type: 'person',
            styleClass: 'my-node child',
            data: {
                image: 'assets/images/pp.jpg',
                name: 'Mohamed Wael ',
                title: 'executive',
            },

              children: [
                        {
                            //child of the fifth child
                        },
                        {
                            //child of the fifth child
                        },
                    ],


          },


            ],
        },
    ];



}
