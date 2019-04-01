import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform, ToastController, AlertController, ViewController, ModalController, IonicPage } from 'ionic-angular';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
import {Diagnostic} from '@ionic-native/diagnostic/ngx';
//import { AjouterChampsPage } from './ajouter-champs/ajouter-champs';
//import { DetailChampsPage } from './detail-champs/detail-champs';
//import { TypeSolePage } from '../type-sole/type-sole';
import { Storage } from '@ionic/storage';
import { Validators, FormBuilder } from '@angular/forms';
import { AutoCompletion } from '../../providers/auto-completion';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
import { Geolocation } from '@ionic-native/geolocation';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { File } from '@ionic-native/file';
import {global} from '../../global-variables/variable';
import PouchDB from 'pouchdb';
declare var cordova: any;


/*
  Generated class for the Champs page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@IonicPage()
@Component({
  selector: 'page-champs',
  templateUrl: 'champs.html'
})
export class ChampsPage {

  selectedTypeSole: any = 'Tous';
  champs: any = [];
  champs1: any = [];
  allChamps: any = [];
  typeSoles: any = [];
  typeSoles1: any = [];
  typeSoleTous: any = {'doc':{'data': {'nom': 'Tous'}}};
  matricule_producteur: any;
  matricule_producteur1: any;
  nom_producteur: any;
  code_union: any;
  code_op: any;
  surnom_producteur: any;
  membre: any;
  typeSolesSelected: any = [];
  typeRecherche: any = 'matricule';
  selectedStyle: any = 'liste';
  appartenance: any = '';
  appartenances: any = ['Achât', 'Donnation', 'Gage', 'Héritage', 'Location', 'Prêt'];

  champsForm: any;
  producteurs: any = [];
  selectedProducteur: any = {};
  imei: any = '';
  phonenumber: any = '';
  longitude: any ='';
  latitude: any = '';
  nom: any = '';
  type_sole: any;
  superficie: any = '';
  code_champs: any = '';
  ajoutForm: boolean = false;
  a_matricule: boolean = false;
  user: any = global.info_user;
  global:any = global;
  fromUnion: any;


  constructor(public navCtrl: NavController, public diagnostic: Diagnostic, public loadtingCtl: LoadingController, public viewCtl: ViewController, public platform: Platform, public printer: Printer, public file: File, public toastCtl: ToastController, public formBuilder: FormBuilder, public modelCtl: ModalController, public ServiceAutoCompletion: AutoCompletion, public sim: Sim, public geolocation: Geolocation, public device: Device,  public navParams: NavParams, public storage: Storage, public servicePouchdb: PouchdbProvider, public alertCtl: AlertController) {
    
    this.fromUnion = this.navParams.data.fromUnion
    if(this.navParams.data.matricule_producteur){
      this.matricule_producteur = this.navParams.data.matricule_producteur;
      this.matricule_producteur1 = this.navParams.data.matricule_producteur;
      this.nom_producteur = this.navParams.data.nom_producteur;
      this.membre = this.navParams.data.membre;
      this.surnom_producteur = this.membre.data.surnom_Membre;
       
      //this.viewCtl.showBackButton(false)
      
      this.selectedProducteur = this.navParams.data.membre
      this.generecodeChamps(this.selectedProducteur.data.matricule_Membre);
      this.a_matricule = true;
      
    }
  }

   copierDB(){
    //this.servicePouchdb.copierDB();
  let codes_unions: any = {};
    //let unions: any = ['WA', 'DO']
    let loading = this.loadtingCtl.create({
      content: 'Transfert champs en cours...'
    });
    loading.present();
      if(this.allChamps){
        alert('nbdoc == '+this.allChamps.length);
        this.allChamps.forEach((ch) => {
          let doc = ch.doc
          //copier les données vers la nouvelle base données
          /*if(doc.type && doc.type != '' && doc.type != 'photo' && doc.data){
            var newDoc: any = {};
            newDoc._id = doc._id;
            newDoc.type = doc.type;
            newDoc.data = doc.data;
            copie_db.put(newDoc);
          }else */
          if(doc.data.code_union == 'WA' || doc.data.code_union == 'DO' || doc.data.code_union == 'JA' || doc.data.code_union == 'HA' || doc.data.code_union == 'AM' || doc.data.code_union == 'SA' || !doc.data.code_union){
            var newDoc: any = {};
            newDoc._id = doc._id;
            newDoc.data = doc.data;
            newDoc.rev = doc._rev;

            this.updateCopieDoc(newDoc)
            //alert(doc._rev.substring(0, doc._rev.indexOf('-')))
            /*copie_db.put(newDoc).then((res) => {
              this.updateCopieDco(newDoc, doc);
            }) .catch(err => { alert('err '+err) });*/

          }/*else if(doc.type && doc.type != '' && doc.type == 'photo' && (doc.code_union == 'WA' || doc.code_union == 'DO' || doc.code_union == 'SA' || !doc.code_union)){
    
              //var fileName = photoDocId + '.jpeg';  
              var newPhoto: any = {};
              newPhoto._id = doc._id;
              //newPhoto._attachments[fileName] = doc._attachments[fileName];
              newPhoto.photoID =  doc.photoID;
              newPhoto.timestamp = doc.timestamp;
              newPhoto.type = doc.type;
              newPhoto.code_union = doc.code_union;
              newPhoto._attachments = doc._attachments;
              newPhoto.rev = doc._rev;
              this.updateCopieDoc(newPhoto)
              //copie_db.put(doc).catch(err => { alert('err tof '+err) })
        
          }*//*else{

          }*/
        });

        loading.dismiss();
      }

  }

  updateCopieDoc(newDoc){

     var copie_db = new PouchDB('http://'+ global.info_db.ip+'/copie_db', {
      /*auth: {
        username: 'admin',
        password: 'admin'
      }*/
      ajax: {
        timeout: 4800000,
      }
    });
    //let i = parseInt(doc._rev.substring(0, doc._rev.indexOf('-')))
    if(!newDoc._rev || newDoc._rev !== ''){
      //var newDoc: any = {};
      //newDoc._id = oldDoc._id;
      //newDoc.data = oldDoc.data;
      copie_db.put(newDoc).then((res) => {
        newDoc._rev = res.rev;
        //this.updateCopieDoc(newDoc);
      }).catch(err => { alert('err '+err) })
    }else{
      if(parseInt(newDoc._rev.substring(0, newDoc._rev.indexOf('-'))) < parseInt(newDoc.rev.substring(0, newDoc.rev.indexOf('-')))){
        copie_db.put(newDoc).then((res) => {
          newDoc._rev = res.rev;
          //this.updateCopieDoc(newDoc);
        }).catch(err => { alert('err rec '+err) })
      }
    }
    
    
  }


  onPrint(){
    let options: PrintOptions = {
        //name: 'Rapport',
        //printerId: 'printer007',
        duplex: true,
        landscape: true,
        grayscale: true
    };
    let content = document.getElementById('champs_tableau').innerHTML;
    this.printer.print(content, options);
  }

  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('champs_tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'Champs_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'Membres_'+nom+'.xls', blob).then(()=> {
          alert("Fichier créé dans: " + fileDestiny);
      }).catch(()=>{
          alert("Erreur de création du fichier dans: " + fileDestiny);
      })
    }
  }



  typeRechercheChange(){
    this.champs = this.allChamps;
  }

  dismiss(){
    this.viewCtl.dismiss(this.champs);
    this.a_matricule = false;
  }

initForm(){
  if(!this.matricule_producteur1){
      let p: any = [];
    this.servicePouchdb.getPlageDocsRapide('fuma:op:membre','fuma:op:membre:\uffff').then((mbrA) => {
      
        this.servicePouchdb.getPlageDocsRapide('koboSubmission_fuma-op-membre','koboSubmission_fuma-op-membre\uffff').then((mbrK) => {
        this.producteurs = mbrA.concat(mbrK);

       
        this.producteurs.forEach((prod, index) => {
          p.push(prod.doc.data); 
        });

        this.ServiceAutoCompletion.data = p;
        //this.ServiceAutoCompletion.data = this.producteurs;
        //this.allMembres = this.membres
    }, err => console.log(err));

    }, err => console.log(err)); 
  }
    //this.chergerTypeSole()
    let maDate = new Date();
    let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());

    this.champsForm = this.formBuilder.group({
     // _id:[''],
      type:['champs'],
      nom: ['', Validators.required],
      appartenance: ['', Validators.required],
      longitude: [''],
      latitude: [''],
      superficie: ['', Validators.required],
      type_sole: ['', Validators.required],
      matricule_producteur: [''],
      nom_producteur: ['', Validators.required],
      surnom_producteur: [''],
      today: [today, Validators.required],
      deviceid: [''],
      imei: [''],
      phonenumber: [''],
      start: [maDate.toJSON()],
      end: ['']
    });
    
  }

 /* chergerTypeSole(){
    
    this.servicePouchdb.getPlageDocs('fuma:type-sole','fuma:type-sole:\uffff').then((ts) => {
              this.typeSoles = ts;
    }, err => console.log(err)); 

    
  }*/

  msg(msg: string = ''){
    let toast = this.toastCtl.create({
      message: msg,
      position: 'top',
      duration: 3000,
      showCloseButton: true,
      closeButtonText: 'ok',
      dismissOnPageChange: true
    });

    toast.present();
  }

  partager(_id){
    let ids: any = [];
    ids.push(_id);

    let alert = this.alertCtl.create({
      title: 'Information de connexion au du serveur',
      //cssClass: 'error',
      inputs: [
        {
          type: 'text',
          placeholder: 'Adrèsse hôte',
          name: 'ip',
          value: '@ip:5984'
        },
        {
          type: 'text',
          placeholder: 'Nom DB',
          name: 'nom_db',
          value: 'nom_db'
        },
        {
          type: 'text',
          placeholder: 'Nom d\'utilisateur',
          name: 'username',
          //value: info_db.ip
        },
        {
          type: 'password',
          placeholder: 'Mot de passe',
          name: 'passwd',
          //value: info_db.nom_db
        }
      ],
      buttons: [
        {
          //cssClass: 'error-border',
          text: 'Annuler',
          role: 'Cancel',
          handler: () => console.log('Changement ip serveur annuler')
        },
        {
          text: 'Valider',
          handler: (data) => {
            let ip = data.ip.toString();
            let nom_db = data.nom_db.toString();
            let username = data.username.toString();
            let passwd = data.passwd.toString();
            let ids:any = [];
            ids.push(_id);
            this.servicePouchdb.replicationByDocsId(ids, ip, nom_db, username, passwd);
          }
        }
      ]
    }); 

    alert.present();
    
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

  createDate(jour: any, moi: any, annee: any){
    let s = annee+'-';
    moi += 1;
    if(moi < 10){
      s += '0'+moi+'-';
    }else{
      s += moi+'-';
    }

    if(jour < 10){
      s += '0'+jour;
    }else{
      s += jour;
    }
    return s;
  }

  getInfoSimEmei(){
 // this.chergerTypeSole();
  
    this.sim.getSimInfo().then(
      (info) => {
        if(info.cards && info.cards.length > 0){
          info.cards.forEach((infoCard, i) => {
            if(infoCard.phoneNumber){
              this.phonenumber = infoCard.phoneNumber;
            }
            if(infoCard.deviceId){
              this.imei = infoCard.deviceId;
            }
          })
        }else{
          this.phonenumber = info.phoneNumber;
          this.imei = info.deviceId;
        }

      },
      (err) => console.log('Unable to get sim info: ', err)
    );

    /*this.servicePouchdb.getPlageDocs('fuma:champs','fuma:champs:\uffff').then((ch) => {
        this.allChamps = ch;

      }, err => console.log(err));   */   
  }

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
    var Id= matricule+' '+'CH-'+/*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */+randomString 
    return Id;
  }

  itemSelected(ev: any){
    //alert(ev.code_produit);
    this.producteurs.forEach((prod, index) => {
      prod = prod.doc;
      if(prod.doc.data.matricule_Membre === ev.matricule_Membre){
        this.selectedProducteur = prod.doc;
        this.nom_producteur = prod.doc.data.nom_Membre;
        this.code_union = prod.doc.data.code_union;
        this.code_op = prod.doc.data.code_op;
        this.surnom_producteur = prod.doc.data.surnom_Membre;
        this.generecodeChamps(this.selectedProducteur.data.matricule_Membre)
      }
    });
  }

  /*producteurSelected(matricule){
    this.nom_producteur = prod.data.nom_Membre;
    //alert(ev.code_produit);
   /* this.producteurs.forEach((prod, index) => {
      if(prod.data.matricule_Membre === matricule){
        this.selectedProducteur = prod;
        this.nom_producteur = prod.data.nom_Membre;
      }
    });/*
  }*/

  dechanfChamps(){
    this.longitude ='';
    this.latitude = '';
    this.nom = '';
    this.type_sole = '';
    this.superficie = '';
    this.appartenance = '';
    this.generecodeChamps(this.selectedProducteur.data.matricule_Membre)
  }
 
  generecodeChamps(matricule){
    this.code_champs = this.generateId(matricule);
  }

  ajouterChamps(){
    let date = new Date();
    let champs = this.champsForm.value;
    champs.matricule_producteur = this.selectedProducteur.data.matricule_Membre; 
    champs.code_union = this.selectedProducteur.data.code_union;
    champs.code_op = this.selectedProducteur.data.code_op;
    champs.surnom_producteur = this.selectedProducteur.data.surnom_Membre;
    //champs.nom_producteur = this.selectedProducteur.data.nom_Membre;
    champs.deviceid = this.device.uuid;
    champs.phonenumber = this.phonenumber;
    champs.imei = this.imei;
    
    //union._id = 'fuma'+ id;
    champs.end = date.toJSON();
    champs.id_champs = this.code_champs;

    let champsFinal: any = {};
    champsFinal._id = 'fuma'+':champs:'+ this.code_champs;
    champsFinal.data = champs
    this.servicePouchdb.createDocReturn(champsFinal).then((res) => {

      /*let toast = this.toastCtl.create({
        message: 'Champs bien enregistré!',
        position: 'top',
        duration: 1000
      });*/

       champsFinal._rev = res.rev;
       let c: any = {};
       c.doc = champsFinal;

       if(this.matricule_producteur1){
          this.champs1.push(c);
           this.dechanfChamps()
         }else{
           this.champs.push(c);
           this.ajoutForm = false;
         }

       //this.champs.push(champsFinal)
        //});

        
    });
    
    

    //this.navCtrl.pop();
    //toast.present();
    

  }

  /*annuler(){
    this.navCtrl.pop();
  }*/

  annuler(){
    //this.navCtrl.pop();
     if(this.matricule_producteur1){
      let C: any = this.champs;
      C = C.concat(this.champs1);
      this.champs = C;
      this.allChamps = this.champs;
    this.ajoutForm = false;
    this.champs1 = [];
    }else{
      this.ajoutForm = false;
    }
    
  }



  ionViewDidEnter() {

    this.servicePouchdb.getPlageDocsRapide('fuma:type-sole','fuma:type-sole:\uffff').then((ts) => {
        if(ts){
          this.typeSoles = ts;
          this.typeSoles1 = ts;
          this.typeSoles.push(this.typeSoleTous);
        }
      });

    if(this.selectedTypeSole === 'Tous'){
     // this.unions = [];
     // this.servicePouchdb.getPlageDocs('fuma:champs','fuma:champs:\uffff').then((c) => {
       // if(c){
          if(this.matricule_producteur1){
            this.servicePouchdb.getPlageDocsRapide('fuma:champs:'+this.matricule_producteur1, 'fuma:champs:'+this.matricule_producteur1+' \uffff').then((c) => {
              this.champs = c;
              this.allChamps = c;
            })
            /*let chmps: any = [];
            c.forEach((ch, i) => {
              if(ch.data.matricule_producteur === this.matricule_producteur){
                chmps.push(ch);
              }
            });

            this.champs = chmps;
            this.allChamps = chmps;*/
          }else {
            this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((c) => {
              if(c){
                this.champs = c;
                this.allChamps = c;
              }
            });
            
          }
     //   }
     // });
    }else{
     // this.unions = [];
      this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((c) => {
        if(c){
          let ch: any = [];
          c.forEach((cp, index) => {
            if(cp.doc.data.type_sole === this.selectedTypeSole){
              ch.push(cp);
            }
          });

          if(this.matricule_producteur1){
            let chmps: any = [];
            ch.forEach((chm, i) => {
              if(chm.doc.data.matricule_producteur === this.matricule_producteur1){
                chmps.push(chm);
              }
            });

            this.champs = chmps;
            this.allChamps = chmps;
          }else {
            this.champs = ch;
            this.allChamps = ch;
          }

          //this.champs = ch;
          //this.allChamps = ch;
        }
      });
    }
    //this.chergerTypeSole();
    this.initForm();
    this.getInfoSimEmei();
  }

  chergerTypeSole(){
    this.servicePouchdb.getPlageDocsRapide('fuma:type-sole','fuma:type-sole:\uffff').then((ts) => {
          this.typeSolesSelected = ts;
    }, err => console.log(err)); 
  }

  choixTypeSole(){
    if(this.selectedTypeSole === 'Tous'){
     // this.unions = [];
      this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((c) => {
        if(c){ 
          if(this.matricule_producteur1){
            let chmps: any = [];
            c.forEach((ch, i) => {
              if(ch.doc.data.matricule_producteur1 === this.matricule_producteur1){
                chmps.push(ch);
              }
            });

            this.champs = chmps;
            this.allChamps = chmps;
          }else {
            this.champs = c;
            this.allChamps = c;
          }
          //this.champs = c;
          //this.allChamps = c;
        }
      });
    }else{
     // this.unions = [];
      this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((c) => {
        if(c){
          let ch: any = [];
          c.forEach((cp, index) => {
            if(cp.doc.data.type_sole === this.selectedTypeSole){
              ch.push(cp);
            }
          });

          if(this.matricule_producteur1){
            let chmps: any = [];
            ch.forEach((chm, i) => {
              if(chm.doc.data.matricule_producteur1 === this.matricule_producteur1){
                chmps.push(chm);
              }
            });

            this.champs = chmps;
            this.allChamps = chmps;
          }else {
            this.champs = ch;
            this.allChamps = ch;
          }
          //this.champs = ch;
          //this.allChamps = ch;
        }
      });
    }   

  }

   ajouter(){
    if(this.typeSoles1 && this.typeSoles1.length > 0){
      this.ajoutForm = true;
     /* if(this.matricule_producteur){
        let model = this.modelCtl.create('AjouterChampsPage', {'matricule_producteur': this.matricule_producteur, 'nom':this.nom_producteur, 'membre': this.membre});
        model.onDidDismiss(champs => {
        if (champs) {
          let C: any = this.champs;
          C = C.concat(champs);
         // this.allEssais.push(essai);
         // this.zone.run(() => {
            this.champs = C;
            this.allChamps = this.champs;
            //this.events.publish('ajout-essai', {'essai': essai});
          //});
          
          
        }
      });
      model.present();

     }else{
         let model = this.modelCtl.create('AjouterChampsPage');
         model.onDidDismiss(champs => {
        if (champs) {
          let C: any = this.champs;
          C = C.concat(champs);
         // this.allEssais.push(essai);
         // this.zone.run(() => {
            this.champs = C;
            this.allChamps = this.champs;
            //this.events.publish('ajout-essai', {'essai': essai});
          //});
          
          
        }
      });
      model.present();

     }*/
      
    }else{
      let alert = this.alertCtl.create({
        title: 'Erreur',
        message: 'Vous devez d\'abord définir les types de soles!',
        buttons: [
          {
            text: 'Définir types soles',
            handler:  () => {
              this.navCtrl.push('TypeSolePage');
            }        
          },
          {
            text: 'Annuler',
            handler: () => console.log('annuler')
          }
        ]
      });

      alert.present();
    }
    
  }

  detail(champ){
    this.navCtrl.push('DetailChampsPage', {'champ': champ, 'membre': this.membre});
  }

  getItems(ev: any) {
    // Reset items back to all of the items
    this.champs = this.allChamps;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.champs = this.champs.filter((item) => {
        if(this.typeRecherche === 'matricule'){
          return (item.doc.data.matricule_producteur.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'nom'){
          return (item.doc.data.nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'nom_producteur'){
          return (item.doc.data.nom_producteur.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
        
      });
    }
  }
 
}
