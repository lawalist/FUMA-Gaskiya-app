import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ToastController, LoadingController, AlertController, ViewController, MenuController, Events } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';

/**
 * Generated class for the AjouterDepartementPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-ajouter-departement',
  templateUrl: 'ajouter-departement.html',
})
export class AjouterDepartementPage {
  departementForm: any;
  departement: any;
  allDepartement: any = [];
  nom_region: any;
  id_region: any;
  id: any = '';
  nom: any = '';

  //allRegions: any = [];
  ancien_nom: any = '';
  ancien_id: any = '';

  liste: boolean = false;
  ajouter:boolean = true;
  modifier: boolean = false;
  region_defini: boolean = false;
  allRegion: any = [];
  gestion_departement: boolean = false;
  
  constructor(public navCtrl: NavController, public loadingCtl: LoadingController, public alertCtl: AlertController, public menuCtl: MenuController, public viewCtrl: ViewController, public navParams: NavParams,public toastCtl: ToastController, public servicePouchdb: PouchdbProvider, public formBuilder: FormBuilder) {
  

    if(this.navParams.data.liste){
      this.liste = true;
      this.gestion_departement = true;
      this.ajouter = false;
    }

    if(this.navParams.data.regionID){
      this.id_region = this.navParams.data.regionID;
      //this.nom_region = this.navParams.data.nom_region;
      this.region_defini = true;
    }
    
    
    this.departementForm = this.formBuilder.group({
      id:['', Validators.required],
      nom:['', Validators.required],
      id_region:[''],
      nom_region:[''],
    });
  }

  ionViewDidEnter() {
     this.servicePouchdb.getDocById('departement').then((departement) => {
       this.allDepartement = departement.data;
       this.departement = departement;
       //alert(this.pays._id)
     });

     this.servicePouchdb.getDocById('region').then((regions) => {
          this.allRegion = regions.data;
          if(this.id_region){
            for(let i = 0; i < this.allRegion.length; i++){
              if(this.allRegion[i].id == this.id_region){
                this.nom_region = this.allRegion[i].nom;
                break;
              }
            }
          }
        });
  }

  //fait la conbinaison de caractere de gauche vers la droite en variant la taille a la recherche d'un code disponible
  genererID(){
    
    let nom = this.nom;
     nom = nom.replace(' ' || '  ' || '    ' || '     ' || '      ' , '');
     let taille_nom = nom.length;
     let an = nom;
    //taille initiale: deux aractères
    let taille_code = 2;
    let code: string = '';
    this.id = code.toUpperCase()
    let p = 0;
    let last_position = 0;
    let trouve: boolean;

    if(taille_nom >= 2){
      while(taille_code <= taille_nom){
        last_position = taille_code - 1;
        trouve  = false;
        code = '';
        for(let i = 0; i < taille_code; i++){
          code += nom.charAt(i).toString() ;
        }

        do{
            code = code.substr(0, code.length - 1);
            code += nom.charAt(last_position).toString() ;
            p = 0;
            for(let pos=0; pos < this.allDepartement.length; pos++){
              let rg = this.allDepartement[pos];
              if(rg.id === code.toUpperCase()){
                trouve = true;
                break ;
              }else{
                trouve = false;
              }
            }
            
            last_position++;

          }while(trouve && last_position < taille_nom);
          //
          if(last_position === taille_nom && trouve){
            //non disponible, augmenter la taille du code
            taille_code++;
        
            //au cas ou on teste toutes les combinaisons, sant trouver de combinaison disponible, on ajoute des chiffre
            if(taille_code > taille_nom){
              //non disponible, augmenter la taille et utiliser des chiffres
              taille_code = 3;
              nom = an + '123456789'.toString();
              taille_nom = nom.length;
            }
          }else{
              this.id = code.toUpperCase();
              break;
            
          }
      }
      
    }
    
  }

   verifierUniqueNon(departement){
    let res = 1;
    this.allDepartement.forEach((p, index) => {
      if((departement.nom.toString().toUpperCase() === p.nom.toString().toUpperCase())){
        res = 0;
      }
    });

    return res;
  }


 /* ajouter(){
    
    let departement = this.departementForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
      let data = [];
      data = this.departement.data;
      data.push(departement);
      this.departement.data = data;
      this.servicePouchdb.updateLocalite(this.departement);
      let toast = this.toastCtl.create({
        message: 'Departement bien enregistré!',
        position: 'top',
        duration: 3000
      });

      toast.present();
      this.viewCtrl.dismiss();
  //  }
  } */



    actionForm(){
      let departement = this.departementForm.value;
    if(this.ajouter){
        
      if(this.verifierUniqueNon(departement) === 0){
        alert('Les noms des departement doivent être uniques!');
      }else{

        //let region = this.regionForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
        let data = [];
        data = this.departement.data;
        if(!this.region_defini){
          departement.id_region = this.id_region.id;
          departement.nom_region = this.id_region.nom;
        }
        data.push(departement);
        this.departement.data = data;
        this.departement.type = 'departement';
        this.allDepartement = data;
        this.servicePouchdb.updateLocalite(this.departement).then((res) => {
          this.departement._rev = res.rev;
        })
        let toast = this.toastCtl.create({
          message: 'Departement bien enregistré!',
          position: 'top',
          duration: 1000
        });

        toast.present();
        this.ajouter = false;

        if(!this.gestion_departement){
          this.viewCtrl.dismiss();
        }else{
          this.liste = true;
          this.ajouter = false;
        }
      }
    }else if(this.modifier){
      let loading = this.loadingCtl.create({
        content: 'Application des changements en cours...'
      });

      //loading.present();
      //let region = this.regionForm.value;
      if(!this.region_defini){
        departement.id_pays = this.id_region.id;
        departement.nom_pays = this.id_region.nom;
      }
      this.allDepartement.forEach((d, i) => {
        if(d.id === departement.id){
          this.allDepartement[i] = departement;
        }
      });

      this.departement.data = this.allDepartement;
      //this.allPays.splice(this.pays.indesOf())
      //this.servicePouchdb.updateLocalite(this.departement);
      this.servicePouchdb.updateLocalite(this.departement).then((res) => {
          this.departement._rev = res.rev;
      })
        //recuperer tous les doc pour modifier le nom du pays
       /* this.servicePouchdb.getPlageDocsRapide('fuma', 'fuma:\uffff').then((allDocs) => {
          allDocs.map((doc) => {
            //pour les essais
            ****if(doc.doc.data.type === 'essai' && doc.doc.data.village_producteur === this.ancien_nom ){
              doc.doc.data0village_producteur = pays.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }else ******
            //pour les memebres
            if(doc.doc.data.type === 'membre_op' && doc.doc.data.departement === this.ancien_id ){
              doc.doc.data.departement_nom = departement.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
            else 
            //pour les union
            if(doc.doc.data.type === 'union' && doc.doc.data.departement === this.ancien_id ){
              doc.doc.data.departement_nom = departement.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
            else 
            //pour les op
            if(doc.doc.data.type === 'op' && doc.doc.data.departement === this.ancien_id ){
              doc.doc.data.departement_nom = departement.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
           ***** else 
            //pour les champs
            if(doc.doc.data.type === 'champs' && doc.doc.data.village === this.ancien_nom ){
              doc.doc.data.village = pays.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }*****
          });

           let toast = this.toastCtl.create({
              message: 'Departement bien modifier!',
              position: 'top',
              duration: 1000
            });
            toast.present();  
            loading.dismissAll();
        });*/

        let toast = this.toastCtl.create({
              message: 'Departement bien modifier!',
              position: 'top',
              duration: 1000
            });
            toast.present();
      
        this.ajouter = false;
        this.modifier = false;
        this.liste = true;
    }
  } 

ajouterDepartement(){
  this.id = '';
  this.nom = '';
  this.id_region = '';
  this.nom_region = '';
    this.liste = false;
    this.ajouter = true;
  }

  modifierDepartement(departement){

    this.id = departement.id;
    this.nom = departement.nom;
    this.id_region = departement.id_region;
    this.nom_region = departement.nom_region;
    this.ancien_nom = this.nom;
    this.ancien_id = this.id;
    this.liste = false;
    this.modifier = true;

    this.allRegion.forEach((region) => {
      if(this.id_region === region.id){
        this.id_region = region;
      }
    })
  }

  supprimerDepartement(departement){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression Departement',
      message: 'Etes vous sûr de supprimer ce departement ?',
      buttons:[
        {
          text: 'Non',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Oui',
          handler: () => {
            this.allDepartement.forEach((r, i) => {
              if(r.id === departement.id){
                this.allDepartement.splice(i, 1);
              }
            });

            this.departement.data = this.allDepartement;
            //this.allPays.splice(this.pays.indesOf())
            //this.servicePouchdb.updateLocalite(this.departement);
            this.servicePouchdb.updateLocalite(this.departement).then((res) => {
              this.departement._rev = res.rev;
            })
            let toast = this.toastCtl.create({
              message: 'Departement bien suprimé!',
              position: 'top',
              duration: 1000
            });
            toast.present();           
          }
        }
      ]
    });

    alert.present();
  }

  annuler(){
    if(this.gestion_departement){
      if(this.liste){
        this.viewCtrl.dismiss();
      }else if(this.ajouter){
        this.liste = true;
        this.ajouter = false;
      } else{
        this.liste = true;
        this.modifier = false;
      }

    }else{
      this.viewCtrl.dismiss();
    }
     
  }



}
