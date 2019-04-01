import { Injectable, EventEmitter } from '@angular/core';
import { ToastController, LoadingController, Platform, Events } from 'ionic-angular';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Rx';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Storage } from '@ionic/storage';
import { global } from '../global-variables/variable';
 

//pouchDB made available to compiler through  @types/pouchdb (npm install @types/pouchdb --save --save-exact)
//import PouchDB from 'pouchdb'
declare var require: any;
//import PouchDB from 'pouchdb';
//import 'fs'
import {WriteStream, createWriteStream} from 'fs'
var PouchDB = require('pouchdb').default;
//import * as cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import * as pouchdbAuthentication from 'pouchdb-authentication';

//import * as pouchdbQuickSearch from 'pouchdb-quick-search';

//import * as pouchdbdesign from 'pouchdb-design';
PouchDB.plugin(require('pouchdb-adapter-cordova-sqlite'));
PouchDB.plugin(pouchdbAuthentication);
//PouchDB.plugin(require('pouchdb-design'));
//PouchDB.plugin(require('relational-pouch'));
//PouchDB.plugin(require('pouchdb-full-sync'));
//PouchDB.plugin(require('pouchdb-load'));
import * as replicationStream from 'pouchdb-replication-stream';
//var replicationStream = require('pouchdb-replication-stream');
//var fs = require('fs');

//import fs from 'fs';
//import * as fs from 'fs';
PouchDB.plugin(replicationStream.plugin);
PouchDB.adapter('writableStream', replicationStream.adapters.writableStream);
//PouchDB.plugin(pouchdbQuickSearch); 

//var GQL = require('GQL')
//PouchDB.plugin({ gql: GQL });



@Injectable()
export class PouchdbProvider {

    //declare private variables not available to template
    private isInstantiated: boolean;
    private database: any;
    private listener: EventEmitter<any> = new EventEmitter();
    // private remoteDetails: any;
    
    //pour la sécurité
    remoteSaved: any;
    loading: any;
    pouchOpts = {
        skip_setup: true
    };

    //my array
    data: any;
    roles: any = [];
    codes_unions: any = [];
    codes_ops: any = [];
    codes_protocoles: any = [];
    sites: any = [];
    annees_essais: any = [];
    batch_size = 100;
    batches_limit = 10;
    //wr: createWriteStream
    

 
    constructor(public http: Http, private sanitizer: DomSanitizer, public platform: Platform, public toastCtl: ToastController, public pl: Platform, public events: Events, public loadingCtrl: LoadingController, public storage: Storage) {
      //PouchDB.plugin(cordovaSqlitePlugin);
        //PouchDB.plugin(pouchdbFind);
        //this.remoteDetails = this.http.get('assets/app-config.json').subscribe(res => this.remoteDetails = (res.json()))
        //setup db to connect to single database
        //this.remoteSaved = new PouchDB("http://"+ global.info_db.ip +"/"+global.info_db.nom_db);//, this.pouchOpts);//base production
        //this.remoteSaved = new PouchDB("http://192.168.43.53:5984/fuma_frn_app");//, this.pouchOpts); prod local
        //this.remoteSaved = new PouchDB("http://127.0.0.1:5984/app_fuma")
  //  var wr = fs.createWriteStream('output.txt')
        //createWriteStream('output.txt');

        //le pour appreil autres que les mobiles
        if(!this.platform.is('android') && !this.platform.is('ios')){
          this.batch_size = 100;
          this.batches_limit = 10
        }

        if (!this.isInstantiated) { 

            //this.database = new PouchDB("frna-db"/*, {adapter: 'cordova-sqlite'}*/);
            //this.database.info().then(console.log.bind(console))
            
            this.storage.get('info_db').then((info_db) => {
              if(info_db){
                global.info_db.ip = info_db.ip.toString();
                global.info_db.nom_db =  info_db.nom_db.toString();
                global.info_db.mode_connexion =  info_db.mode_connexion.toString();
                //alert("http://"+ info_db.ip +"/"+info_db.nom_db)
                this.remoteSaved = new PouchDB('http://'+ info_db.ip.toString() +'/'+ info_db.nom_db.toString(), this.pouchOpts);
                global.remoteSaved = this.remoteSaved;
                //this.database = new PouchDB('app-database');
                //this.sync()
                if(global.info_db.mode_connexion == 'online')
                  this.database = this.remoteSaved;
                else
                  this.database = new PouchDB("frna-db"/*, {adapter: 'cordova-sqlite'}*/);////base production
                //alert(this.database.adapter);
                //this.database = new PouchDB("moriben-frn-app-db");////base production moriben
                //this.sync()
                /*this.database.changes({
                    live: true,
                    include_docs: true 
                }).on('change', change => {
                    console.log('db changed') 
                    this.listener.emit(change);
                });*/
                this.isInstantiated = true;
            
              }else{
                if(global.info_db && global.info_db.ip){
                  this.remoteSaved = new PouchDB('http://'+ global.info_db.ip +'/'+ global.info_db.nom_db, this.pouchOpts);
                  global.remoteSaved = this.remoteSaved;
                }
                this.database = new PouchDB("frna-db"/*, {adapter: 'cordova-sqlite'}*/);////base production
                //this.database = new PouchDB("frna-db"/*, {adapter: 'cordova-sqlite'}**/);
                //alert(this.database.adapter);
                //this.database = new PouchDB("moriben-frn-app-db");////base production moriben
                //this.database = new PouchDB('app-database');
              }
            }).catch((err) => {
              if(global.info_db && global.info_db.ip){
                  this.remoteSaved = new PouchDB('http://'+ global.info_db.ip +'/'+ global.info_db.nom_db, this.pouchOpts);
                  global.remoteSaved = this.remoteSaved;
              }
              this.database = new PouchDB("frna-db"/*, {adapter: 'cordova-sqlite'}*/);////base production
              //this.database = new PouchDB("frna-db"/*, {adapter: 'cordova-sqlite'}*/);
              //alert(this.database.adapter);
              //this.database = new PouchDB("fuma-frn-app-db");
              //this.database = new PouchDB("moriben-frn-app-db");////base production moriben
              //this.database = new PouchDB('app-database');
            });

            //this.sync();
            //this.database.sync()
        //}else{
            //this.sync();
        //
      }
    }

    backUpDB(){
      //let p: WriteStream =   new WriteStream(createWriteStream('t.txt'))
      //let wr = new p().path = 'txt';
      
     // var ws = f.cre
      
      /*this.database.dump(p).then((res) => {
        alert(res+'  '+res.ok)
      })*/
    }

    replication(server){
      if(global.info_db.mode_connexion != 'online'){
                 
        let toast = this.toastCtl.create({
          message: 'replication en cours...',
          position: 'top',
          duration: 1000,
          showCloseButton: true,
          closeButtonText: 'ok',
          dismissOnPageChange: true
            });
    
            toast.present();
          // t = true
            //toast.onDidDismiss(() => t = false)
        PouchDB.replicate(this.database, server, {batch_size: 1, batches_limit: 1}).on('change',  (info) => {
            //alert(info)
            //console.log('change', info)
            //this.affichierMsg('Change '+info)
        }).on('paused',  (err) => {
            //console.log('paused', err)
            if(err){
              alert('pause replication vers servveur => '+err)
            }
            
        }).on('active',  ()  => {
            // replicate resumed (e.g. new changes replicating, user went back online)
            //this.affichierMsg('Active')
        }).on('denied',  (err) => {
            //console.log('denied', err)
            /*if(t){
              toast.dismiss()
            }*/
            this.affichierMsg('Erreur replication vers le serveur, accès réfusé par le serveur!')
        }).on('complete',  (info) => {
            //console.log('complete', info)
            /*if(t){
              toast.dismiss()
            }*/
            this.affichierMsg('Replication vers le serveur terminée avec succes')
            //metode;
        }).on('error',  (err) => {
            //console.log('error', err)
            /*if(t){
              toast.dismiss()
            }*/

            alert('err rep => '+err)
            this.affichierMsg('Erreur replication vers le serveur, problème réseau!')
            //metode;
        }).catch((err) => alert('err catch replication => '+err));
      }else
        alert('Vous etes en mode connecté')
    }


    replicationByDocsId(ids: any = [], ip, nom_db, username, paswd){
      if(global.info_db.mode_connexion != 'online'){
        let t: boolean = false;
        //this.affichierMsg('Synchronisation en cours...');
        let toast = this.toastCtl.create({
          message: 'Replication de l\'enregistrement en cours...',
          position: 'top',
          duration: 1000,
          showCloseButton: true,
          closeButtonText: 'ok',
          dismissOnPageChange: true
            });
    
            toast.present();
            t = true
            toast.onDidDismiss(() => t = false)
      
        var optionsSaved = {
          skip_setup: true
          // "auth.username": "fumagaskiya-app",
          //"auth.password": "AA61E1481D12534A9CABE87465474"
          //"auth.username": "admin",
          //"auth.password": "admin"
        }
    
        let remote = new PouchDB('http://'+ ip +'/'+ nom_db,  {
          auth: {
            username: username,
            password: paswd
          },
          ajax: {
            timeout: 4800000,
          }
        });

        this.database.replicate.to(remote, {
          timeout: 60000,
          batch_size: this.batch_size,
          batches_limit: this.batches_limit,
          doc_ids: ids
        }).on('change',  (info) => {
        }).on('paused',  (err) => {
            //console.log('paused', err)
            if(err){
              alert('pause replication de l\'enregistrement => '+err)
            }
            
        }).on('active',  ()  => {
            // replicate resumed (e.g. new changes replicating, user went back online)
            //this.affichierMsg('Active')
        }).on('denied',  (err) => {
            //console.log('denied', err)
            if(t){
              toast.dismiss()
            }
            this.affichierMsg('Erreur replication de l\'enregistrement, accès réfusé par le serveur!')
            remote.close();
        }).on('complete',  (info) => {
            //console.log('complete', info)
            if(t){
              toast.dismiss()
            }
            this.affichierMsg('Replication de l\'enregistrement terminée avec succes')
            remote.close();
            //metode;
        }).on('error',  (err) => {
            //console.log('error', err)
            if(t){
              toast.dismiss()
            }
    
            alert('Erruer  de l\'enregistrement => '+err+ '. hote ==> '+'http://'+ ip +'/'+ nom_db)
            this.affichierMsg('Erreur replication de l\'enregistrement, problème réseau!')
            remote.close();
            //metode;
        });
      }else
        alert('Vous etes en mode connecté')
    }




    syncUsersDB(ip_local, username_local, paswd_local, ip_distant, username_distant, paswd_distant){
        let t: boolean = false;
        //this.affichierMsg('Synchronisation en cours...');
        let toast = this.toastCtl.create({
          message: 'Synchronisation en cours...',
          position: 'top',
          duration: 1000,
          showCloseButton: true,
          closeButtonText: 'ok',
          dismissOnPageChange: true
            });
    
            toast.present();
            t = true
            toast.onDidDismiss(() => t = false)
      
        var optionsSaved = {
          skip_setup: true
        }

        let local = new PouchDB('http://'+ ip_local +'/_users',  {
          auth: {
            username: username_local,
            password: paswd_local
          },
          ajax: {
            timeout: 4800000,
          }
        });
    
        let remote = new PouchDB('http://'+ ip_distant +'/_users',  {
          auth: {
            username: username_distant,
            password: paswd_local
          },
          ajax: {
            timeout: 4800000,
          }
        });

        local.sync(remote, {
          timeout: 60000,
          batch_size: this.batch_size,
          batches_limit: this.batches_limit,
        }).on('change',  (info) => {
        }).on('paused',  (err) => {
            //console.log('paused', err)
            if(err){
              alert('pause sync => '+err)
            }
            
        }).on('active',  ()  => {
            // replicate resumed (e.g. new changes replicating, user went back online)
            //this.affichierMsg('Active')
        }).on('denied',  (err) => {
            //console.log('denied', err)
            if(t){
              toast.dismiss()
            }
            this.affichierMsg('Erreur sync , accès réfusé par le serveur!')
            remote.close();
        }).on('complete',  (info) => {
            //console.log('complete', info)
            if(t){
              toast.dismiss()
            }
            this.affichierMsg('Sync terminée avec succes')
            remote.close();
            //metode;
        }).on('error',  (err) => {
            //console.log('error', err)
            if(t){
              toast.dismiss()
            }
    
            alert('Erruer  Sync => '+err)
            this.affichierMsg('Erreur Sync, problème réseau!')
            remote.close();
            //metode;
        });
    }

  copierDB(){
   
    let codes_unions: any = [];
    //let unions: any = ['WA', 'DO']
    let loading = this.loadingCtrl.create({
      content: 'Transfert en cours...'
    });
    loading.present();
    this.getAllDoc().then((allDoc) => {
      if(allDoc){
       // alert('nbdoc == '+allDoc.length);
        allDoc.forEach((doc) => {
          //copier les données vers la nouvelle base données
          /*if(doc.type && doc.type != '' && doc.type != 'photo' && doc.data){
            var newDoc: any = {};
            newDoc._id = doc._id;
            newDoc.type = doc.type;
            newDoc.data = doc.data;
            copie_db.put(newDoc);
          }else */
          if(doc.data && !doc.data.deleted && doc.data.type && (doc.data.code_union == 'WA' || doc.data.code_union == 'DO' || doc.data.code_union == 'SA' || !doc.data.code_union)){
            var newDoc: any = {};
            newDoc._id = doc._id;
            newDoc.data = doc.data;
            newDoc.rev = doc._rev;

            this.updateCopieDoc(newDoc)
            //alert(doc._rev.substring(0, doc._rev.indexOf('-')))
            /*copie_db.put(newDoc).then((res) => {
              this.updateCopieDco(newDoc, doc);
            }) .catch(err => { alert('err '+err) });*/

          }else if(doc.type && doc.type != '' && doc.type == 'photo' && (doc.code_union == 'WA' || doc.code_union == 'DO' || doc.code_union == 'SA' || !doc.code_union)){
    
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
        
          }/*else{

          }*/
        });

        loading.dismiss();
      }
    }).catch((er) => {
      loading.dismiss();
      alert('err chargement '+er)
    });
  }

  updateCopieDoc(newDoc){

     var copie_db = new PouchDB('http://'+ global.info_db.ip+'/copie_db', {
      auth: {
        username: 'admin',
        password: 'admin'
      },
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
        this.updateCopieDoc(newDoc);
      }).catch(err => { alert('err '+err) })
    }else{
      if(parseInt(newDoc._rev.substring(0, newDoc._rev.indexOf('-'))) < parseInt(newDoc.rev.substring(0, newDoc.rev.indexOf('-')))){
        copie_db.put(newDoc).then((res) => {
          newDoc._rev = res.rev;
          this.updateCopieDoc(newDoc);
        }).catch(err => { alert('err rec '+err) })
      }
    }
    
    
  }

    testerRP(){
      this.database.setSchema([
        {
          singular: 'author',
          plural: 'authors',
          relations: {
            books: {
              hasMany: {
                type: 'book',
                options: {
                  queryInverse: 'author'
                }
              }
            }
          }
        }, {
          singular: 'book',
          plural: 'books',
          relations: {
            author: {
              belongsTo: 'author'
            }
          }
        }
      ]);
      this.database.rel.save('author', {
        name: 'George R. R. Martin',
        id: 10
      }).then(() => {
        return this.database.rel.save('book', {
          title: 'A Game of Thrones',
          id: 6,
          author: 10
        });
      }).then(() => {
        return this.database.rel.save('book', {
          title: 'The Hedge Knight',
          id: 7,
          author: 10
        });
      }).then(() => {
        return this.database.rel.save('book', {
          title: 'Winny the Pooh',
          id: 8,
          author: 10
        })
      }).then(() => {
        var result = this.database.rel.find('author', 1);
        return result.then((data) => {
          alert(data)
        });
      }).catch((err) => alert(err));
    }


    public get(id: string, options?:any) {
        return this.database.get(id);
    }

    public getAll(options?: any) {
        return this.database.allDocs(options);
    }

    public bulkDocs(docs) {
        return this.database.bulkDocs(docs);
    }
    public remove(id) {
        console.log('removing',id)
       return this.database.get(id).then(function (doc) {
            return this.database.remove(doc);
        }.bind(this));
    }

    public put(document: any, id: string) {
        document._id = id;
        return this.get(id).then(result => {
            document._rev = result._rev;
            return this.database.put(document);
        }, error => {
            if (error.status == "404") {
                return this.database.put(document);
            } else {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
        });
    }

    public getAttachment(id,filename) {
        return this.database.getAttachment(id, filename)
    .then(function (blob) {
        var url = URL.createObjectURL(blob);
        return url
    }).catch(function (err) {
        console.log('err',err);
        return ('assets/images/no-photo.png')
        
    });
}

public getMembreAttachment(id,filename) {
  return this.database.getAttachment(id, filename)
}

    public checkExists(id: string) {
    return this.get(id).then(result => {
        return true
    }, error => {
        //not found error message
        if (error.status == "404") {
            return false
        } else {
            //other errors
            return false
        }
    });
}

    public sync(remote ?: string, options: any = {}) {

      if(global.info_db.mode_connexion != 'online'){
                 
        if(global.info_user && global.info_user.roles){
          this.roles = global.info_user.roles
        }else{
          this.roles = []
        }
      
        if(global.info_user && global.info_user.codes_unions){
          this.codes_unions = global.info_user.codes_unions
        }else{
          this.codes_unions = []
        }

        if(global.info_user && global.info_user.codes_ops){
          this.codes_ops = global.info_user.codes_ops
        }else{
          this.codes_ops = []
        }

        if(global.info_user && global.info_user.codes_protocoles){
          this.codes_protocoles = global.info_user.codes_protocoles
        }else{
          this.codes_protocoles = []
        }

        if(global.info_user && global.info_user.sites){
          this.sites = global.info_user.sites
        }else{
          this.sites = []
        }

        if(global.info_user && global.info_user.annees_essais){
          this.annees_essais = global.info_user.annees_essais
        }else{
          this.annees_essais = []
        }
        console.log('setting up db sync')
        //default connection
        // if (!remote) {
        //     remote = this.remoteDetails['remote-couch-url']
        //     options = {
        //         "auth.username": this.remoteDetails.username,
        //         "auth.password": this.remoteDetails.password
        //     }
        // }

        
        //var remoteSaved = "http://fumagaskiya-db.stats4sd.org/test"
        //var remoteSaved = "http://127.0.0.1:5984/app_fuma"
        var optionsSaved = {
          skip_setup: true
          //  "auth.username": "fumagaskiya-app",
          // "auth.password": "AA61E1481D12534A9CABE87465474"
          //"auth.username": "admin",
          //"auth.password": "admin"
        }
        //let remoteDatabase = new PouchDB(remoteSaved, optionsSaved);
        // let remoteDatabase = new PouchDB(this.remoteSaved, optionsSaved);
        //console.log('remoteDB', remoteDatabase)
        //this.database.sync(remoteDatabase, {
        //this.database.compact().then(() => {
        // this.affichierMsg('Commpaction ok');
          this.database.sync(this.remoteSaved, {
            live: true,
            retry: true,
            continuous: true,
            batch_size: this.batch_size,
            batches_limit: this.batches_limit,
            filter: 'filtrerDoc/myfilter',
            query_params: {roles: this.roles, codes_unions: this.codes_unions, codes_ops: this.codes_ops, codes_protocoles: this.codes_protocoles, sites: this.sites}
        }).on('change', function (info) {
            //alert(info)
            console.log('change', info)
        }).on('paused', function (err) {
            //alert('sync paused => ' +err)
        }).on('active', function () {
            // replicate resumed (e.g. new changes replicating, user went back online)
        }).on('denied', function (err) {
            alert('sync denied => '+ err)
        }).on('complete', function (info) {
            this.affichierMsg('sync complete')
        }).on('error', function (err) {
            alert('error sync => '+ err)
        });
      //});
      }else
        alert('Vous etes en mode connecté')

}

getAttachement(id){
  return this.database.get(id, {attachments: true})
}


getAllDoc(){
      //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        attachments: true,
        //revs: true,
      }).then((result) => {
        data = [];
        let doc = result.rows.map((row) => {
            //data.push(row);
            data.push(row.doc);
        });

        resolve(data);

        this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );

}

public syncIinfoDB(ip, nom) {
  this.isInstantiated = false;
  if(global.info_user && global.info_user.roles){
      this.roles = global.info_user.roles
    }else{
      this.roles = []
    }
  
    if(global.info_user && global.info_user.codes_unions){
      this.codes_unions = global.info_user.codes_unions
    }else{
      this.codes_unions = []
    }

    if(global.info_user && global.info_user.codes_ops){
      this.codes_ops = global.info_user.codes_ops
    }else{
      this.codes_ops = []
    }

    if(global.info_user && global.info_user.codes_protocoles){
      this.codes_protocoles = global.info_user.codes_protocoles
    }else{
      this.codes_protocoles = []
    }

    
    if(global.info_user && global.info_user.sites){
      this.sites = global.info_user.sites
    }else{
      this.sites = []
    }

    if(global.info_user && global.info_user.annees_essais){
      this.annees_essais = global.info_user.annees_essais
    }else{
      this.annees_essais = []
    }
    
  //alert("http://"+ ip +"/"+nom)
  //this.remoteSaved = null;
  this.remoteSaved = new PouchDB('http://'+ ip +'/'+ nom, this.pouchOpts);
  global.remoteSaved = this.remoteSaved;
  if(global.info_db.mode_connexion == 'online'){
    this.database = this.remoteSaved;
    this.testConnexion()
  }
  else{
    this.database = new PouchDB("frna-db"/*, {adapter: 'cordova-sqlite'}*/);////base production

    this.testConnexion()
      console.log('setting up db sync')
      //default connection
      // if (!remote) {
      //     remote = this.remoteDetails['remote-couch-url']
      //     options = {
      //         "auth.username": this.remoteDetails.username,
      //         "auth.password": this.remoteDetails.password
      //     }
      // }

      
      //var remoteSaved = "http://fumagaskiya-db.stats4sd.org/test"
      //var remoteSaved = "http://127.0.0.1:5984/app_fuma"
      var optionsSaved = {
        //  "auth.username": "fumagaskiya-app",
        // "auth.password": "AA61E1481D12534A9CABE87465474"
        //"auth.username": "admin",
        //"auth.password": "admin"
      }
      //let remoteDatabase = new PouchDB(remoteSaved, optionsSaved);
      //let remoteDatabase = new PouchDB(this.remoteSaved, optionsSaved);
      //console.log('remoteDB', remoteDatabase)
      //this.database.compact().then(() => {
        //this.affichierMsg('Commpaction ok');
        this.database.sync(this.remoteSaved, {
          live: true,
          retry: true,
          continuous: true,
          batch_size: this.batch_size,
          batches_limit: this.batches_limit,
          filter: 'filtrerDoc/myfilter',
          query_params: {roles: this.roles, codes_unions: this.codes_unions, codes_ops: this.codes_ops, codes_protocoles: this.codes_protocoles, sites: this.sites}
      }).on('change', function (info) {
          //alert(info)
          //console.log('change', info)
      }).on('paused', function (err) {
          //alert('sync paused => '+ err)
      }).on('active', function () {
          // replicate resumed (e.g. new changes replicating, user went back online)
          this.affichierMsg('Synchronisation en cours...')
      }).on('denied', function (err) {
          //console.log('denied', err)
          this.affichierMsg('Erreur synchronisation, accès réfusé par le serveur!')
      }).on('complete', function (info) {
          //console.log('complete', info)
          this.affichierMsg('Synchronisation terminée avec succes')
      }).on('error', function (err) {
          //console.log('error', err)
          alert('Erreur synchronisation, problème réseau! => '+err)
      });
    //});
    }

}

    affichierMsg(msg = 'Enregistrement mis à jour'){
    let toast = this.toastCtl.create({
      message: msg,
      position: 'top',
      duration: 1500,
      showCloseButton: true,
      closeButtonText: 'ok',
      dismissOnPageChange: true
        });

        toast.present();
    }

  public syncAvecToast(metode: any = '') {
    if(global.info_db.mode_connexion != 'online'){
                
      //console.log('setting up db sync')
      let t: boolean = false;
      if(global.info_user && global.info_user.roles){
        this.roles = global.info_user.roles
      }else{
        this.roles = []
      }
    
      if(global.info_user && global.info_user.codes_unions){
        this.codes_unions = global.info_user.codes_unions
      }else{
        this.codes_unions = []
      }

      if(global.info_user && global.info_user.codes_ops){
        this.codes_ops = global.info_user.codes_ops
      }else{
        this.codes_ops = []
      }

      if(global.info_user && global.info_user.codes_protocoles){
        this.codes_protocoles = global.info_user.codes_protocoles
      }else{
        this.codes_protocoles = []
      }

      if(global.info_user && global.info_user.sites){
        this.sites = global.info_user.sites
      }else{
        this.sites = []
      }
      //this.affichierMsg('Synchronisation en cours...');
      let toast = this.toastCtl.create({
        message: 'Synchronisation en cours...',
        position: 'top',
        duration: 1000,
        showCloseButton: true,
        closeButtonText: 'ok',
        dismissOnPageChange: true
          });

          toast.present();
          t = true
          toast.onDidDismiss(() => t = false)
    // }
      //default connection
      // if (!remote) {
      //     remote = this.remoteDetails['remote-couch-url']
      //     options = {
      //         "auth.username": this.remoteDetails.username,
      //         "auth.password": this.remoteDetails.password
      //     }
      // }

      
      //var remoteSaved = "http://fumagaskiya-db.stats4sd.org/test"
      //var remoteSaved = "http://127.0.0.1:5984/app_fuma"
      var optionsSaved = {
        skip_setup: true
        // "auth.username": "fumagaskiya-app",
        //"auth.password": "AA61E1481D12534A9CABE87465474"
        //"auth.username": "admin",
        //"auth.password": "admin"
      }
      //let remoteDatabase = new PouchDB(remoteSaved, optionsSaved);
      this.remoteSaved = new PouchDB('http://'+ global.info_db.ip +'/'+ global.info_db.nom_db, this.pouchOpts);
      global.remoteSaved = this.remoteSaved;
      //console.log('remoteDB', remoteDatabase)
      //alert(global.info_db.ip+'   '+global.info_db.nom_db + '  '+this.remoteSaved)
      //this.database.compact().then(() => {
        //this.affichierMsg('Commpaction ok');
        this.database.sync(this.remoteSaved, {
          //live: true,
          //retry: true,
          //continuous: true
          timeout: 60000,
          batch_size: this.batch_size,
          batches_limit: this.batches_limit,
          filter: 'filtrerDoc/myfilter',
          query_params: {roles: this.roles, codes_unions: this.codes_unions, codes_ops: this.codes_ops, codes_protocoles: this.codes_protocoles, sites: this.sites}
      }).on('change',  (info) => {
          //alert(info)
          //console.log('change', info)
      }).on('paused',  (err) => {
          //alert('sync paused => '+ err)
          if(err){
            alert('pause sync depuis serveur => '+err)
          }
      }).on('active',  ()  => {
          // replicate resumed (e.g. new changes replicating, user went back online)
      }).on('denied',  (err) => {
          //console.log('denied', err)
          if(t){
            toast.dismiss()
          }
          this.affichierMsg('Erreur synchronisation, accès réfusé par le serveur!')
      }).on('complete',  (info) => {
          //console.log('complete', info)
          if(t){
            toast.dismiss()
          }
          this.affichierMsg('Synchronisation terminée avec succes')
          //metode;
      }).on('error',  (err) => {
          //console.log('error', err)
          if(t){
            toast.dismiss()
          }

          alert(err+ '. hote ==> '+'http://'+ global.info_db.ip +'/'+ global.info_db.nom_db)
          this.affichierMsg('Erreur synchronisation, problème réseau!')
          //metode;
      });
    //});
    }else
      alert('Vous etes en mode connecté')
}


public replicationDepuisServeur() {
  if(global.info_db.mode_connexion != 'online'){
                
      //console.log('setting up db sync')
      let t: boolean = false;
      if(global.info_user && global.info_user.roles){
        this.roles = global.info_user.roles
      }else{
        this.roles = []
      }
    
      if(global.info_user && global.info_user.codes_unions){
        this.codes_unions = global.info_user.codes_unions
      }else{
        this.codes_unions = []
      }

      if(global.info_user && global.info_user.codes_ops){
        this.codes_ops = global.info_user.codes_ops
      }else{
        this.codes_ops = []
      }

      if(global.info_user && global.info_user.codes_protocoles){
        this.codes_protocoles = global.info_user.codes_protocoles
      }else{
        this.codes_protocoles = []
      }

      
      if(global.info_user && global.info_user.sites){
        this.sites = global.info_user.sites
      }else{
        this.sites = []
      }
      //this.affichierMsg('Synchronisation en cours...');
      let toast = this.toastCtl.create({
        message: 'Replication depuis le serveur en cours...',
        position: 'top',
        duration: 1000,
        showCloseButton: true,
        closeButtonText: 'ok',
        dismissOnPageChange: true
          });

          toast.present();
          t = true
          toast.onDidDismiss(() => t = false)
    // }
      //default connection
      // if (!remote) {
      //     remote = this.remoteDetails['remote-couch-url']
      //     options = {
      //         "auth.username": this.remoteDetails.username,
      //         "auth.password": this.remoteDetails.password
      //     }
      // }

      
      //var remoteSaved = "http://fumagaskiya-db.stats4sd.org/test"
      //var remoteSaved = "http://127.0.0.1:5984/app_fuma"
      var optionsSaved = {
        skip_setup: true
        // "auth.username": "fumagaskiya-app",
        //"auth.password": "AA61E1481D12534A9CABE87465474"
        //"auth.username": "admin",
        //"auth.password": "admin"
      }
      
      //let remoteDatabase = new PouchDB(remoteSaved, optionsSaved);
      this.remoteSaved = new PouchDB('http://'+ global.info_db.ip +'/'+ global.info_db.nom_db, this.pouchOpts);
      global.remoteSaved = this.remoteSaved;
      //console.log('remoteDB', remoteDatabase)
      //alert(global.info_db.ip+'   '+global.info_db.nom_db + '  '+this.remoteSaved)
      //this.database.compact().then(() => {
        //this.affichierMsg('Commpaction ok');
        this.database.replicate.from(this.remoteSaved, {
          //live: true,
          //retry: true,
          //continuous: true
          timeout: 60000,
          batch_size: this.batch_size,
          batches_limit: this.batches_limit,
          filter: 'filtrerDoc/myfilter',
          query_params: {roles: this.roles, codes_unions: this.codes_unions, codes_ops: this.codes_ops, codes_protocoles: this.codes_protocoles, sites: this.sites}
      }).on('change',  (info) => {
          //alert(info)
          //console.log('change', info)
      }).on('paused',  (err) => {
          //console.log('paused', err)
          if(err){
            alert('pause replication depuis serveur => '+err)
          }
          
      }).on('active',  ()  => {
          // replicate resumed (e.g. new changes replicating, user went back online)
      }).on('denied',  (err) => {
          //console.log('denied', err)
          if(t){
            toast.dismiss()
          }
          this.affichierMsg('Erreur replication depuis le serveur, accès réfusé par le serveur!')
      }).on('complete',  (info) => {
          //console.log('complete', info)
          if(t){
            toast.dismiss()
          }
          this.affichierMsg('Replication depuis le serveur terminée avec succes')
          //metode;
      }).on('error',  (err) => {
          //console.log('error', err)
          if(t){
            toast.dismiss()
          }

          alert(err+ '. hote ==> '+'http://'+ global.info_db.ip +'/'+ global.info_db.nom_db)
          this.affichierMsg('Erreur replication depuis le serveur, problème réseau!')
          //metode;
      });
    //});
    }else
      alert('Vous etes en mode connecté')
}


public replicationVersServeur() {
  if(global.info_db.mode_connexion != 'online'){

      //console.log('setting up db sync')
      //if(this.pl)
      let t: boolean = false;
      if(global.info_user && global.info_user.roles){
        this.roles = global.info_user.roles
      }else{
        this.roles = []
      }
    
      if(global.info_user && global.info_user.codes_unions){
        this.codes_unions = global.info_user.codes_unions
      }else{
        this.codes_unions = []
      }

      if(global.info_user && global.info_user.codes_ops){
        this.codes_ops = global.info_user.codes_ops
      }else{
        this.codes_ops = []
      }

      if(global.info_user && global.info_user.codes_protocoles){
        this.codes_protocoles = global.info_user.codes_protocoles
      }else{
        this.codes_protocoles = []
      }

      if(global.info_user && global.info_user.sites){
        this.sites = global.info_user.sites
      }else{
        this.sites = []
      }
      //this.affichierMsg('Synchronisation en cours...');
      let toast = this.toastCtl.create({
        message: 'Replication vers le serveur en cours...',
        position: 'top',
        duration: 1000,
        showCloseButton: true,
        closeButtonText: 'ok',
        dismissOnPageChange: true
          });

          toast.present();
          t = true
          toast.onDidDismiss(() => t = false)
    // }
      //default connection
      // if (!remote) {
      //     remote = this.remoteDetails['remote-couch-url']
      //     options = {
      //         "auth.username": this.remoteDetails.username,
      //         "auth.password": this.remoteDetails.password
      //     }
      // }

      
      //var remoteSaved = "http://fumagaskiya-db.stats4sd.org/test"
      //var remoteSaved = "http://127.0.0.1:5984/app_fuma"
      var optionsSaved = {
        skip_setup: true
        // "auth.username": "fumagaskiya-app",
        //"auth.password": "AA61E1481D12534A9CABE87465474"
        //"auth.username": "admin",
        //"auth.password": "admin"
      }

  
      //let remoteDatabase = new PouchDB(remoteSaved, optionsSaved);
      this.remoteSaved = new PouchDB('http://'+ global.info_db.ip +'/'+ global.info_db.nom_db, this.pouchOpts);
      global.remoteSaved = this.remoteSaved;
      //console.log('remoteDB', remoteDatabase)
      //alert(global.info_db.ip+'   '+global.info_db.nom_db + '  '+this.remoteSaved)
      //this.database.compact().then(() => {
        //this.affichierMsg('Commpaction ok');
        this.database.replicate.to(this.remoteSaved, {
          //live: true,
          //retry: true,
          //continuous: true
          timeout: 60000,
          batch_size: this.batch_size,
          batches_limit: this.batches_limit,
          filter: 'filtrerDoc/myfilter',
          query_params: {roles: this.roles, codes_unions: this.codes_unions, codes_ops: this.codes_ops, codes_protocoles: this.codes_protocoles, sites: this.sites}
      }).on('change',  (info) => {
          //alert(info)
          //console.log('change', info)
          //this.affichierMsg('Change '+info)
      }).on('paused',  (err) => {
          //console.log('paused', err)
          if(err){
            alert('pause replication vers servveur => '+err)
          }
          
      }).on('active',  ()  => {
          // replicate resumed (e.g. new changes replicating, user went back online)
          //this.affichierMsg('Active')
      }).on('denied',  (err) => {
          //console.log('denied', err)
          if(t){
            toast.dismiss()
          }
          this.affichierMsg('Erreur replication vers le serveur, accès réfusé par le serveur!')
      }).on('complete',  (info) => {
          //console.log('complete', info)
          if(t){
            toast.dismiss()
          }
          this.affichierMsg('Replication vers le serveur terminée avec succes')
          //metode;
      }).on('error',  (err) => {
          //console.log('error', err)
          if(t){
            toast.dismiss()
          }

          alert(err+ '. hote ==> '+'http://'+ global.info_db.ip +'/'+ global.info_db.nom_db)
          this.affichierMsg('Erreur replication vers le serveur, problème réseau!')
          //metode;
      });
  // });
    }else
      alert('Vous etes en mode connecté')
}


compacteLocalDB(){
  let loading = this.loadingCtrl.create({
    content: 'Compression de la base de données local en cours...',
  });

  loading.present();
  

  this.database.compact().then((result) => {
    // handle result
    loading.dismiss();
    this.affichierMsg('Compression terminée avec succes');
  }).catch(function (err) {
    alert('Un erreur est survenue lors de la compression => '+err);
  });
}


compacteRemoteDB(){
  let loading = this.loadingCtrl.create({
    content: 'Compression de la base de données serveur en cours...',
  });

  loading.present();
  

  global.remoteSaved.compact().then((result) => {
    // handle result
    loading.dismiss();
    this.affichierMsg('Compression terminée avec succes');
  }).catch(function (err) {
    alert('Un erreur est survenue lors de la compression => '+err);
  });
}



    public getChangeListener() {
    return this.listener;
}

getProgress(pending){
  var progress;
  var batch_size =  1000;
  var pendingMax = 0;

  pendingMax = pendingMax < pending ? pending + batch_size : pendingMax;
  if(pendingMax > 0){
    progress = 1 - pending/pendingMax;
    if(pending === 0){
      pendingMax = 0;
    }
  }else{
    progress = 1; //100%
  }

  return progress;
}



/**************************************************************************************/
/**************************************************************************************/
/*********************************** my changes ***************************************/
/**************************************************************************************/
/**************************************************************************************/

  removeAtachement(id){
    return this.database.get(id).then(function (doc) {
            return  this.database.removeAttachment(doc._id, doc._id + '.jpeg', doc._rev);
        }.bind(this));
     
  }

  getDocById(id){
    return this.database.get(id);
  }

  delete(doc){
      this.database.remove(doc).catch((err) => console.log(err));
  }

  deleteReturn(doc){
    doc._deleted = true;
    return this.database.put(doc);
    //return this.database.remove(doc);
}

  createDoc(doc){
    let dat = new Date();
    doc.data.created_at = dat.toJSON();
    doc.data.updatet_at = dat.toJSON();
    //doc.data.created_by = '';
    if(global.info_user !== null){
      doc.data.created_by = global.info_user.name;
    }else{
      doc.data.created_by = '';
    }
    //doc.data.updated_by = '';
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    doc.data.deleted = false;
    /*doc.deleted_at = '';
    doc.deleted_by = '';
    doc.supprime = false;
    doc.annuler_at = '';
    doc.annuler_by = '';
    doc.annuler = false;
    this.storage.get('gerant').then((gerant) => {
      if(gerant){
        doc.created_by = gerant.name;
        doc.updated_by = gerant.name;
        this.db.post(doc); 
      }else{
        doc.created_by = '';
        doc.updated_by = '';
        this.db.put(doc); 
      }
       
    });*/
    
    this.database.put(doc).catch((err) => alert('Erreur lors de l\'enreistrement. \nVeuillez reéssayer plus tard!'));
  }

   createDocReturn(doc){
    let dat = new Date();
    doc.data.created_at = dat.toJSON();
    doc.data.updatet_at = dat.toJSON();
    //doc.data.created_by = '';
    if(global.info_user !== null){
      doc.data.created_by = global.info_user.name;
    }else{
      doc.data.created_by = '';
    }
    //doc.data.updated_by = '';
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    doc.data.deleted = false;
    
    return this.database.put(doc);
  }

  createSimpleDocReturn(doc){
    
    return this.database.put(doc);
  }

   updateDocReturn(doc){
    let dat = new Date();
    //doc.data.created_at = dat.toJSON();
    doc.data.updatet_at = dat.toJSON();
    //doc.data.created_by = '';
    /*if(global.info_user !== null){
      doc.data.created_by = global.info_user.name;
    }else{
      doc.data.created_by = '';
    }*/
    //doc.data.updated_by = '';
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    doc.data.deleted = false;
    
    return this.database.put(doc);
  }


  getPlageDocs(startkey, endkey){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        data = [];
        let doc = result.rows.map((row) => {
           if(!row.doc.data.deleted){
            //data.push(row);
            data.push(row.doc);
          }
            
        });

        resolve(data);

        this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }

  getPlageDocsRapide(startkey, endkey){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted){
            data.push(row);
          }
            
        });

        
        resolve(data);

        this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }


  
  getPlagePhotoRapide(startkey, endkey){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        attachments: true,
        startkey: startkey,
        endkey: endkey
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          data.push(row);
      
            
        });

        
        resolve(data);

        this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }


   getPlageDocsAvecLimit(startkey, endkey, limit){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey,
        limit: limit,
      }).then((result) => {
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted){
            //data.push(row);
            data.push(row.doc);
          }
            //data.push(row.doc);
        });

        resolve(data);

        this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }

   getPlageDocsRapideAvecLimit(startkey, endkey, limit){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey,
        limit: limit,
      }).then((result) => {
        data = [];
        //data = result.rows;

        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted){
            data.push(row);
          }
            
        });

        resolve(data);

        this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => console.log(err));
    } );
  }

    getPlageDocsRapideAvecLimitO(startkey, endkey, limit):Observable<any> {

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return Observable.fromPromise (
      this.database.allDocs({
        include_docs: true,
        startkey: startkey,
        endkey: endkey,
        limit: limit,
      }).then((result) => {
        data = result.rows;
        /*let doc = result.rows.map((row) => {
          
            data.push(row.doc);
        });*/

       

        this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      
        return data;
      })//.catch((err) => console.log(err));
     );
  }



  deleteDoc(doc){
    let dat = new Date();
    doc.data.deleted_at = dat.toJSON();
    if(global.info_user !== null){
      doc.data.deleted_by = global.info_user.name;
    }else{
      doc.data.deleted_by = '';
    }
    doc.data.deleted = true;
   // this.database.put(doc).catch((err) => console.log(err));
    /*let dat = new Date();
    doc.deleted_at = dat.toJSON();
    //doc.deleted_by = '';
    //doc._deleted = true;
    doc.supprime = true;
    doc.annuler_at = '';
    doc.annuler_by = '';
    doc.annuler = false;
    this.storage.get('gerant').then((gerant) => {
      if(gerant){
        //doc.created_by = gerant.name;
        doc.deleted_by = gerant.name;
        this.db.put(doc).catch((err) => console.log(err)); 
      }else{
       // doc.created_by = '';
        doc.deleted_by = '';
        this.db.put(doc).catch((err) => console.log(err)); 
      }
       
    });*/
    //this.database.remove(doc).catch((err) => console.log(err));
    this.database.put(doc);//this.database.remove(doc);//.catch((err) => console.log(err));
    //this.db.put(doc).catch((err) => console.log(err));
  }

  deleteDocReturn(doc){
    let dat = new Date();
    doc.data.deleted_at = dat.toJSON();
    if(global.info_user !== null){
      doc.data.deleted_by = global.info_user.name;
    }else{
      doc.data.deleted_by = '';
    }
    doc.data.deleted = true;
    //let newDoc: any = {};
    //newDoc.data = doc.data;
    //newDoc._id = 'deleted:doc:'+doc._id;

    //newDoc._rev = doc._rev;
    //this.database.put(newDoc);
    return  this.database.put(doc);//this.database.remove(doc);//.catch((err) => console.log(err));
  }

  updateDoc(doc){
    let dat = new Date();
    doc.data.updatet_at = dat.toJSON();
    if(global.info_user !== null){
      doc.data.updated_by = global.info_user.name;
    }else{
      doc.data.updated_by = '';
    }
    
    doc.data.deleted = false;
    /*doc.deleted_at = '';
    doc.deleted_by = '';
    doc.supprime = false;
    doc.annuler_at = '';
    doc.annuler_by = '';
    doc.annuler = false;
    this.storage.get('gerant').then((gerant) => {
      if(gerant){
        //doc.created_by = gerant.name;
        doc.updated_by = gerant.name;
        this.db.put(doc).catch((err) => console.log(err)); 
      }else{
       // doc.created_by = '';
        doc.updated_by = '';
        this.db.put(doc).catch((err) => console.log(err)); 
      }
       
    });*/
    
    this.database.put(doc).catch((err) => console.log(err));
  }

   

  updateLocalite(doc){
    /*let dat = new Date();
    doc.updated_at = dat.toJSON();
    if(global.info_user !== null){
      doc.updated_by = global.info_user.name;
    }else{
      doc.updated_by = '';
    }
    
    doc.deleted = false; */   
    return this.database.put(doc); //.catch((err) => console.log(err));
  }



  handleChange(change){
    let changeDoc = null;
    let changeIndex = null;

    this.data.forEach((doc, index) => {
      if(doc._id === change.id){
        changeDoc = doc;
        changeIndex = index;
      }
    });

    //le document a ete supprime

    if(change.delete){
      this.data.splice(changeIndex, 1);
    }else{
      //mise a jour
      if(changeDoc){
        this.data[changeIndex] = change.doc;
      }
      //ajout
      else{
        this.data.push(change.doc);
      }
    }
  }

  generateId(operation, pays, region, departement, commune, village){
    var pays = pays||'XX'
    var region = region||'XX'
    var department = departement || 'XX'
    var commune = commune || 'XX'
    var village = village || 'XX'
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
    var Id= ':'+operation+':'+pays+'-'+region+'-'+department+'-'+commune +'-'+ village+ '-'+randomString 
    return Id
  }

  generateId1(operation, village/*, departement, commune, village*/){
    //var pays = pays||'XX'
    //var region = region||'XX'
    //var department = departement || 'XX'
    //var commune = commune || 'XX'
    var village = village || 'XX'
    //select 3 random numbers and random letter for up to 25,000 unique per department
    //var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
    var numbers='0123456789ABCDEFGHIJKLMNPQRSTUVWYZ'
    var randomArray=[]
    for(let i=0;i<20;i++){
      var rand = Math.floor(Math.random()*34)
      randomArray.push(numbers[rand])
    }
    //randomArray.push('-')
    //var rand = Math.floor(Math.random()*24)
    //randomArray.push(chars[rand])
    var randomString=randomArray.join("");
    var Id= operation+':'+village+/*'-'+department+'-'+commune +'-'+ village+*/ '-'+randomString 
    return Id
  }

  reset(){
 
      //this.data = null;
      let load = this.loadingCtrl.create({
        content: 'Réinialisation de la BD en cours...'
      });

      load.present();
  
      this.database.destroy().then(() => {
        console.log("database removed");
        this.logout('oui');
        this.isInstantiated = false;
        this.storage.remove('info_user').catch((err) => console.log(err));
        this.storage.remove('info_connexion').catch((err) => console.log(err));
        this.storage.remove('confLocaliteEnquete').catch((err) => console.log(err));
        this.storage.remove('info_db').catch((err) => console.log(err));
        let toast = this.toastCtl.create({
          message:'Base de données bien réinitialiser',
          position: 'top',
          duration: 1000,
          showCloseButton: true,
        closeButtonText: 'ok',
        dismissOnPageChange: true
        });

        toast.present();
        

        load.dismiss();
        this.pl.exitApp();
      }, err =>  {
        load.dismiss();
        console.log()
        
      });
    }

    generateOderId(operation){
    var chars='ABCDEFGHIJKLMNPQRSTUVWYZ'
    var numbers='0123456789'
    var randomArray=[]
    for(let i=0;i<15;i++){
      var rand = Math.floor(Math.random()*10)
      var rand = Math.floor(Math.random()*24)
      randomArray.push(numbers[rand])
      randomArray.push(chars[rand])
    }
    //randomArray.push('-')
    //var rand = Math.floor(Math.random()*24)
    //randomArray.push(chars[rand])
    var randomString=randomArray.join("");
    var Id= ':'+operation+':'+randomString;
    return Id
  }


  /**************************************************
  ***************************************************
  ************ Sécurity section *********************
  ***************************************************
  **************************************************/
  
  showLoader(msg: any){
    this.loading = this.loadingCtrl.create({
      content: msg
    });
    this.loading.present();
  }

  register(username: any, mdpass: any, meta = {}){
    this.showLoader('Création du compte...');
    //let db = new PouchDB('http://localhost:5984/stock-fuma');
    this.remoteSaved.signup(username, mdpass,{metadata : meta}, (err, response) => {
      if(err){
        this.loading.dismiss();
        if (err.name === 'conflict') {
            return 'username exist';
          }else  if (err.name === 'forbidden') {
            return 'username invalide';
          } else{
            return 'erreur';
          }
      }else if(response){
        this.loading.dismiss();
        return 'success';
      }else{
        this.loading.dismiss();
        return 'echec';
      }
        
    });
  }

  login(username: any, mdpass: any){
    let ajaxOpts = {
      ajax: {
        headers: {
          Authorization: 'Basic ' + window.btoa(username + ':' + mdpass),
        }
      }
    };
    this.showLoader('Authentification...');
    //this.remote.login(username, mdpass, ajaxOpts).then((err, response) =
    this.remoteSaved.login(username, mdpass, ajaxOpts, (err, response) => {
      if (err) {
        this.loading.dismiss();
        if (err.name === 'unauthorized') {
          alert('nom ou mdpass incorrecte');
          //return 'nom ou mdpass incorrecte';
        } else {
          alert('erreur');
          //return 'erreur';
        }
      }else if(response){
        this.loading.dismiss();
        alert('success');
        //return 'success';
      }else{
        this.loading.dismiss();
        alert('echec');
        //return 'echec';
      }
    });
  }

  logout(destroy: any = ''){
    if(destroy == 'oui'){
      this.showLoader('Déconnexion...');
    }
    this.remoteSaved.logout((err, response) => {
      if (err) {
        if(destroy == 'oui'){
          this.loading.dismissAll();
        }
        this.events.publish('user:login');
        //this.events.publish('user:login_com');
        return 'echec déconnexion';
      }else if(response){
        //this.data = null;
        //this.db.destroy().then(() => {
        //  console.log("base de données supprimée");
        //});
        this.storage.remove('info_user').catch((err) => console.log(err));
        this.storage.remove('info_connexion').catch((err) => console.log(err));
        global.info_connexion = null;
        global.info_user = null;
        if(destroy == 'oui'){
          this.loading.dismissAll();
        }
        this.affichierMsg('Déconnexion terminée avec succès. \nVous êtes désormais hors ligne!')
        this.events.publish('user:login');
        return 'success';
      }else{
        if(destroy == 'oui'){
          this.loading.dismiss();
        }
        //this.storage.remove('info_user').catch((err) => console.log(err));
        //this.storage.remove('info_connexion').catch((err) => console.log(err));
        this.affichierMsg('Une erreur s\'est produite lors de la déconnexion. \n Veuillez réessayer plus tard!')
        this.events.publish('user:login');
        return 'echec';
      }
    });
  }

  getUser(username: any){
    this.remoteSaved.getUser(username, (err, response) => {
      if (err) {
        if (err.name === 'not_found') {
          //return 'acces non autorise'
          this.remoteSaved.getSession((err, response) =>{
            if (err) {
              // network error
              return 'Erreur du réseau';
            } else if (!response.userCtx.name) {
              // nobody's logged in
              return 'Non connecté ou privilèges insuffiasants';
            } else {
              // response.userCtx.name is the current user
              return response.userCtx;
            }
          });
        } else {
          return 'erreur'
        }
      } else {
        return response;
      }
    });
  }

  getSession(){
    this.remoteSaved.getSession((err, response) => {
      if (err) {
        this.events.publish('user:login');
        return 'erreur du réseau';
      } else if (!response.userCtx.name) {
        this.events.publish('user:login');
        return 'Personne n\est connecté';
      } else {
        this.events.publish('user:login', response.userCtx);
        return response.userCtx.name;
      }
    });
  }

  testConnexion(){
    //alert(this.remoteSaved)
    //alert(global.info_db.ip+'   '+global.info_db.nom_db + '  '+global.remoteSaved)
    //tester le status de la connexion
    if(global.remoteSaved){
      global.remoteSaved.getSession((err, response) => {
        if (err) {
          // network error
          this.events.publish('user:login');
          //alert('network')
        } else if (!response.userCtx.name) {
          // nobody's logged in
          this.events.publish('user:login');
          //alert('nobady')
        } else {
          // response.userCtx.name is the current user
          this.events.publish('user:login', response.userCtx);
          //alert(response.userCtx.name)
        }
      });
    }
  }


  updateUser(unsername: string){
    this.remoteSaved.putUser(unsername, {
      metadata : {
        email : 'robin@boywonder.com',
        birthday : '1932-03-27T00:00:00.000Z',
        likes : ['acrobatics', 'short pants', 'sidekickin\''],
      }
    }, (err, response) => {
      // etc.
    });
  }

  changerMdpass(){
    this.remoteSaved.changePassword('spiderman', 'will-remember', (err, response) => {
      if (err) {
        if (err.name === 'not_found') {
          // typo, or you don't have the privileges to see this user
        } else {
          // some other error
        }
      } else {
        // response is the user update response
        // {
        //   "ok": true,
        //   "id": "org.couchdb.user:spiderman",
        //   "rev": "2-09310a62dcc7eea42bf3d4f67e8ff8c4"
        // }
      }
    });
  }

  chagerUsername(){
    this.remoteSaved.changeUsername('spiderman', 'batman', (err) => {
      if (err) {
        if (err.name === 'not_found') {
          // typo, or you don't have the privileges to see this user
        } else if (err.taken) {
          // auth error, make sure that 'batman' isn't already in DB
        } else {
          // some other error
        }
      } else {
        // succeeded
      }
    }); 
  }


  getAllUsers(username, pass){
    var users_db = new PouchDB('http://'+ global.info_db.ip+'/_users'/*, {
      auth: {
        username: username,
        password: pass
      }
    }*/);

    //si non vide
    let data: any;
    if(data){
      return data
    }
    
    return new Promise ( resolve => {
      users_db.allDocs({
        include_docs: true,
        startkey: 'org.couchdb.user',
        endkey: 'org.couchdb.user:\uffff'
      }).then((result) => {
        data = [];
        let d:any = result
        d.rows.map((row) => {
          if(row.doc.db === 'frna'){
            data.push(row.doc);
          }
        });
        resolve(data);
      }).catch((err) => console.log(err));
    });
  }

   managerUpdateUser(username, pass, user){
    var users_db = new PouchDB('http://'+ global.info_db.ip+'/_users'/*, {
      auth: {
        username: username,
        password: pass
      }
    }*/);

    return users_db.put(user);//.catch((err) => alert('Erreur lors de l\'enreistrement. \nVeuillez reéssayer plus tard!'));
   }

   managerDeleteUser(username, pass, user){
    var users_db = new PouchDB('http://'+ global.info_db.ip+'/_users'/*, {
      auth: {
        username: username,
        password: pass
      }
    }*/);

    return users_db.remove(user);//.catch((err) => alert('Erreur lors de l\'enreistrement. \nVeuillez reéssayer plus tard!'));
   }

   managerGetAllUnions(){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        startkey: 'fuma:union',
        endkey: 'fuma:union:\uffff'
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted){
            data.push(row);
          }
            
        });

        
        resolve(data);

       // this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => alert(err));
    } );
  }

  managerGetAllOps(){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        startkey: 'fuma:op',
        endkey: 'fuma:op:\uffff'
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted && row.doc.data.type == 'op'){
            data.push(row);
          }
            
        });

        
        resolve(data);

       // this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => alert(err));
    } );
  }

  managerGetAllProtocoles(){

    //si non vide
    let data: any;
    if(data){
      return data
    }
 
    
    return new Promise ( resolve => {
      this.database.allDocs({
        include_docs: true,
        startkey: 'fuma:protocole',
        endkey: 'fuma:protocole:\uffff'
      }).then((result) => {
        //data = result.rows;
        data = [];
        let doc = result.rows.map((row) => {
          if(!row.doc.data.deleted && row.doc.data.type == 'protocole'){
            data.push(row);
          }
            
        });

        
        resolve(data);

       // this.database.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => this.handleChange(change));
      }).catch((err) => alert(err));
    } );
  }


  //***********************************************Fin manege user***************************************/

  compterNbEnregistrement(enregistrement, nom){
   return this.database.search({
      query: nom,
      fields: ['data.op_code']
    });
  }

  updateAtachement(docId, attachmentId, rev, attachment, type){
    this.database.putAttachment(docId, attachmentId, rev, attachment, type).catch(function (err) {
      console.log(err);
    });
  }

  updateAtachementReturn(docId, attachmentId, rev, attachment, type){
    return this.database.putAttachment(docId, attachmentId, rev, attachment, type);
  }
  ///*************************************   Find plugon   *************************************************** */////

  createIdex(){
   /*this.database.createIndex({
      index: {fields: ['_id']}
    }).then((res) => {
      alert(res)
    }, err => alert('err'))*/

    

    this.database.createIndex({
      index: {
        fields: ['_id']
      }
    }).then(function (result) {
      alert(result)
    }).catch(function (err) {
      ///alert('err => '+ err)
      console.log(err);
    });


  }
  
}
