import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, ModalController, ToastController, ViewController, IonicPage, Loading } from 'ionic-angular';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';
//import { OpPage } from '../../op/op';
import { TranslateService } from '@ngx-translate/core';
import { global } from '../../../global-variables/variable';
import { Storage } from '@ionic/storage';
import { EssaiType } from '../../../app/essai.class';
import { CultureType } from '../../../app/culture-essai.class';


/*
  Generated class for the Admin page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@IonicPage()
@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})
export class AdminPage {
  profiles:any=[];
  pendingProfiles:any=[];
  unions:any = [];
  ops:any = [];
  membres:any = [];
  user: any = global.info_user;
  global:any = global;
  //toast: any;

  constructor(public translate: TranslateService, public modalCtl: ModalController, public loadtingCtl: LoadingController, public viewCtl: ViewController, public storage: Storage, public alertCtl: AlertController, public navCtrl: NavController, public toastCtl: ToastController, public navParams: NavParams,  private database: PouchdbProvider) {
    this.translate.setDefaultLang(global.langue);
  }

  dismiss(){
    this.viewCtl.dismiss();
  }

  ionViewDidEnter() {
    this.translate.use(global.langue);
    this.getProfiles();

    //union 
    this.database.getPlageDocs('fuma:union','fuma:union:\uffff').then((unionsA) => {
         this.database.getPlageDocs('koboSubmission_fuma-union','koboSubmission_fuma-union\uffff').then((unionsK) => {
          this.unions = unionsA.concat(unionsK);
         }, err => console.log(err));  
    }, err => console.log(err));   

    //op
    let A = [];
    let opss: any = [];
    this.database.getPlageDocs('fuma:op','fuma:op:\uffff').then((opsA) => {
      if(opsA){
          //opss = ops;
          opsA.forEach((o, index) => {
            if(!o.data.op/* || o.data.op !== ''*/){
              A.push(o)
            }
          })
        }
      let k = [];
      this.database.getPlageDocs('koboSubmission_fuma-op','koboSubmission_fuma-op\uffff').then((opsK) => {
        opsK.forEach((o, i) => {
            if(!o.data.op){
             k.push(o) ;
             //this.allOPs.push(o);
            }
          })

        this.ops = A.concat(k);
      }, err => console.log(err));
    }, err => console.log(err));

     //membres
    this.database.getPlageDocs('fuma:op:membre','fuma:op:membre:\uffff').then((mbrA) => {

      this.database.getPlageDocs('koboSubmission_fuma-op-membre','koboSubmission_fuma-op-membre\uffff').then((mbrK) => {
        this.membres = mbrA.concat(mbrK);
      }, err => console.log(err));
    }, err => console.log(err));

  }

  validate_doc_update(){

     let doc = {

      _id: '_design/validate_doc_update',

      /*
      //Everybody can read, only some can write (everything)
      function (newDoc, oldDoc, userCtx) {
        var role = "blogger";
        if (userCtx.roles.indexOf("_admin") === -1 && userCtx.roles.indexOf(role) === -1) {
          throw({forbidden : "Only users with role " + role + " or an admin can modify this database."});
        }
      }*/


      //Everybody can read, only some can write (some things)
      function(newDoc, oldDoc, userCtx) {
        if (userCtx.roles.indexOf('_admin') === -1 && newDoc.user !== userCtx.name) {
          throw({forbidden : "doc.user must be the same as your username."});
        }
      }
     }
  }


  
  get_IDEssaisASupprimer(){
    let alert = this.alertCtl.create({
      title: 'Suppression multiple des essais',
      //cssClass: 'error',
      inputs: [
        {
          type: 'text',
          placeholder: 'Codes essais séparés par deux espaces (  )',
          name: 'code_essais',
          //value: info_db.ip
        },
      ],
      buttons: [
        {
          //cssClass: 'error-border',
          text: 'Annuler',
          role: 'Cancel',
          handler: () => console.log('Operation annulée annuler')
        },
        {
          text: 'Valider',
          handler: (data) => {
            this.supprimer(data.code_essais.toString().split('  '));
          }
        }
      ]
    }); 

    alert.present();
}



  supprimer(essai_ids){
    let model = this.loadtingCtl.create({
      content: 'Suppression des essais en cours...'
    });
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression Essais',
      message: 'Etes vous sûr de vouloir supprimer ces essais ?',
      inputs: [
        {
          type: 'checkbox',
          label: 'Supprimer définitivement!',
          value: 'oui',
          checked: false
          }
      ],
      buttons:[
        {
          text: 'Non',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Oui',
          handler: (data) => {
            model.present();
            if(data.toString() === 'oui'){
              //suppression complete
              essai_ids.forEach((id ) =>{
                
                this.database.getDocById('fuma:essai:' + id).then((essai) => {
                  if(essai && essai != ''){
                    this.database.deleteReturn(essai).then((res) => {
                
                    }, err => {
                      console.log(err)
                      model.dismiss()
                    }) ;
                  }
                  
                });
              });
              model.dismiss()
              
            }else{
              //corbeille
              essai_ids.forEach((id ) =>{
                this.database.getDocById('fuma:essai:' + id).then((essai) => {
                  if(essai && essai != ''){
                    this.database.deleteDocReturn(essai).then((res) => {
                    }, err => {
                      console.log(err)
                      model.dismiss()
                    }) ;
                  }
                });
              });
              model.dismiss()
            }
            
          }
        }
      ]
    });

    alert.present();
  }



  corrigerEssaiAvecGestionNombre(){
    let alert = this.alertCtl.create({
      title: 'Mise à jour essais avec ancien type protocole',
      //cssClass: 'error',
      inputs: [
        {
          type: 'text',
          placeholder: 'Code union',
          name: 'code_union',
          //value: info_db.ip
        },
      ],
      buttons: [
        {
          //cssClass: 'error-border',
          text: 'Annuler',
          role: 'Cancel',
          handler: () => console.log('Operation annulée annuler')
        },
        {
          text: 'Valider',
          handler: (data) => {
            this.doUpdate(data.code_union.toString());
          }
        }
      ]
    }); 

    alert.present();
}


doUpdate(code_union){
  let model = this.loadtingCtl.create({
    content: 'Application des changements en cours...'
  });
  model.present();

  this.database.getPlageDocsRapide('fuma:essai:', 'fuma:essai:\uffff').then((ess) => {
    if(ess){
      ess.forEach((essai) => {
        if(essai.doc.data.code_union == code_union){  
          for(let i = 0; i < essai.doc.data.cultures[0].variables_essai.length; i++){
            if(essai.doc.data.cultures[0].variables_essai[i].code_variable == 'gestion'){
              //essai
              essai.doc.data.cultures[0].variables_essai[i].choix_variable = ["Désherbage complet avec hilaire", "Désherbage complet avec houe", "Désherbage partiel"];
              if(essai.doc.data.cultures[0].variables_essai[i].valeur_variable == '1'){
                essai.doc.data.cultures[0].variables_essai[i].valeur_variable = 'Désherbage complet avec hilaire';
              }else if(essai.doc.data.cultures[0].variables_essai[i].valeur_variable == '2'){
                essai.doc.data.cultures[0].variables_essai[i].valeur_variable = 'Désherbage complet avec houe'; 
              }else if(essai.doc.data.cultures[0].variables_essai[i].valeur_variable == '3'){
                essai.doc.data.cultures[0].variables_essai[i].valeur_variable = 'Désherbage partiel'; 
              }
              //controle
              essai.doc.data.cultures[0].variables_controle[i].choix_variable = ["Désherbage complet avec hilaire", "Désherbage complet avec houe", "Désherbage partiel"];
              if(essai.doc.data.cultures[0].variables_controle[i].valeur_variable == '1'){
                essai.doc.data.cultures[0].variables_controle[i].valeur_variable = 'Désherbage complet avec hilaire';
              }else if(essai.doc.data.cultures[0].variables_controle[i].valeur_variable == '2'){
                essai.doc.data.cultures[0].variables_controle[i].valeur_variable = 'Désherbage complet avec houe'; 
              }else if(essai.doc.data.cultures[0].variables_controle[i].valeur_variable == '3'){
                essai.doc.data.cultures[0].variables_controle[i].valeur_variable = 'Désherbage partiel'; 
              }
            }else if(essai.doc.data.cultures[0].variables_essai[i].code_variable == 'DAP' || essai.doc.data.cultures[0].variables_essai[i].code_variable == 'NPK' ||essai.doc.data.cultures[0].variables_essai[i].code_variable == 'uree'){
              essai.doc.data.cultures[0].variables_essai[i].unite = 'tia';
              essai.doc.data.cultures[0].variables_controle[i].unite = 'tia';
            }
          }

          this.database.updateDoc(essai.doc);
        }
       // alert(essai.doc.data.code_op)
      })
      model.dismiss()
    }else{
      model.dismiss()
      alert('vide')
    } 
    
  }).catch((er) =>  {
    model.dismiss()
    alert(er)
  }
  )
}



  syncUsers(){
    //let ids: any = [];
    //ids.push(_id);

    this.storage.get('info_db').then((info_db) => {
      if(!info_db){
        //this.storage.set('ip_serveur', '127.0.0.1');
        info_db = global.info_db
      }//else{
        

        let alert = this.alertCtl.create({
          title: 'Information de connexion au du serveur',
          //cssClass: 'error',
          inputs: [
            {
              type: 'text',
              placeholder: 'Adrèsse hôte local',
              name: 'ip_local',
              value: info_db.ip
            },
            /*{
              type: 'text',
              placeholder: 'Nom DB',
              name: 'nom_db',
              value: '_users'
            },*/
            {
              type: 'text',
              placeholder: 'Nom admin local',
              name: 'username_local',
              //value: info_db.ip
            },
            {
              type: 'password',
              placeholder: 'Mot de passe admin local',
              name: 'passwd_local',
              //value: info_db.nom_db
            },
            {
              type: 'text',
              placeholder: 'Adrèsse hôte distant',
              name: 'ip_distant',
              value: '@ip:5984'
            },
            {
              type: 'text',
              placeholder: 'Nom admin distant',
              name: 'username_distant',
              //value: info_db.ip
            },
            {
              type: 'password',
              placeholder: 'Mot de passe admin distant',
              name: 'passwd_distant',
              //value: info_db.nom_db
            }
          ],
          buttons: [
            {
              //cssClass: 'error-border',
              text: 'Annuler',
              role: 'Cancel',
              handler: () => console.log('Sunc users annuler')
            },
            {
              text: 'Valider',
              handler: (data) => {
                if(data.ip_local != data.ip_distant){
                  this.database.syncUsersDB(data.ip_local, data.username_local, data.passwd_local, data.ip_distant, data.username_distant, data.passwd_distant);
                }else{
                  let toast = this.toastCtl.create({
                    message: 'Erreur, l\'adresse des serveurs local et distant doivent etre différent',
                    position: 'top',
                    duration: 2000,
                    showCloseButton: true,
                    closeButtonText: 'ok',
                    dismissOnPageChange: true
                      });
              
                      toast.present();
                }
              }
            }
          ] 
        });  
    
        alert.present();
      }).catch((err) => alert('Error, vous devez d\'abord déinir les info de la connexion au serveur local'));

    
  }


  addCodeOPPourChamp(){
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();

    this.database.getPlageDocsRapide('fuma:champs:', 'fuma:champs:\uffff').then((chs) => {
      if(chs){
        chs.forEach((ch) => {
          if(!ch.doc.data.code_op || ch.doc.data.code_op == ''){
            ch.doc.data.code_op = ch.doc.data.matricule_producteur.substr(ch.doc.data.matricule_producteur.indexOf('-') +1, ch.doc.data.matricule_producteur.indexOf(' ') -3)
            this.database.updateDoc(ch.doc);
            // alert(essai.doc.data.code_op)
          }
          
        })
        model.dismiss()
      }else{
        model.dismiss()
        alert('vide')
      } 
      
    }).catch((er) =>  {
      model.dismiss()
      alert(er)
    }
    )
  }

  addCodeOPPourTypologie(){
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();

    this.database.getPlageDocsRapide('fuma:typologie:', 'fuma:typologie:\uffff').then((tys) => {
      if(tys){
        tys.forEach((ty) => {
          if(!ty.doc.data.code_op || ty.doc.data.code_op == ''){
            ty.doc.data.code_op = ty.doc.data.matricule_producteur.substr(ty.doc.data.matricule_producteur.indexOf('-') +1, ty.doc.data.matricule_producteur.indexOf(' ') -3)
            this.database.updateDoc(ty.doc);
           // alert(essai.doc.data.code_op)
          }
          
        })
        model.dismiss()
      }else{
        model.dismiss()
        alert('vide')
      } 
      
    }).catch((er) =>  {
      model.dismiss()
      alert(er)
    }
    )
  }


  ajouterCodeOpPourOP(){
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();

    this.database.getPlageDocsRapide('fuma:op:', 'fuma:op:\uffff').then((ops) => {
      if(ops){
        ops.forEach((op) => {
          if(op.doc.data.type == 'op' && (!op.doc.data.code_op || op.doc.data.code_op == '')){
            op.doc.data.code_op = op.doc.data.code_OP
            this.database.updateDoc(op.doc);
          }
         // alert(essai.doc.data.code_op)
        })
        model.dismiss()
      }else{
        model.dismiss()
        alert('vide')
      } 
      
    }).catch((er) =>  {
      model.dismiss()
      alert(er)
    }
    )
  }


  updateEssaiDoubara(){
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();

    this.database.getPlageDocsRapide('fuma:essai:', 'fuma:essai:\uffff').then((ess) => {
      if(ess){
        ess.forEach((essai) => {
          if( essai.doc.data.annee_essai == '2018' && essai.doc.data.code_union == 'DO' && (essai.doc.data.code_op == 'HP' || essai.doc.data.code_op == 'TÉ' || essai.doc.data.code_op == 'BM' || essai.doc.data.code_op == 'DR' || essai.doc.data.code_op == 'HN' || essai.doc.data.code_op == 'LA') ){
            essai.doc.data.cultures[0].variables_essai.forEach((vr) => {
              if(vr.code_variable == 'gestion'){
                if(vr.valeur_variable && vr.valeur_variable != ""){
                  vr.valeur_variable = "Désherbage complet avec hilaire"
                }
                
                vr.choix_variable = ["Désherbage complet avec hilaire","Désherbage complet avec houe","Désherbage partiel"]
              }else if(vr.code_variable == 'DAP' || vr.code_variable == 'NPK' || vr.code_variable == 'uree'){
                vr.unite = "tia"
              }
            });

            essai.doc.data.cultures[0].variables_controle.forEach((vr) => {
              if(vr.code_variable == 'gestion'){
                if(vr.valeur_variable && vr.valeur_variable != ""){
                  vr.valeur_variable = "Désherbage complet avec hilaire"
                }
                vr.choix_variable = ["Désherbage complet avec hilaire","Désherbage complet avec houe","Désherbage partiel"]
              }else if(vr.code_variable == 'DAP' || vr.code_variable == 'NPK' || vr.code_variable == 'uree'){
                vr.unite = "tia"
              }
            })
            this.database.updateDoc(essai.doc);
          }
          
         // alert(essai.doc.data.code_op)
        })
        model.dismiss()
      }else{
        model.dismiss()
        alert('vide')
      } 
      
    }).catch((er) =>  {
      model.dismiss()
      alert(er)
    }
    )
  }


  addCodeOPPourEssai(){
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();

    this.database.getPlageDocsRapide('fuma:essai:', 'fuma:essai:\uffff').then((ess) => {
      if(ess){
        ess.forEach((essai) => {
          essai.doc.data.code_op = essai.doc.data.matricule_producteur.substr(essai.doc.data.matricule_producteur.indexOf('-') +1, essai.doc.data.matricule_producteur.indexOf(' ') -3)
          this.database.updateDoc(essai.doc);
         // alert(essai.doc.data.code_op)
        })
        model.dismiss()
      }else{
        model.dismiss()
        alert('vide')
      } 
      
    }).catch((er) =>  {
      model.dismiss()
      alert(er)
    }
    )
  }

  updateCommune(){
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();

    this.database.getPlageDocsRapide('fuma:essai:', 'fuma:essai:\uffff').then((docs) => {
      if(docs){
        docs.forEach((doc) => {
          if(doc.doc.data.type == 'essai'){
            if(doc.doc.data.site_producteur == 'Tachdoua'){
              doc.doc.data.site_producteur = 'Tchadoua';
              doc.doc.data.id_site_producteur = 'TC'
            }
            
            if(doc.doc.data.village_producteur == 'Tachdoua'){
              doc.doc.data.village_producteur = 'Tchadoua';
              doc.doc.data.id_village_producteur = 'TH'
            }

            this.database.updateDoc(doc.doc);
          }
        })

        this.database.getPlageDocsRapide('fuma:union:', 'fuma:union:\uffff').then((unions) => {
          if(unions){
            unions.forEach((doc) => {
              if(doc.doc.data.type == 'union'){
                if(doc.doc.data.commune_nom == 'Tachdoua'){
                  doc.doc.data.commune_nom = 'Tchadoua';
                  doc.doc.data.commune = 'TC' 
                } 

                if(doc.doc.data.village_nom == 'Tachdoua'){
                  doc.doc.data.village_nom = 'Tchadoua';
                  doc.doc.data.village = 'TH' 
                } 
                
                this.database.updateDoc(doc.doc);
              }
            })

          this.database.getPlageDocsRapide('fuma:op:', 'fuma:op:\uffff').then((ops) => {
            if(ops){
              ops.forEach((doc) => {
                if(doc.doc.data.type == 'op' || doc.doc.data.type == 'membre_op'){
                  if(doc.doc.data.commune_nom == 'Tachdoua'){
                    doc.doc.data.commune_nom = 'Tchadoua';
                    doc.doc.data.commune = 'TC' 
                  } 
  
                  if(doc.doc.data.village_nom == 'Tachdoua'){
                    doc.doc.data.village_nom = 'Tchadoua';
                    doc.doc.data.village = 'TH' 
                  } 
                  
                  this.database.updateDoc(doc.doc);
                }
              })
            }
            model.dismiss()
          })
        }
       })
      }else{
        model.dismiss()
      }
    }).catch((err) => {
      model.dismiss();
      alert(err)
    });
  }

  corrigerLongLat(){
    let selectedAnnee: any = '2017'
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();
    this.database.getPlageDocsRapide('fuma:essai:', 'fuma:essai:\uffff').then((ess) => {
      if(ess){
        ess.forEach((e) => {
          //if(e.doc.data.annee_essai == selectedAnnee && parseFloat(e.doc.data.longitude) < 9){
            let lat  = e.doc.data.longitude;
            e.doc.data.longitude =  e.doc.data.latitude;
            e.doc.data.latitude = lat;
            this.database.updateDoc(e.doc)
          //}
        });

        model.dismiss();
      }
    });
  }

  updateEssaiToNewForm(){
    let protocole: any;
    let cultureProtocole: any;
    let selectedAnnee = 2017;
    //let matricule_producteur = 'FM-BA 094-G'
    let Essai: EssaiType;
    let Culture_1: CultureType;
    let model = this.loadtingCtl.create({
      content: 'Application des changements en cours...'
    });
    model.present();

    this.database.getPlageDocsRapide('fuma:protocole', 'fuma:protocole:\uffff').then((p) => {
      if(p){
        let ps: any = [];
        for(let i = 0; i < p.length; i++){
          if(p[i].doc.data.annee == selectedAnnee){
            protocole = p[i].doc.data;
            //alert(protocole.code)
            break;
          }
        }        
        this.database.getPlageDocsRapide('fuma:culture-protocole', 'fuma:culture-protocole:\uffff').then((cp) => {
          if(cp){
           for(let i = 0; i < cp.length; i++){
            if(cp[i].doc.data.code_protocole == protocole.code){
              cultureProtocole = cp[i].doc.data;
              //alert(cultureProtocole.nom_culture)
              break;
            }
           }

           //ici faire les manipulations sur les essais
           this.database.getPlageDocsRapide('fuma:essai:', 'fuma:essai:\uffff').then((ess) => {
            if(ess){
              ess.forEach((e) => {
                if(!e.doc.data.code_protocole && e.doc.data.annee_essai == selectedAnnee){
                  //alert(e.doc._id)
                  Essai = new EssaiType();
                  Culture_1 = new CultureType();
                  
                  Essai.today = e.doc.data.today;
                  Essai.annee_essai=  e.doc.data.annee_essai;
                  Essai.type = e.doc.data.type;
                  Essai.code_essai = e.doc.data.code_essai;
    
                  //protocole
                  Essai.code_protocole = protocole.code;
                  Essai.nom_protocole = protocole.nom;
                  Essai.type_essais = protocole.type_essais;
                  Essai.type_culture = protocole.type_culture;
                  Essai.typologie = protocole.typologie;
                  Essai.annee_typologie = protocole.annee_typologie;
                  Essai.traitement = protocole.traitement;
              
                  //info producteur
                  Essai.matricule_producteur = e.doc.data.matricule_producteur;
                  Essai.nom_producteur = e.doc.data.nom_producteur;
                  Essai.surnom_producteur = e.doc.data.surnom_producteur;
                  Essai.sex_producteur = e.doc.data.sex_producteur;
                  Essai.code_union = e.doc.data.code_union;
                  Essai.code_op = e.doc.data.code_op;
                  Essai.site_producteur = e.doc.data.site_producteur;
                  Essai.id_site_producteur = e.doc.data.id_site_producteur;
                  Essai.id_village_producteur = e.doc.data.id_village_producteur; 
                  Essai.village_producteur = e.doc.data.village_producteur; 
              
                  //info traitement
                  Essai.id_traitement = e.doc.data.id_traitement;
                  Essai.code_traitement = e.doc.data.code_traitement;
                  Essai.nom_entree = e.doc.data.nom_entree;
                  Essai.nom_controle = e.doc.data.nom_controle;
                  //superficie_tr: any = null;
                  if(e.doc.data.nom_entree == 'OGA'){
                    Essai.superficie_standard = 400;
                  }else{
                    Essai.superficie_standard = 100;
                  }
                  
                  //superficie_essai: any = null;
              
                  //info champ
                  Essai.id_champs = e.doc.data.id_champs;
                  Essai.nom_champs = e.doc.data.nom_champs;
                  Essai.type_sole = e.doc.data.type_sole;
                  Essai.superficie = e.doc.data.superficie;
                  Essai.longitude = e.doc.data.longitude;
                  Essai.latitude = e.doc.data.latitude;
              
                  //info cultures
                  //cultures: Array<CultureType> = [];
                  /********************* debu a commenter apres */
                  //culture: any = null;// ---> migré dans culture essai
                  //superficie_essai: any = null;// ---> migré dans culture essai
                  //variete: any = null;// ---> migré dans culture essai
                  //variables:any = [];// ---> migré dans culture essai
                  /********************* fin a commenter apres */
              
                  //info généraux
                  Essai.systeme = null;
                  Essai.bloc = null;
                  Essai.parcelle = null;
                  Essai.repetition = null;
                  Essai.gerants = e.doc.data.gerants;
                  Essai.precedante_cultures = e.doc.data.precedante_cultures;
                  Essai.objectif_essai = e.doc.data.objectif_essai;
                  Essai.effort_personnel = e.doc.data.effort_personnel;
                  Essai.classes_producteur = e.doc.data.classes_producteur;
                  Essai.estValide = e.doc.data.estValide;
              
                  //info appareil et users
                  Essai.deviceid = e.doc.data.deviceid;
                  Essai.imei = e.doc.data.imei;
                  Essai.phonenumber = e.doc.data.phonenumber;
                  Essai.update_deviceid = e.doc.data.update_deviceid;
                  Essai.update_phonenumber = e.doc.data.update_phonenumber;
                  Essai.update_imei = e.doc.data.update_imei;
                  Essai.start = e.doc.data.start;
                  Essai.end = e.doc.data.end;
    
                  //Essai.superficie_standard = t.data.superficie;
                  Culture_1.variete = cultureProtocole.varietes[0];
                  Culture_1.superficie_essai = e.doc.data.superficie_essai;
                  Culture_1.superficie_controle = e.doc.data.superficie_essai;
                  Culture_1.culture = cultureProtocole.nom_culture;
                  Culture_1.variables_essai = this.clone(cultureProtocole.variables);
                  Culture_1.variables_essai[0].valeur_variable = e.doc.data.date_semis;
                  Culture_1.variables_essai[1].valeur_variable = e.doc.data.mode_semis;
                  Culture_1.variables_essai[2].valeur_variable = e.doc.data.NPL;
                  Culture_1.variables_essai[3].valeur_variable = e.doc.data.gestion;
                  Culture_1.variables_essai[4].valeur_variable = e.doc.data.date_recolte;
                  Culture_1.variables_essai[5].valeur_variable = e.doc.data.NPR;
                  Culture_1.variables_essai[6].valeur_variable = e.doc.data.PDE;
                  Culture_1.variables_essai[7].valeur_variable = e.doc.data.observation;
                  Culture_1.variables_controle = this.clone(cultureProtocole.variables);
                  Culture_1.variables_controle[0].valeur_variable = e.doc.data.date_semis_controle;
                  Culture_1.variables_controle[1].valeur_variable = e.doc.data.mode_semis_controle;
                  Culture_1.variables_controle[2].valeur_variable = e.doc.data.NPL_controle;
                  Culture_1.variables_controle[3].valeur_variable = e.doc.data.gestion_controle;
                  Culture_1.variables_controle[4].valeur_variable = e.doc.data.date_recolte;
                  Culture_1.variables_controle[5].valeur_variable = e.doc.data.NPR_controle;
                  Culture_1.variables_controle[6].valeur_variable = e.doc.data.PDE_controle;
                  Culture_1.variables_controle[7].valeur_variable = e.doc.data.observation_controle;
    
                  Essai.cultures.push(Culture_1);
                  let essaiFinal: any = {};
                  essaiFinal._id = e.doc._id;
                  essaiFinal._rev = e.doc._rev;
                  essaiFinal.data = Essai;
                  essaiFinal.data.created_at = e.doc.data.created_at;
                  essaiFinal.data.updatet_at = e.doc.data.updatet_at;
                  essaiFinal.data.created_by = e.doc.data.created_by
                  essaiFinal.data.updated_by = e.doc.data.updated_by;
                  essaiFinal.data.deleted = e.doc.data.deleted;
    
                  //alert(essaiFinal._id)
                  this.database.updateDocReturn(essaiFinal).catch((err) => alert(err));
                                  
                }
             }
            )
              model.dismiss();
            }
            });

          }else{
            model.dismiss();
          }
        });
      }else{
        model.dismiss();
      }
    });

  }

  viderCorbeille(){
    let loding = this.loadtingCtl.create({
      content: 'Suppresion en cours...'
    });

    loding.present();
    this.database.getAllDoc().then((docs) => {
      if(docs){
        docs.forEach((doc) => {
          if(doc.data && doc.data.deleted == true ){
            this.database.deleteReturn(doc);
          }
        });

        loding.dismiss();
      }else{
        loding.dismiss();
      }
    });
  }

  clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) {return obj};

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        let copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = this.clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        let copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}


  ajouterDesignDoc(){
    let filter_doc: any = {
      //Prend en parametre un tableau contenant la liste des code des union
          _id: '_design/filtrerDoc',
          filters: {
            myfilter: function (doc, req) {
              var public_doc_type = ['pays', 'region', 'commune', 'departement', 'village', 'type-sole', 'variete', 'culture', 'config-app'];
              var doc_pour_union_type = ['union', 'op', 'membre_op', 'champs', 'typologie', 'essai'];
              var doc_pour_protocole_type = ['protocole', 'culture-protocole', 'traitement'];
              
               
              /*//tous le monde a acces au filtre
              if(doc._id == '_design/filtrerDoc'/* || doc._deleted*****){
                return 1;
              }else*/
              //seul l'admin à accès à la totalité des inforamtions de la base de donnée
              if(doc._id == '_design/filtrerDoc' || (req.query.roles && req.query.roles.length && (req.query.roles.indexOf('admin') != -1) || (req.query.roles.indexOf('_admin') != -1))){
                return 1
              }else 
              //si pas moderateur
              if(req.query.roles.indexOf('moderateur') === -1){

                
                //localité et photos
                if(doc.type){
                  //acceder aux localités
                  if(public_doc_type.indexOf(doc.type) !== -1){
                    return 1;
                  }

                  //acceder aux photo des membres des unions autorisé
                  else if(doc.type == 'photo'){
                    //au cas ou la liste des ops est définie
                    if(req.query.codes_ops && req.query.codes_ops.length > 0 && doc.code_op){
                      return req.query.codes_ops.indexOf(doc.code_op) !== -1;
                    } else // la liste des unions seulement
                    if(req.query.codes_unions && req.query.codes_unions.length > 0 && doc.code_union){
                      return req.query.codes_unions.indexOf(doc.code_union) !== -1;
                    }/*else if(req.query.codes_unions && req.query.codes_unions.length > 0 && (!doc.code_union || doc.code_union == '')){
                      //pour les documement qu nom pas de code_union, les retoruner
                      return 1;
                    }*/
                  }else{
                    //return 'doc type probleme => '+doc._id
                    throw({forbidden: 'doc type probleme => '+doc._id})
                  }
                }
                
                
                //traitements, unions, ops, membres, champs, essais, protocole
                else if(doc.data && doc.data.type){
                  //pluviometrie par site
                  if(doc.data.type == 'pluviometrie' && req.query.sites && req.query.sites.length > 0){
                    return req.query.sites.indexOf(doc.data.commune + '-' + doc.data.commune_nom) !== -1;
                  }else
                  //acceder aux type de sole et variétés
                  if(public_doc_type.indexOf(doc.data.type) !== -1){
                    return 1;
                  }else 
                  //fitre du protocole
                  if(doc_pour_protocole_type.indexOf(doc.data.type) !== -1){
                    //si filtre défini
                    if(req.query.codes_protocoles && req.query.codes_protocoles.length > 0 && doc.data.type == 'protocole'){
                      //cas du protocole
                      return req.query.codes_protocoles.indexOf(doc.data.code) !== -1;
                    }else
                    if(req.query.codes_protocoles && req.query.codes_protocoles.length > 0 && doc.data.type != 'protocole'){
                      //cas des traitements et culture protocole
                      return req.query.codes_protocoles.indexOf(doc.data.code_protocole) !== -1;
                    }else
                    //si non défini
                      return 1;
                  }else
                  //acceder aux unions, ops, traitements, protocoles, membres, champs, essais et typologie autorisés à l'utilisateur à ltravers le code union
                  if(doc_pour_union_type.indexOf(doc.data.type) != -1){
                    
                     //au cas ou la liste des ops est définie
                      if(req.query.codes_unions && req.query.codes_unions.length > 0 && req.query.codes_ops && req.query.codes_ops.length > 0 && doc.data.code_op){
                        //pour les essais si le protocole est défini
                        if(doc.data.type == 'essai' && req.query.codes_protocoles && req.query.codes_protocoles.length > 0){
                          return (req.query.codes_unions.indexOf(doc.data.code_union) !== -1 && req.query.codes_ops.indexOf(doc.data.code_op) !== -1 && req.query.codes_protocoles.indexOf(doc.data.code_protocole) !== -1);
                        }else{
                          return (req.query.codes_unions.indexOf(doc.data.code_union) !== -1 && req.query.codes_ops.indexOf(doc.data.code_op) !== -1);
                        }
                      } else // la liste des unions seulement
                      if(req.query.codes_unions && req.query.codes_unions.length > 0 && doc.data.code_union){

                        //au cas ou la liste des ops est définie
                      //if(req.query.codes_ops && req.query.codes_ops.length > 0 && doc.data.code_op){
                        //pour les essais si le protocole est défini
                        if(doc.data.type == 'essai' && req.query.codes_protocoles && req.query.codes_protocoles.length > 0){
                          return (req.query.codes_unions.indexOf(doc.data.code_union) !== -1 && req.query.codes_protocoles.indexOf(doc.data.code_protocole) !== -1);
                        }else{
                          return req.query.codes_unions.indexOf(doc.data.code_union) !== -1;
                        }
                      //}
                      /*else if(req.query.codes_unions && req.query.codes_unions.length > 0 && (!doc.data.code_union || doc.data.code_union == '')){
                      //pour les documement qu nom pas de code_union, les retoruner
                      return 1;
                      }*/
                  }else{
                    //throw({forbidden: 'doc.data ou doc.data.type => '+doc._id})
                    //return 'doc.data'
                  }
                }else{
                  //throw({forbidden: 'erreur incomprise => '+doc._id})
                }

                //fin public doc
                
              }//fin data doc
            }//fin user filter
            }.toString()
          }
        }

        global.remoteSaved.get('_design/filtrerDoc').then((doc) => {
          if(doc && doc._id){
            //doc existe
            //this.database.remote(doc)
            filter_doc._rev = doc._rev;
            global.remoteSaved.put(filter_doc).then((res) => alert('Filter mise à jour avec succes')).catch((err) => alert('erreur mise à jour du filter du filter '+err));
          }else{
            //créer le filtre de base
            //this.ajouterDesignDoc();
            global.remoteSaved.put(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter '+err));
          }
          
        }).catch((err) => {
          //alert(err)
          //this.ajouterDesignDoc();
          global.remoteSaved.put(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter '+err));
        });
    

        //global.remoteSaved.put(filter_doc).catch((err) => alert('erreur vers server '+err));
        //this.database.put(doc, doc._id).catch((err) => alert('erreur vers local '+err));
  }

  ajouterLoalDesignDoc(){
    let filter_doc: any = {
      //Prend en parametre un tableau contenant la liste des code des union
          _id: '_design/filtrerDoc',
          filters: {
            myfilter: function (doc, req) {
              var public_doc_type = ['pays', 'region', 'commune', 'departement', 'village', 'type-sole', 'variete', 'culture', 'config-app'];
              var doc_pour_union_type = ['union', 'op', 'membre_op', 'champs', 'typologie', 'essai'];
              var doc_pour_protocole_type = ['protocole', 'culture-protocole', 'traitement'];
              
               
              /*//tous le monde a acces au filtre
              if(doc._id == '_design/filtrerDoc'/* || doc._deleted*****){
                return 1;
              }else*/
              //seul l'admin à accès à la totalité des inforamtions de la base de donnée
              if(doc._id == '_design/filtrerDoc' || (req.query.roles && req.query.roles.length && (req.query.roles.indexOf('admin') != -1) || (req.query.roles.indexOf('_admin') != -1))){
                return 1
              }else 
              //si pas moderateur
              if(req.query.roles.indexOf('moderateur') === -1){

                //localité et photos
                if(doc.type){
                  //acceder aux localités
                  if(public_doc_type.indexOf(doc.type) !== -1){
                    return 1;
                  }

                  //acceder aux photo des membres des unions autorisé
                  else if(doc.type == 'photo'){
                    //au cas ou la liste des ops est définie
                    if(req.query.codes_ops && req.query.codes_ops.length > 0 && doc.code_op){
                      return req.query.codes_ops.indexOf(doc.code_op) !== -1;
                    } else // la liste des unions seulement
                    if(req.query.codes_unions && req.query.codes_unions.length > 0 && doc.code_union){
                      return req.query.codes_unions.indexOf(doc.code_union) !== -1;
                    }/*else if(req.query.codes_unions && req.query.codes_unions.length > 0 && (!doc.code_union || doc.code_union == '')){
                      //pour les documement qu nom pas de code_union, les retoruner
                      return 1;
                    }*/
                  }else{
                    //return 'doc type probleme => '+doc._id
                    throw({forbidden: 'doc type probleme => '+doc._id})
                  }
                }
                
                
                //traitements, unions, ops, membres, champs, essais, protocole
                else if(doc.data && doc.data.type){
                  //pluviometrie par site
                  if(doc.data.type == 'pluviometrie' && req.query.sites && req.query.sites.length > 0){
                    return req.query.sites.indexOf(doc.data.commune + '-' + doc.data.commune_nom) !== -1;
                  }else
                  //acceder aux type de sole et variétés
                  if(public_doc_type.indexOf(doc.data.type) !== -1){
                    return 1;
                  }else 
                  //fitre du protocole
                  if(doc_pour_protocole_type.indexOf(doc.data.type) !== -1){
                    //si filtre défini
                    if(req.query.codes_protocoles && req.query.codes_protocoles.length > 0 && doc.data.type == 'protocole'){
                      //cas du protocole
                      return req.query.codes_protocoles.indexOf(doc.data.code) !== -1;
                    }else
                    if(req.query.codes_protocoles && req.query.codes_protocoles.length > 0 && doc.data.type != 'protocole'){
                      //cas des traitements et culture protocole
                      return req.query.codes_protocoles.indexOf(doc.data.code_protocole) !== -1;
                    }else
                    //si non défini
                      return 1;
                  }else
                  //acceder aux unions, ops, traitements, protocoles, membres, champs, essais et typologie autorisés à l'utilisateur à ltravers le code union
                  if(doc_pour_union_type.indexOf(doc.data.type) != -1){
                    
                     //au cas ou la liste des ops est définie
                      if(req.query.codes_unions && req.query.codes_unions.length > 0 && req.query.codes_ops && req.query.codes_ops.length > 0 && doc.data.code_op){
                        //pour les essais si le protocole est défini
                        if(doc.data.type == 'essai' && req.query.codes_protocoles && req.query.codes_protocoles.length > 0){
                          return (req.query.codes_unions.indexOf(doc.data.code_union) !== -1 && req.query.codes_ops.indexOf(doc.data.code_op) !== -1 && req.query.codes_protocoles.indexOf(doc.data.code_protocole) !== -1);
                        }else{
                          return (req.query.codes_unions.indexOf(doc.data.code_union) !== -1 && req.query.codes_ops.indexOf(doc.data.code_op) !== -1);
                        }
                      } else // la liste des unions seulement
                      if(req.query.codes_unions && req.query.codes_unions.length > 0 && doc.data.code_union){

                        //au cas ou la liste des ops est définie
                      //if(req.query.codes_ops && req.query.codes_ops.length > 0 && doc.data.code_op){
                        //pour les essais si le protocole est défini
                        if(doc.data.type == 'essai' && req.query.codes_protocoles && req.query.codes_protocoles.length > 0){
                          return (req.query.codes_unions.indexOf(doc.data.code_union) !== -1 && req.query.codes_protocoles.indexOf(doc.data.code_protocole) !== -1);
                        }else{
                          return req.query.codes_unions.indexOf(doc.data.code_union) !== -1;
                        }
                      //}
                      /*else if(req.query.codes_unions && req.query.codes_unions.length > 0 && (!doc.data.code_union || doc.data.code_union == '')){
                      //pour les documement qu nom pas de code_union, les retoruner
                      return 1;
                      }*/
                  }else{
                    //throw({forbidden: 'doc.data ou doc.data.type => '+doc._id})
                    //return 'doc.data'
                  }
                }else{
                  //throw({forbidden: 'erreur incomprise => '+doc._id})
                }

                //fin public doc
                
              }//fin data doc
            }//fin user filter
            }.toString()
          }
        }

        this.database.getDocById('_design/filtrerDoc').then((doc) => {
          if(doc && doc._id){
            //doc existe
            //this.database.remote(doc)
            filter_doc._id = '_design/filtrerDoc';
            filter_doc._rev = doc._rev;
            this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter mise à jour avec succes')).catch((err) => alert('erreur mise à jour du filter du filter => '+err));
          }else{
            //créer le filtre de base
            //this.ajouterDesignDoc();
            filter_doc._id = '_design/filtrerDoc';
            this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter => '+err));
          }
          
        }).catch((err) => {
          //alert(err)
          //this.ajouterDesignDoc();
          filter_doc._id = '_design/filtrerDoc';
          this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter '+err));
        });
    

        //global.remoteSaved.put(filter_doc).catch((err) => alert('erreur vers server '+err));
        //this.database.put(doc, doc._id).catch((err) => alert('erreur vers local '+err));
  }

  ajouterLoalDesignDocOld(){
    let filter_doc: any = {
      //Prend en parametre un tableau contenant la liste des code des union
          _id: '_design/filtrerDoc',
          filters: {
            myfilter: function (doc, req) {
              var public_doc_type = ['pays', 'region', 'commune', 'departement', 'village', 'traitement', 'type-sole', 'protocole', 'variete', 'culture', 'config-app', 'culture-protocole'];
              var doc_pour_union_type = ['union', 'op', 'membre_op', 'champs', 'essai', 'typologie'];
              /*//tous le monde a acces au filtre
              if(doc._id == '_design/filtrerDoc'/* || doc._deleted*****){
                return 1;
              }else*/
              //seul l'admin à accès à la totalité des inforamtions de la base de donnée
              if(doc._id == '_design/filtrerDoc' || (req.query.roles && req.query.roles.length && (req.query.roles.indexOf('admin') != -1) || (req.query.roles.indexOf('_admin') != -1))){
                return 1
              }else{

                //localité et photos
                if(doc.type){
                  //acceder aux localités
                  if(public_doc_type.indexOf(doc.type) !== -1){
                    return 1;
                  }

                  //acceder aux photo des membres des unions autorisé
                  else if(doc.type == 'photo'){
                    //au cas ou la liste des ops est définie
                    if(req.query.codes_ops && req.query.codes_ops.length > 0 && doc.code_op){
                      return req.query.codes_ops.indexOf(doc.code_op) !== -1;
                    } else // la liste des unions seulement
                    if(req.query.codes_unions && req.query.codes_unions.length > 0 && doc.code_union){
                      return req.query.codes_unions.indexOf(doc.code_union) !== -1;
                    }/*else if(req.query.codes_unions && req.query.codes_unions.length > 0 && (!doc.code_union || doc.code_union == '')){
                      //pour les documement qu nom pas de code_union, les retoruner
                      return 1;
                    }*/
                  }else{
                    //return 'doc type probleme => '+doc._id
                    throw({forbidden: 'doc type probleme => '+doc._id})
                  }
                }
                
                
                //traitements, unions, ops, membres, champs et essais
                else if(doc.data && doc.data.type){
                  //acceder aux traitements, type de sole et variétés
                  if(public_doc_type.indexOf(doc.data.type) !== -1){
                    return 1;
                  }else
                  //acceder aux unions, ops, membres, champs, essais et typologie autorisés à l'utilisateur à ltravers le code union
                  if(doc_pour_union_type.indexOf(doc.data.type) != -1){
                    
                     //au cas ou la liste des ops est définie
                      if(req.query.codes_ops && req.query.codes_ops.length > 0 && doc.data.code_op && doc.data.type != 'union'){
                        return req.query.codes_ops.indexOf(doc.data.code_op) !== -1;
                      } else // la liste des unions seulement
                      if(req.query.codes_unions && req.query.codes_unions.length > 0 && doc.data.code_union){
                        return req.query.codes_unions.indexOf(doc.data.code_union) !== -1;
                      }/*else if(req.query.codes_unions && req.query.codes_unions.length > 0 && (!doc.data.code_union || doc.data.code_union == '')){
                      //pour les documement qu nom pas de code_union, les retoruner
                      return 1;
                      }*/
                  }else{
                    throw({forbidden: 'doc.data ou doc.data.type => '+doc._id})
                    //return 'doc.data'
                  }
                }else{
                  //throw({forbidden: 'erreur incomprise => '+doc._id})
                }
                
              }
            }.toString()
          }
        }

        this.database.getDocById('_design/filtrerDoc').then((doc) => {
          if(doc && doc._id){
            //doc existe
            //this.database.remote(doc)
            filter_doc._id = '_design/filtrerDoc';
            filter_doc._rev = doc._rev;
            this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter mise à jour avec succes')).catch((err) => alert('erreur mise à jour du filter du filter => '+err));
          }else{
            //créer le filtre de base
            //this.ajouterDesignDoc();
            filter_doc._id = '_design/filtrerDoc';
            this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter => '+err));
          }
          
        }).catch((err) => {
          //alert(err)
          //this.ajouterDesignDoc();
          filter_doc._id = '_design/filtrerDoc';
          this.database.createSimpleDocReturn(filter_doc).then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter '+err));
        });
    

        //global.remoteSaved.put(filter_doc).catch((err) => alert('erreur vers server '+err));
        //this.database.put(doc, doc._id).catch((err) => alert('erreur vers local '+err));
  }

  existeFilter(){
    if(global.info_user && global.info_user.roles && (global.info_user.roles.indexOf('admin') || global.info_user.roles.indexOf('_admin'))){
      return true
    }else{
      this.database.getDocById('_design/filtrerDoc').then((doc) => {
        if(doc && doc._id){
          return true;
        }
        return false
      });
    }
    
  }


  removeAncienFilter(){
    this.database.getDocById('_design/filtrerDocByCodesUnions').then((doc) => {
      if(doc){
        //doc existe
        //this.database.remote(doc)
        this.database.remove('_design/filtrerDocByCodesUnions').then((res)=> alert('Filter trouvé et supprimer')).catch((err) => alert('erreur suppression du filter => '+err));
      }else{
        //créer le filtre de base
        //this.ajouterDesignDoc();
        alert('Filter non trouvé')
      }
      
    }).catch((err) => {
      //alert(err)
      //this.ajouterDesignDoc();
      alert('Filter non trouvé => '+err)
    });
  }

  removeNouveauFilter(){
    this.database.getDocById('_design/filtrerDoc').then((doc) => {
      if(doc){
        //doc existe
        //this.database.remote(doc)
        this.database.remove('_design/filtrerDoc').then((res)=> alert('Filter trouvé et supprimer')).catch((err) => alert('erreur suppression du filter => '+err));
      }else{
        //créer le filtre de base
        //this.ajouterDesignDoc();
        alert('Filter non trouvé')
      }
      
    }).catch((err) => {
      //alert(err)
      //this.ajouterDesignDoc();
      alert('Filter non trouvé => '+err)
    });
  }

  compacteRemoteDB(){
    this.database.compacteRemoteDB();
  }

  compacteLoacalDB(){
    this.database.compacteLocalDB();
  }


  ajouterNomUnionPourMembres(unions, membres){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });
    model.present();

    membres.forEach((mbr) => {
          //compter les OP
      for(let i = 0; i < unions.length; i++) {
        if((!mbr.data.code_union || mbr.data.code_union == '') && unions[i].data.code_union === mbr.data.code_union){
          mbr.data.nom_union = unions[i].data.nom_union;
          this.database.updateDoc(mbr);
          break;
        }
      }
    });

    model.dismiss();
  }
  

  
  ajouterNomOpPourMembres(ops, membres){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });
    model.present();

    membres.forEach((mbr) => {
          //compter les OP
      for(let i = 0; i < ops.length; i++) {
        if((!mbr.data.op_nom || mbr.data.op_nom == '') && (ops[i].data.code_op === mbr.data.code_op) && (ops[i].data.code_union === mbr.data.code_union)){
          mbr.data.op_nom = ops[i].data.nom_OP;
          //mbr.data.op_nom = ops[i].data.nom_OP;
          this.database.updateDoc(mbr);
          break;
        }
      }
    });

    model.dismiss();
  }
  


  ajouterCodeOpPourMembres(membres){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });

    model.present();
    membres.forEach((membre) => {
      if(!membre.data.code_op || membre.data.code_op == ''){
        membre.data.code_op = membre.data.matricule_Membre.substr(membre.data.matricule_Membre.indexOf('-') +1, membre.data.matricule_Membre.indexOf(' ') -3)
        this.database.updateDoc(membre);
      }
      
    });
    model.dismiss();
  }


  
  ajouterCodeOpDansPhoto(membres){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });

    model.present();
    //this.database.getPlageDocs('fuma:photo:membre', 'fuma:photo:membre:\uffff').then((ats) => {
      membres.forEach((membre) => {
        if(membre.data.photoID){
          this.database.getDocById(membre.data.photoID).then((at) => {
            if(at && (!at.code_op || at.code_op == '')){
              at.type = 'photo'
              at.code_op = membre.data.code_op;
              this.database.put(at, at._id);
            }
          }) ;
        }
        
        model.dismiss();      
      });
      //model.dismiss();
   // });


  }


  
  ajouterCodeunionDansPhoto(membres){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });

    model.present();
    //this.database.getPlageDocs('fuma:photo:membre', 'fuma:photo:membre:\uffff').then((ats) => {
      membres.forEach((membre) => {
        if(membre.data.photoID){
          this.database.getDocById(membre.data.photoID).then((at) => {
            if(at){
              at.type = 'photo'
              at.code_union = membre.data.code_union;
              this.database.put(at, at._id);
            }
          }) ;
        }
        
        model.dismiss();      
      });
      //model.dismiss();
   // });
  }


  ramenerMembreDansLaBonneOP(membres){
    
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });

    model.present();
    membres.forEach((membre) => {
      let code_op = membre._id.toString().substring(membre._id.toString().indexOf('-') +1, membre._id.toString().indexOf(' '))
      //alert(code_op+' -- '+membre.data.op_code)
      
      if(code_op !== membre.data.op_code){
        
        let id = 'fuma:op:membre:' +membre.data.op_code + ':' + membre.data.matricule_Membre;
        alert(code_op+' -- '+membre.data.op_code+'id='+membre._id+' new='+id)
        //sauvegarder les ancienne donnees
        let data: any = membre.data;
        //supprimer l'ancien membre
        this.database.deleteDoc(membre);
        //restaurer les anciennes donnees
        membre = {};
        membre._id = id;
        membre.data = data;
        this.database.updateDoc(membre)
      }
    });

    model.dismiss();
  }
 

  ajouterCodeUnionPourMembres(ops, membres){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });

    model.present();
     ops.forEach((op, indexO) => {
          //compter les OP
      membres.forEach((membre) => {
        if(membre.data.op === op.data.num_aggrement){
            membre.data.op_code = op.data.code_OP;
            membre.data.op_nom = op.data.nom_OP;
            membre.data.code_union = op.data.code_union;
            this.database.updateDoc(membre);
          }
      });
    });

    model.dismiss();
  }

  ajouterCodeUnionPourOps(unions, ops){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });
    model.present();

     unions.forEach((union) => {
          //compter les OP
      ops.forEach((op) => {
        if(union.data.num_aggrement === op.data.union){
          op.data.code_union = union.data.code_union;
          this.database.updateDoc(op);
        }
      });
    });

    model.dismiss();
  }

  ajouterCodeUnionPourChamps(membres){
    let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });

    model.present();
    let champs: any = [];
    this.database.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((c) => {
      if(c){
        champs = c;
        membres.forEach((membre, indexO) => {
          //compter les OP
          champs.forEach((ch) => {
            if(membre.data.matricule_Membre === ch.doc.data.matricule_producteur){
                ch.doc.data.code_union = membre.data.code_union;
                this.database.updateDoc(ch.doc);
              }
          });
        });

        model.dismiss();
      }else{
        model.dismiss();
      }
    });

  }

    ajouterCodeUnionPourEssais(membres){
      let model = this.loadtingCtl.create({
      content: 'Appliction des modifiactions en cours...'
    });

    model.present();
    let essais: any = [];
    this.database.getPlageDocsRapide('fuma:essai','fuma:essai:\uffff').then((e) => {
      if(e){
        essais = e;
        membres.forEach((membre, indexO) => {
          //compter les OP
          essais.forEach((es) => {
            if(membre.data.matricule_Membre === es.doc.data.matricule_producteur){
                es.doc.data.code_union = membre.data.code_union;
                this.database.updateDoc(es.doc);
              }
          });
        });

        model.dismiss()
      }else{
        model.dismiss()
      }
    });

  }

  infoStructure(){
    let model = this.modalCtl.create('ConfigAppPage');
    model.present();
  }

  gestionPays(){
    let model = this.modalCtl.create('AjouterPaysPage', {'liste': true});
    model.present();
  }

  gestionRegions(){
    let model = this.modalCtl.create('AjouterRegionPage', {'liste': true});
    model.present();
  }

  gestionDepartements(){
    let model = this.modalCtl.create('AjouterDepartementPage', {'liste': true});
    model.present();
  }

  gestionCommunes(){
    let model = this.modalCtl.create('AjouterCommunePage', {'liste': true});
    model.present();
  }

  gestionVillages(){
    let model = this.modalCtl.create('AjouterVillagePage', {'liste': true});
    model.present();
  }


  culture(){
    this.navCtrl.push('CulturePage')
  }
  variete(){
    this.navCtrl.push('VarietePage')
  }

  fusionnerEssais(){
    let loading = this.loadtingCtl.create({
      content: 'Application des changeme,ts sur les essais en cours...'
    });
    loading.present();

    let tous_essais: any = [];
    let tous_essais2: any = [];
    //let tous_membres: any = [];
    let essais_membre: any = [];
    //let nb_essais_membres: any;
    //let nbm: any = 0;
    let essai1: any = {};
    let essai2: any = {};
    this.database.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then((membres) => {
      if(membres){
        //tous_membres = membres;
        //this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
        //  if(essais){
          //  tous_essais = essais;
            //tous_essais2 = essais;
            //alert('nbm l '+membres.length)
            //alert('nbe l '+essais.length)
            membres.map((membre) => {
              essais_membre = [];
              //nb_essais_membres = 0;
              this.database.getPlageDocsRapide('fuma:essai:'+membre.doc.data.matricule_Membre, 'fuma:essai:'+membre.doc.data.matricule_Membre+' \uffff').then((essais_mb) => {
                if(essais_mb){
                  essais_membre = essais_mb;

                  //if(essais_membre.length){
                  let nb_essais_membres: any = essais_membre.length;
                  //tous_essais = tous_essais2;
                  //}else{
                  //  nb_essais_membres = 0;
                  //}
                  
                  //if(nb_essais_membres > 1){
                    //alert('nb_essais_membres = '+nb_essais_membres)
                    while(nb_essais_membres > 1){
                      essai1 = essais_membre[0].doc;
                      //essai2 = '';
                      essais_membre.splice(0, 1);
                      nb_essais_membres--;
                      
                      if(essai1.data.nom_entree ===  'Boule NPK'){
                        for(let ii = 0; ii < essais_membre.length; ii++) {
                          //alert(essai1.data.nom_entree +' '+ essais_membre[ii].data.nom_entree)
                          if(essais_membre[ii].doc.data.nom_entree ===  'Semis ordinaire '){
                            //alert(essai1.data.nom_entree + '===> '+essais_membre[ii].data.nom_entree);
                            essai2 = essais_membre[ii].doc;
                            
                            essai1.data.NPL_controle = essai2.data.NPL;
                            essai1.data.NPR_controle = essai2.data.NPR;
                            essai1.data.PDE_controle = essai2.data.PDE;

                            this.database.updateDoc(essai1);
                            this.database.deleteDoc(essai2)
                            essais_membre.splice(ii, 1);
                            nb_essais_membres--;

                            //essai2 = '';

                            //ii = essais_membre.length;
                            break;
                          }
                        }

                      }else if(essai1.data.nom_entree ===  'Boule cendre'){
                        for(let ii = 0; ii < essais_membre.length; ii++) {
                          if(essais_membre[ii].doc.data.nom_entree ===  'Semis ordinaire '){
                           // alert(essai1.data.nom_entree + '===> '+essais_membre[ii].data.nom_entree)
                            essai2 = essais_membre[ii].doc;
                          
                            essai1.data.NPL_controle = essai2.data.NPL;
                            essai1.data.NPR_controle = essai2.data.NPR;
                            essai1.data.PDE_controle = essai2.data.PDE;

                            this.database.updateDoc(essai1);
                            this.database.deleteDoc(essai2);

                            essais_membre.splice(ii, 1);
                            nb_essais_membres--;

                            //essai2 = '';

                            //ii = essais_membre.length;
                            break;
                          }
                        }

                      
                      }else if(essai1.data.nom_entree ===  'Semis ordinaire '){
                        for(let ii = 0; ii < essais_membre.length; ii++) {
                          if(essais_membre[ii].doc.data.nom_entree ===  'Boule cendre' || essais_membre[ii].doc.data.nom_entree ===  'Boule NPK'){
                            essai2 = essais_membre[ii].doc;
                            //alert(essai1.data.nom_entree + '===> '+essais_membre[ii].data.nom_entree)
                            
                            essai2.data.NPL_controle = essai1.data.NPL;
                            essai2.data.NPR_controle = essai1.data.NPR;
                            essai2.data.PDE_controle = essai1.data.PDE;

                            this.database.updateDoc(essai2);
                            this.database.deleteDoc(essai1)
                            essais_membre.splice(ii, 1);
                            nb_essais_membres--;


                            //ii = essais_membre.length;
                            break;
                          }
                        }
                      }else if(essai1.data.nom_entree ===  'OGA'){
                        for(let ii = 0; ii < essais_membre.length; ii++) {
                          if(essais_membre[ii].doc.data.nom_entree ===  'SANS OGA'){
                            essai2 = essais_membre[ii].doc;
                            //alert(essai1.data.nom_entree + '===> '+essais_membre[ii].data.nom_entree)
                            
                            essai1.data.NPL_controle = essai2.data.NPL;
                            essai1.data.NPR_controle = essai2.data.NPR;
                            essai1.data.PDE_controle = essai2.data.PDE;

                            this.database.updateDoc(essai1);
                            this.database.deleteDoc(essai2);

                            essais_membre.splice(ii, 1);
                            nb_essais_membres--;


                            //ii = essais_membre.length;
                            break;
                          }
                        }                  
                      }else if(essai1.data.nom_entree ===  'SANS OGA'){
                        for(let ii = 0; ii < essais_membre.length; ii++) {
                          if(essais_membre[ii].doc.data.nom_entree ===  'OGA'){
                            essai2 = essais_membre[ii].doc;
                            //alert(essai1.data.nom_entree + '===> '+essais_membre[ii].data.nom_entree)
                            essai2.data.NPL_controle = essai1.data.NPL;
                            essai2.data.NPR_controle = essai1.data.NPR;
                            essai2.data.PDE_controle = essai1.data.PDE;

                            this.database.updateDoc(essai2);
                            this.database.deleteDoc(essai1);

                            essais_membre.splice(ii, 1);
                            nb_essais_membres--;

                            //ii = essais_membre.length;
                            break;
                          }
                        }
                      }
                    }
                    }
              });

              
             /* tous_essais.forEach((e, i) => {
                if(e.doc.data.matricule_producteur === membre.doc.data.matricule_Membre){
                  essais_membre.push(e.doc);
                  tous_essais2.splice(i, 1);
                }
              });*/
             

                
             // }
            // nbm++;
            });


            loading.dismissAll();

            //alert('nbm '+nbm)

             let toast = this.toastCtl.create({
                message: 'Changement bien appliqué!',
                position: 'top',
                duration: 3000
              });

              toast.present();
         // }
      //  });
      }
    });
  }

  reorganiser_coordonnees(){

    let loading = this.loadtingCtl.create({
      content: 'Application des changements sur les coordonnées en cours...'
    });
    loading.present();
    this.database.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
      if(essais){
        essais.map((ess) => {
          if(ess.doc.data.longitude && ess.doc.data.longitude !== ''){
            let tmp = ess.doc.data.longitude;
            ess.doc.data.longitude = ess.doc.data.latitude;
            ess.doc.data.latitude = tmp;
            this.database.updateDoc(ess.doc);

          }
        });
      }
    });
    
    
    this.database.getPlageDocsRapide('fuma:champs', 'fuma:champs:\uffff').then((champs) => {
      if(champs){
        champs.map((ch) => {
          if(ch.doc.data.longitude && ch.doc.data.longitude !== ''){
            let tmp = ch.doc.data.longitude;
            ch.doc.data.longitude = ch.doc.data.latitude;
            ch.doc.data.latitude = tmp;
            this.database.updateDoc(ch.doc);
          }

        });
       loading.dismissAll();
       this.affichierMsg('Coordonnées mises à jour') 
      }
    });
    
  }


    completer_controle_essai(){

    let loading = this.loadtingCtl.create({
      content: 'Application des changements sur les essais en cours...'
    });
    loading.present();
    this.database.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
      if(essais){
        essais.map((ess) => {
          ess.doc.data.date_semis_controle = ess.doc.data.date_semis;
          ess.doc.data.gestion_controle = ess.doc.data.gestion;
          ess.doc.data.mode_semis_controle = ess.doc.data.mode_semis;
          this.database.updateDoc(ess.doc);
        });

      loading.dismissAll();
       this.affichierMsg('Essais mis à jour') 
      }
    });
        
  }


  mise_a_jour_code_union_op(){

    let loading = this.loadtingCtl.create({
      content: 'Application des changements sur les ops en cours...'
    });
    loading.present();
    this.database.getPlageDocsRapide('fuma:union','fuma:union:\uffff').then((unions) => {
      if(unions){
        let ops: any = [];
        this.database.getPlageDocsRapide('fuma:op','fuma:op:\uffff').then((opsA) => {
          if(opsA){
            //opss = ops;
            opsA.forEach((o, index) => {
              if(!o.doc.data.op/* || o.data.op !== ''*/){
                ops.push(o)
              }
          });

          unions.forEach((union, i) => {
            ops.forEach((op, i) => {
              if(union.doc.data.num_aggrement === op.doc.data.union){
                op.doc.data.code_union = union.doc.data.code_union;
                this.database.updateDoc(op.doc);
              }
            })
          });
          loading.dismissAll();
          this.affichierMsg('Ops mis à jour')

        }
      });
      }
    });
    

  }

  mise_a_jour_mbr(){

    let loading = this.loadtingCtl.create({
      content: 'Application des changements sur les membres en cours...'
    });
    loading.present();
    this.database.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then((membres) => {
      if(membres){
        let ops: any = [];
       this.database.getPlageDocsRapide('fuma:op','fuma:op:\uffff').then((opsA) => {
        if(opsA){
          //opss = ops;
          opsA.forEach((o, index) => {
            if(!o.doc.data.op/* || o.data.op !== ''*/){
              ops.push(o)
            }
         });

          let mbrs: any = [];
          let m: any = {};
          mbrs = membres;
          //ops.forEach((op) =>  {
           // if(op.doc.data.type === 'op'){
              
             membres.forEach((membre, i) => {

              if(membre.doc.data.op_code && membre.doc.data.op_code !== ''){
                m._id = 'fuma:op:membre:' + membre.doc.data.op_code + ':' + membre.doc.data.matricule_Membre;
                m.data = membre.doc.data;
                this.database.deleteDoc(membre.doc);
                this.database.updateDocReturn(m).then((res) => {
                  //this.database.deleteDoc(membre.doc);
                  //this.database.deleteDoc(membre.doc);
                }, err => {
                  //this.database.deleteDoc(membre.doc);
                  
                });

                //membres.splice(i, 1);
                m = {};
              }else{
                for(let j=0; j < ops.length; j++){
                  if(membre.doc.data.op === ops[j].doc.data.num_aggrement){
                    membre.doc.data.op_code = ops[j].doc.data.code_OP;

                    m._id = 'fuma:op:membre:' + membre.doc.data.op_code + ':' + membre.doc.data.matricule_Membre;
                    m.data = membre.doc.data;
                    this.database.deleteDoc(membre.doc);
                    this.database.updateDocReturn(m).then((res) => {
                      //this.database.deleteDoc(membre.doc);
                      //this.database.deleteDoc(membre.doc);
                    }, err => {
                      //this.database.deleteDoc(membre.doc);
                      
                    });

                    //membres.splice(i, 1);
                    m = {};
                    break;
                    
                  }
                }
              }
              /* for(let i = 0; i < ops.length; i++){
                  if(membre.doc.data.op === ops[i].doc.data.num_aggrement){
                    m._id = 'fuma:op:membre:' + ops[i].doc.data.code_OP + ':' + membre.doc.data.matricule_Membre;
                    m.data = membre.doc.data;
                    this.database.createDocReturn(m).then((res) => {
                      //this.database.deleteDoc(membre.doc);
                      //this.database.deleteDoc(membre.doc);
                    }, err => {
                      //this.database.deleteDoc(membre.doc);
                      
                    });

                    this.database.deleteDoc(membre.doc);

                    //membres.splice(i, 1);
                    m = {};

                    break;

                    /*this.database.createDocReturn(m).then((res) => {
                      this.database.remove(membre.doc._id);

                      //alert(membre.doc.data.op +' === '+op.doc.data.num_aggrement +' ===> '+membre.doc._id+'  => ' +res.id)
                      //mbrs.splice(i, 1);
                    // m = {};
                    });*/
                  //}

               //}

            });

            //membres = mbrs;
            }
          });

          loading.dismissAll();
          this.affichierMsg('Membres mis à jour')
        //}
       // });
      }
    })
  }


  affichierMsg(msg = 'Enregistrement mis à jour'){
    let toast = this.toastCtl.create({
      message: msg,
      position: 'top',
      duration: 2000,
      showCloseButton: true,
      closeButtonText: 'ok',
      dismissOnPageChange: true
    });

    toast.present();
  }

  connexion(){
    this.navCtrl.push('LoginPage');
  }

  register(){
    this.navCtrl.push('RegisterPage');
  }

  profile(){
    this.database.remoteSaved.getSession((err, response) => {
      if (err) {
        // network error
        alert('Erreur du réseau');
        
      } else if (!response.userCtx.name) {
        // nobody's logged in
        alert('Personne n\'est connecté');
        
      } else {
        this.navCtrl.push('ProfileUserPage');
      }
    });
    
  }

  deconnexion(){
    this.database.logout()
  }

  confLocaliteEnquetee(){
    this.navCtrl.push('ConfLocaliteEnquetePage');
  }

  changeLangue(){
    this.navCtrl.push('LanguePage');
  }

  gestionTypeSole(){
    this.navCtrl.push('TypeSolePage');
  }

  gestionChamps(){
    this.navCtrl.push('ChampsPage');
  }

  gestionEssai(){
    this.navCtrl.push('EssaiPage');
  }

  gestionTraitement(){
    this.navCtrl.push('TraitementPage');
  }

  calculNbOPUnion(){

    //on recupere toutes les unions
    //this.affichierMsg('Calcul du nombre d\'OPs par union encours...');
     let toast = this.toastCtl.create({
      message: 'Calcul du nombre d\'OPs par union encours...',
      position: 'top',
      duration: 2000,
      showCloseButton: true,
      closeButtonText: 'ok',
      dismissOnPageChange: true
    });

    toast.present();
      //Pour chaque union
      this.unions.forEach((union, indexU) => {
        //reinitialiser le nombre d'OP de l'union
        union.data.num_OP = 0;
        //parcourir les op a la recherche des ops qui appartiennent a l'union
        this.ops.forEach((op, indexO) => {
          //compter les OP
          if(union.data.num_aggrement === op.data.union){
            union.data.num_OP++
          }

        });

        //mettre a jour l'union
        this.database.updateDoc(union);
      });
      //this.affichierMsg('Calcul du nombre d\'OPs par union terminé avec succes!');
      
      //toast.dismiss();
      let toast1 = this.toastCtl.create({
        message: 'Calcul du nombre d\'OPs par union terminé avec succes!',
        position: 'top',
        duration: 2000,
        showCloseButton: true,
        closeButtonText: 'ok',
        dismissOnPageChange: true
      });
    toast1.present();
  }

  calculNbMembreOP(){
    //this.affichierMsg('Calcul du nombre de membre par OPs et par union encours...');   
     let toast = this.toastCtl.create({
      message: 'Calcul du nombre de membre par OPs et par union encours...',
      position: 'top',
      duration: 2000,
      showCloseButton: true,
      closeButtonText: 'ok',
      dismissOnPageChange: true
    });

    toast.present();               
    //on parcour les uion
    this.unions.forEach((union, indexU) =>{

        union.data.num_membre = 0;
        union.data.num_hommes = 0;
        union.data.num_femmes = 0;
        //parcourir toutes les OPs
        this.ops.forEach((op, indexO) => {

          //prendre uniquement les ops de l'union
          if(union.data.num_aggrement === op.data.union){
            //reinitialiser les champs a calculer
            op.data.num_membre = 0;
            op.data.num_hommes = 0;
            op.data.num_femmes = 0;

            //parcourir tous les membres a la recherche des membres qui appartennenent à l'OP
            this.membres.forEach((membre, indexM) => {
              //si le membre appartient a l'OP
              if(membre.data.op === op.data.num_aggrement){
                op.data.num_membre++;
                if(membre.data.genre === 'male'){
                  op.data.num_hommes++;
                }else{
                  op.data.num_femmes++;
                }
              }
            });
            //fin membre
            
            //calculer les champs de l'union
            union.data.num_membre += op.data.num_membre;
            union.data.num_hommes += op.data.num_hommes;
            union.data.num_femmes += op.data.num_femmes;

              //mettre a jour m'OP
            this.database.updateDoc(op);
          }

        });
        //fin op

        //mettre ajour l'union
        this.database.updateDoc(union);
      
    });
    //fin union
    //this.affichierMsg('Calcul du nombre de membre apr OPs et par union terminé avec succes!');
    //toast.dismiss()
    let toast1 = this.toastCtl.create({
      message: 'Calcul du nombre de membre apr OPs et par union terminé avec succes!',
      position: 'top',
      duration: 2000,
      showCloseButton: true,
      closeButtonText: 'ok',
      dismissOnPageChange: true
    });
    toast1.present();
  }

  
  gestionOP(){
    this.navCtrl.push('OpPage');
  }

  gestionMembre(){
    this.navCtrl.push('MembresPage');
  }

  gestionUnion(){
    this.navCtrl.push('UnionsPage');
  }

   getProfiles() {
    this.database.getAll(
      {
        startkey: 'koboSubmission_fuma-op-membre',
        endkey: 'koboSubmission_fuma-op-membre\uffff',
        include_docs: true
      },
    ).then(
      res => {
        this.profiles = res.rows
        this.pendingProfiles = this.profiles.filter(function (profile) {
          return !profile.doc.fumaID
        })
      }
      )
  }

  
  //assign semi-random id, check unique, add photo(?)
  approveProfiles(){
    var docs=this.pendingProfiles.map(function(profile){
      //console.log(profile)
      profile.doc.fumaID=this.generateId(profile.doc.data)
      return profile.doc
    }.bind(this))
    console.log('approved profiles',docs)
    this.database.bulkDocs(docs).then(function(){
      this.getProfiles();
    }.bind(this))
  }
  generateId(data){
    var country = data.pays||'XX'
    var region=data.region||'XX'
    var department = data.departement || 'XX'
    //var commune = data.commune || 'XX'
    //select 3 random numbers and random letter for up to 25,000 unique per department
    var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
    var numbers='0123456789'
    var randomArray=[]
    for(let i=0;i<3;i++){
      var rand = Math.floor(Math.random()*10)
      randomArray.push(numbers[rand])
    }
    randomArray.push('-')
    var rand = Math.floor(Math.random()*24)
    randomArray.push(chars[rand])
    var randomString=randomArray.join("");
    var fumaId=country+'-'+region+' '+department+'-'+randomString 
    return fumaId
  }


    infoDB(){
      this.storage.get('info_db').then((info_db) => {
      if(!info_db){
        //this.storage.set('ip_serveur', '127.0.0.1');
        info_db = global.info_db
      }//else{
        let alert = this.alertCtl.create({
        title: 'Information de connexion au serveur',
        //cssClass: 'error',
        inputs: [
          {
            type: 'text',
            placeholder: 'Adrèsse hôte',
            name: 'ip',
            value: info_db.ip
          },
          {
            type: 'text',
            placeholder: 'Nom DB',
            name: 'nom_db',
            value: info_db.nom_db
          },
         /* {
            type: 'select',
            placeholder: 'Mode connexion',
            name: 'mode_connexion',
            value: info_db.nom_db
          },
          {
            type: 'checkbox',
            label: 'Mode connexion',
            value: 'definitive',
            checked: false,
            name: 'mode_connexion',
          },*/
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
              let i_db = {
                ip: data.ip.toString(),
                nom_db: data.nom_db.toString(),
                mode_connexion: 'ofline_online',
              }
              this.storage.set('info_db', i_db);
              global.info_db = i_db;
              //global.ip_serveur = data.ip_serveur;
              this.database.syncIinfoDB(data.ip.toString(), data.nom_db.toString());
              
              let toast = this.toastCtl.create({
                message: 'Info DB mises à jour avec succes...',
                duration: 2000,
                position: 'top',
                showCloseButton: true,
                closeButtonText: 'ok',
                dismissOnPageChange: true
              });
              toast.present();
              
            }
          }
        ]
      }); 

      alert.present();
 //       }
      });
  }

  reset(){
    if(global.info_db.mode_connexion != 'online'){
      let alert = this.alertCtl.create({
        title: 'Réinitialiser la base de données',
        message: 'Etes vous sûr de vouloir réinitialiser la base de données ?',
        buttons:[
          {
            text: 'Annuler',
            handler: () => console.log('suppression annulée')
  
          },
          {
            text: 'Confirmer',
            handler: () => {
              this.database.reset();
              /*let toast = this.toastCtl.create({
                message:'Base de données bien réinitialiser',
                position: 'top',
                duration: 1000
              });

              toast.present();
              this.navCtrl.setRoot('HomePage');*/
            }
          }
        ]
      });

      alert.present();
    }else
      alert('Vous etes en mode connecté')
  }

    
  //}

}
