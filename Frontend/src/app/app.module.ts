import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { importProvidersFrom } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    // Aquí inyectamos los módulos globales
    importProvidersFrom(FormsModule, HttpClientModule)
  ]
}).catch(err => console.error(err));