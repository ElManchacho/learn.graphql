const e = require('cors');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');

const { Pool } = require('pg');
const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'root',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})


async function getUsers() {
  console.log("Trying to get users from database...");
  const { rows } = await pool.query('SELECT * FROM users;');
  return rows;
}

async function addUser(firstname,lastname,password,email) {
  var ran = Math.floor(Math.random()*100000000);
  console.log(`INSERT Job done `+ran+` ${firstname}, ${lastname},${password}, ${email}`); 
  const { rows } = await pool.query("INSERT INTO users (firstname,lastname,password,email) VALUES ($1,$2,$3,$4) RETURNING *", [firstname,lastname,password,email]);
  return rows
}


var schema = buildSchema(`
  type User{
    id: Int,
    email: String,
    password: String,
    firstname: String,
    lastname: String
  }
  type Query{
      users:[User]
  }
  type Mutation {
    register(firstname:String!,lastname:String!,password:String!,email:String!):User!
  }
`);

/*

query{
  users{
    id
    lastname
    firstname
    email
    password
  }
}

*/

//var data = require('./user.json');

var root = { users: getUsers(), register : addUser };

var app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

