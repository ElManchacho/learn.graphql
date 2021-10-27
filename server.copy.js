const e = require('cors');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { gql } = require('graphql');
var { makeExecutableSchema } = require('graphql-tools')

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

async function register(firstname,lastname,password,email) {
  var ran = Math.floor(Math.random()*100000000);
  console.log(`INSERT Job done : ID=`+ran+` ${firstname}, ${lastname},${password}, ${email}`); 
  const { rows } = await pool.query("INSERT INTO users (id,firstname,lastname,password,email) VALUES ($1,$2,$3,$4) RETURNING *", [firstname,lastname,password,email]);
  return rows
}

async function resetDB(){
  console.log("Reseting DB...");
  const {rows} = await pool.query("DROP TABLE users;");
  rows += await pool.query("CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(50), password VARCHAR(50), firstname VARCHAR(50), lastname VARCHAR(50))");
  rows += await pool.query("INSERT INTO users (id,email,password,firstname,lastname) VALUES (1,'user.1@gmail.fr','123456','User1FirstName','User1LastName') RETURNING *;");
  rows += await pool.query("INSERT INTO users (id,email,password,firstname,lastname) VALUES (2,'user.2@gmail.fr','123456','User2FirstName','User2LastName') RETURNING *;")
  return rows
}


var typdefs = gql`
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
    resetDB():[User]
  }
`;

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

const resolvers = { users: getUsers(), register : register(), resetDB : resetDB() };

var app = express();
app.use('/graphql', graphqlHTTP({
  schema:makeExecutableSchema(
      {
          typeDefs,
          resolvers
        }
        ),
  rootValue: root,
  graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

