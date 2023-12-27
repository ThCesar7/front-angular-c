import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private API: string = environment.API;

  constructor(
    private http: HttpClient) { }

  get(): Observable<any> {
    return this.http.get<any>(`${this.API}/Usuario`)
    .pipe(
      catchError(error => {
        console.error('Erro ao buscar cadastro:', error);
        console.error('Detalhes do erro:', error.message);
        throw error;
      })
    );
  }

  inserir(dados: any): Observable<any> {
    return this.http.post<any>(`${this.API}/Usuario`, dados);
  }

  editar(id: number, dados: any): Observable<any> {
    return this.http.put<any>(`${this.API}/Usuario/${id}`, dados);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API}/Usuario/${id}`);
  }
}
