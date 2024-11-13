const express = require('express')
const { v4: uuidv4 } = require('uuid');
const app = express()
const jwt = require('jsonwebtoken')
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // Allow only this origin
}))

let {open} = require('sqlite')
let sqlite3 = require('sqlite3')
const path = require('path');
const { request } = require('http');
app.use(express.json())
const dbpath = path.join(__dirname, 'todo.db')
let db = null
const intiallizedb = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(5000)
  } catch (e) {
    console.log(`Error: ${e.message}`)
    process.exit(1)
  }
}
intiallizedb()

app.post("/login",async (request,response) => {
  const {name,password}=request.body
  const q1=`select * from user where name="${name}";`
  const r1=await db.get(q1)
  console.log(r1)
  if(r1===undefined){
    console.log("not exists user")
    response.status(400)
    response.send("not exists user")
  }
  else{
    const match=r1.password===password
    if(match){
      let jwtToken = jwt.sign(name, 'MY_SECRET_KEY')
      response.send({jwtToken})
    }
    else{
      console.log("invalid password")
      response.status(400)
      response.send("invalid")
    }
  }

})
app.post("/register", async (request,response) => {
  const {name,password}=request.body
  const q1=`select * from user where name="${name}";`
  const r1=await db.get(q1)
  if(r1===undefined){
    const q2=`insert into user (name,password) values ("${name}","${password}");`
    const r2=await db.run(q2)
    console.log("created user")
    response.send("created user")
  }
  else{
    response.status(400)
    console.log("already user exists 400")
    response.send("already user exists")

  }
})


app.get("/todos",async (request,response) => {
    const data="select * from todo;";
    const r=await db.all(data);
    response.send(r);
})

app.delete("/todos/:id", async (request,response) => {
    const {id}=request.params
    const delque=`delete from todo where id="${id}";`;
    const r=await db.run(delque);
    if (r.changes > 0) {
      response.status(200).json({ message: "Todo item deleted successfully", id });
  } else {
      response.status(404).json({ error: "Todo item not found" });
  }
    
})
app.put("/todos/profile",async (request,response) => {
    const {name,changename,newpassword}=request.body;
    if(changename!==undefined){
    const q=`update user set name="${changename}" where name="${name}";`;
    const r=await db.run(q);
    if (r.changes > 0) {
      response.status(200).json({ message: "Name changed successfully" });
    } else {
        response.status(404).json({ error: "User not found or no change in name" });
    }
  }
  else{
    const qq=`update user set password="${newpassword}" where name="${name}";`;
    const rr=await db.run(qq);
    if (rr.changes > 0) {
      response.status(200).json({ message: "password changed successfully" });
    } else {
        response.status(404).json({ error: "User not found or no change in name" });
    }
  }
    
})


app.put("/todos/:id",async (request,response) => {
  const {id}=request.params;
  const {status}=request.body;
  const q=`update todo set status="${status}" where id="${id}";`
  const r=await db.run(q);
  if (r.changes > 0) {
    const qq=`select * from todo where id="${id}";`;
    const rr=await db.get(qq);
    response.status(200).json(rr);
  } else {
      response.status(404).json({ error: "Todo item not found" });
  }
})
app.post("/todos",async (request,response) => {
    const {name,status}=request.body;
    if(!name){
      response.send("hgv")
    }
    const idd=uuidv4()
    const qq=`insert into todo(name,id,status) values('${name}',"${idd}",'${status}');`;
    await db.run(qq);
    response.status(200).send({id:idd,name,status});
})


module.exports=app