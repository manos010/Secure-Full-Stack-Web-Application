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


// New function to retrieve all bands
async function getAllBands() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM bands');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getBandByCredentials(username, password) {
  try {
    const conn = await getConnection();

    const selectQuery = `
      SELECT * FROM bands
      WHERE username = ? AND password = ?
    `;

    const [rows] = await conn.execute(selectQuery, [username, password]);

    return rows; // returns an array of matching bands (likely 0 or 1)
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


async function getBandByName(username) {
  try {
    const conn = await getConnection();

    const selectQuery = `
      SELECT * FROM bands
      WHERE band_name = ? 
    `;

    const [rows] = await conn.execute(selectQuery, [username]);

    return rows; // returns an array of matching bands (likely 0 or 1)
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function updateBand(username, newBandName) {
  try {
    const conn = await getConnection();

    const updateQuery = `
      UPDATE users
      SET band_name = ?
      WHERE username = ?
    `;

    const [result] = await conn.execute(updateQuery, [newBandName, username]);

    if (result.affectedRows === 0) {
      return 'No band found with that username.';
    }

    return 'Firstname updated successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function deleteBand(username) {
  try {
    const conn = await getConnection();

    const deleteQuery = `
      DELETE FROM bands
      WHERE username = ?
    `;

    const [result] = await conn.execute(deleteQuery, [username]);

    if (result.affectedRows === 0) {
      return 'No band found with that username.';
    }

    return 'User deleted successfully.';
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}
async function getReviewsFromDB(band_name, ratingFrom, ratingTo) {
    const conn = await getConnection();

    let query = `
        SELECT * FROM reviews
        WHERE status = 'published'
    `;
    const params = [];

    if (band_name !== "all") {
        query += " AND band_name = ?";
        params.push(band_name);
    }

    if (ratingFrom) {
        query += " AND rating >= ?";
        params.push(ratingFrom);
    }

    if (ratingTo) {
        query += " AND rating <= ?";
        params.push(ratingTo);
    }

    const [rows] = await conn.execute(query, params);
    return rows;
}
//show only pending reviews
async function getPendingReviewsFromDB(band_name) {
    const conn = await getConnection();

    let query = `
        SELECT * FROM reviews
        WHERE status = 'pending'
    `;
    const params = [];

    /*if (band_name !== "all") {
        query += " AND band_name = ?";
        params.push(band_name);
    }

    if (ratingFrom) {
        query += " AND rating >= ?";
        params.push(ratingFrom);
    }

    if (ratingTo) {
        query += " AND rating <= ?";
        params.push(ratingTo);
    }*/

    const [rows] = await conn.execute(query, params);
    return rows;
}


async function updateReviewStatusDB(review_id, status) {
    const conn = await getConnection();

    const query = `
        UPDATE reviews 
        SET status = ?
        WHERE review_id = ?
    `;

    const [result] = await conn.execute(query, [status, review_id]);
    return result;
}

async function getReviewStatusDB(review_id) {
    const conn = await getConnection();

    const query = `
        SELECT status FROM reviews
        WHERE review_id = ?
    `;

    const [rows] = await conn.execute(query, [review_id]);
    return rows;
}

async function getReviewStatusDB(review_id) {
    const conn = await getConnection();

    const query = `
        SELECT status FROM reviews
        WHERE review_id = ?
    `;

    const [rows] = await conn.execute(query, [review_id]);
    return rows;
}

async function deleteReviewDB(review_id){
  const conn = await getConnection();

  const query = `
      DELETE FROM reviews
      WHERE review_id = ?
    `;
    const [result] = await conn.execute(query, [review_id]);
    return result;
}

async function getPublicEventsByBand(band_id){
    const conn = await getConnection();

    const query = `
    SELECT * FROM public_events
    WHERE band_id = ?
    `;

    const [result] = await conn.execute(query, [band_id]);
    return result;

}

async function deletePublicEventFromDB(event_id){
  const conn = await getConnection();
  
  const query = `
    DELETE FROM public_events
    where public_event_id = ?
  `;

  const [result] = await conn.execute(query, [event_id]);
  return result;
}

async function updatePublicEventFromDB(event_id, data){
  const conn = await getConnection();

  const query = `
    UPDATE public_events
    SET
      event_type = ?,
      event_datetime = ?,
      event_description = ?,
      participants_price = ?,
      event_city = ?,
      event_address = ?,
      event_lat = ?,
      event_lon = ?
    WHERE public_event_id = ?
  `;

  const params = [
    data.event_type,
    data.event_datetime,
    data.event_description,
    data.participants_price,
    data.event_city,
    data.event_address,
    data.event_lat,
    data.event_lon,
    event_id
  ];

  const [result] = await conn.execute(query, params);
  return result;
}

async function getAllBandGenresFromDB() {
  const conn = await getConnection();
  const query = `
    SELECT DISTINCT music_genres 
    FROM bands
    WHERE music_genres IS NOT NULL
  `;
  const [rows] = await conn.execute(query);
  return rows;
}

async function getAllCitiesFromDB() {
  const conn = await getConnection();
  const query = `
    SELECT DISTINCT band_city
    FROM bands
    WHERE band_city IS NOT NULL
  `;
  const [rows] = await conn.execute(query);
  return rows;
}

async function getBandsFiltered(genre, city, founded_year){
  const conn = await getConnection();

  let query = "SELECT * FROM bands WHERE 1=1";
  const params = [];
  if (genre && genre !== "") {
    query += " AND music_genres = ?";
    params.push(genre);
  }
  if (city && city !== "") {
    query += " AND band_city = ?";
    params.push(city);
  }
  if (founded_year && founded_year !== "") {
    query += " AND foundedYear = ?";
    params.push(founded_year);
  }

  const [rows] = await conn.execute(query, params);
  return rows;
}

async function getAverageRatingFromDB(band_name){
  const conn = await getConnection();

  const query = `
  SELECT AVG(rating) as avgRating, COUNT(*) AS totalReviews 
  FROM reviews 
  where band_name = ? AND status = 'published';
  `
  const [rows] = await conn.execute(query, [band_name]);
  return rows[0];
}

async function getBandAvailabiltyFromDB(band_id){
  const conn = await getConnection();

  const query = `
  SELECT bookedDate FROM (
    SELECT DATE(event_datetime) AS bookedDate
    FROM private_events
    WHERE band_id = ? 
      AND status = 'to be done'

    UNION

    SELECT DATE(event_datetime) AS bookedDate
    FROM public_events
    WHERE band_id = ?
) AS all_events;`

  const [rows] = await conn.execute(query, [band_id, band_id]); 
  return rows;
}


async function getPrivateEventsFromDB(band_id){
    const conn = await getConnection();

    const query = `
    SELECT * FROM private_events
    WHERE band_id = ?

    `;

    const [result] = await conn.execute(query, [band_id]);
    return result;

}

async function updatePrivateEventStatusFromDB(event_id, status, band_decision){
  const conn = await getConnection();

  const query = `
  UPDATE private_events
  SET status = ?, band_decision = ?
  WHERE private_event_id = ? `;

  const [result] = await conn.execute(query, [status,band_decision, event_id]);
  return result
}

async function deletePrivateEventFromDB(private_event_id){
  const conn = await getConnection();
  const query = `
  DELETE FROM private_events
  WHERE private_event_id = ?`;

    const [result] = await conn.execute(query, [private_event_id]);
    return result;
}

async function getAllPublicEventsGenresFromDB(){
  
  const conn = await getConnection();
  const query = `
    SELECT DISTINCT event_type
    FROM public_events
    WHERE event_type IS NOT NULL
    AND event_datetime >= NOW()
  `;
  const [rows] = await conn.execute(query);
  return rows;


}


async function getAllPublicEventsCitiesFromDB() {
  const conn = await getConnection();
  const query = `
    SELECT DISTINCT event_city
    FROM public_events
    WHERE event_city IS NOT NULL
  `;
  const [rows] = await conn.execute(query);
  return rows;
}

async function getPublicEventsFiltered(genre, city, date){
  const conn = await getConnection();

  let query = "SELECT * FROM public_events WHERE event_datetime >= NOW()";
  const params = [];
  if (genre && genre !== "") {
    query += " AND event_type = ?";
    params.push(genre);
  }
  if (city && city !== "") {
    query += " AND event_city = ?";
    params.push(city);
  }
  if (date && date !== "") {
    query += " AND DATE(event_datetime) = ?";
    params.push(date);
  }

  const [rows] = await conn.execute(query, params);
  return rows;
}

async function getMessagesByPrivateEvent(private_event_id) {
  try {
    const conn = await getConnection();

    const query = `
      SELECT 
        message_id,
        sender,
        recipient,
        message AS text,
        date_time AS timestamp
      FROM messages
      WHERE private_event_id = ?
      ORDER BY date_time ASC
    `;

    const [rows] = await conn.execute(query, [private_event_id]);
    return rows;

  } catch (err) {
    throw new Error("DB error (getMessagesByPrivateEvent): " + err.message);
  }
}

async function getBandsFilteredFromJSON(queryJSON) {
  try {
    console.log("MPIKA STO FILTER")
    const conn = await getConnection();

    const table = queryJSON.table;
    const columns = queryJSON.columns.join(", ");
    const conditions = queryJSON.conditions || {};
    const limit = queryJSON.limit ? `LIMIT ${parseInt(queryJSON.limit)}` : "";

    const conditionKeys = Object.keys(conditions);
    let conditionString = "";
    let values = [];

    if (conditionKeys.length > 0) {
      conditionString = conditionKeys.map(key => `${key} = ?`).join(" AND ");
      values = conditionKeys.map(key => conditions[key]);
    }

    const sql = `SELECT ${columns} FROM ${table} ${conditionString ? "WHERE " + conditionString : ""} ${limit}`;
    console.log("SQL:", sql);
  console.log("Values:", values);
    const [rows] = await conn.execute(sql, values);
    return rows;
  } catch (err) {
    throw new Error('DB error in getBandsFilteredFromJSON: ' + err.message);
  }
}


async function getBandNameById(band_id){
  try{
    const conn = await getConnection();
    const query = `
    SELECT band_name 
    FROM bands 
    WHERE band_id = ? 
    `;

  const [rows] = await conn.execute(query, [band_id]);
  return rows[0].band_name;
  }
  catch (err) {
      console.error("DB error in getBandNameById:", err);
      throw err;
    }
}

async function updateBandFields(username, updates) {
    try {
        const conn = await getConnection();

        const sql = `
            UPDATE bands
            SET
                password = ?,
                band_name = ?,
                music_genres = ?,
                band_description = ?,
                members_number = ?,
                foundedYear = ?,
                band_city = ?,
                telephone = ?,
                webpage = ?,
                photo = ?
            WHERE username = ?
        `;

        const values = [
            updates.password,
            updates.band_name,
            updates.music_genres,
            updates.band_description,
            updates.members_number,
            updates.foundedYear,
            updates.band_city,
            updates.telephone,
            updates.webpage,
            updates.photo,
            username
        ];

        const [result] = await conn.execute(sql, values);

        if (result.affectedRows === 0) {
            throw new Error("Band not found");
        }

        return { success: true };
    } catch (err) {
        throw new Error("DB error in updateBandFields: " + err.message);
    }
}

async function getAllPublicEventsFromDB() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM public_events');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}

async function getAllPrivateEventsFromDB() {
  try {
    const conn = await getConnection();
    const [rows] = await conn.query('SELECT * FROM private_events');
    return rows;
  } catch (err) {
    throw new Error('DB error: ' + err.message);
  }
}


async function updatePrivateEventStatusFromDBversion2(event_id, status){
  const conn = await getConnection();

  const query = `
  UPDATE private_events
  SET status = ?
  WHERE private_event_id = ? `;

  const [result] = await conn.execute(query, [status, event_id]);
  return result
}

async function getTotalPrivateEventsRevenue() {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query(`
            SELECT SUM(price) AS total
            FROM private_events
            WHERE status = 'done'
        `);
        return rows[0].total || 0;
    } catch (err) {
        throw new Error("DB error: " + err.message);
    }
}

//BONUS
async function logBandProfileVisit(bandId, userId = null) {
    try {
        const conn = await getConnection();
        const query = `
            INSERT INTO band_profile_visits (band_id, user_id)
            VALUES (?, ?)
        `;
        await conn.execute(query, [bandId, userId]);
        return { message: "Visit recorded" };
    } catch (err) {
        throw new Error('DB error: ' + err.message);
    }
}


async function getBandVisits(bandId) {
    try {
        const conn = await getConnection();

        
        const [generalRows] = await conn.execute(
            `SELECT COUNT(*) AS totalVisits FROM band_profile_visits WHERE band_id = ?`,
            [bandId]
        );

        
        const [registeredRows] = await conn.execute(
            `SELECT COUNT(DISTINCT user_id) AS registeredVisits 
             FROM band_profile_visits 
             WHERE band_id = ? AND user_id IS NOT NULL`,
            [bandId]
        );

        return {
            generalVisits: generalRows[0].totalVisits,
            registeredVisits: registeredRows[0].registeredVisits
        };

    } catch(err) {
        throw new Error('DB error: ' + err.message);
    }
}



module.exports = {getAllBands, getBandByCredentials, updateBand, deleteBand,getReviewStatusDB,getReviewsFromDB, getPendingReviewsFromDB,updateReviewStatusDB, deleteReviewDB, getBandByName,
  getPublicEventsByBand,deletePublicEventFromDB, updatePublicEventFromDB, getAllBandGenresFromDB,getAllCitiesFromDB,getBandsFiltered, getAverageRatingFromDB,
  getBandAvailabiltyFromDB, getPrivateEventsFromDB, updatePrivateEventStatusFromDB,deletePrivateEventFromDB,
  getAllPublicEventsGenresFromDB,getAllPublicEventsCitiesFromDB,getPublicEventsFiltered,getMessagesByPrivateEvent,getBandsFilteredFromJSON,
  getBandNameById,updateBandFields,getAllPublicEventsFromDB, getAllPrivateEventsFromDB, updatePrivateEventStatusFromDBversion2,
  getTotalPrivateEventsRevenue,logBandProfileVisit,getBandVisits

};