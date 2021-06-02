const express = require("express")
const app  = express();
const mysql = require('mysql');
// const bodyParser = require("body-parser")
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({extended:true}));

//DATABASE CHECK
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'banking'
  });
  
con.connect(function(err) {
    if (err) console.log(err);
    console.log("Connected!");
});   

//HOME PAGE REDIRECT
app.get("/", function(req,res){
    res.sendFile(__dirname+'/home.html');
})
var sql = "SELECT Name FROM customers";

//FROM_LIST PAGE
app.get('/from_list', function (req, res,html) {


    //query in first arg
    con.query( sql, function (err, result,f) {
      if (err) throw err;
      //var cust = result[0].Name;
      res.render("from_list",{
        Cust1 : result[0].Name,
        Cust2 : result[1].Name,
        Cust3 : result[2].Name

    });
  });
 });


//TO_LIST PAGE
//    app.get('/to_list', function (req, res,html) {
//     res.render("to_list",{});
//    });
var from_id = "";
var to_id = "";
var payment = "";

   app.post("/to_list", function (req, res) {   
    //res.render("to_list",{iam : req.from_name});
    from_id = req.body.from;
    console.log("Logged In as "+ req.body.from);

        //query in first arg
        con.query( sql, function (err, result,f) {
            if (err) throw err;
            //var cust = result[0].Name;
            res.render("to_list",{
                admin : req.body.from,
              Cust1 : result[0].Name,
              Cust2 : result[1].Name,
              Cust3 : result[2].Name
      
          });
        });
        });
    
    //how much Payment logic
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

   //Final Pay Page Logic        
   app.post('/pay', function (req, res) {
    res.sendFile(__dirname+"/pay.html");
    console.log(req.body.amount);
    payment = req.body.amount;

    console.log("Paid by " + from_id +" "+ payment + " ,to "+ to_id);
    var query = "INSERT INTO transfers (sender,reciever,transaction) VALUES ('"+from_id+"','"+to_id+"','"+payment+"')";
    con.query( query, function (err, result,f) {
        if (err) throw err;
        console.log("Successfully inserted");
  
      });

      //For removing money from the acc to transfer
      var q = "SELECT CurrBal FROM `customers` WHERE Name = '"+ from_id+"'";
      con.query( q, function (err, result) {
        if (err) throw err;
        console.log("Before CurrBal" + result[0].CurrBal);
        var newamt = Number(result[0].CurrBal) - Number(payment);
        var y = "UPDATE customers SET CurrBal = '"+newamt+"' WHERE Name = '"+from_id+"'";
        con.query( y, function (err, result) {
            if (err) throw err;
            console.log("Updated and removed money  who transacted");
            
        });
      });



      //For adding money into acc of other person
      var seequery = "SELECT CurrBal FROM `customers` WHERE Name = '"+ to_id+"'";
      con.query( seequery, function (err, result) {
        if (err) throw err;
        console.log("Before CurrBal" + result[0].CurrBal);
        var newPay = Number(result[0].CurrBal) + Number(payment);
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