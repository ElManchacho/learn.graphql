const e = require('cors');
var express = require('express');
var { graphqlHTTP } = require('express-graphql');
var { buildSchema } = require('graphql');
var gql = require('graphql-tag');
var {makeExecutableSchema} = require('graphql-tools')

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

/**query{
  users{
    email
  }
} */


async function register(_,{firstname,lastname,password,email}) {

  var ran = Math.floor(Math.random()*100000000);
  console.log(firstname,lastname,password,email);
  console.log(`INSERT user done : ID=`+`${ran}, ${email}, ${password}, ${firstname}, ${lastname}`); 
  const { rows } = await pool.query("INSERT INTO users (id,email,password,firstname,lastname) VALUES ($1,$2,$3,$4,$5) RETURNING *", [ran,email,password,firstname,lastname]);
  return rows[0]
}


var typeDefs = gql`
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
  type Mutation{
    register(firstname:String!,lastname:String!,password:String!,email:String!):User!
  }
`;

//var data = require('./user.json');
 
var resolvers = { Mutation : {register}, Query :{users: getUsers} };

var app = express();
app.use('/graphql', graphqlHTTP({
  schema:makeExecutableSchema(
      {
          typeDefs,
          resolvers
        }
        ),
  graphiql: true,
}));
app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));

