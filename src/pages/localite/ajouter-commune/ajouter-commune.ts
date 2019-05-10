import { Component } from '@angular/core';
import { NavController, NavParams, IonicPage, ToastController, LoadingController, AlertController, ViewController, MenuController, Events } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { PouchdbProvider } from '../../../providers/pouchdb-provider';

/**
 * Generated class for the AjouterCommunePage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-ajouter-commune',
  templateUrl: 'ajouter-commune.html',
})
export class AjouterCommunePage {
  communeForm: any;
  commune: any;
  allCommune: any = [];
  nom_departement: any;
  id_departement: any;
  id: any = '';
  nom: any = '';


  //pays: any;
  ancien_nom: any = '';
  ancien_id: any = '';

  liste: boolean = false;
  ajouter:boolean = true;
  modifier: boolean = false;
  departement_defini: boolean = false;
  allDepartement: any = [];
  gestion_commune: boolean = false;
  
  constructor(public navCtrl: NavController, public loadingCtl: LoadingController, public alertCtl: AlertController, public menuCtl: MenuController, public viewCtrl: ViewController, public navParams: NavParams,public toastCtl: ToastController, public servicePouchdb: PouchdbProvider, public formBuilder: FormBuilder) {
    
    if(this.navParams.data.liste){
      this.liste = true;
      this.gestion_commune = true;
      this.ajouter = false;
    }

    if(this.navParams.data.departementID){
      this.id_departement = this.navParams.data.departementID;
      //this.nom_departement = this.navParams.data.nom_departement;
      this.departement_defini = true;
    }
    
    
    this.communeForm = this.formBuilder.group({
      id:['', Validators.required],
      nom:['', Validators.required],
      id_departement:['', Validators.required],
      nom_departement:[''],
    });
  }

  ionViewDidEnter() {
     this.servicePouchdb.getDocById('commune').then((commune) => {
       this.allCommune = commune.data;
       this.commune = commune;
       //alert(this.pays._id)
     });

      this.servicePouchdb.getDocById('departement').then((departement) => {
          this.allDepartement = departement.data;
          if(this.id_departement){
            for(let i = 0; i < this.allDepartement.length; i++){
              if(this.allDepartement[i].id == this.id_departement){
                this.nom_departement = this.allDepartement[i].nom;
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
            for(let pos=0; pos < this.allCommune.length; pos++){
              let rg = this.allCommune[pos];
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
    this.allCommune.forEach((p, index) => {
      if((departement.nom.toString().toUpperCase() === p.nom.toString().toUpperCase())){
        res = 0;
      }
    });

    return res;
  }

/*
  ajouter(){
    
    let commune = this.communeForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
      let data = [];
      data = this.commune.data;
      data.push(commune);
      this.commune.data = data;
      this.servicePouchdb.updateLocalite(this.commune);
      let toast = this.toastCtl.create({
        message: 'Commune bien enregistré!',
        position: 'top',
        duration: 3000
      });

      toast.present();
      this.viewCtrl.dismiss();
  //  }
  } 
*/

  actionForm(){
    let commune = this.communeForm.value;
    if(this.ajouter){
        
      if(this.verifierUniqueNon(commune) === 0){
        alert('Les noms des communes doivent être uniques!');
      }else{

       // let region = this.communeForm.value;
  //  if(this.verifierUniqueNon(region) === 0){
    //  alert('Les noms des régions doivent être uniques!');
    //}else{
        let data = [];
        data = this.commune.data;
        if(!this.departement_defini){
          commune.id_departement = this.id_departement.id;
          commune.nom_departement = this.id_departement.nom;
        }
        data.push(commune);
        this.commune.data = data;
        this.commune.type = 'commune';
        this.allCommune = data;
        this.servicePouchdb.updateLocalite(this.commune).then((res) => {
          this.commune._rev = res.rev;
        })
        let toast = this.toastCtl.create({
          message: 'Commune bien enregistré!',
          position: 'top',
          duration: 1000
        });

        toast.present();
        this.ajouter = false;

        if(!this.gestion_commune){
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
      if(!this.departement_defini){
        commune.id_departement = this.id_departement.id;
        commune.nom_departement = this.id_departement.nom;
      }
      this.allCommune.forEach((r, i) => {
        if(r.id === commune.id){
          this.allCommune[i] = commune;
        }
      });

      this.commune.data = this.allCommune;
      //this.allPays.splice(this.pays.indesOf())
      //this.servicePouchdb.updateLocalite(this.commune);
      this.servicePouchdb.updateLocalite(this.commune).then((res) => {
          this.commune._rev = res.rev;
      })
        //recuperer tous les doc pour modifier le nom du pays
        /*this.servicePouchdb.getPlageDocsRapide('fuma', 'fuma:\uffff').then((allDocs) => {
          allDocs.map((doc) => {
            //pour les essais
            *********if(doc.doc.data.type === 'essai' && doc.doc.data.village_producteur === this.ancien_nom ){
              doc.doc.data0village_producteur = pays.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }else ********
            //pour les memebres
            if(doc.doc.data.type === 'membre_op' && doc.doc.data.commune === this.ancien_id ){
              doc.doc.data.commune_nom = commune.nom;
              this.servicePouchdb.updateDoc(doc.doc);
              let info: any = {};
              info.matricule = doc.doc.data.matricule_Membre;
              info.commune = commune.nom
              matricules.push(info);
              info = {};
            }
            else 
            //pour les union
            if(doc.doc.data.type === 'union' && doc.doc.data.commune === this.ancien_id ){
              doc.doc.data.commune_nom = commune.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
            else 
            //pour les op
            if(doc.doc.data.type === 'op' && doc.doc.data.commune === this.ancien_id ){
              doc.doc.data.commune_nom = commune.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }
           *********** else 
            //pour les champs
            if(doc.doc.data.type === 'champs' && doc.doc.data.village === this.ancien_nom ){
              doc.doc.data.village = pays.nom;
              this.servicePouchdb.updateDoc(doc.doc);
            }************
          });

          if(matricules.length > 0){
            for(let i = 0; i < matricules.length; i++){
              this.servicePouchdb.getPlageDocsRapide('fuma:essai:'+matricules[i].matricule, 'fuma:essai:'+matricules[i].matricule+' \uffff').then((essais) => {
                  if(essais){
                    essais.forEach((essai) => {
                      essai.doc.data.site_producteur = +matricules[i].commune;
                      this.servicePouchdb.updateDoc(essai.doc)
                    })
                  }
                });
            }
          }

           let toast = this.toastCtl.create({
              message: 'Commune bien modifier!',
              position: 'top',
              duration: 1000
            });
            toast.present();  
            loading.dismissAll();
        });*/
      
        let toast = this.toastCtl.create({
              message: 'Commune bien modifier!',
              position: 'top',
              duration: 1000
            });

        this.ajouter = false;
        this.modifier = false;
        this.liste = true;
    }
  } 


   ajouterCommune(){
     this.id = '';
     this.nom = '';
     this.id_departement = '';
     this.nom_departement = '';
    this.liste = false;
    this.ajouter = true;
  }

  modifierCommune(commune){

    this.id = commune.id;
    this.nom = commune.nom;
    this.id_departement = commune.id_departement;
    this.nom_departement = commune.nom_departement;
    this.ancien_nom = this.nom;
    this.ancien_id = this.id;
    this.liste = false;
    this.modifier = true;

    this.allDepartement.forEach((departement) => {
      if(this.id_departement === departement.id){
        this.id_departement = departement;
      }
    })
  }

  supprimerCommune(commune){
    let e: any = {};
    let alert = this.alertCtl.create({
      title: 'Suppression Commune',
      message: 'Etes vous sûr de supprimer cette commune ?',
      buttons:[
        {
          text: 'Non',
          handler: () => console.log('suppression annulée')
 
        },
        {
          text: 'Oui',
          handler: () => {
            this.allCommune.forEach((r, i) => {
              if(r.id === commune.id){
                this.allCommune.splice(i, 1);
              }
            });

            this.commune.data = this.allCommune;
            //this.allPays.splice(this.pays.indesOf())
            //this.servicePouchdb.updateLocalite(this.commune);
            this.servicePouchdb.updateLocalite(this.commune).then((res) => {
              this.commune._rev = res.rev;
            })
            let toast = this.toastCtl.create({
              message: 'Commune bien suprimé!',
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
    if(this.gestion_commune){
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
