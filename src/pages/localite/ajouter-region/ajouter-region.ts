import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ToastController, LoadingController, AlertController, ViewController, MenuController, Events } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';
/**
 * Generated class for the AjouterRegionPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage() 
@Component({
  selector: 'page-ajouter-region',
  templateUrl: 'ajouter-region.html',
})
export class AjouterRegionPage {
  regionForm: any;
  region: any;
  allRegion: any = [];
  nom_pays: any;
  id_pays: any;
  id: any = '';
  nom: any = '';

  //pays: any;
  allRegions: any = [];
  ancien_nom: any = '';
  ancien_id: any = '';

  liste: boolean = false;
  ajouter:boolean = true;
  modifier: boolean = false;
  pays_defini: boolean = false;
  allPays: any = [];
  gestion_region: boolean = false;

 
  constructor(public navCtrl: NavController, public loadingCtl: LoadingController, public alertCtl: AlertController, public menuCtl: MenuController, public viewCtrl: ViewController, public navParams: NavParams,public toastCtl: ToastController, public servicePouchdb: PouchdbProvider, public formBuilder: FormBuilder) {
  

    if(this.navParams.data.liste){
      this.liste = true;
      this.gestion_region = true;
      this.ajouter = false;
    }

    if(this.navParams.data.paysID){
      this.id_pays = this.navParams.data.paysID;
      //this.nom_pays = this.navParams.data.nom_pays;
      this.pays_defini = true;
    }
    
    this.regionForm = this.formBuilder.group({
      id:['', Validators.required],
      nom:['', Validators.required],
      id_pays:[''],
      nom_pays:[''],
    });
  }

  ionViewDidEnter() {
     this.servicePouchdb.getDocById('region').then((region) => {
       this.allRegion = region.data;
       this.region = region;
       //alert(this.pays._id)
     });

       this.servicePouchdb.getDocById('pays').then((pays) => {
          this.allPays = pays.data;
          if(this.id_pays){
            for(let i = 0; i < this.allPays.length; i++){
              if(this.allPays[i].id == this.id_pays){
                this.nom_pays = this.allPays[i].nom;
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
            for(let pos=0; pos < this.allRegion.length; pos++){
              let rg = this.allRegion[pos];
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

   verifierUniqueNon(region){
    let res = 1;
    this.allRegion.forEach((p, index) => {
      if((region.nom.toString().toUpperCase() === p.nom.toString().toUpperCase())){
        res = 0;
      }
    });

    return res;
  }


 /* ajouter(){
    
    let region = this.regionForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
      let data = [];
      data = this.region.data;
      data.push(region);
      this.region.data = data;
      this.servicePouchdb.updateLocalite(this.region);
      let toast = this.toastCtl.create({
        message: 'Région bien enregistré!',
        position: 'top',
        duration: 3000
      });

      toast.present();
      this.viewCtrl.dismiss();
  //  }
  } */


    actionForm(){
    if(this.ajouter){
        let region = this.regionForm.value;
      if(this.verifierUniqueNon(region) === 0){
        alert('Les noms des regions doivent être uniques!');
      }else{

        //let region = this.regionForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
        let data = [];
        data = this.region.data;
        if(!this.pays_defini){
          region.id_pays = this.id_pays.id;
          region.nom_pays = this.id_pays.nom;
        }
        data.push(region);
        this.region.data = data;
        this.region.type = 'region';
        this.allRegion = data;
        this.servicePouchdb.updateLocalite(this.region).then((res) => {
          this.region._rev = res.rev;
        })
        let toast = this.toastCtl.create({
          message: 'Région bien enregistré!',
          position: 'top',
          duration: 1000
        });

        toast.present();
        this.ajouter = false;

        if(!this.gestion_region){
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
      let region = this.regionForm.value;
      if(!this.pays_defini){
        region.id_pays = this.id_pays.id;
        region.nom_pays = this.id_pays.nom;
      }
      this.allRegion.forEach((r, i) => {
        if(r.id === region.id){
          this.allRegion[i] = region;
        }
      });

      this.region.data = this.allRegion;
      //this.allPays.splice(this.pays.indesOf())
      //this.servicePouchdb.updateLocalite(this.region);
      this.servicePouchdb.updateLocalite(this.region).then((res) => {
          this.region._rev = res.rev;
      })
        //recuperer tous les doc pour modifier le nom du pays
        /*this.servicePouchdb.getPlageDocsRapide('fuma', 'fuma:\uffff').then((allDocs) => {
          allDocs.map((doc) => {
            //pour les essais
            ******if(doc.doc.data.type === 'essai' && doc.doc.data.village_producteur === this.ancien_nom ){
              doc.doc.data0village_producteur = pays.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }else *******
            //pour les memebres
            if(doc.doc.data.type === 'membre_op' && doc.doc.data.region === this.ancien_id ){
              doc.doc.data.region_nom = region.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
            else 
            //pour les union
            if(doc.doc.data.type === 'union' && doc.doc.data.region === this.ancien_id ){
              doc.doc.data.region_nom = region.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
            else 
            //pour les op
            if(doc.doc.data.type === 'op' && doc.doc.data.region === this.ancien_id ){
              doc.doc.data.region_nom = region.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
           ****** else 
            //pour les champs
            if(doc.doc.data.type === 'champs' && doc.doc.data.village === this.ancien_nom ){
              doc.doc.data.village = pays.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }*******
          });

           let toast = this.toastCtl.create({
              message: 'Région bien modifier!',
              position: 'top',
              duration: 1000
            });
            toast.present();  
            loading.dismissAll();
        });
      */

      let toast = this.toastCtl.create({
        message: 'Région bien modifier!',
        position: 'top',
        duration: 1000
      });
      toast.present();

      this.ajouter = false;
        this.modifier = false;
        this.liste = true;
    }
  } 

  ajouterRegion(){
    this.id = '';
    this.nom = '';
    this.id_pays = '';
    this.nom_pays;
    this.liste = false;
    this.ajouter = true;
  }

  modifierRegion(region){

    this.id = region.id;
    this.nom = region.nom;
    this.id_pays = region.id_pays;
    this.nom_pays = region.nom_pays;
    this.ancien_nom = this.nom;
    this.ancien_id = this.id;
    this.liste = false;
    this.modifier = true;

    this.allPays.forEach((pays) => {
      if(this.id_pays === pays.id){
        this.id_pays = pays;
      }
    })
  }

  supprimerRegion(region){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression Région',
      message: 'Etes vous sûr de supprimer cette région ?',
      buttons:[
        {
          text: 'Non',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Oui',
          handler: () => {
            this.allRegion.forEach((r, i) => {
              if(r.id === region.id){
                this.allRegion.splice(i, 1);
              }
            });

            this.region.data = this.allRegion;
            //this.allPays.splice(this.pays.indesOf())
            //this.servicePouchdb.updateLocalite(this.region);
            this.servicePouchdb.updateLocalite(this.region).then((res) => {
              this.region._rev = res.rev;
            })
            let toast = this.toastCtl.create({
              message: 'Région bien suprimé!',
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
    if(this.gestion_region){
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




/*  annuler(){
     this.viewCtrl.dismiss();
  }
*/


}
