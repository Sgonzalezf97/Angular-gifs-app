import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Gif, SearchResponse } from '../interfaces/gifs.interfaces';

@Injectable({providedIn: 'root'})
export class GifsService {
  constructor( private http:HttpClient) {

    this.loadLocalStorage();
    console.log('Gifs service ready')

   }

  public gifList: Gif[]=[];
  private apikey: string = 'hd6NYZ2qzOwXdyH9exRn2tzrawQkkpHf'
  private _tagsHistory: string[] = [];
  private serviceUrl: string ="https://api.giphy.com/v1/gifs/search"
  get tagsHistory(){
    return [...this._tagsHistory];
  }

  private orgnizeHistory (tag: string){
    // Se pasa a lowercase para poder comparar
    tag = tag.toLocaleLowerCase();

    // se hace la validcación para saber si el valor ya se encuentra en tagsHistory
    // se usa filter que nos permite dejar todos los elementos que cumplan con la condición
    // se hace una función felcha con el parametro oldtag que es el tag y se compara con el nuevo valor de tag ingresado
    if(this._tagsHistory.includes(tag)){
      this._tagsHistory = this._tagsHistory.filter((oldTag) => oldTag !== tag)
    }

    // se acomoda el utlimo tag de primeras agregandolo a la primera posición del arreglo
    this._tagsHistory.unshift( tag );

    // Se limita al arreglo a tener 10 posiciones unicamente
    this._tagsHistory = this._tagsHistory.splice(0,10);

    //Guarda en el local Storage las entradas de busqueda del usuario
    this.saveLocalStorage();
  }

  private saveLocalStorage():void{
    localStorage.setItem('history',JSON.stringify(this._tagsHistory))
  }

  private loadLocalStorage():void{
    if(!localStorage.getItem('history')) return;
    this._tagsHistory = JSON.parse(localStorage.getItem('history')!)
    this.searchTag(this.tagsHistory[0])
  }

  searchTag( tag:string ):void{
    if( tag.length===0 ) return; //se valida que si el tag viene vacio no se ejecute la siguiente instrucción
    this.orgnizeHistory(tag);

    const params = new HttpParams()
    .set('api_key',this.apikey)
    .set('limit',10)
    .set('q',tag);

    // forma de observables
    this.http.get<SearchResponse>(`${this.serviceUrl}`,{params})
    .subscribe( resp => {
      this.gifList=resp.data;
      console.log({gifs:this.gifList})
    })

    // forma tradicional
    // fetch('https://api.giphy.com/v1/gifs/search?api_key=hd6NYZ2qzOwXdyH9exRn2tzrawQkkpHf&q=Valorant&limit=10')
    // .then( resp => resp.json())
    // .then(data => console.log(data))
  }
}
