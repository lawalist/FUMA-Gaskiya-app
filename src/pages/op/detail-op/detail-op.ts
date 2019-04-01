import { Component } from '@angular/core';
import { NavController, ModalController, ViewController, LoadingController, NavParams, IonicPage, AlertController, ToastController, MenuController, Events } from 'ionic-angular';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';
//import { ModifierOpPage } from '../modifier-op/modifier-op';
//import { MembresPage } from '../../membres/membres'
import { global } from '../../../global-variables/variable';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
//import { Storage } from '@ionic/storage';


/* 
  Generated class for the DetailOp page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@IonicPage()
@Component({
  selector: 'page-detail-op',
  templateUrl: 'detail-op.html'
})
export class DetailOpPage {

  op: any = {};
  selectedSource: any;
  opID: any;
  aProfile: boolean = false;
  //allOPs1: any = [];
  //nom_op: string;
  //nouveauChamps: any = [];


  op1: any;
  grandeOP: any;
  opForm: any;
  confLocaliteEnquete: any = {};
  villages: any = [];
  unions: any = [];
  selectedVillageID: any;
  selectedUnionID: any;
  ancienSelectedUnionID: any;
  opApplication: any = [];
  ancien_num_a: any;
  ancien_code_op: any;
  opKobo: any = [];
  allOP: any;
  autreVillage: any = {'id':'AUTRE', 'nom':'Autre'};
  nom_autre_village: any = '';
  autreUnion: any = {"data": {'num_aggrement':'AUTRE', 'nom_union':'Autre'}};
  nom_autre_union: any = '';
  nom_op: string = '';
  code_op: any = '';
  code_union: any = '';
  modifierForm: boolean = false;
  user: any = global.info_user;
  global:any = global;
  estManger: boolean = false;
  estAnimataire: boolean = false;
  

  constructor(public servicePouchdb: PouchdbProvider, public viewCtl: ViewController, public loadinCtl: LoadingController, public formBuilder: FormBuilder, public modelCtl: ModalController, public toastCtl: ToastController, public menuCtl: MenuController, public events: Events, public alertCtl: AlertController, public navCtrl: NavController, public navParams: NavParams) {
    
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
    
    this.op = this.navParams.data.op;
    this.selectedSource = this.navParams.data.selectedSource;
    this.opID = this.op._id;
    this.ancien_num_a = this.op.data.num_aggrement;
    this.ancien_code_op = this.op.data.code_OP;
    //this.nom_op = this.op.data.nom_OP;
  }

  estMangerConnecter(user){
    //alert('entree')
    if(user && user.roles){
      //alert('ok')
      this.estManger = global.estManager(user.roles);
      this.estAnimataire = global.estAnimataire(user.roles);
    }
  }

  initForm(){
    this.grandeOP = this.navParams.data.op;
    this.op1 = this.grandeOP.data;
    this.selectedVillageID = this.op1.village;
    this.selectedUnionID = this.op1.union;
    this.ancienSelectedUnionID = this.op1.union;
    this.nom_op = this.op1.nom_OP;
    this.code_op = this.op1.code_OP;
    this.code_union = this.op1.code_union;

    if(this.op1.village_autre){
        this.nom_autre_village = this.op1.village_autre;
      }else{
        this.nom_autre_village = 'NA';
    }

    if(this.op1.union_autre) {
        this.nom_autre_union = this.op1.union_autre;
    }else{
      this.nom_autre_union = 'NA';
    }

    //let maDate = new Date();
    
    //this.storage.get('confLocaliteEnquete').then((confLocaliteEnquete) => {
    this.chargerVillages(this.op1.commune);
    //});

    this.opForm = this.formBuilder.group({
      //_id:[''],
      nom_OP: [this.op1.nom_OP, Validators.required],
      code_OP: [this.op1.code_OP, Validators.required],
      num_aggrement: [this.op1.num_aggrement, Validators.required],
      pays: [this.op1.pays, Validators.required],
      pays_nom: [this.op1.pays_nom],
      pays_autre: [this.op1.pays_autre],
      region: [this.op1.region, Validators.required],
      region_nom: [this.op1.region_nom],
      region_autre: [this.op1.region_autre],
      departement: [this.op1.departement, Validators.required],
      departement_nom: [this.op1.departement_nom],
      departement_autre: [this.op1.departement_autre],
      commune: [this.op1.commune, Validators.required],
      commune_nom: [this.op1.commune_nom],
      commune_autre: [this.op1.commune_autre],
      village: [this.op1.village, Validators.required],
      village_nom: [this.op1.village_nom],
      village_autre: [this.op1.village_autre, Validators.required],
      union: [this.op1.union, Validators.required],
      union_nom: [this.op1.union_nom],
      code_union: [this.op1.code_union],
      union_autre: [this.op1.union_autre, Validators.required],
      today: [this.op1.today, Validators.required],
      /*deviceid: [this.op.deviceid],
      imei: [this.op.imei],
      phonenumber: [this.op.phonenumber],*/
      //num_OP: [0],
      num_membre: [this.op1.num_membre],
      num_hommes: [this.op1.num_hommes],
      num_femmes: [this.op1.num_femmes],
      /*start: [this.op.start],
      end: [this.op.end],
      created_at: [this.op.created_at],
      created_by: [this.op.created_by],*/
    });

  }

  restitution(code_op){
    let model = this.modelCtl.create('RestitutionPage', {'type': 'op', 'code_op': code_op});
    model.present();
    //this.calculerMembreAyantFaitUnEssai(essais);
    //this.calculerNombreEssaiParTraitement(essais, traitements);
    //this.visualisation(essais);
  }

  getStatistique(code_op){
    let model = this.modelCtl.create('StatistiquePage', {'type': 'op', 'code_op': code_op});
    model.present();
    //this.calculerMembreAyantFaitUnEssai(essais);
    //this.calculerNombreEssaiParTraitement(essais, traitements);
    //this.visualisation(essais);
  }

  openMap(code_op){
    let modal = this.modelCtl.create('LeafletPage', { 'type': 'op', 'code_op': code_op });
    modal.present();
  }

  getAllUnion(){
    this.servicePouchdb.getPlageDocs('fuma:union','fuma:union:\uffff').then((uA) => {
        this.servicePouchdb.getPlageDocs('koboSubmission_fuma-union','koboSubmission_fuma-union\uffff').then((uK) => {
        this.unions = uA.concat(uK);
        //this.unions.push(this.autreUnion);
    }, err => console.log(err));

    }, err => console.log(err));
  }

  Change_num_a_op(ancien_num_a, num_a, code_op, nom_op) {
    let loadin = this.loadinCtl.create({
      content: 'Modification en cours....'
    });

    loadin.present();
    this.servicePouchdb.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then(((membres) => {
      membres.forEach((membre) => {
          //return this.getPhoto(membre)
          if(membre.doc.data.op === ancien_num_a){
                membre.doc.data.op = num_a;
                membre.doc.data.op_code = code_op;
                membre.doc.data.op_nom = nom_op;
                this.servicePouchdb.updateDoc(membre.doc);
                //mbrs.push(mbr);
              }
        });

        loadin.dismissAll();
          let toast = this.toastCtl.create({
            message: 'OP bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          
          //this.navCtrl.pop();
          this.modifierForm = false;
          toast.present();

          //this.membres = mbrs
          //this.allMembres=mbrs
    }))
    
          
  }

dismiss(){
    this.viewCtl.dismiss();
  }

  Change_nom_op(num_a, nom_op) {
    let loadin = this.loadinCtl.create({
      content: 'Modification en cours....'
    });

    loadin.present();
    this.servicePouchdb.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then(((membres) => {
      membres.forEach((membre) => {
          //return this.getPhoto(membre)
          if(membre.doc.data.op === num_a){
                membre.doc.data.op_nom = nom_op;
                this.servicePouchdb.updateDoc(membre.doc);
                //mbrs.push(mbr);
              }
        });

        loadin.dismissAll();
          let toast = this.toastCtl.create({
            message: 'OP bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          
          //this.navCtrl.pop();
          this.modifierForm = false;
          toast.present();

          //this.membres = mbrs
          //this.allMembres=mbrs
    }))
    
          
  }

  Changer_code_op(num_a, ancien_code_op, nouveau_code_op, nom_op) {
    let loadin = this.loadinCtl.create({
      content: 'Modification en cours....'
    });

    loadin.present();
    let m: any = {};
    this.servicePouchdb.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then(((membres) => {
      membres.forEach((membre) => {
          //return this.getPhoto(membre)
          if(membre.doc.data.op === num_a){
                membre.doc.data.ancien_op_code = membre.doc.data.op_code;
                membre.doc.data.op_code = nouveau_code_op;
                membre.doc.data.op_nom = nom_op;
                //let ancien_m = membre.doc.data.matricule_Membre;
                membre.doc.data.ancien_matricule_Membre = membre.doc.data.matricule_Membre;
                membre.doc.data.matricule_Membre = 'FM-'+nouveau_code_op+ membre.doc.data.matricule_Membre.substr(membre.doc.data.matricule_Membre.indexOf(' '), membre.doc.data.matricule_Membre.length - membre.doc.data.matricule_Membre.indexOf(' '));
                //membre.doc.data.matricule_Membre = 'MR-'+nouveau_code_op+ membre.doc.data.matricule_Membre.substr(membre.doc.data.matricule_Membre.indexOf(' '), membre.doc.data.matricule_Membre.length - membre.doc.data.matricule_Membre.indexOf(' '));
                
                m._id = 'fuma:op:membre:' +nouveau_code_op+':'+ membre.doc.data.matricule_Membre;
                m.data = membre.doc.data;
                this.servicePouchdb.deleteDoc(membre.doc);
                this.servicePouchdb.updateDoc(m);
                this.changerOP(m.data.ancien_matricule_Membre, m.data.matricule_Membre, m.data.nom_Membre, nouveau_code_op)
                m = {};

                //mbrs.push(mbr);
              }
        });

        loadin.dismissAll();
          let toast = this.toastCtl.create({
            message: 'OP bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          
          //this.navCtrl.pop();
          this.modifierForm = false;
          toast.present();

          //this.membres = mbrs
          //this.allMembres=mbrs
    }))
    
          
  }


  Changer_num_a_et_code_op(ancien_num_a, num_a, ancien_code_op, nouveau_code_op, nom_op) {
    let loadin = this.loadinCtl.create({
      content: 'Modification en cours....'
    });

    loadin.present();
    this.servicePouchdb.getPlageDocsRapide('fuma:op:membre', 'fuma:op:membre:\uffff').then(((membres) => {
      membres.forEach((membre) => {
          //return this.getPhoto(membre)
          if(membre.doc.data.op === ancien_num_a){
                membre.doc.data.op = num_a;
                membre.doc.data.ancien_op_code = membre.doc.data.op_code;
                membre.doc.data.op_code = nouveau_code_op;
                membre.doc.data.op_nom = nom_op;
                //let ancien_m = membre.doc.data.matricule_Membre;
                membre.doc.data.ancien_matricule_Membre = membre.doc.data.matricule_Membre;
                membre.doc.data.matricule_Membre = 'FM-'+nouveau_code_op+ membre.doc.data.matricule_Membre.substr(membre.doc.data.matricule_Membre.indexOf(' '), membre.doc.data.matricule_Membre.length - membre.doc.data.matricule_Membre.indexOf(' '));
                //membre.doc.data.matricule_Membre = 'MR-'+nouveau_code_op+ membre.doc.data.matricule_Membre.substr(membre.doc.data.matricule_Membre.indexOf(' '), membre.doc.data.matricule_Membre.length - membre.doc.data.matricule_Membre.indexOf(' '));
                
                this.servicePouchdb.updateDocReturn(membre.doc).then((res) => {
                  this.changerOP(membre.doc.data.ancien_matricule_Membre, membre.doc.data.matricule_Membre, membre.doc.data.nom_Membre, nouveau_code_op)
                }) ;

                //mbrs.push(mbr);
              }
        });

        loadin.dismissAll();
          let toast = this.toastCtl.create({
            message: 'OP bien sauvegardée!',
            position: 'top',
            duration: 1000
          });
          
          //this.navCtrl.pop();
          this.modifierForm = false;
          toast.present();

          //this.membres = mbrs
          //this.allMembres=mbrs
    }))
    
          
  }


  changerOP(ancienMatricule, nouveauMatricule, nomProducteur, code_op){
    let nouveauChamps: any = [];
    //let nouveauEssai: any = [];
    let id_champs: any = '';
    let nChamps: any = {};
    this.servicePouchdb.getPlageDocsRapide('fuma:champs:'+ancienMatricule, 'fuma:champs:'+ancienMatricule+' \uffff').then((mes_champs) => {
      if(mes_champs){
        //nouveauChamps = [];
        //this.mes_champs = c;
            mes_champs.forEach((champs, i) => {
            champs = champs.doc;
            //let code_champs = this.generateIdChamps(nouveauMatricule);    
            let nouveauChamp: any = {};
            let data = champs.data;
            let code_champs = 'FM-'+code_op+ data.id_champs.substr(data.id_champs.indexOf(' '), data.id_champs.length - data.id_champs.indexOf(' '));
            //let code_champs = 'MR-'+code_op+ data.id_champs.substr(data.id_champs.indexOf(' '), data.id_champs.length - data.id_champs.indexOf(' '));
            
            let id = 'fuma:champs:'+ code_champs;
            //nouveauChamp.data = 
            data.ancien_id_champs = champs.data.id_champs;
            data.id_champs = code_champs;
            data.matricule_producteur = nouveauMatricule;
            data.ancien_matricule_producteur = ancienMatricule;
            data.nom_producteur = nomProducteur;
            nouveauChamp._id = id;
            nouveauChamp.data = data;
            
            nouveauChamps.push(nouveauChamp);
            //alert('champs '+nouveauChamp._id);
            this.servicePouchdb.remove(champs._id);
            this.servicePouchdb.createDoc(nouveauChamp);
            nouveauChamp = {};
          });

              if(nouveauChamps.length > 0){
                let nouveauEssai: any = {};
                this.servicePouchdb.getPlageDocsRapide('fuma:essai:'+ancienMatricule, 'fuma:essai:'+ancienMatricule+' \uffff').then((mes_essais) => {
                if(mes_essais){
                  mes_essais.forEach((essai, j) => {
                      essai = essai.doc;
                      //let code_essai = this.generateIdEssai(nouveauMatricule);
                      
                      //let nouveauEssai: any = {};
                      let data = essai.data;
                      
                      let code_essai = 'FM-'+code_op+ data.code_essai.substr(data.code_essai.indexOf(' '), data.code_essai.length - data.code_essai.indexOf(' '));
                      //let code_essai = 'MR-'+code_op+ data.code_essai.substr(data.code_essai.indexOf(' '), data.code_essai.length - data.code_essai.indexOf(' '));
                      
                      let id = 'fuma'+':essai:'+ code_essai;
                      //let id_champs = data.id_champs;
                      data.ancien_code_essai = essai.data.code_essai;
                      data.code_essai = code_essai
                      
                      if(id_champs !== essai.data.id_champs){
                        nouveauChamps.forEach((champs, i) => {
                          //champs = champs;
                          if(champs.data.ancien_id_champs === data.id_champs){
                            id_champs = champs.data.ancien_id_champs;
                            nChamps = champs;
                            data.ancien_id_champs = essai.data.id_champs;
                            data.id_champs = champs.data.id_champs;
                            //alert(data.id_champs +' !== '+ data.ancien_id_champs)
                            data.matricule_producteur = nouveauMatricule;
                            data.ancien_matricule_producteur = ancienMatricule;
                            data.nom_producteur = nomProducteur;

                            nouveauEssai._id = id;
                            nouveauEssai.data = data;
                            
                            this.servicePouchdb.remove(essai._id);
                            this.servicePouchdb.createDoc(nouveauEssai);
                            }
                          });
                      }else{
                        data.ancien_id_champs = essai.data.id_champs;
                        data.id_champs = nChamps.data.id_champs;
                        //alert(data.id_champs +' !== '+ data.ancien_id_champs)
                        data.matricule_producteur = nouveauMatricule;
                        data.ancien_matricule_producteur = ancienMatricule;
                        data.nom_producteur = nomProducteur;

                        nouveauEssai._id = id;
                        nouveauEssai.data = data;
                        
                        this.servicePouchdb.remove(essai._id);
                        this.servicePouchdb.createDoc(nouveauEssai);
                      }
                      /*nouveauEssai._id = id;
                      nouveauEssai.data = data;
                      
                      this.servicePouchdb.remove(essai._id);
                      this.servicePouchdb.createDoc(nouveauEssai);*/
                      nouveauEssai = {};
                    });
                }
              });

                //this.nouveauChamps = [];
              }else{

                let nouveauEssai: any = {};
                this.servicePouchdb.getPlageDocsRapide('fuma:essai:'+ancienMatricule, 'fuma:essai:'+ancienMatricule+' \uffff').then((mes_essais) => {
                if(mes_essais){
                  mes_essais.forEach((essai, j) => {
                      essai = essai.doc;
                      //let code_essai = this.generateIdEssai(nouveauMatricule);
                      
                      //let nouveauEssai: any = {};
                      let data = essai.data;
                      
                      let code_essai = 'FM-'+code_op+ data.code_essai.substr(data.code_essai.indexOf(' '), data.code_essai.length - data.code_essai.indexOf(' '));
                      
                      //let code_essai = 'MR-'+code_op+ data.code_essai.substr(data.code_essai.indexOf(' '), data.code_essai.length - data.code_essai.indexOf(' '));
                     
                      let id = 'fuma'+':essai:'+ code_essai;
                      //let id_champs = data.id_champs;
                      data.ancien_code_essai = essai.data.code_essai;
                      data.code_essai = code_essai

                      data.matricule_producteur = nouveauMatricule;
                      data.ancien_matricule_producteur = ancienMatricule;
                      data.nom_producteur = nomProducteur;

                      nouveauEssai._id = id;
                      nouveauEssai.data = data;
                      
                      this.servicePouchdb.deleteDoc(essai);
                      this.servicePouchdb.createDoc(nouveauEssai);
                      nouveauEssai = {};
                    });
                }
              });

                alert('Erreur mise à jour des essais, la liste des champs est vide!\nMemebre :'+ancienMatricule+' --> '+nouveauMatricule)
              }
      }
      
    })



    
  }

    //fait la conbinaison de caractere de gauche vers la droite en variant la taille a la recherche d'un code disponible
  /*genererCodeOP_Nom(){
    
    let nom = this.nom_op;
     nom = nom.replace(' ' || '  ' || '    ' || '     ' || '      ' , '');
     let taille_nom = nom.length;
     let an = nom;
    //taille initiale: deux aractères
    let taille_code = 2;
    let code: string = '';
    this.code_op = code.toUpperCase()
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
            for(let pos=0; pos < this.allOPs1.length; pos++){
              let op = this.allOPs1[pos];
              if(op.doc.data.code_OP === code.toUpperCase()){
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
              this.code_op = code.toUpperCase();
              break;
            
          }
      }
      
    }
    
  }*/

    getAllOp(){
    let A = [];
      let opss: any = [];
      this.servicePouchdb.getPlageDocsRapide('fuma:op','fuma:op:\uffff').then((opsA) => {
        if(opsA){
          //opss = ops;
          opsA.forEach((o, index) => {
            if(!o.doc.data.op/* || o.data.op !== ''*/){
              A.push(o.doc)
            }
          })
        }
        let k = [];
         this.servicePouchdb.getPlageDocsRapide('koboSubmission_fuma-op','koboSubmission_fuma-op\uffff').then((opsK) => {
           
          opsK.forEach((o, i) => {
            if(!o.doc.data.op){
             k.push(o.doc) ;
             //this.allOPs.push(o);
            }
          })

          opss = A.concat(k);
         
            //this.ops = opss;
            this.allOP = opss;
          //this.ops = A.concat(k);
          //this.allOPs = this.ops

       
      }, err => console.log(err));

      }, err => console.log(err));
    }


  generateIdEssai(matricule){
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
    var Id= matricule+' '+'ES-'+/*+pays+'-'+region+'-'+department+'-'+commune +'-' +village+ */+randomString 
    return Id;
  }

  generateIdChamps(matricule){
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




 /* getAllOp(){
    this.servicePouchdb.getPlageDocs('fuma:op','fuma:op:\uffff').then((opA) => {
         this.servicePouchdb.getPlageDocs('koboSubmission_fuma-op','koboSubmission_fuma-op\uffff').then((opK) => {
           this.allOP = opA.concat(opK)
      }, err => console.log(err));

      }, err => console.log(err));
  }*/


  //fait la conbinaison de caractere de gauche vers la droite en variant la taille a la recherche d'un code disponible
  genererCodeOP(){
    
    let nom = this.nom_op;
    //let nom = this.nom_op;
    let nom1: any = '';
    for(let i = 0; i < nom.length; i++){
      if(nom.charAt(i) !== ' '){
        nom1 += nom.charAt(i).toString();
      }
    }
    
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
            for(let pos=0; pos < this.allOP.length; pos++){
              let op = this.allOP[pos];
              if((op.data.num_aggrement !== this.ancien_num_a) && (op.data.code_OP === code.toUpperCase())){
                trouve = true;
                //alert(op.data.num_aggrement +' !== '+ this.ancien_num_a + '   '+op.data.code_OP)
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
              nom = this.nom_op.toString() + '123456789'.toString();
              taille_nom = nom.length;
            }
          }else{
              this.code_op = code.toUpperCase();
              break;
            
          }
      }
      
    }else{
      this.code_op = '';
    }
    
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

    //this.selectedVillage = '';
  } 

  chargerAutreNomVillage(v){
    if(v !== 'AUTRE'){
      this.nom_autre_village = 'NA';
    }else{
       let model = this.modelCtl.create('AjouterVillagePage', {'id_commune':this.op.commune, 'nom_commune': this.op.commune_nom});
      model.present();
      model.onDidDismiss(() => {
        this.chargerVillages(this.op.commune);
        this.selectedVillageID = '';
      })
      this.nom_autre_village = '';
    }
  }

  chargerUnion(){
    this.servicePouchdb.getPlageDocs('fuma:union','fuma:union:\uffff').then((uA) => {
         this.servicePouchdb.getPlageDocs('koboSubmission_fuma-union','koboSubmission_fuma-union\uffff').then((uK) => {
          this.unions = uA.concat(uK);
          this.unions.push(this.autreUnion);
      }, err => console.log(err));

      }, err => console.log(err)); 
  }

  chargerAutreNomUnion(u){
    if(u !== 'AUTRE'){
      this.nom_autre_union = 'NA';
    }else{
      let model = this.modelCtl.create('AjouterUnionPage', {'confLocaliteEnquete': this.confLocaliteEnquete});
        model.present();
        model.onDidDismiss(() => {
          this.chargerUnion();
          this.selectedUnionID = '';
      })
      this.nom_autre_union = '';
    }
  }

   verifierUniqueNon(op){
    let res = 1;
    this.allOP.forEach((o, index) => {
      if((o._id !== this.grandeOP._id) && (/*(op.nom_OP === o.data.nom_OP) || */(op.num_aggrement === o.data.num_aggrement) && (op.code_OP !== o.data.code_OP))){
        res = 0;
      }
    });
    return res;
  }


  modifierOP(){
      //  let date = new Date();
    let op = this.opForm.value;
 
    this.op1.nom_OP = op.nom_OP;
    this.op1.code_OP = op.code_OP;
    this.op1.num_aggrement = op.num_aggrement;
    this.op1.village = op.village;
    this.op1.village_nom = op.village_nom;
    this.op1.village_autre = op.village_autre;
    this.op1.union = op.union;
    this.op1.union_nom = op.union_nom;
    this.op1.union_autre = op.union_autre;
    this.op1.num_membre = op.num_membre;
    this.op1.num_hommes = op.num_hommes;
    this.op1.num_femmes = op.num_femmes;

    this.villages.forEach((v, i) => {
      if(v.id === this.selectedVillageID){
        this.op1.village = v.id;
        this.op1.village_nom = v.nom;
      }
    })

    if(this.selectedUnionID !== 'AUTRE'){
      this.unions.forEach((u, i) => {
        if(u.data.num_aggrement === this.selectedUnionID){
          this.op1.union = u.data.num_aggrement;
          this.op1.union_nom = u.data.nom_union;
          this.op1.code_union = u.data.code_union;
        }
      });
    }else{
      this.op1.union = this.autreUnion.data.num_aggrement;
      this.op1.union_nom = this.autreUnion.data.nom_union;
    }
    
    //union.village = this.selectedVillage.id;
    //union.village_nom = this.selectedVillage.nom;
    //let id = this.servicePouchdb.generateId('union', union.pays, union.region, union.departement,union.commune, union.village);
    //union._id = 'fuma'+ id;
    //union.end = date.toJSON();

    if(this.verifierUniqueNon(op) === 0){
      alert('L\'aggrément de l\'OP doit être unique!');
    }else{
      this.grandeOP.data = this.op1
      this.servicePouchdb.updateDocReturn(this.grandeOP).then((res) => {
        this.grandeOP._rev = res.rev;
        this.op = this.grandeOP;
        //alert(this.ancien_num_a +' !== '+this.op1.code_OP)
        if(this.ancien_num_a !== this.op1.num_aggrement && this.ancien_code_op !== this.op1.code_OP){
          this.Changer_num_a_et_code_op(this.ancien_num_a, op.num_aggrement, this.ancien_code_op, this.op1.code_OP, this.op1.nom_op);
        }else if(this.ancien_num_a !== this.op1.num_aggrement && this.ancien_code_op === this.op1.code_OP){
          this.Change_num_a_op(this.ancien_num_a, op.num_aggrement, this.op1.code_OP, this.op1.nom_op);
        }else if(this.ancien_code_op !== this.op1.code_OP){
          this.Changer_code_op(this.op1.num_aggrement, this.ancien_code_op, this.op1.code_OP, this.op1.nom_op);
        }else{
           
          this.Change_nom_op(op.num_aggrement, this.op1.nom_op);
          /* let toast = this.toastCtl.create({
            message: 'OP bien sauvegardée!',
            position: 'top',
            duration: 1000
          });*/
          
          //this.navCtrl.pop();
          this.modifierForm = false;
          //toast.present();
            }

      
      }) ;

    }
  }

  annuler(){
    //this.navCtrl.pop();
    this.modifierForm = false;
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
    this.servicePouchdb.syncAvecToast(this.ionViewDidEnter());
  }

   ionViewDidEnter() {

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

    /* this.servicePouchdb.remoteSaved.getSession((err, response) => {
        if (response.userCtx.name) {
          this.aProfile = true;
        }else{
          this.aProfile = false;
        }
    }, err => {
      if(global.info_user != null){
        this.aProfile = true;
      }else{
        this.aProfile = false;
      }
      //console.log(err)
    }); */

    //console.log('ionViewDidLoad DetailUnionPage');
    /*this.servicePouchdb.getDocById(this.opID).then((o) => {
      this.op = o;
    }, err => console.log(err))*/

    this.initForm();
    this.getAllUnion();
    this.getAllOp();
  }

  editer(op, dbclick: boolean = false){
    if(!dbclick || (dbclick && this.user && this.user.roles && global.estManager(this.user.roles))){
    //this.navCtrl.push('ModifierOpPage', {'op': op});
    this.modifierForm = true;
    //this.getAllOPs();
    }
  }

  membresOP(num_aggrement, nom_OP, code_OP, code_union){
    this.navCtrl.push('MembresPage', {'num_aggrement_op': num_aggrement, 'nom_op': nom_OP, 'code_op': code_OP, 'code_union': code_union});
  }

  supprimer(op){
    let alert = this.alertCtl.create({
      title: 'Suppression OP',
      message: 'Etes vous sûr de vouloir supprimer cette OP ?',
      buttons:[
        {
          text: 'Annuler',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Confirmer',
          handler: () => {
            this.servicePouchdb.deleteDoc(op);
            let toast = this.toastCtl.create({
              message:'OP bien suppriée',
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
      