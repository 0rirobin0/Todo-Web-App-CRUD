# TODO CRUD APP 

This Projects is created using NodeJS,ExpressJS,MySQL with JWT TOken Authentication for CRUD And Authentication and Authorisation!

## Table of Methods
- [GET](#GET)
- [POST](#POST)
- [PUT](#PUT)
- [PATCH](#PATCH)
- [DELETE](#DELETE)

## GET
localhost:5001/tasklist/1000/14       
Here /user_id/task_id

## POST 
localhost:5001/tasklist
{
    
     
     "user_id":1000,
     "task_title":"Playing",
     "description":"Football",
     "status":"In queue", 
     "timestamp":"24-5-6"

}

## PUT
localhost:5001/tasklist/:10
Here /task_id


{

     "task_title":"Eating",
     "description":"Lunch",
     "status":"Done"

}


## PATCH
localhost:5001/tasklist/10/status
{

 "status":"Complete"

}

## DELETE
localhost:5001/tasklist/14
Here /task_id


