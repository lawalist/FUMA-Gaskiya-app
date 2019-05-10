import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ToastController, LoadingController, AlertController, ViewController, MenuController, Events } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';

/**
 * Generated class for the AjouterVillagePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-ajouter-village',
  templateUrl: 'ajouter-village.html',
})
export class AjouterVillagePage {
  villageForm: any;
  village: any;
  allVillage: any = [];
  nom_commune: any;
  id_commune: any;
  id: any = '';
  nom: any = '';

  //commune: any;
  //allRegions: any = [];
  ancien_nom: any = '';
  ancien_id: any = '';

  liste: boolean = false;
  ajouter:boolean = true;
  modifier: boolean = false;
  commune_defini: boolean = false;
  allCommune: any = [];
  gestion_village: boolean = false;
  
  constructor(public navCtrl: NavController, public loadingCtl: LoadingController, public alertCtl: AlertController, public menuCtl: MenuController, public viewCtrl: ViewController, public navParams: NavParams,public toastCtl: ToastController, public servicePouchdb: PouchdbProvider, public formBuilder: FormBuilder) {
  

    if(this.navParams.data.liste){
      this.liste = true;
      this.gestion_village = true;
      this.ajouter = false;
    }
    
    if(this.navParams.data.communeID){
      this.id_commune = this.navParams.data.communeID;
      //this.nom_commune = this.navParams.data.nom_commune;
      this.commune_defini = true;
    }
    
    
    this.villageForm = this.formBuilder.group({
      id:['', Validators.required],
      nom:['', Validators.required],
      id_commune:[''],
      nom_commune:[''],
    });
  } 

  ionViewDidEnter() {
     this.servicePouchdb.getDocById('village').then((village) => {
       this.allVillage = village.data;
       this.village = village;
       //alert(this.commune._id)
     });

     this.servicePouchdb.getDocById('commune').then((communes) => {
          this.allCommune = communes.data;
          if(this.id_commune){
            for(let i = 0; i < this.allCommune.length; i++){
              if(this.allCommune[i].id == this.id_commune){
                this.nom_commune = this.allCommune[i].nom;
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
            for(let pos=0; pos < this.allVillage.length; pos++){
              let rg = this.allVillage[pos];
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

   verifierUniqueNon(village){
    let res = 1;
    this.allVillage.forEach((p, index) => {
      if((village.nom.toString().toUpperCase() === p.nom.toString().toUpperCase())){
        res = 0;
      }
    });

    return res;
  }


 /* ajouter(){
    
    let village = this.villageForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
      let data = [];
      data = this.village.data;
      data.push(village);
      this.village.data = data;
      this.servicePouchdb.updateLocalite(this.village);
      let toast = this.toastCtl.create({
        message: 'Village bien enregistré!',
        position: 'top',
        duration: 3000
      });

      toast.present();
      this.viewCtrl.dismiss();
  //  }
  } */

  actionForm(){
    let village = this.villageForm.value;
    if(this.ajouter){
        
      if(this.verifierUniqueNon(village) === 0){
        alert('Les noms des villages doivent être uniques!');
      }else{

        //let region = this.regionForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
        let data = [];
        data = this.village.data;
        if(!this.commune_defini){
          village.id_commune = this.id_commune.id;
          village.nom_commune = this.id_commune.nom;
        }
        data.push(village);
        this.village.data = data;
        this.village.type = 'village';
        this.allVillage = data;
        this.servicePouchdb.updateLocalite(this.village).then((res) => {
          this.village._rev = res.rev;
        })
        let toast = this.toastCtl.create({
          message: 'Village bien enregistré!',
          position: 'top',
          duration: 1000
        });

        toast.present();
        this.ajouter = false;

        if(!this.gestion_village){
          this.viewCtrl.dismiss();
        }else{
          this.liste = true;
          this.ajouter = false;
        }
      }
    }else if(this.modifier){
      let matricules: any = [];
      let loading = this.loadingCtl.create({
        content: 'Application des changements en cours...'
      });

      //loading.present();
      //let region = this.regionForm.value;
      if(!this.commune_defini){
        village.id_commune = this.id_commune.id;
        village.nom_commune = this.id_commune.nom;
      }
      this.allVillage.forEach((r, i) => {
        if(r.id === village.id){
          this.allVillage[i] = village;
        }
      });

      this.village.data = this.allVillage;
      //this.allcommune.splice(this.commune.indesOf())
      //this.servicePouchdb.updateLocalite(this.village);
      this.servicePouchdb.updateLocalite(this.village).then((res) => {
          this.village._rev = res.rev;
      })
        //recuperer tous les doc pour modifier le nom du commune
       /* this.servicePouchdb.getPlageDocsRapide('fuma', 'fuma:\uffff').then((allDocs) => {
          allDocs.map((doc) => {
            //pour les essais
            ********if(doc.doc.data.type === 'essai' && doc.doc.data.village_producteur === this.ancien_nom ){
              doc.doc.data0village_producteur = commune.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }else *********
            //pour les memebres
            if(doc.doc.data.type === 'membre_op' && doc.doc.data.village === this.ancien_id ){
              doc.doc.data.village_nom = village.nom;
              this.servicePouchdb.updateDoc(doc.doc);
              let info: any = {};
              info.matricule = doc.doc.data.matricule_Membre;
              info.village = village.nom
              matricules.push(info);
              info = {};
            }
            else 
            //pour les union
            if(doc.doc.data.type === 'union' && doc.doc.data.village === this.ancien_id ){
              doc.doc.data.village_nom = village.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
            else 
            //pour les op
            if(doc.doc.data.type === 'op' && doc.doc.data.village === this.ancien_id ){
              doc.doc.data.village_nom = village.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
           ********* else 
            //pour les champs
            if(doc.doc.data.type === 'champs' && doc.doc.data.village === this.ancien_nom ){
              doc.doc.data.village = commune.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }*******
          });

          if(matricules.length > 0){
            for(let i = 0; i < matricules.length; i++){
              this.servicePouchdb.getPlageDocsRapide('fuma:essai:'+matricules[i].matricule, 'fuma:essai:'+matricules[i].matricule+' \uffff').then((essais) => {
                  if(essais){
                    essais.forEach((essai) => {
                      essai.doc.data.village_producteur = +matricules[i].village;
                      this.servicePouchdb.updateDoc(essai.doc)
                    })
                  }
                });
            }
          }

           let toast = this.toastCtl.create({
              message: 'Village bien modifier!',
              position: 'top',
              duration: 1000
            });
            toast.present();  
            loading.dismissAll();
        });
      */
        let toast = this.toastCtl.create({
              message: 'Village bien modifier!',
              position: 'top',
              duration: 1000
            });
            toast.present();

        this.ajouter = false;
        this.modifier = false;
        this.liste = true;
    }
  } 


   ajouterVillage(){
     this.id = '';
     this.nom = '';
     this.id_commune = '';
     this.nom_commune = '';
    this.liste = false;
    this.ajouter = true;
  }

  modifierVillage(village){

    this.id = village.id;
    this.nom = village.nom;
    this.id_commune = village.id_commune;
    this.nom_commune = village.nom_commune;
    this.ancien_nom = this.nom;
    this.ancien_id = this.id;
    this.liste = false;
    this.modifier = true;

    this.allCommune.forEach((commune) => {
      if(this.id_commune === commune.id){
        this.id_commune = commune;
      }
    })
  }

  supprimerVillage(village){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression village',
      message: 'Etes vous sûr de supprimer ce village ?',
      buttons:[
        {
          text: 'Non',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Oui',
          handler: () => {
            this.allVillage.forEach((r, i) => {
              if(r.id === village.id){
                this.allVillage.splice(i, 1);
              }
            });

            this.village.data = this.allVillage;
            //this.allcommune.splice(this.commune.indesOf())
            //this.servicePouchdb.updateLocalite(this.village);
            this.servicePouchdb.updateLocalite(this.village).then((res) => {
              this.village._rev = res.rev;
            })
            let toast = this.toastCtl.create({
              message: 'Village bien suprimé!',
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
    if(this.gestion_village){
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
