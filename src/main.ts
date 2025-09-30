// src/main.ts
import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

import { App } from './app/app';

// if you want routes, add them here
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideAnimations(),
    provideRouter(routes),
  ],
}).catch(err => console.error(err));
