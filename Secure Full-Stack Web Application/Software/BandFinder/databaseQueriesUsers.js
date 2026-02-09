const mysql = require('mysql2/promise');


let connection;

async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection({
      host: "localhost",
      port: 3307,
      user: "root",
      password: "",
      database: "HY359_2025",
    });
    console.log('MySQL connection established.');
  }
  return connection;
}


// New function to retrieve all users
async function getAllUsers() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM users');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getUserByCredentials(username, password) {
  try {
    const conn = await getConnection();

    const selectQuery = `
      SELECT * FROM users
      WHERE username = ? AND password = ?
    `;

    const [rows] = await conn.execute(selectQuery, [username, password]);

    return rows; // returns an array of matching users (likely 0 or 1)
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


async function updateUser(username, newFirstname) {
  try {
    const conn = await getConnection();

    const updateQuery = `
      UPDATE users
      SET firstname = ?
      WHERE username = ?
    `;

    const [result] = await conn.execute(updateQuery, [newFirstname, username]);

    if (result.affectedRows === 0) {
      return 'No user found with that username.';
    }

    return 'Firstname updated successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function deleteUser(username) {
  try {
    const conn = await getConnection();

    const deleteQuery = `
      DELETE FROM users
      WHERE username = ?
    `;

    const [result] = await conn.execute(deleteQuery, [username]);

    if (result.affectedRows === 0) {
      return 'No user found with that username.';
    }

    return 'User deleted successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function dbGetDuplicate(type, value){
  try{
    const conn = await getConnection();
    
    const duplicateQuery = `
      SELECT ${type} from users
      WHERE ${type} = ? 

      UNION 

      SELECT ${type} from bands
      WHERE ${type} = ? 
    `;

     const [rows] = await conn.execute(duplicateQuery, [value, value]);
    return rows.length > 0; 

  }catch(err){
    throw new Error('DB error: ' + err.message);
  }
}

//getUserByUsername
async function getUserByUsername(username) {
  try {
    const conn = await getConnection();

    const selectQuery = `
      SELECT * FROM users
      WHERE username = ?
    `;

    const [rows] = await conn.execute(selectQuery, [username]);

    return rows; // returns an array of matching users (likely 0 or 1)
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


async function updateUserFields(username, updates){
  try{
    //console.log("kanei update?");
    const conn = await getConnection();
    const updateUserQuery = `
      UPDATE users
      SET 
        password = ?,
        firstname = ?,
        lastname = ?,
        birthdate = ?,
        gender = ?,
        country = ?,
        city = ?,
        address = ? ,
        telephone = ?

        
      
      

      WHERE username = ?
    `;

    const values = [
      updates.password,
      updates.firstname,
      updates.lastname,
      updates.birthdate,
      updates.gender,
      updates.country,
      updates.city,
      updates.address,
      updates.telephone,


     
 
      
      username
    ];

    const [result] = await conn.execute(updateUserQuery, values);
    if (result.affectedRows === 0) {
      return 'No user found with that username.';
    }

    return 'User updated successfully.';
  }catch(err){
    throw new Error('DB error: ' + err.message);

  }
}

async function getUserPrivateEventsFromDB(userId){
  try{
    const conn = await getConnection();
    const query = `
    SELECT * FROM private_events
    WHERE user_id = ?
    ORDER BY event_datetime ASC 
    ` //asc ascending

    const [result] = await conn.execute(query, [userId]);
    return result;
  }
  catch(err){
    throw new Error('DB error: ' + err.message);
 
  }
}

module.exports = {getAllUsers, getUserByCredentials, updateUser, deleteUser, dbGetDuplicate, getUserByUsername, updateUserFields,
  getUserPrivateEventsFromDB
};