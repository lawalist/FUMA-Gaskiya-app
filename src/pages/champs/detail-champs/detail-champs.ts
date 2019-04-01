import { Component } from '@angular/core';
import { NavController, NavParams, Platform, LoadingController, AlertController, ToastController, IonicPage } from 'ionic-angular';
//import { ModifierChampsPage } from '../modifier-champs/modifier-champs';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { Geolocation } from '@ionic-native/geolocation';
import { global } from '../../../global-variables/variable';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';

/*
  Generated class for the DetailChamps page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@IonicPage()
@Component({
  selector: 'page-detail-champs',
  templateUrl: 'detail-champs.html'
})
export class DetailChampsPage {

  champ: any = {};
  ancien_nom: any;
  ancien_superficie: any;
  ancien_type_sole: any;
  ancien_longitude: any;
  ancien_latitude: any;
  membre: any;
  champID: any;
  appartenance: any = '';
  appartenances: any = ['Achât', 'Donnation', 'Gage', 'Héritage', 'Location', 'Prêt'];



  champsForm: any;
  grandChamps: any;
  champs: any;
  typeSoles: any = [];
  producteurs: any = [];
  selectedTypeSole: any;
  selectedProducteur: any = [];
  nom_producteur: any = '';
  surnom_producteur: any = '';
  code_union: any = '';
  allChamps: any;
  id_champs: any;
  ancienMatriculeProducteur: any;
  longitude: any;
  latitude: any;
  modifierForm: boolean = false;
  user: any = global.info_user;
  global:any = global;


   constructor(public servicePouchdb: PouchdbProvider, public platform: Platform, public diagnostic: Diagnostic, public loadingCtl: LoadingController, public geolocation: Geolocation, public formBuilder: FormBuilder, public toastCtl: ToastController, public navCtrl: NavController, public navParams: NavParams, public alertCtl: AlertController) {
    this.champ = this.navParams.data.champ;
    this.membre = this.navParams.data.membre;
    this.champID = this.champ._id;
  }

  update_essais(matricule, champs){
    
    let loading = this.loadingCtl.create({
      content: 'Mise à jour des informations en cours...'
    });

    loading.present();

    this.servicePouchdb.getPlageDocsRapide('fuma:essai:'+matricule, 'fuma:essai:'+matricule+'\uffff').then((essais) => {
      if(essais){
        essais.map((essai) => {
         if(essai.doc.data.id_champs === champs.id_champs){
            essai.doc.data.nom_champs = champs.nom;
            essai.doc.data.superficie = champs.superficie;
            essai.doc.data.type_sole = champs.type_sole;
            essai.doc.data.longitude = champs.longitude;
            essai.doc.data.latitude = champs.latitude;

            this.servicePouchdb.updateDoc(essai.doc);
         }
        });

        loading.dismissAll();

        this.modifierForm = false;
        this.msg('Champs bien enrégistré')
        
      }
    })

  }
  initFrom(){
    this.grandChamps = this.navParams.data.champ;
    this.champs = this.grandChamps.data;

    this.selectedProducteur = this.champs.matricule_producteur;
    this.nom_producteur = this.champs.nom_producteur;
    this.surnom_producteur = this.champs.surnom_producteur;
    this.code_union = this.champs.code_union;
    this.ancienMatriculeProducteur = this.champs.matricule_producteur;
    this.selectedTypeSole = this.champs.type_sole;
    this.id_champs = this.champs.id_champs;
    this.longitude = this.champs.longitude;
    this.latitude = this.champs.latitude;
    
     // let p: any = [];
        
    this.champsForm = this.formBuilder.group({
      id_champs:[this.champs.id_champs],
      nom: [this.champs.nom, Validators.required],
      longitude: [this.champs.longitude],
      latitude: [this.champs.latitude],
      superficie: [this.champs.superficie, Validators.required],
      appartenance: [this.champs.appartenance, Validators.required],
      type_sole: [this.champs.type_sole, Validators.required],
      matricule_producteur: [this.champs.matricule_producteur],
      nom_producteur: [this.champs.nom_producteur, Validators.required],
      surnom_producteur: [this.champs.surnom_producteur],
    });
    
  }

  getAllTypeSol(){
    this.servicePouchdb.getPlageDocs('fuma:type-sole','fuma:type-sole:\uffff').then((ts) => {
          this.typeSoles = ts;
      }, err => console.log(err)); 
  }

  getAllMembre(){
     this.servicePouchdb.getPlageDocs('fuma:op:membre','fuma:op:membre:\uffff').then((mbrA) => {
        this.servicePouchdb.getPlageDocs('koboSubmission_fuma-op-membre','koboSubmission_fuma-op-membre\uffff').then((mbrK) => {
        this.producteurs = mbrA.concat(mbrK);
      }, err => console.log(err));
    }, err => console.log(err)); 
  }



  getNomProducteur(){
    this.producteurs.forEach((p, i) => {
      if(p.data.matricule_Membre === this.selectedProducteur){
        this.nom_producteur = p.data.nom_Membre;
         this.surnom_producteur = p.data.surnom_Membre;

         this.code_union = p.data.code_union;
         if(this.ancienMatriculeProducteur !== p.data.matricule_Membre){
            let id = this.generateId(p.data.matricule_Membre);
            this.id_champs = id;
          }else{
            this.id_champs = this.ancienMatriculeProducteur;
          }
      } 
    });

    
  }

  msg(msg: string = ''){
    let toast = this.toastCtl.create({
      message: msg,
      position: 'top',
      duration: 1000,
      showCloseButton: true,
      closeButtonText: 'ok',
      dismissOnPageChange: true
    });

    toast.present();
  }

    getPosition(){
      this.msg('Obtention des coordonnées en cours...');
        this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
            this.longitude = resp.coords.longitude;
            this.latitude = resp.coords.latitude;
            this.msg('Coordonnées obtenues avec succes!')
        }, err => {
            this.msg('Une erreur c\'est produite lors de l\obtention des coordonnées. \nVeuillez reéssayer plus tard!')
            console.log('')
        });

      /*if(this.platform.is('android')){
        this.diagnostic.isLocationEnabled().then((enabled) => {
            console.log("Le GPS est "+(enabled ? "activié" : "désactivé"));
            if(!enabled){
                this.diagnostic.switchToLocationSettings();
            }else {
                this.msg('Obtention des coordonnées en cours...');
                this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
                    this.longitude = resp.coords.longitude;
                    this.latitude = resp.coords.latitude;
                    this.msg('Coordonnées obtenues avec succes!')
                }, err => {
                    this.msg('Une erreur c\'est produite lors de l\obtention des coordonnées. \nVeuillez reéssayer plus tard!')
                    console.log('')
                });
            }
        }).catch((err) => {
            alert("Erreur: "+err)
        })
      }else{
        this.msg('Obtention des coordonnées en cours...');
        this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
            this.longitude = resp.coords.longitude;
            this.latitude = resp.coords.latitude;
            this.msg('Coordonnées obtenues avec succes!')
        }, err => {
            this.msg('Une erreur c\'est produite lors de l\obtention des coordonnées. \nVeuillez reéssayer plus tard!')
            console.log('')
        });
      }*/
        
    }

    /*getPosition(){
    this.msg('Obtention des coordonnées en cours...');
    this.geolocation.getCurrentPosition({enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }).then((resp) => {
      this.longitude = resp.coords.longitude;
      this.latitude = resp.coords.latitude;
      this.msg('Coordonnées obtenues avec succes!')
    }, err => {
      this.msg('Une erreur c\'est produite lors de l\obtention des coordonnées. \nVeuillez reéssayer plus tard!')
      console.log('')
    });
  }*/

  generateId(matricule){
    var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
    var numbers='0123456789'
    var randomArray=[]
    for(let i=0;i<3;i++){
      var rand = Math.floor(Math.random()*10)
      randomArray.push(numbers[rand])
    }
    //randomArray.push('-')
    //var rand = Math.floor(Math.random()*24)
    //randomArray.push(chars[rand])
    var randomString=randomArray.join("");
    var Id= matricule+' '+/*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */+randomString 
    return Id;
  }

   modifierChamps(){
      //  let date = new Date();
    let champ = this.champsForm.value;

    this.champs.id_champs = champ.id_champs;
    this.champs.nom = champ.nom; 
    this.champs.longitude = champ.longitude;
    this.champs.latitude = champ.latitude;
    this.champs.superficie = champ.superficie;
    this.champs.appartenance = champ.appartenance;
    this.champs.type_sole = champ.type_sole;
    this.champs.matricule_producteur = champ.matricule_producteur;
    this.champs.nom_producteur = champ.nom_producteur; 
/*
    champs.matricule_producteur = this.selectedProducteur.data.matricule_Membre; 
    champs.code_union = this.selectedProducteur.data.code_union;
    champs.code_op = this.selectedProducteur.data.code_op;
    champs.surnom_producteur = this.selectedProducteur.data.surnom_Membre;
    */
    
    
    /*if(this.membre && this.membre != {}){
      this.champs.surnom_producteur = this.membre.data.surnom_Membre;
      this.champs.code_union = this.membre.data.code_union;
    }else{
      this.champs.surnom_producteur = champ.surnom_producteur;
      this.champs.code_union = champ.code_union;
    }*/
    
    
      this.grandChamps.data = this.champs;
      this.servicePouchdb.updateDocReturn(this.grandChamps).then((res) => {
        this.grandChamps._rev = res.rev;
        this.champ = this.grandChamps;
        if(this.ancien_nom !== champ.nom || this.ancien_superficie !== champ.superficie || this.ancien_type_sole !== champ.type_sole || this.ancien_longitude !== champ.longitude || this.ancien_latitude !== champ.latitude){
          this.update_essais(champ.matricule_producteur, champ)
        }else{
          this.modifierForm = false;
          this.msg('Champs bien enrégistré')
        }
        /*this.modifierForm = false;
        this.msg('Champs bien enrégistré')*/
      }) ;

      //this.navCtrl.pop();
      //toast.present();
      

   // }
  }

  annuler(){
    //this.navCtrl.pop();
    this.modifierForm = false;

    if(!this.code_union || this.code_union === ''){
      for(let k = 0; k < this.producteurs.length; k++){
      if(this.producteurs[k].data.matricule_Membre === this.selectedProducteur){
        this.code_union = this.producteurs[k].data.code_union;
        break;
      }}
    }
  }



  ionViewDidEnter() {
    //console.log('ionViewDidLoad DetailUnionPage');
    /*this.servicePouchdb.getDocById(this.champID).then((c) => {
      this.champ = c;
    }, err => console.log(err))*/

    this.initFrom();
    this.getAllTypeSol();
    this.getAllMembre();
  }

  editer(champ, dbclick: boolean = false){
    if(!dbclick || (dbclick && this.user && this.user.roles && global.estAnimataire(this.user.roles))){
    //this.navCtrl.push('ModifierChampsPage', {'champ': champ});
    this.modifierForm = true;
    }
  }

  supprimer(champ){
    let alert = this.alertCtl.create({
      title: 'Suppression champs',
      message: 'Etes vous sûr de vouloir supprimer cet champs ?',
      buttons:[
        {
          text: 'Non',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Oui',
          handler: () => {
            this.servicePouchdb.deleteDoc(champ);
            let toast = this.toastCtl.create({
              message:'Champs bien supprié',
              position: 'top',
              duration: 3000
            });

            toast.present();
            this.navCtrl.pop();
          }
        }
      ]
    });

    alert.present();
  }

 
}
