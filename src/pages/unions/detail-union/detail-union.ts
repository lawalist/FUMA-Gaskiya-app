import { Component } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, AlertController, IonicPage, ToastController, MenuController, Events } from 'ionic-angular';
//import { ModifierUnionPage } from '../modifier-union/modifier-union';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';
//import { OpPage } from '../../op/op'
import { global } from '../../../global-variables/variable';
import { Device } from '@ionic-native/device';
import { Sim } from '@ionic-native/sim';
 

/*
  Generated class for the DetailUnion page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-detail-union',
  templateUrl: 'detail-union.html'
})
export class DetailUnionPage {
  union: any = {};
  selectedSource: any;
  unionID: any;
  aProfile: boolean = false;
  imei: any = '';
  phonenumber: any = '';

  union1: any;
  grandeUnion: any;
  unionForm: any;
  confLocaliteEnquete: any = {};
  villages: any = [];
  selectedVillageID: any;
  selectedPaysID: any;
  selectedRegionID: any;
  selectedDepartementID: any;
  selectedCommuneID: any;
  unionsApplication: any = [];
  unionKobo: any = [];
  allUnions: any;
  autreVillage: any = {'id':'AUTRE', 'nom':'Autre'};
  nom_autre_village: any = '';
  code_union: string = '';
  nom_union: string = '';
  modifierForm: boolean = false;
  ancien_num_a: any;
  ancien_nom: any;
  ancien_code: any;
  user: any = global.info_user;
  global:any = global;
  estManger: boolean = false;
  estAnimataire: boolean = false;


 
  constructor(public servicePouchdb: PouchdbProvider, public sim: Sim, public device: Device, public loadinCtl: LoadingController, public modelCtl: ModalController, public formBuilder: FormBuilder, public menuCtl: MenuController, public events: Events, public toastCtl: ToastController, public navCtrl: NavController, public navParams: NavParams, public alertCtl: AlertController) {
    
    this.menuCtl.enable(false, 'options');
    this.menuCtl.enable(false, 'connexion');
    this.menuCtl.enable(false, 'profile');
    
    events.subscribe('user:login', (user) => {
      if(user){
        this.aProfile = true;
        //this.user = global.info_user;
        this.estMangerConnecter(user)
      }else{
        this.aProfile = false;
        this.estManger = false;
        this.estAnimataire = false;
        this.user = global.info_user;
      }
      
      /*this.servicePouchdb.remoteSaved.getSession((err, response) => {
        if (response.userCtx.name) {
          this.aProfile = true;
          this.user = global.info_user;
        }else{
          this.aProfile = false;
          this.user = {};
        }
      }, err => console.log(err));*/
    });
    
    this.union = this.navParams.data.union;
    this.selectedSource = this.navParams.data.selectedSource;
    this.unionID = this.union._id;
  }

  estMangerConnecter(user){
    //alert('entree')
    if(user && user.roles){
      //alert('ok')
      this.estManger = global.estManager(user.roles);
      this.estAnimataire = global.estAnimataire(user.roles);
    }
  }
    restitution(code_union){
    let model = this.modelCtl.create('RestitutionPage', {'type': 'union', 'code_union': code_union});
    model.present();
    //this.calculerMembreAyantFaitUnEssai(essais);
    //this.calculerNombreEssaiParTraitement(essais, traitements);
    //this.visualisation(essais);
  }

  getStatistique(code_union){
    let model = this.modelCtl.create('StatistiquePage', {'type': 'union', 'code_union': code_union});
    model.present();
    //this.calculerMembreAyantFaitUnEssai(essais);
    //this.calculerNombreEssaiParTraitement(essais, traitements);
    //this.visualisation(essais);
  }
  openMap(code_union){
    let modal = this.modelCtl.create('LeafletPage', { 'type': 'union', 'code_union': code_union });
    modal.present();
  }


  initForm(){
    this.grandeUnion = this.navParams.data.union;
    this.union1 = this.grandeUnion.data;
    this.selectedVillageID = this.union1.village;
    this.selectedPaysID = this.union1.pays;
    this.selectedRegionID = this.union1.region;
    this.selectedDepartementID = this.union1.departement;
    this.selectedCommuneID = this.union1.commune;
    this.nom_union = this.union1.nom_union;
    this.code_union = this.union1.code_union;
    this.ancien_code = this.union1.code_union;
    this.ancien_nom = this.union1.code_union;
    this.ancien_num_a = this.union1.num_aggrement;

    if(this.union1.village_autre)
      {
        this.nom_autre_village = this.union1.village_autre;
      }else{
        this.nom_autre_village = 'NA';
      }

    let maDate = new Date();
    
    //this.storage.get('confLocaliteEnquete').then((confLocaliteEnquete) => {
   // this.chargerVillages(this.union1.commune);
    
    //});

    this.unionForm = this.formBuilder.group({
      //_id:[this.union._id],
      //_rev:[this.union._rev],
      nom_union: [this.union1.nom_union, Validators.required],
      code_union: [this.union1.code_union, Validators.required],
      num_aggrement: [this.union1.num_aggrement, Validators.required],
      pays: [this.union1.pays, Validators.required],
      pays_nom: [this.union1.pays_nom],
      pays_autre: [this.union1.pays_autre],
      region: [this.union1.region, Validators.required],
      region_nom: [this.union1.region_nom],
      region_autre: [this.union1.region_autre],
      departement: [this.union1.departement, Validators.required],
      departement_nom: [this.union1.departement_nom],
      departement_autre: [this.union1.departement_autre],
      commune: [this.union1.commune, Validators.required],
      commune_nom: [this.union1.commune_nom],
      commune_autre: [this.union1.commune_autre],
      village: [this.union1.village, Validators.required],
      village_nom: [this.union1.village_nom],
      village_autre: [this.union1.village_autre, Validators.required],
      today: [this.union1.today, Validators.required],
      //deviceid: [this.union.deviceid],
      //imei: [this.union.imei],
      //phonenumber: [this.union.phonenumber],
      num_OP: [this.union1.num_OP],
      num_membre: [this.union1.num_membre],
      num_hommes: [this.union1.num_hommes],
      num_femmes: [this.union1.num_femmes],
      /*start: [this.union.start],
      end: [this.union.end],
      created_at: [this.union.created_at],
      created_by: [this.union.created_by],*/
    });

     this.chargerVillages(this.union1.commune);
  }

    option(){
    this.menuCtl.enable(true, 'options');
    this.menuCtl.enable(false, 'connexion');
    this.menuCtl.enable(false, 'profile');
    this.menuCtl.toggle()
  }

  getAllUnion(){
    this.servicePouchdb.getPlageDocs('fuma:union','fuma:union:\uffff').then((unionsA) => {
         this.servicePouchdb.getPlageDocs('koboSubmission_fuma-union','koboSubmission_fuma-union\uffff').then((unionsK) => {
          this.allUnions = unionsA.concat(unionsK);
      }, err => console.log(err));

      }, err => console.log(err));
  }

  chargerVillages(c){
    this.villages = [];
    if(c !== 'AUTRE')
      {this.servicePouchdb.getDocById('village').then((villages) => {
        villages.data.forEach((village, index) => {
          if(village.id_commune === c){
            this.villages.push(village);
            
          }
        });
        if(this.user && this.user.roles && global.estManager(this.user.roles)){
          this.villages.push(this.autreVillage);
        }
        
        //this.nom_autre_departement = 'NA';
      });
    }else{
      if(this.user && this.user.roles && global.estManager(this.user.roles)){
          this.villages.push(this.autreVillage);
        }
      //this.nom_autre_departement = '';
    }

    //this.selectedVillageID = '';
  } 

  chargerAutreNomVillage(c){
    if(c !== 'AUTRE'){
      this.nom_autre_village = 'NA';
    }else{
       let model = this.modelCtl.create('AjouterVillagePage', {'id_commune':this.union1.commune, 'nom_commune': this.union1.commune_nom});
      model.present();
      model.onDidDismiss(() => {
        this.chargerVillages(this.union1.commune);
        this.selectedVillageID = '';
      })
      this.nom_autre_village = '';
    }
  }



  verifierUniqueNon(union){

    let res = 1;
    this.allUnions.forEach((u, index) => {
      if((u._id !== this.grandeUnion._id) && (/*(union.nom_union === u.data.nom_union) || */(union.num_aggrement === u.data.num_aggrement))){
        res = 0;
      }
    });

    return res;
  }


  //fait la conbinaison de caractere de gauche vers la droite en variant la taille a la recherche d'un code disponible
  genererCodeUnion(){
    
    let nom = this.nom_union;
    let nom1: any = '';
    for(let i = 0; i < nom.length; i++){
      if(nom.charAt(i) !== ' '){
        nom1 += nom.charAt(i).toString();
      }
    }
    //let nom = this.nom_op;
     //let nom1 = nom.replace(/ /g,"");
     nom = nom1;
     let taille_nom = nom.length;
    //taille initiale: deux aractères
    let taille_code = 2;
    let code: string = '';
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
            for(let pos=0; pos < this.allUnions.length; pos++){
              let u = this.allUnions[pos];
              if((u.data.num_aggrement !== this.ancien_num_a) && (u.data.code_union === code.toUpperCase())){
                //alert('trouve '+code.toUpperCase())
                trouve = true;
                //alert('trouver '+trouve)
                break ;
              }else{
                //alert('non trouve '+code.toUpperCase())
                trouve = false;
              }
            }
           
              last_position++;
            

          }while(trouve && last_position < taille_nom);
          //
          if(last_position === taille_nom && trouve){
            //non disponible, augmenter la taille du code
            taille_code++;
            //alert('ici')
            //au cas ou on teste toutes les combinaisons, sant trouver de combinaison disponible, on ajoute des chiffre
            if(taille_code > taille_nom){
              //non disponible, augmenter la taille et utiliser des chiffres
              taille_code = 3;
              nom = this.nom_union.toString() + '123456789'.toString();
              taille_nom = nom.length;
            }
          }else{
              //trouvé
              this.code_union = code.toUpperCase();
              break;
            
          }
      }
      
    }else{
      this.code_union = '';
    }
    
  }


  Change_update_ionfo_ops(ancien_num_a, num_a, nom, ancien_code, code) {
    let loadin = this.loadinCtl.create({
      content: 'Modification en cours....'
    });

    loadin.present();
    //modification du code union dans op
    this.servicePouchdb.getPlageDocsRapide('fuma:op','fuma:op:\uffff').then((ops) => {
      ops.forEach((op) => {
          //return this.getPhoto(membre)
          if(op.doc.data.union === ancien_num_a){
                op.doc.data.union = num_a;
                op.doc.data.union_nom = nom;
                op.doc.data.code_union = code;
                this.servicePouchdb.updateDoc(op.doc);
                //mbrs.push(mbr);
              }
        });
        //modification du code union dans membres
        this.servicePouchdb.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then((membres) => {
          membres.forEach((membre) => {
            if(membre.doc.data.code_union === ancien_code){
              membre.doc.data.code_union = code;
              this.servicePouchdb.updateDoc(membre.doc);
            }
          })

          //modification du code union dans essais
          this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
            essais.forEach((essai) => {
                if(essai.doc.data.code_union === ancien_code){
                  essai.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(essai.doc);
                }
              });

              //modification du code union dans champs
              this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
                champs.forEach((champ) => {
                  if(champ.doc.data.code_union === ancien_code){
                    champ.doc.data.code_union = code;
                    this.servicePouchdb.updateDoc(champ.doc);
                  }
                })

                loadin.dismiss();
                let toast = this.toastCtl.create({
                  message: 'Union bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });

                this.modifierForm  = false;
                toast.present();
              });
            }).catch((err) => {
              //modification du code union dans champs
              this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
                champs.forEach((champ) => {
                  if(champ.doc.data.code_union === ancien_code){
                    champ.doc.data.code_union = code;
                    this.servicePouchdb.updateDoc(champ.doc);
                  }
                })

                loadin.dismiss();
                let toast = this.toastCtl.create({
                  message: 'Union bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });

                this.modifierForm  = false;
                toast.present();
              });
            } ) ;


          }).catch((err) => {
            //modification du code union dans essais
          this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
            essais.forEach((essai) => {
                if(essai.doc.data.code_union === ancien_code){
                  essai.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(essai.doc);
                }
              });

              //modification du code union dans champs
              this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
                champs.forEach((champ) => {
                  if(champ.doc.data.code_union === ancien_code){
                    champ.doc.data.code_union = code;
                    this.servicePouchdb.updateDoc(champ.doc);
                  }
                })

                loadin.dismiss();
                let toast = this.toastCtl.create({
                  message: 'Union bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });

                this.modifierForm  = false;
                toast.present();
              });
            }).catch((err) => {
              //modification du code union dans champs
              this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
                champs.forEach((champ) => {
                  if(champ.doc.data.code_union === ancien_code){
                    champ.doc.data.code_union = code;
                    this.servicePouchdb.updateDoc(champ.doc);
                  }
                })

                loadin.dismiss();
                let toast = this.toastCtl.create({
                  message: 'Union bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });

                this.modifierForm  = false;
                toast.present();
              });
            });


          }) ;

       /* loadin.dismissAll();
          let toast = this.toastCtl.create({
            message: 'Union bien sauvegardée!',
            position: 'top',
            duration: 1000
          });

          this.modifierForm  = false;
          toast.present();*/
          
          //this.navCtrl.pop();
          //this.modifierForm = false;
          

        
          //this.union = this.grandeUnion

          //this.membres = mbrs
          //this.allMembres=mbrs
    }).catch((err) => {
         //modification du code union dans membres
        this.servicePouchdb.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then((membres) => {
          membres.forEach((membre) => {
            if(membre.doc.data.code_union === ancien_code){
              membre.doc.data.code_union = code;
              this.servicePouchdb.updateDoc(membre.doc);
            }
          })

          //modification du code union dans essais
          this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
            essais.forEach((essai) => {
                if(essai.doc.data.code_union === ancien_code){
                  essai.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(essai.doc);
                }
              });

              //modification du code union dans champs
              this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
                champs.forEach((champ) => {
                  if(champ.doc.data.code_union === ancien_code){
                    champ.doc.data.code_union = code;
                    this.servicePouchdb.updateDoc(champ.doc);
                  }
                })

                loadin.dismiss();
                let toast = this.toastCtl.create({
                  message: 'Union bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });

                this.modifierForm  = false;
                toast.present();
              });
            });


          }).catch((err) => {
          //modification du code union dans essais
          this.servicePouchdb.getPlageDocsRapide('fuma:essai', 'fuma:essai:\uffff').then((essais) => {
            essais.forEach((essai) => {
                if(essai.doc.data.code_union === ancien_code){
                  essai.doc.data.code_union = code;
                  this.servicePouchdb.updateDoc(essai.doc);
                }
              });

              //modification du code union dans champs
              this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
                champs.forEach((champ) => {
                  if(champ.doc.data.code_union === ancien_code){
                    champ.doc.data.code_union = code;
                    this.servicePouchdb.updateDoc(champ.doc);
                  }
                })

                loadin.dismiss();
                let toast = this.toastCtl.create({
                  message: 'Union bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });

                this.modifierForm  = false;
                toast.present();
              });
            }).catch((err) => {

              //modification du code union dans champs
              this.servicePouchdb.getPlageDocsRapide('fuma:champs','fuma:champs:\uffff').then((champs) => {
                champs.forEach((champ) => {
                  if(champ.doc.data.code_union === ancien_code){
                    champ.doc.data.code_union = code;
                    this.servicePouchdb.updateDoc(champ.doc);
                  }
                })

                loadin.dismiss();
                let toast = this.toastCtl.create({
                  message: 'Union bien sauvegardée!',
                  position: 'top',
                  duration: 1000
                });

                this.modifierForm  = false;
                toast.present();
              });
            }) ;

          });
    })
    
          
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



  modifierUnion(){
      //  let date = new Date();
    let union = this.unionForm.value;

    this.union1.nom_union = union.nom_union;
    this.union1.code_union = union.code_union;
    this.union1.num_aggrement = union.num_aggrement;
    this.union1.village = union.village;
    this.union1.village_nom = union.village_nom;
    this.union1.village_autre = union.village_autre;
    this.union1.num_OP = union.num_OP;
    this.union1.num_membre = union.num_membre;
    this.union1.num_hommes = union.num_hommes;
    this.union1.num_femmes = union.num_femmes;
    this.union1.update_deviceid = this.device.uuid;
    this.union1.update_phonenumber = this.phonenumber;
    this.union1.update_imei = this.imei;

    this.villages.forEach((v, i) => {
      if(v.id === this.selectedVillageID){
        this.union1.village = v.id;
        this.union1.village_nom = v.nom;
      }
    })
    
    if(this.verifierUniqueNon(union) === 0){
      alert('Le le numéro d\'aggrément de l\'union doit être unique!');
    }else{
      this.grandeUnion.data = this.union1
      this.servicePouchdb.updateDocReturn(this.grandeUnion).then((res) => {
        this.grandeUnion._rev = res.rev;
        this.union = this.grandeUnion

        if(this.ancien_num_a !== this.union1.num_aggrement || this.ancien_code !== this.union1.code_union || this.ancien_nom !== this.union1.nom_union){
          this.Change_update_ionfo_ops(this.ancien_num_a, union.num_aggrement, union.nom_union, this.ancien_code, union.code_union);
        }else{

        let toast = this.toastCtl.create({
        message: 'Union bien sauvegardée!',
        position: 'top',
        duration: 1000
      });
      
      //this.navCtrl.pop();
      this.modifierForm  = false;
      
      toast.present();
        }
      });

    }
  }

  annuler(){
    //this.navCtrl.pop();
    this.modifierForm  = false;
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
    this.servicePouchdb.syncAvecToast(this.ionViewDidEnter());
  }

  ionViewDidEnter() {

    this.getInfoSimEmei();

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


    this.initForm();
    this.getAllUnion();

    //console.log('ionViewDidLoad DetailUnionPage');
    /*this.servicePouchdb.getDocById(this.unionID).then((u) => {
      this.union = u;
    }, err => console.log(err))*/
  } 

  editer(union, dbclick: boolean = false){
    if(!dbclick || (dbclick && this.user && this.user.roles && global.estManager(this.user.roles))){
    //this.navCtrl.push('ModifierUnionPage', {'union': union});
    this.modifierForm  = true;
    }
  }

  opUnion(num_aggrement, nom_union, code_union){
    this.navCtrl.push('OpPage', {'num_aggrement_union': num_aggrement, 'nom_union': nom_union, 'code_union': code_union});
  }

  supprimer(union){
    let alert = this.alertCtl.create({
      title: 'Suppression union',
      message: 'Etes vous sûr de vouloir supprimer cette union ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(union);
            let toast = this.toastCtl.create({
              message:'Union bien suppriée',
              position: 'top',
              duration: 1000
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
