const express = require("express")
const app  = express();
const mysql = require('mysql');
app.set('view engine', 'ejs');

//express body-parser built in
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//DATABASE CHECK
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'banking'
  });

//Connecting to db
con.connect(function(err) {
    if (err) console.log(err);
    console.log("Connected!");
});   

//HOME PAGE 
app.get("/", function(req,res){
    res.sendFile(__dirname+'/home.html');
})

var sql = "SELECT Name FROM customers";

//Login as PAGE
app.get('/from_list', function (req, res) {
    //query in first arg
    con.query( sql, function (err, result) {
      if (err) throw err;
      //var cust = result[0].Name;
      res.render("from_list",{ Custlist : result });
  });
 });

//Variables for tracking the sender,receiver and amt
var from_id = "";
var to_id = "";
var payment = "";

//Selecting whom to pay PAGE
   app.post("/to_list", function (req, res) {   
    //res.render("to_list",{iam : req.from_name});
    from_id = req.body.from;
    console.log("Logged In as "+ req.body.from);

        //query in first arg
        con.query( sql, function (err, result,f) {
            if (err) throw err;
            //var cust = result[0].Name;
            var g = "SELECT CurrBal FROM customers WHERE Name = '" + from_id + "'";
          con.query(g,function (err,bal) {
            if(err) throw err;

            res.render("to_list",{
              admin : req.body.from,
              Custlist : result,
              Balance : bal
              
            });
          });
        });
        });
    
    //Payment PAGE
   app.post('/payment', function (req, res) {
       var s = "SELECT CurrBal FROM `customers` WHERE Name = '"+ from_id+"'";
       con.query( s, function (err, result) {
           if (err) throw err;
           var cb = Number(result[0].CurrBal);
            if(cb == 0)
            {
                res.sendFile(__dirname+"/Error.html");
            }
            else{
                res.render("payment",{maxamt: cb});

            }
           
           to_id = req.body.to;
           console.log(req.body.to);
        });
   });

   //FINAL PAGE and all DB updation logic       
   app.post('/pay', function (req, res) {
    res.sendFile(__dirname+"/pay.html");
    console.log(req.body.amount);
    payment = req.body.amount;

    console.log("Paid by " + from_id +" "+ payment + " ,to "+ to_id);

    //Inserting data in transfers table
    var query = "INSERT INTO transfers (sender,reciever,transaction) VALUES ('"+from_id+"','"+to_id+"','"+payment+"')";
    con.query( query, function (err, result,f) {
        if (err) throw err;
        console.log("Successfully inserted");
  
      });

      //For removing money from the acc to transfer (Customer Table)
      var q = "SELECT CurrBal FROM `customers` WHERE Name = '"+ from_id+"'";
      con.query( q, function (err, result) {
        if (err) throw err;
        console.log("Bal of sender: " + from_id + " before ₹"+ result[0].CurrBal +"/-" );
        var newamt = Number(result[0].CurrBal) - Number(payment);
        console.log("Bal of sender: " + from_id + " after ₹"+ newamt+"/-");

        var y = "UPDATE customers SET CurrBal = '"+newamt+"' WHERE Name = '"+from_id+"'";
        con.query( y, function (err, result) {
            if (err) throw err;
            console.log("Updated and removed money  who transacted");
            
        });
      });



      //For adding money into acc of other person (Customer Table)
      var seequery = "SELECT CurrBal FROM `customers` WHERE Name = '"+ to_id+"'";
      con.query( seequery, function (err, result) {
        if (err) throw err;
        console.log("Bal of Reciever: " +to_id+" before ₹"+ result[0].CurrBal + "/- ");
        var newPay = Number(result[0].CurrBal) + Number(payment);
        console.log("Bal of Reciever: " +to_id+" after ₹"+ newPay + "/- ");
        var upquery = "UPDATE customers SET CurrBal = '"+newPay+"' WHERE Name = '"+to_id+"'";
        con.query( upquery, function (err, result,f) {
            if (err) throw err;
            console.log("Updated and added money  to customer table");
            
        });
      });



    });
    

//SERVER OPEN
app.listen(3000,()=>{
    console.log("Server Started");

})