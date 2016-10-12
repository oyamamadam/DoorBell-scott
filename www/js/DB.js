// global variables
var db;
var shortName = 'responsiveApp';//DBName
var version = '1.0';
var displayName = 'Gadgeon Phonegap DB';
var maxSize = 65535;
var userId,userName,name,email;
var isLogin,isSignUp;

var data=new Array();

// this is called when an error happens in a transaction
function errorHandler(transaction, error) {
   console.log('Db Error: ' + error.message + ' code: ' + error.code);

}

// this is called when a successful transaction happens
function successCallBack() {
   console.log("DEBUGGING: success");

}

function nullHandler(){};


function isDBExists() {

 if (!window.openDatabase) {
  console.log('Databases are not supported in this browser.');
  return;
 }

 var returnVal;
 db.transaction(function(transaction) {
		transaction.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name=User;", [],
     function(transaction, result) {
      if (result != null && result.rows != null) {
        returnVal=true;
      }else{
				returnVal=false;
			}
     },errorHandler);
 },errorHandler,nullHandler);

 return returnVal;

}


function isSignedUp() {

 if (!window.openDatabase) {
  console.log('Databases are not supported in this browser.');
  return;
 }
console.log('check signed up');
 var returnVal=false;
 db.transaction(function(transaction) {
		transaction.executeSql("SELECT * FROM User;", [],
     function(transaction, result) {
      if (result != null && result.rows != null) {console.log(result.rows.length);
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
          userId=row.userId;
					userName=row.userName;	
					name=row.name;
					isLogin=row.isLogin;
        }
				console.log("issignedup :true");
				return true;
      }else{
				console.log("issignedup :false");
				return false;
			}
     },errorHandler);
 },errorHandler,nullHandler);
}

function createUserTable(){

 db.transaction(function(tx){
			console.log('created use table');
		 tx.executeSql('CREATE TABLE IF NOT EXISTS User(userId INTEGER NOT NULL PRIMARY KEY,name TEXT NOT NULL,userName TEXT NOT NULL,password TEXT NOT NULL, email TEXT NOT NULL,isLogin INTEGER)',[],nullHandler,errorHandler);
			},errorHandler,successCallBack);


}

function deleteUserTable(){

db.transaction(function(tx){
			console.log('created use table');
		 tx.executeSql( 'DROP TABLE IF EXISTS User',[],nullHandler,errorHandler);
			},errorHandler,successCallBack);


}

function ListDBValues(table) {

 if (!window.openDatabase) {
  console.log('Databases are not supported in this browser.');
  return;
 }

 
 db.transaction(function(transaction) {
   transaction.executeSql("SELECT * FROM "+table+";", [],
     function(transaction, result) {
      if (result != null && result.rows != null) {
        for (var i = 0; i < result.rows.length; i++) {
          var row = result.rows.item(i);
          userId=row.UserId;
					userName=row.userName;	
					name=row.LastName;
					isLogin=row.isLogin;
        }
      }
     },errorHandler);
 },errorHandler,nullHandler);

 return;

}


function AddValueToDB(formdata,table) {
 
 if (!window.openDatabase) {
   console.log('Databases are not supported in this browser.');
   return;
 }
	
	
 db.transaction(function(transaction) {

	var inertQuery="INSERT INTO "+table+" (name,userName,password,email,isLogin) VALUES ('"+formdata['name']+"','"+formdata['userName']+"','"+formdata['password']+"','"+formdata['email']+"','1') ";
		console.log(inertQuery);
   transaction.executeSql(inertQuery,[],nullHandler,errorHandler);
 	});

}
