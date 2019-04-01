import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, IonicPage, ToastController } from 'ionic-angular';
import { Validators, FormBuilder } from '@angular/forms';
import { PouchdbProvider } from '../../../../providers/pouchdb-provider';
//import { ProfileUserPage } from '../../profile/profile-user';
import { TranslateService } from '@ngx-translate/core';
import { global } from '../../../../global-variables/variable';
import { Storage } from '@ionic/storage';

/*
  Generated class for the ModifierProfile page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@IonicPage()
@Component({
  selector: 'page-modifier-profile',
  templateUrl: 'modifier-profile.html'
})
export class ModifierProfilePage {
  user: any;
  registerForm: any;
  l: any = global.langue;
  motif: any;
  nom: any = '';
  prenom: any = '';
  sex: any = ''

  constructor(public translate: TranslateService, public navCtrl: NavController, public toastCtl: ToastController, public storage: Storage, public navParams: NavParams, public formBuilder: FormBuilder, public loadingCtl: LoadingController, public gestionService: PouchdbProvider) {
    this.translate.setDefaultLang(global.langue);
    this.user = this.navParams.data.user;
    this.motif = this.navParams.data.motif;
    this.nom = this.user.nom;
    this.prenom = this.user.prenom;
    this.sex = this.user.sex;

    this.registerForm = this.formBuilder.group({
        nom: [''],
        name: [''],
        prenom: [''],
        //username: ['', Validators.required],
        //email: [this.user.email],
        mdpass: [''],
        //confmdpass: ['', Validators.required],
        //date: [this.user.date, Validators.required],
        sex: [''],
    })
  }

  afficheMsg(msg: string){
    let toast = this.toastCtl.create({
      message: msg,
      position: 'top',
      duration: 3000
    });

    toast.present();
  }

  ionViewWillEnter() {
    this.translate.use(global.langue);
    console.log('ionViewDidLoad ModifierProfilePage');
  }

  modifier(){
    let newUserInfo = this.registerForm.value;
    if(!this.motif){
      this.gestionService.remoteSaved.putUser(this.user.name, {
        metadata : {
          prenom : newUserInfo.prenom,
          date : newUserInfo.date,
          sex : newUserInfo.sex,
          nom: newUserInfo.nom
        }
      }, (err, response) => {
        if(err){
          alert('Erreur');
        }else if(response){
          this.gestionService.remoteSaved.getUser(this.user.name, (err, us) => {
            if (!err) {
              global.info_user = us;
              this.storage.set('info_user', us);
              this.afficheMsg('Profile mis à jour avec succès!')
              this.navCtrl.pop();
            }else{
              this.afficheMsg('Profile mis à jour avec succès!')
              this.navCtrl.pop();
            }
          });
        }
        
      });

    }else if(this.motif === 'cpwd'){
      //chager le mot de passe

      this.gestionService.remoteSaved.changePassword(this.user.name, newUserInfo.mdpass, (err, response) => {
        if (err) {
          if (err.name === 'not_found') {
            // typo, or you don't have the privileges to see this user
            alert('Privilège insuffisant');
            //this.navCtrl.pop();
          } else {
            // some other error
            alert('Une erreur est survenue')

          }
        } else {
          global.info_connexion.mdpass = newUserInfo.mdpass;
          this.storage.set('info_connexion', global.info_connexion);
          alert('Mode de pass changé avec succès');
          this.navCtrl.pop();
          // response is the user update response
          // {
          //   "ok": true,
          //   "id": "org.couchdb.user:spiderman",
          //   "rev": "2-09310a62dcc7eea42bf3d4f67e8ff8c4"
          // }
        }
      })

    }else if(this.motif === 'cun'){
      //changer le nom d'utilisateur
      alert(this.user.name+' '+newUserInfo.name)
       this.gestionService.remoteSaved.changeUsername(this.user.name, newUserInfo.name, (err) => {
        if (err) {
          if (err.name === 'not_found') {
            // typo, or you don't have the privileges to see this user
            alert('Privilège insuffisant');
          } else if (err.taken) {
            // auth error, make sure that 'batman' isn't already in DB
            alert('Erreur, assurez vous que l\'utilisateur existe dans la base!')
          } else {
            // some other error
          }
        } else {
          this.user.name = newUserInfo.name;
          global.info_user = this.user;
          this.storage.set('info_user', global.info_user);
          alert('Nom d\'utilisateur changé avec succès');
          this.navCtrl.pop();
          // succeeded
        }
      })
    }
  }
 


}
