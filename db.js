const mysql =require('mysql2');

const mysqlconnection = mysql.createConnection({

    host:'localhost',
    user:'robin',
    password:'robinhood',
    database:'todo'





});

mysqlconnection.connect((err)=>{
    if(err)
    {
        console.log('Error in Database Connection!!!'+JSON.stringify(err,undefined,2));
    }
    else
    {
       console.log('Database is connected Successfully!!!');
    }
});


module.exports=mysqlconnection;