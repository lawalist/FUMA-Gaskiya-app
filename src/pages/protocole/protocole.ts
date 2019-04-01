import { Component } from '@angular/core';
import { NavController, IonicApp, ToastController, NavParams, LoadingController, ViewController, App, AlertController, Platform, ModalController, IonicPage, MenuController, Events  } from 'ionic-angular';
import { PouchdbProvider } from '../../providers/pouchdb-provider';
//import { AjouterEssaiPage } from './ajouter-essai/ajouter-essai';
//import { DetailEssaiPage } from './detail-essai/detail-essai';
import { Storage } from '@ionic/storage'; 
import { File } from '@ionic-native/file';
import { global } from '../../global-variables/variable';
import * as FileSaver from 'file-saver';
import { Printer, PrintOptions } from '@ionic-native/printer';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';


declare var cordova: any;

/**
 * Generated class for the ProtocolePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */ 

@IonicPage()
@Component({
  selector: 'page-protocole',
  templateUrl: 'protocole.html',
})
export class ProtocolePage {


  protocoles: any = [];
  allProtocoles: any = [];
  id: any = '';
  loading: boolean = true;
  rechercher: any = false;
  detailProtocole: boolean = false;
  selectedStyle: any = 'liste';
  protocole: any;
  protocole1: any;
  protocoleAModifier: any;
  grandProtocole: any;
  protocoleForm: any;
  annees: any = [];
  
  //type_culture: any = 'Mil';
  selectedLimit: any = 10;
  selectedAnnee: any;
  limits: any = [10, 25, 50, 100, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 'Tous'];
  typeRecherche: any = 'annee';
  annee: any = '';
  code: any;
  projet: any = '';
  nom: any = '';
  titre_essais: any = ''; 
  contexte: any = '';
  methodologie: any = '';
  choix_varietes: any = '';
  type_culture: any = '';
  avec_repetition: any = '';
  test_varietal: any = '';
  nb_repetition: any;
  avec_parcelle: any = '';
  nb_parcelle: any;
  avec_bloc: any = '';
  typologie:any = '';
  nb_bloc: any;
  traitement: any = '';
  type_essais: any = '';
  objectifs: any = '';
  nb_e_r_d_e: any = '';
  taille_parcelle: any = '';
  d_e_p_d_u_l: any = '';
  d_e_l_l: any = '';
  demariage: any = '';
  fertilisation: any = '';
  autres_specifications: any = '';
  today: any;
  imei: any = '';
  phonenumber: any = '';
  user: any = global.info_user;
  global:any = global;
  estManager: boolean = false;
  estAnimataire: boolean = false;
  aProfile:boolean = false;
  modifierFrom: boolean = false;
  estInstancier: boolean = false;
  ajoutForm: boolean = false;
  annees_typologie: any = [];

  constructor(public navCtrl: NavController, public loadtingCtl: LoadingController, public toastCtl: ToastController, public ionicApp: IonicApp, public viewCtl: ViewController, public formBuilder: FormBuilder, public sim: Sim, public device: Device, public modelCtl: ModalController, public a: App, public events: Events, public navParams: NavParams, public menuCtl: MenuController, public printer: Printer, public file: File, public platform: Platform, public storage: Storage, public servicePouchdb: PouchdbProvider, public alertCtl: AlertController) {
  
    this.menuCtl.enable(false, 'options');
      this.menuCtl.enable(false, 'connexion');
      this.menuCtl.enable(false, 'profile');
      
    
    events.subscribe('user:login', (user) => {
        if(user){
          this.aProfile = true;
          this.estMangerConnecter(user)
          this.estAnimataireConnecter(user)
        }else{
          this.aProfile = false;
          this.estManager = false;
          this.estAnimataire = false;
          this.user = global.info_user;
        }
        //alert(user)
        /*this.servicePouchdb.remoteSaved.getSession((err, response) => {
          if (response.userCtx.name) {
            //this.aProfile = true;
            this.user = global.info_user;
          }else{
            this.aProfile = false;
            this.user = {};
          }
        }, err => console.log(err));*/
      });


      for(let i=0; i<=50; i++){
        this.annees.push(2000 + i)
      }

      let date = new Date();
      this.selectedAnnee = date.getFullYear();

      for(let i= (date.getFullYear() - 10); i <= date.getFullYear(); i++){
        this.annees_typologie.push(i)
      }
  }
  
    dismiss(){
      this.viewCtl.dismiss(/*this.protocoles*/);
      //this.a_matricule = false;
    }
    closeToast(){
     let toast = this.ionicApp._toastPortal.getActive();
      toast.dismiss();
    }
    estMangerConnecter(user){
      if(user && user.roles){
        this.estManager = global.estManager(user.roles);
      }
    }
  
     estAnimataireConnecter(user){
      if(user && user.roles){
        this.estAnimataire = global.estAnimataire(user.roles);
      }
    }
  
    initForm(){
      let maDate = new Date();
      //this.dateAjout = maDate;
       let today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
       this.protocoleForm = this.formBuilder.group({
       // _id:[''],
        type:['protocole'],
        annee:['', Validators.required],
        nom:['', Validators.required],
        projet:['', Validators.required],
        //titre_essais: ['', Validators.required],
        //contexte:[''],
        //objectifs:[''],
        //methodologie:[''], 
        //choix_varietes:[''],
        attributs: this.formBuilder.array([
          this.initAttribut(),
        ]),
        type_culture:['', Validators.required],
        traitement:['oui', Validators.required],
        type_essais:['', Validators.required],
        avec_repetition:['non', Validators.required],
        test_varietal:['non', Validators.required],
        nb_repetition:['' ],
        avec_parcelle:['non', Validators.required],
        nb_parcelle:['' ],
        avec_bloc:['non', Validators.required],
        typologie:['non', Validators.required],
        annee_typologie:[''],
        nb_bloc:['' ],
        //avec_code_association:['non', Validators.required],
        superficie_essais:[''],
        superficie_essais_modifiable:['non', Validators.required],
        //today: [today],
        //id_site:['', , Validators.required],
        //id_village:['', , Validators.required],
        //nb_e_r_d_e:[''], 
        //taille_parcelle: [''],
        //d_e_p_d_u_l: [''],
        //d_e_l_l: [''],
        //demariage: [''],
        //id_classe_producteur: [''],
        //fertilisation: [''],
        //id_traitement: [''],
        //autres_specifications: [''],
        today: [today],
        deviceid: [''],
        imei: [''],
        phonenumber: [''],
        start: [maDate.toJSON()],
        end: ['']
      });
       
    }
  
    initAttribut() {
      
      return this.formBuilder.group({
        nom: ['', Validators.required],  
        detail: ['', Validators.required],    
      });
    }
  
    addAttribut() {
      const control = <FormArray>this.protocoleForm.controls['attributs'];
      control.push(this.initAttribut());
    }
  
    removeAttribut(i: number) {
      const control = <FormArray>this.protocoleForm.controls['attributs'];
      control.removeAt(i);
    }
  
  
  
    getInfoSimEmei(){
      this.sim.getSimInfo().then(
          (info) => {
            if(info.cards.length > 0){
              info.cards.forEach((infoCard) => {
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
  
  
    reinitForm(){

      this.initForm();
      this.avec_repetition = 'non';
      this.test_varietal = 'non';
      this.avec_parcelle = 'non';
      this.avec_bloc = 'non';
      this.typologie = 'non';
      this.traitement = 'oui';
      /*let maDate = new Date();
      //this.dateAjout = maDate;
      this.today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
  
      this.projet = '';
      this.nom = '';
      //this.chargerChamps('');
      this.annee = '';
      this.titre_essais = '';
      this.contexte = '';
      this.methodologie = '';
      this.choix_varietes = '';
      this.type_culture = '';
      this.avec_repetition = '';
      this.nb_repetition = '';
      this.traitement = '';
      this.type_essais = '';
      this.objectifs = '';
      this.nb_e_r_d_e = '';
      this.taille_parcelle = '';
      this.nb_e_r_d_e = '';
      //nom producteur
      this.d_e_l_l = '';
      this.d_e_p_d_u_l = '';
      this.demariage = '';
      this.fertilisation = '';
      this.autres_specifications = '';*/
    }
  
  generateId(){
      var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
      var numbers='0123456789'
      var randomArray=[]
      for(let i=0;i<4;i++){
        var rand = Math.floor(Math.random()*10)
        randomArray.push(numbers[rand])
      }
      randomArray.push('-')
      for(let i=0;i<4;i++){
        var rand = Math.floor(Math.random()*24)
        randomArray.push(chars[rand])
      }
      
      var randomString=randomArray.join("");
      var Id= /*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */''+randomString 
      return Id;
    }
  
    
  existe(protocole, modifierFrom){
    //let c: any = {};
    let res: number = 0;
    //alert(producteur_connu+'  '+matricule_producteur)
    if(!modifierFrom){
      for(let i = 0; i < this.allProtocoles.length; i++){ 
        //c = this.allCultures[i];
        if((this.allProtocoles[i].doc.data.nom == protocole.nom) && (this.allProtocoles[i].doc.data.annee == protocole.annee)){
          res = 1;
          break;
        }
      }
    }else{
      for(let i = 0; i < this.allProtocoles.length; i++){ 
        //c = this.allCultures[i];
        if(((this.allProtocoles[i].doc.data.nom === protocole.nom) && (this.allProtocoles[i].doc.data.annee === protocole.annee)) && (protocole.code && this.allProtocoles[i].doc.data.code !== protocole.code)){
          res = 1;
          break;
        }
      }
    }
    return res;

    
  }




    actionForm(){
      let protocole = this.protocoleForm.value;

      if(this.valider(protocole) === ''){
        if(this.modifierFrom){
          protocole.code = this.protocole1.code;
        }
        if(this.existe(protocole, this.modifierFrom) == 1){
          alert('Erreur! Enregistrement impossible, ce protocole existe déjà');
        }else{
          if(this.ajoutForm && !this.modifierFrom){
            let date = new Date();
            protocole.annee = this.selectedAnnee;
            protocole.deviceid = this.device.uuid;
            protocole.phonenumber = this.phonenumber;
            protocole.imei = this.imei; 
            protocole.update_deviceid = this.device.uuid;
            protocole.update_phonenumber = this.phonenumber;
            protocole.update_imei = this.imei;
            protocole.code = this.id;
            if(protocole.traitement == 'oui'){
              protocole.superficie_essais  = '';
            }
            
            //union._id = 'fuma'+ id;
            protocole.end = date.toJSON();
            //protocole.code_essai = id;
            //champs.id_champs = id;
          
            let protocoleFinal: any = {};
            protocoleFinal._id = 'fuma'+':protocole:'+ this.id;
            protocoleFinal.data = protocole
            let EF: any;
            this.servicePouchdb.createDocReturn(protocoleFinal).then((res) => {
              /* let toast = this.toastCtl.create({
                  message: 'Essai bien enregistré!',
                  position: 'top',
                  duration: 1000
                });*/
                
                
                //alert(res.rev)
                protocoleFinal._rev = res.rev;
                let E: any = {};
                E.doc = protocoleFinal;
                this.code = null;
                
                //this.viewCtl.dismiss(essaiFinal);
              // this.zone.run(() => {
                this.protocoles.push(E);
              });
  
              
              this.ajoutForm = false;
              this.reinitForm();
              
  
              //this.navCtrl.pop();
              //toast.present();
              
  
        // }
        }else if(this.modifierFrom){
          let date = new Date();
          //let protocole = this.protocoleForm.value;
          this.protocole1.annee = protocole.annee;
          this.protocole1.objectifs = protocole.objectifs;
          this.protocole1.projet = protocole.projet; 
          this.protocole1.nom = protocole.nom; 
          //this.protocole1.titre_essais = protocole.titre_essais;
          //today: [today],
          //id_site:['', , Validators.required],
  
          this.protocole1.traitement = protocole.traitement;
          this.protocole1.type_essais = protocole.type_essais;
          this.protocole1.type_culture = protocole.type_culture;
          this.protocole1.avec_repetition = protocole.avec_repetition;
          this.protocole1.test_varietal = protocole.test_varietal;
          this.protocole1.nb_repetition = protocole.nb_repetition;
          this.protocole1.avec_parcelle = protocole.avec_parcelle;
          this.protocole1.nb_parcelle = protocole.nb_parcelle;
          this.protocole1.avec_bloc = protocole.avec_bloc;
          this.protocole1.typologie = protocole.typologie;
          this.protocole1.annee_typologie = protocole.annee_typologie;
          this.protocole1.nb_bloc = protocole.nb_bloc;
          //this.protocole1.avec_code_association = protocole.avec_code_association;
          this.protocole1.superficie_essais = protocole.superficie_essais;
          this.protocole1.superficie_essais_modifiable = protocole.superficie_essais_modifiable;
          this.protocole1.attributs = protocole.attributs;
          if(this.protocole1.traitement == 'oui'){
            this.protocole1.superficie_essais  = '';
          }
          
          /*this.protocole1.contexte = protocole.contexte;
          this.protocole1.methodologie = protocole.methodologie;
          this.protocole1.choix_varietes = protocole.choix_varietes;
          this.protocole1.nb_e_r_d_e = protocole.nb_e_r_d_e;
          this.protocole1.taille_parcelle = protocole.taille_parcelle;
          this.protocole1.d_e_p_d_u_l = protocole.d_e_p_d_u_l;
          this.protocole1.d_e_l_l = protocole.d_e_l_l;
          //id_classe_producteur: [''],
          this.protocole1.demariage = protocole.demariage;
          this.protocole1.fertilisation = protocole.fertilisation;
          //id_traitement: [''],
          this.protocole1.autres_specifications = protocole.autres_specifications;
          */
          this.protocole1.update_deviceid = this.device.uuid;
          this.protocole1.update_phonenumber = this.phonenumber;
          this.protocole1.update_imei = this.imei;
        
          //let essaiFinal: any = {};
          this.grandProtocole.data = this.protocole1
          this.servicePouchdb.updateDocReturn(this.grandProtocole).then((res) => {
            this.grandProtocole._rev = res.rev;
            this.protocole = this.grandProtocole;
            //this.essais[this.essais.indexOf(this.essaiAModifier)] = e;
            
            
            this.reinitFormModifier();
            this.modifierFrom = false;
            this.detailProtocole = true
            this.ajoutForm = false;
            this.code = null;
  
          
          let e: any = {};
            e.doc = this.protocole;
            this.protocoles.forEach((es, i) => {
              if(es.doc._id === this.protocoleAModifier._id){
                this.protocoles[i] = e ;
              }
              
            });
          });
        }
      
        }
      }else{
        alert(this.valider(protocole))
      }
     
  }

  annuler(){
      this.ajoutForm = false;

    if(this.modifierFrom){
      this.modifierFrom = false;
      this.ajoutForm = false;
      this.detailProtocole = true;
      this.reinitFormModifier();
    } 
  }

  fermerDetail(){
      this.detailProtocole = false;
      //this.essai = {};
    
  }

  supprimer(protocole){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression protocole',
      message: 'Etes vous sûr de vouloir supprimer ce protocole ?',
      buttons:[
        {
          text: 'Non',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Oui',
          handler: () => {
            this.servicePouchdb.deleteDocReturn(protocole).then((res) => {
              //let e: any = {};
              //e.doc = essai;
              this.protocoles.forEach((es, i) => {
                if(es.doc._id === protocole._id){
                  this.protocoles.splice(i, 1);
                }
                
              });

              this.detailProtocole = false;
              //this.navCtrl.pop();
            }, err => {
              console.log(err)
            }) ;
            
          }
        }
      ]
    });

    alert.present();
  }

  option(){
    this.menuCtl.enable(true, 'options');
    this.menuCtl.enable(false, 'connexion');
    this.menuCtl.enable(false, 'profile');
    this.menuCtl.toggle()
  }

  profile(){
    this.menuCtl.enable(false, 'options');
    this.menuCtl.enable(false, 'connexion');
    this.menuCtl.enable(true, 'profile');
    this.menuCtl.toggle()
  }

  connexion(){
    this.menuCtl.enable(false, 'options');
    this.menuCtl.enable(true, 'connexion');
    this.menuCtl.enable(false, 'profile');
    this.menuCtl.toggle() 
  }


   sync(){
    this.servicePouchdb.syncAvecToast(this.getprotocoles());
    //this.pourCreerForm();
  }

  exportExcel(){

    let date = new Date();
    //let dateHeure = date.toLocaleDateString()+ date.toLocaleTimeString();// + date.getTime().toLocaleString();
    let nom = date.getDate().toString() +'_'+ (date.getMonth() + 1).toString() +'_'+ date.getFullYear().toString() +'_'+ date.getHours().toString() +'_'+ date.getMinutes().toString() +'_'+ date.getSeconds().toString();

    let blob = new Blob([document.getElementById('tableau').innerHTML], {
      //type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
      type: "text/plain;charset=utf-8"
      //type: 'application/vnd.ms-excel;charset=utf-8'
      //type: "application/vnd.ms-excel;charset=utf-8"
    });

    if(!this.platform.is('android')){
      FileSaver.saveAs(blob, 'protocoles_'+nom+'.xls');
    }else{

      let fileDestiny: string = cordova.file.externalRootDirectory;
      this.file.writeFile(fileDestiny, 'protocoles_'+nom+'.xls', blob).then(()=> {
          alert("Fichier créé dans: " + fileDestiny);
      }).catch(()=>{
          alert("Erreur de création du fichier dans: " + fileDestiny);
      })
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
    let content = document.getElementById('tableau').innerHTML;
    this.printer.print(content, options);
  }


   ionViewDidEnter(){
        //this.getEssais()
    this.servicePouchdb.remoteSaved.getSession((err, response) => {
        if (err) {
          // network error
          //this.events.publish('user:login');
          //alert('network')
          this.aProfile = false;
        } else if (!response.userCtx.name) {
          // nobody's logged in
          //this.events.publish('user:login');
          //alert('nobady')
          this.aProfile = false;
        } else {
          // response.userCtx.name is the current user
          //this.events.publish('user:login', response.userCtx);
          //alert(response.userCtx.name)
          this.aProfile = true;
        }
      });
    

    //setInterval(this.servicePouchdb.testConnexion(), 2000)
    if(!this.estInstancier){
      this.getprotocoles();
      this.estInstancier = true;
    }
    
    //this.pourCreerForm();
    this.getInfoSimEmei();
    this.estInstancier = true;

    ///this.corrigerErreur();
    //this.servicePouchdb.findByTypeData()
  }

  ionViewDidLoad() { 

    this.initForm();

  }


  choixLimit(){
    this.rechercher = true;
    if(this.selectedLimit !== 'Tous'){
      this.protocoles = this.allProtocoles.slice(0, this.selectedLimit);
      this.rechercher = false;
    }else{
      this.protocoles = this.allProtocoles;
      this.rechercher = false;
    }
    
  }

  choixLimit1(){
    this.rechercher = true;

    if(this.selectedLimit === 'Tous'){
      this.servicePouchdb.getPlageDocsRapide('fuma:protocole', 'fuma:protocole:\uffff').then((p) => {
        if(p){
            this.protocoles = p;
            this.allProtocoles = p;
            this.rechercher = false;
        }else{
          this.rechercher = false;
        }
      });

      }else{
        this.servicePouchdb.getPlageDocsRapideAvecLimit('fuma:protocole', 'fuma:protocole:\uffff', this.selectedLimit).then((p) => {
          if(p){
            this.protocoles = p;
            this.allProtocoles = p;
            this.rechercher = false;
          }else{
            this.rechercher = false;
          }

        });

    }
  }

   getprotocoles(refresher: any = ''){
    if(refresher === ''){
      this.rechercher = true;
    }



    if(this.selectedLimit === 'Tous'){
      // this.servicePouchdb.getPlageDocs('fuma:essai', 'fuma:essai:\uffff').then((e) => {
        //   if(e){
            //cas ou le producteur est connu

              this.servicePouchdb.getPlageDocsRapide('fuma:protocole', 'fuma:protocole:\uffff').then((p) => {
                if(p){
                    this.protocoles = p;
                    this.allProtocoles = p;
                    this.rechercher = false;
                    if(refresher !== ''){
                    refresher.complete();
                  }
                }else{
                  this.rechercher = false;
                  if(refresher !== ''){
                    refresher.complete();
                  }
                }
              });

        
        //  }
        // });
      }else{

    
          this.servicePouchdb.getPlageDocsRapideAvecLimit('fuma:protocole', 'fuma:protocole:\uffff', this.selectedLimit).then((p) => {
            if(p){
              this.protocoles = p;
              //this.allEssais = e;
              this.rechercher = false;
              if(refresher !== ''){
                refresher.complete();
              }
            }else{
              this.rechercher = false;
              if(refresher !== ''){
                refresher.complete();
              }
            }

          });

          this.servicePouchdb.getPlageDocsRapide('fuma:protocole', 'fuma:protocole:\uffff').then((p) => {
            if(p){
              
              this.allProtocoles = p;
              //this.rechercher = false;
            }
          });

      }
  }

  cultures(protocole){
    let model = this.modelCtl.create('CultureProtocolePage', {'protocole': protocole});
    model.present();
  }

  traitements(protocole){
    let model = this.modelCtl.create('TraitementPage', {'protocole': protocole});
    model.present();
  }

  editer(protocole, dbclick: boolean = false){
    if(!dbclick || (dbclick && this.user && this.user.roles && global.estAnimataire(this.user.roles))){
      this.grandProtocole = protocole;
      this.protocole1 = this.grandProtocole.data;
      //this.nom_producteur = this.protocole1.nom_producteur;

      let Protocole = {

        type: protocole.data.type,
        annee: protocole.data.annee,
        nom: protocole.data.nom,
        projet: protocole.data.projet,
        //titre_essais: protocole.data.titre_essais,
        attributs: protocole.data.attributs,
        type_culture: protocole.data.type_culture,
        traitement: protocole.data.traitement,
        type_essais: protocole.data.type_essais,
        avec_repetition: protocole.data.avec_repetition,
        test_varietal: protocole.data.test_varietal,
        nb_repetition: protocole.data.nb_repetition,
        avec_parcelle: protocole.data.avec_parcelle,
        nb_parcelle: protocole.data.nb_parcelle,
        avec_bloc: protocole.data.avec_bloc,
        typologie:protocole.data.typologie,
        annee_typologie: protocole.data.annee_typologie,
        nb_bloc: protocole.data.nb_bloc,
        //avec_code_association: protocole.data.avec_code_association,
        superficie_essais: protocole.data.superficie_essais,
        superficie_essais_modifiable: protocole.data.superficie_essais_modifiable,
        today: protocole.data.today,
        start: protocole.data.start,
        deviceid: protocole.data.deviceId,
        imei: protocole.data.imei,
        phonenumber: protocole.data.phonenumber,
        end: protocole.data.end
    }

    this.protocoleForm.patchValue(Protocole);
    protocole.data.attributs.forEach((attribut, index)=> {
        if(index > 0){
          (<FormArray>this.protocoleForm.get('attributs')).push(
            this.formBuilder.group({
              nom: [attribut.nom, Validators.required],  
              detail: [attribut.detail, Validators.required],    
              
            }))
        }
        
      }
    )
     
     //this.today = this.protocole1.today;
      //this.annee = this.protocole1.annee;
      this.code = this.protocole1.code;
      this.selectedAnnee = this.protocole1.annee;
      //this.projet = this.protocole1.projet;
      //this.nom = this.protocole1.nom;
      //this.objectifs = this.protocole1.objectifs;
      //this.titre_essais = this.protocole1.titre_essais;
      //this.contexte = this.protocole1.contexte;
      //this.methodologie = this.protocole1.methodologie;
      //this.choix_varietes = this.protocole1.choix_varietes;
      //this.type_culture = this.protocole1.type_culture;
      this.avec_repetition = this.protocole1.avec_repetition;
      this.test_varietal = this.protocole1.test_varietal;
      this.nb_repetition = this.protocole1.nb_repetition;
      this.avec_parcelle = this.protocole1.avec_parcelle;
      this.nb_parcelle = this.protocole1.nb_parcelle;
      this.avec_bloc = this.protocole1.avec_bloc;
      this.typologie = this.protocole1.typologie;
      this.nb_bloc = this.protocole1.nb_bloc;
      this.traitement = this.protocole1.traitement;
      this.type_essais = this.protocole1.type_essais;
      //this.nb_e_r_d_e = this.protocole1.nb_e_r_d_e;
      //this.taille_parcelle = this.protocole1.taille_parcelle;
      //this.d_e_p_d_u_l = this.protocole1.d_e_p_d_u_l;
      //this.d_e_l_l = this.protocole1.d_e_l_l;
      //this.demariage = this.protocole1.demariage;
      //this.fertilisation = this.protocole1.fertilisation;
      //this.autres_specifications = this.protocole1.autres_specifications;

      //this.navCtrl.push('ModifierEssaiPage', {'essai': essai});
      this.detailProtocole = false;

      this.ajoutForm = true;

      this.modifierFrom = true;
      this.protocoleAModifier = protocole;
   }
  }

  reinitFormModifier(){
    this.grandProtocole = '';
    this.protocole1 = {};
    this.initForm();
    this.avec_repetition = 'non';
    this.test_varietal = 'non';
    this.avec_parcelle = 'non';
    this.avec_bloc = 'non';
    this.typologie = 'non';
    this.traitement = 'oui';
    /*//this.type_culture = '';
    this.annee = '';
    this.projet = '';
    this.nom = '';
    this.titre_essais = '';
    this.contexte = '';
    this.methodologie = '';
    this.choix_varietes = '';
    this.type_culture = '';
    this.avec_repetition = '';
    this.nb_repetition = '';
    this.traitement = '';
    this.type_essais = '';
    this.objectifs = '';
    this.nb_e_r_d_e ='';
    this.taille_parcelle ='';
    this.d_e_p_d_u_l = '';
    this.d_e_l_l = '';
    this.demariage ='';
    this.fertilisation = "";
    this.autres_specifications = '';*/
  }

  valider(protocole){
    let msg: string = '';
    if(protocole.traitement == 'non' && (!protocole.superficie_essais || protocole.superficie_essais == '')){
      msg += '\nLa superficie des essais est vide!'
    }
    if(protocole.avec_bloc == 'oui' && (!protocole.nb_bloc || protocole.nb_bloc < 1)){
      msg += '\nLe nombre de bloc doit etre non vide et supperieur à 0!'
    }
    if(protocole.avec_parcelle == 'oui' && (!protocole.nb_parcelle || protocole.nb_parcelle < 1)){
      msg += '\nLe nombre de parcelle doit etre non vide et supperieur à 0!'
    }
    if(protocole.avec_repetition == 'oui' && (!protocole.nb_repetition || protocole.nb_repetition < 1)){
      msg += '\nLe nombre de répétition doit etre non vide et supperieur à 0!'
    }

    if(protocole.typologie == 'oui' && (!protocole.annee_typologie || protocole.annee_typologie == '')){
      msg += '\nL\'année de la typologie est vide!'
    }

    return msg;
  }

   ajouter(){

      let maDate = new Date();
      this.today = this.createDate(maDate.getDate(), maDate.getMonth(), maDate.getFullYear());
      this.id = this.generateId();
      this.traitement = 'oui';
      this.avec_repetition = 'non';
      this.test_varietal = 'non';
      this.avec_bloc = 'non';
      this.typologie = 'non';
      this.avec_parcelle = 'non';
      //this.nb_repetition = 0;
      this.ajoutForm = true;
      
  }


 detail(protocole){
    this.protocole = protocole;

    this.detailProtocole = true;

  }
  


  getItems(ev: any) {
    // Reset items back to all of the items
    //this.essais = this.allEssais;

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.protocoles = this.allProtocoles.filter((item, index) => {
        if(this.typeRecherche === 'nom'){
          return (item.doc.data.nom.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else
        if(this.typeRecherche === 'projet'){
          return (item.doc.data.projet.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'titre_essais'){
          return (item.doc.data.titre_essais.toLowerCase().indexOf(val.toLowerCase()) > -1);
        }else if(this.typeRecherche === 'annee'){
          return (item.doc.data.annee.toString().toLowerCase().indexOf(val.toLowerCase()) > -1);
        }
      });
    }else{
      this.choixLimit();
    }
  }


}
