import { Component, NgZone } from '@angular/core';
import { NavController, IonicPage } from 'ionic-angular';
/*
import { HomePage } from './home/home';
import { CollectPage } from './collect/collect';
import { ResearchPage } from './research/research';
import { ProfilePage } from './profile/profile';
import { AdminPage } from './admin/admin';
*/
//import { FormViewPage } from '../form-view/form-view'
import { PouchdbProvider } from '../../providers/pouchdb-provider'
import { TranslateService  } from '@ngx-translate/core';
import { global } from '../../global-variables/variable'
/*
import { UnionsPage } from '../unions/unions'
import { OpPage } from '../op/op'
import { MembresPage } from '../membres/membres'
import { EssaiPage } from '../essai/essai';
*/
@IonicPage()
@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})  
export class TabsPage {
  
  // public showFormTab = false;

  // onShowForm(agreed: boolean) {
  //   this.showFormTab=true
  // }

  // include formview as unselectable tab to keep window open after form filled
  tab1Root: any = 'HomePage';
  tab2Root: any = 'Essai1Page';
  tab3Root: any = 'ResearchPage';
  //tab4Root: any = ProfilePage;
  tab4Root: any = 'MembresPage';
  tab5Root: any = 'AdminPage';
  tab6Root: any = 'FormViewPage';
  tab10Root: any = 'UnionsPage';
  tab11Root: any = 'OpPage';



  constructor(public translate: TranslateService, private database: PouchdbProvider, private zone: NgZone) {
    this.translate.setDefaultLang(global.langue)
  }

  public ionViewDidEnter() {
    this.translate.use(global.langue)
    //console.log('syncing database')
    //this.database.sync();
    this.initFilter();
    this.getConfig();
    this.database.getChangeListener().subscribe(data => {
      this.zone.run(() => {
        //this.items.push(data.doc);
      });
    });
  }


  getConfig(){
    this.database.getDocById('config-app').then((c) => {
      if(c){
          global.config_app.nom_structure = c.data.nom_structure;
          global.config_app.code_structure = c.data.code_structure
        }
    }).catch((err) => console.log(err));
  }

  initFilter(){
    this.database.getDocById('_design/filtrerDoc').then((c) => {
      if(!c){
          this.ajouterLoalDesignDoc()
        }
    }).catch((err) => this.ajouterLoalDesignDoc());
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
            this.database.createSimpleDocReturn(filter_doc);//.then((res) => alert('Filter mise à jour avec succes')).catch((err) => alert('erreur mise à jour du filter du filter => '+err));
          }else{
            //créer le filtre de base
            //this.ajouterDesignDoc();
            filter_doc._id = '_design/filtrerDoc';
            this.database.createSimpleDocReturn(filter_doc);//.then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter => '+err));
          }
          
        }).catch((err) => {
          //alert(err)
          //this.ajouterDesignDoc();
          filter_doc._id = '_design/filtrerDoc';
          this.database.createSimpleDocReturn(filter_doc);//.then((res) => alert('Filter ajouté avec succes')).catch((err) => alert('erreur ajout du filter '+err));
        });
    

        //global.remoteSaved.put(filter_doc).catch((err) => alert('erreur vers server '+err));
        //this.database.put(doc, doc._id).catch((err) => alert('erreur vers local '+err));
      }
}
