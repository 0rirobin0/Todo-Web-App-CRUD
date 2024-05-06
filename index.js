const bodyParser = require("body-parser");
const express = require("express");
const db = require("./db");
const jwt=require("jsonwebtoken");
const secretkey ='robinhood';

var app = express();

//============= Server Starter =============//

app.listen(5001, () => {
  console.log("server is running port:5001");
});



// ======== Middleware ============ //

app.use(bodyParser.json());

//Token verifier
function verifytoken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];

    if (typeof bearerHeader !== 'undefined') {
        // Split the header by space
        const bearer = bearerHeader.split(' ');
        // Get token from array
        const bearerToken = bearer[1];
   
        req.token = bearerToken;
        // Next middleware
        next();
    } else {
    
        res.status(403).send("Forbidden");
    }
}


// ======== User Registration ============ //



app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
   
  
    // Check if the user already exists
    db.query('SELECT * FROM user WHERE username = ? OR email = ?', [username, email], (err, results) => {
      if (err) {
        res.status(500).send('Internal Server Error');
        
      }
  
      // If user exists, send error response
      if (results.length > 0) {
        res.status(400).send('User already exists');
      } else {
        // If user doesn't exist, insert new user data into the database
        db.query('INSERT INTO user (username, email, password, role) VALUES (?, ?, ?, "user")', [username, email, password], (err, result) => {
          if (err) {
            res.status(500).send('Internal Server Error');
            console.log('Internal Server Error');
          }
          res.status(201).send('User registered successfully');
          console.log(req.body);
          console.log('User registered successfully');
        });
      }
    });
  });

  // ======== User Login and JWT Authentication ============ //

app.post('/login',(req,res)=>
{
 const {username,password} =req.body;
 const user=req.body;
 
    // Check if the user exists or login
    db.query('SELECT * FROM user WHERE username = ? AND password = ?', [username,password], (err, results) => {
        if (err) {
          res.status(500).send('Internal Server Error');
          
        }
    
        // If user exists, send error response
        if (results.length > 0) {
    
            console.log("Authienticated!!");
            // jwt token creation
            jwt.sign({user},secretkey,{expiresIn:"300s"},(err,token)=>
        {
             res.json(token);
        });

        } 

        else
        {
            res.status(400).send('You don\'t have an account ! Register Please or check username or password');
            console.log('You don\'t have an account ! Register Please or check username or password');
        }



});

});

//============= Get profile by User authenticated =============//

// app.get('/profile',verifytoken,(req,res)=>
// {
//     jwt.verify(req.token,secretkey,(err,authdata)=>
// {
//    if(err)
//    {
//     res.send("Invalid Token");
//    }
//    else
//    {
//     res.json(
//         {
//             message:"Profile accessed",
//             authdata
//         }
       
//     )

//    }

// });

// });







//============= Get todo tasklist by User authentication =============//


app.get("/tasklist",verifytoken, (req, res) => {
    
   var userid;
    

    // verify token
    jwt.verify(req.token,secretkey,(err,authdata)=>
    {
        
        
       if(err)
       {
        res.send("Invalid Token");
       }
       else
       {
        
        const username= authdata.user.username;
        db.query("SELECT user_id FROM user WHERE username = ?",[username],(err,results)=>
    {
         userid = results[0].user_id;
       // console.log(userid);

         db.query(
            "SELECT * FROM tasklist WHERE user_id = ?",
            [userid],
            (err, userRows) => {
              if (err) {
                console.log("Error getting user task" + err);
                res.status(500).send("Error getting user task");
              } else {
                console.log("User Data is Fetched");
                res.status(200).send(userRows);
                console.log(userRows);
              }
            }
          );
         
    });
 
  

       
    
       }
    
    });

    


    
  });










//============= Get todo taskby User =============//

// app.get("/tasklist/:user_id/:task_id", (req, res) => {
//   const userid = req.params.user_id;
//   const taskid = req.params.task_id;
//   db.query(
//     "SELECT * FROM tasklist WHERE user_id = ? AND task_id = ?",
//     [userid,taskid],
//     (err, userRows) => {
//       if (err) {
//         console.log("Error getting user task" + err);
//         res.status(500).send("Error getting user task");
//       } else {
//         console.log("User Data is Fetched");
//         res.status(200).send(userRows);
//         console.log(userRows);
//       }
//     }
//   );
// });



//============= insert todo task =============//

app.post("/tasklist", (req, res) => {
  console.log(req.body);

  const { user_id, task_title, description, status, timestamp } = req.body;

  const taskData = {
    user_id: user_id,
    task_title: task_title,
    description: description,
    status: status,
    timestamp: timestamp,
  };

  // Check if the user exists
  db.query(
    "SELECT * FROM user WHERE user_id = ?",
    [user_id],
    (userErr, userRows) => {
      if (userErr) {
        console.log("Error in checking user: " + userErr);
      } else {
        if (userRows.length === 0) {
          // User does not exist
          res.status(404).send("User does not exist");
        } else {
          // User exists, insert the task
          db.query(
            "INSERT INTO tasklist (user_id, task_title, description, status, timestamp) VALUES (?, ?, ?, ?, ?)",
            [
              taskData.user_id,
              taskData.task_title,
              taskData.description,
              taskData.status,
              taskData.timestamp,
            ],
            (taskErr, taskRows) => {
              if (taskErr) {
                console.log("Error in inserting task: " + taskErr);
              } else {
                console.log("Task inserted successfully");
                res.status(200).send("Task inserted successfully");
                res.send(taskRows);
              }
            }
          );
        }
      }
    }
  );
});

//============= Update todo task =============//

app.put("/tasklist/:task_id", (req, res) => {
  const taskId = req.params.task_id;
  const { task_title, description, status } = req.body;

  db.query(
    "UPDATE tasklist SET task_title = ?, description = ?, status = ? WHERE task_id = ?",
    [task_title, description, status, taskId],
    (err, rows) => {
      if (err) {
        console.log("Error in updating task: " + err);
        res.status(500).send("Error in updating task");
      } else {
        console.log("Task updated successfully");
        res.status(200).send("Task updated successfully");
      }
    }
  );
});

//============= Patch todo task =============// //Status

app.patch("/tasklist/:task_id/status", (req, res) => {
  const taskId = req.params.task_id;
  const { status } = req.body;

  // Update the task status in the database
  db.query(
    "UPDATE tasklist SET status = ? WHERE task_id = ?",
    [status, taskId],
    (err, result) => {
      if (err) {
        console.log("Error in updating task status: " + err);
        res.status(500).send("Error in updating task status");
      } else {
        // Check if the update was successful
        if (result.affectedRows > 0) {
          console.log("Task status updated successfully");
          res.status(200).send("Task status updated successfully");
        } else {
          console.log("Task with ID " + taskId + " not found");
          res.status(404).send("Task not found");
        }
      }
    }
  );
});

//============= Delete todo task =============//

app.delete("/tasklist/:task_id", (req, res) => {
  const taskid = req.params.task_id;

  db.query("DELETE FROM tasklist WHERE task_id = ?", [taskid], (err, rows) => {
    if (err) {
      console.log("Error in Deleting Task");
      console.log(err);
      res.status(500).send("Error in Deleting Task");
    } else {
      console.log("Task Deleted Successfully");
      res.status(200).send("Task Deleted Successfully");
    }
  });
});
