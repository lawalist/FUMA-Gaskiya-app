import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ModalController } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
import { PouchdbProvider } from '../../../../providers/pouchdb-provider';
import { global } from '../../../../global-variables/variable';

/* 
  Generated class for the AjouterConfLocaliteEnquete page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@IonicPage()
@Component({
  selector: 'page-ajouter-conf-localite-enquete',
  templateUrl: 'ajouter-conf-localite-enquete.html'
})
export class AjouterConfLocaliteEnquetePage {

  confLocaliteEnquete: any;
  pays: any = [];
  selectedPays: any ;
  regions: any = [];
  selectedRegion: any;
  departements: any = [];
  selectedDepartement: any;
  communes: any = [];
  selectedCommune: any;
  autrePays: any = {'id': 'AUTRE', 'nom':'Autre'};
  autreRegion: any = {'id':'AUTRE', 'nom':'Autre'};
  autreDepartement: any = {'id':'AUTRE', 'nom':'Autre'};
  autreCommune: any = {'id':'AUTRE', 'nom':'Autre'};
  nom_autre_pays: any = '';
  nom_autre_region: any = '';
  nom_autre_departement: any = '';
  nom_autre_commune: any = '';
  user: any = global.info_user;
  global:any = global;

  constructor(public pouchdbService: PouchdbProvider, public modelCtl: ModalController,  public navCtrl: NavController, public navParams: NavParams , public formBuilder: FormBuilder, public storage: Storage, public translate: TranslateService) {
 
    this.chargerPays(); 
    
    this.confLocaliteEnquete = this.formBuilder.group({
      pays: ['', Validators.required],
      pays_autre: [this.nom_autre_pays, Validators.required],
      region: ['', Validators.required],
      region_autre: [this.nom_autre_region, Validators.required],
      departement: ['', Validators.required],
      departement_autre: [this.nom_autre_departement, Validators.required],
      commune: ['', Validators.required],
      commune_autre: [this.nom_autre_commune, Validators.required]      
    });
  }

  ionViewDidEnter() {

  }

  chargerPays(){
    this.pays = [];
    this.pouchdbService.getDocById('pays').then((pays) => {
      if(pays){ 
        this.pays = pays.data;
        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          this.pays.push(this.autrePays);
        }
        this.selectedPays = '';
        this.selectedRegion = '';
        this.selectedDepartement = '';
        this.selectedCommune = ''
      }
    },err => console.log(err));
  }

  chargerRegions(p){
    this.regions = [];
    if(p !== 'AUTRE')
      {this.pouchdbService.getDocById('region').then((regions) => {
        regions.data.forEach((region, index) => {
          if(region.id_pays === p){
            this.regions.push(region);
            
          }
        });

        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          this.regions.push(this.autreRegion);
        }
        this.nom_autre_pays = 'NA';
      });
    }else{
      let model = this.modelCtl.create('AjouterPaysPage');
      model.present();
      model.onDidDismiss(() => {
        this.chargerPays();
        this.selectedPays = '';
      })
      if(this.user && this.user.roles && global.estManager(this.user.roles)){
        this.regions.push(this.autreRegion);
      }
      this.nom_autre_pays = '';
    }

    this.selectedRegion = '';
    this.selectedDepartement = '';
    this.selectedCommune = ''
  }

  chargerDepartements(r){
    this.departements= [];
    if(r !== 'AUTRE')
      {this.pouchdbService.getDocById('departement').then((departements) => {
        departements.data.forEach((departement, index) => {
          if(departement.id_region === r){
            this.departements.push(departement);
          }
        });
        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          this.departements.push(this.autreDepartement);
        }
        this.nom_autre_region = 'NA';
      });
    }else{
      let model = this.modelCtl.create('AjouterRegionPage', {'id_pays':this.selectedPays.id, 'nom_pays': this.selectedPays.nom});
          model.present();
          model.onDidDismiss(() => {
            this.chargerRegions(this.selectedPays.id);
            this.selectedRegion = '';
        });
      
      if(this.user && this.user.roles && global.estManager(this.user.roles)){
        this.departements.push(this.autreDepartement);
      }
      this.nom_autre_region = '';
    }
    this.selectedDepartement = '';
    this.selectedCommune = ''
  }

  chargerCommunes(d){
    this.communes = [];
    if(d !== 'AUTRE')
      {this.pouchdbService.getDocById('commune').then((communes) => {
        communes.data.forEach((commune, index) => {
          if(commune.id_departement === d){
            this.communes.push(commune);
            
          }
        });
        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          this.communes.push(this.autreCommune);
        }
        this.nom_autre_departement = 'NA';
      });
    }else{
       let model = this.modelCtl.create('AjouterDepartementPage', {'id_region':this.selectedRegion.id, 'nom_region': this.selectedRegion.nom});
      model.present();
      model.onDidDismiss(() => {
        this.chargerDepartements(this.selectedRegion.id);
        this.selectedDepartement = '';
      });
      if(this.user && this.user.roles && global.estManager(this.user.roles)){
        this.communes.push(this.autreCommune);
      }
      this.nom_autre_departement = '';
    }

    this.selectedCommune = '';
  } 

  chargerAutreNomCommune(c){
    if(c !== 'AUTRE'){
      this.nom_autre_commune = 'NA';
    }else{
      let model = this.modelCtl.create('AjouterCommunePage', {'id_departement':this.selectedDepartement.id, 'nom_departement': this.selectedDepartement.nom});
      model.present();
      model.onDidDismiss(() => {
        this.chargerCommunes(this.selectedDepartement.id);
        this.selectedCommune = '';
      })
      this.nom_autre_commune = '';
    }
  }

  configurer(){
    /*let pays :any = {};
    let region :any = {};
    let departement :any = {};
    let commune :any = {};
     this.pays.forEach((p, i) => {
       if(p.id === this.selectedPays){
         pays = p;
       }
     });

     this.regions.forEach((r, i) => {
       if(r.id === this.selectedRegion){
         region = r;
       }
     });

     this.departements.forEach((d, i) => {
       if(d.id === this.selectedDepartement){
         departement = d;
       }
     });

     this.communes.forEach((c, i) => {
       if(c.id === this.selectedCommune){
         commune = c;
       }
     });
     
     let res = {
      pays: pays,
      region: region,
      departement: departement,
      commune: commune
     }*/
    //this.pouchdbService.createDoc(this.confLocaliteEnquete.value);
    this.storage.set('confLocaliteEnquete', this.confLocaliteEnquete.value);
    this.navCtrl.pop();
  }

  annuler(){
    this.navCtrl.pop();
  }

}
