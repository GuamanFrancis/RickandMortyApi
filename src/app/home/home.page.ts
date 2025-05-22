import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

interface Character {
  name: string;
  species: string;
  status: string;
  gender: string;
  origin: { name: string };
  location: { name: string };
  image: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  characters: Character[] = [];
  selectedCharacter: Character | null = null;
  searchTerm = '';
  comment = '';
  loading = false;
  error: string | null = null;

  constructor(
    private http: HttpClient,
    private firestore: Firestore,
    private toastCtrl: ToastController
  ) {}

  searchCharacters() {
    if (this.searchTerm.trim() === '') return;

    this.loading = true;
    this.error = null;
    this.selectedCharacter = null;

    this.http
      .get(`https://rickandmortyapi.com/api/character/?name=${this.searchTerm}`)
      .subscribe(
        (res: any) => {
          this.characters = res.results;
          this.loading = false;
        },
        (error) => {
          this.characters = [];
          this.error = 'No se encontraron personajes.';
          this.loading = false;
        }
      );
  }

  viewDetails(character: Character) {
    this.selectedCharacter = character;
    this.comment = '';
  }

  async saveCharacterToFirebase() {
    if (!this.selectedCharacter) return;

    const characterData = {
      name: this.selectedCharacter.name,
      species: this.selectedCharacter.species,
      status: this.selectedCharacter.status,
      gender: this.selectedCharacter.gender,
      origin: this.selectedCharacter.origin.name,
      location: this.selectedCharacter.location.name,
      image: this.selectedCharacter.image,
      comment: this.comment,
    };

    const charactersCollection = collection(this.firestore, 'Personajes');

    try {
      await addDoc(charactersCollection, characterData);
      const toast = await this.toastCtrl.create({
        message: 'Personaje guardado en Firebase',
        duration: 2000,
        color: 'success',
      });
      toast.present();
      this.goBack();
    } catch (error) {
      const toast = await this.toastCtrl.create({
        message: 'Error al guardar el personaje',
        duration: 2000,
        color: 'danger',
      });
      toast.present();
    }
  }

  goBack() {
    this.selectedCharacter = null;
    this.comment = '';
  }
}
