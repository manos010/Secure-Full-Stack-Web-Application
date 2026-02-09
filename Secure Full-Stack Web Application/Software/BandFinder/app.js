const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Groq = require("groq-sdk");
const { initDatabase, dropDatabase } = require('./database');
const {insertUser, insertBand, insertReview, insertMessage, insertPublicEvent, insertPrivateEvent } = require('./databaseInsert');
const {users, bands,public_events,private_events, reviews, messages} = require('./resources');
const { getAllUsers, getUserByCredentials, updateUser, deleteUser, dbGetDuplicate, getUserByUsername, updateUserFields,getUserPrivateEventsFromDB}=require('./databaseQueriesUsers');
const { getAllBands, getBandByCredentials, updateBand, deleteBand,getReviewStatusDB, 
  getReviewsFromDB,getPendingReviewsFromDB,updateReviewStatusDB, deleteReviewDB, 
  getBandByName,getPublicEventsByBand,deletePublicEventFromDB,updatePublicEventFromDB, 
  getAllBandGenresFromDB, getAllCitiesFromDB,getBandsFiltered,getAverageRatingFromDB,
getBandAvailabiltyFromDB, getPrivateEventsFromDB,updatePrivateEventStatusFromDB,deletePrivateEventFromDB,getAllPublicEventsGenresFromDB,
getAllPublicEventsCitiesFromDB, getPublicEventsFiltered,getMessagesByPrivateEvent,getBandsFilteredFromJSON,
getBandNameById,updateBandFields,getAllPrivateEventsFromDB,getAllPublicEventsFromDB,updatePrivateEventStatusFromDBversion2,getTotalPrivateEventsRevenue,
logBandProfileVisit,getBandVisits}=require('./databaseQueriesBands');

const http = require('http');

const socketIO = require('socket.io');

const app = express();
const cors = require('cors'); 
app.use(bodyParser.json());

const PORT = 8081;
app.use(cors()); 
app.use(express.json()); 

//session
const session = require("express-session");
const { availableMemory } = require('process');

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


app.use(session({
    secret: "secret-key-12345",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 30 } // 30 min
}));

app.use(express.static('public'));

// Route to serve index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.get('/initdb', async (req, res) => {
  try {
    const result = await initDatabase();
    res.send(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
});


app.get('/insertRecords', async (req, res) => {
  try {
    for(const user of users)
      var result = await insertUser(user);
    for(const band of bands)
      var result = await insertBand(band);
    for(const pev of public_events)
      var result = await insertPublicEvent(pev);    
    for(const rev of reviews)
      var result = await insertReview(rev);    
    for(const priv of private_events)
      var result = await insertPrivateEvent(priv);    
    for(const msg of messages)
      var result = await insertMessage(msg);
    res.send(result);
  } catch (error) {
    console.log(error.message)
    res.status(500).send(error.message);
  }
});


app.get('/dropdb', async (req, res) => {
  try {
    const message = await dropDatabase();
    res.send(message);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// /login me alla logia
app.post('/users/details', async (req, res) => {
  //const { username, password } = req.query;
  /*if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' });
  }*/
  const { username, password } = req.body; 

  try {
    const users = await getUserByCredentials(username, password);

    if (users.length > 0) {
      
    req.session.user = {
          id: users[0].user_id,
          username: users[0].username,
          email: users[0].email,
          lat: users[0].lat,
          lon: users[0].lon
      };
      

      return res.status(200).json({
      message: "Login successful",
      user: req.session.user
      });
      //res.json(users[0]);



    } else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});*/
const server = http.createServer(app);
const io = socketIO(server); 


app.post('/register', async (req, res) => {
    console.log("POST /register reached");

    try {
        const userData = req.body;
        const formType = userData.formType; 
        console.log(formType);
        let result
        if(formType === 'user'){
          result = await insertUser(userData); 
        }
        else if(formType === 'band'){
          result = await insertBand(userData); 
          
        }
        res.status(200).json({ message: result });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/checkDuplicate', async (req, res) => {
    console.log("check duplicate reached");
    
    const { type, value } = req.query; 
    console.log(type);
    console.log(value);
    
    try{
      const isDuplicate = await dbGetDuplicate(type, value);
      if(isDuplicate){
            console.log("einai duplicate");

        return res.status(403).json({error: `Το ${type} '${value}' χρησιμοποιείται ήδη.`})
      }
      return res.status(200).json({message: `${type} is available.` })
    }catch(err){
        console.log("DataBase error in /checkDuplicate", err.message);
        return res.status(500).json({ error: err.message });
    }
})

app.get("/session", (req, res) => {
    if (req.session.user) {
        return res.json({ loggedIn: true, user: req.session.user });
    }
    else if (req.session.band){
      return res.json({ loggedIn: true, band: req.session.band});
    }
    else if (req.session.admin) {
      return res.json({loggedIn: true, admin: req.session.admin})
    }
    return res.json({ loggedIn: false});
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        return res.status(200).json({ message: "Logged out" });
    });
});


app.get("/user/profile", async (req, res) => {
  const username = req.session.user.username;
  try{

    const rows = await getUserByUsername(username);
    const user = rows[0];
    res.status(200).json(user);
  }catch(err){
    res.status(500).json({error: err.message});

  }


});


app.put("/user/profile", async (req, res) => {
  const username = req.session.user.username;
  const updates = req.body;
  try{
    await updateUserFields(username, updates); // SQL UPDATE
    res.status(200).json({ message: "Profile updated successfully" }); 
  }catch(err){
    res.status(500).json({ error: err.message });

  }
})

const apiPath = "ubAPI";

app.post('/ubAPI/review', async (req, res) => {
    try {
        //const { band_name, sender, review, rating } = req.body;
        const userdata = req.body

        
if (!userdata.band_name || !userdata.sender || !userdata.review || !userdata.rating) {
    return res.status(406).json({ error: "Missing required fields" });
}
        if (userdata.rating < 1 || userdata.rating > 5) {
            return res.status(406).json({ error: "Rating must be 1-5" });
        }
        const current = await getBandByName(userdata.band_name);
        if (current.length === 0) {
            return res.status(403).json({ error: "Band name not found" });
        }

      
        userdata.date_time = new Date().toISOString().slice(0, 19).replace('T', ' ');
        userdata.status = "pending";
        console.log("app.js doylevei");
        console.log(userdata.band_name);
        await insertReview(userdata);

        res.status(200).json({ message: "Review successfully added" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});
//get ONLY published reviews
app.get('/ubAPI/reviews/:band_name', async (req, res) => {
    try {
        const band_name = req.params.band_name;
        const { ratingFrom, ratingTo } = req.query;

        const reviews = await getReviewsFromDB(band_name, ratingFrom, ratingTo);

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found" });
        }

        res.status(200).json(reviews);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

//get ONLY pending revies
app.get('/ubAPI/Pendingreviews/:band_name', async (req, res) => {
    try {
        const band_name = req.params.band_name;
        

        const reviews = await getPendingReviewsFromDB(band_name);

        if (reviews.length === 0) {
            return res.status(404).json({ message: "No reviews found" });
        }

        res.status(200).json(reviews);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/ubAPI/reviewStatus/:review_id/:status', async (req, res) => {
    try {
        const { review_id, status } = req.params;

        if (status !== "published" && status !== "rejected") {
            return res.status(406).json({ error: "Invalid status value" });
        }

        const current = await getReviewStatusDB(review_id);

        if (current.length === 0) {
            return res.status(403).json({ error: "Review ID not found" });
        }

        const currentStatus = current[0].status;

        if (currentStatus === "published" || currentStatus === "rejected") {
            return res.status(406).json({
                error: `Review already ${currentStatus} and cannot be changed`
            });
        }

        const result = await updateReviewStatusDB(review_id, status);

        res.status(200).json({
            message: `Review status updated to ${status}`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.delete('/ubAPI/reviewDeletion/:review_id', async(req,res) => {
  try{
    const {review_id} = req.params;
    if (!review_id) {
            return res.status(406).json({ error: "Missing review_id" });
        }

        const result = await deleteReviewDB(review_id);

        if (result.affectedRows === 0) {
            return res.status(403).json({ error: "Review ID not found" });
        }

        res.status(200).json({ message: "Review deleted successfully" });
  }
  catch{
    console.error(err);
    res.status(500).json({ error: err.message });

  }
});

app.post("/admin/login", async(req, res) => {
  try{
    const { username, password } = req.body;

    if (username !== "admin") {
        return res.status(401).json({ error: "Not authorized" });
    }
    const users = await getUserByCredentials(username, password); 

       if (users.length > 0) {
          req.session.admin = {
        admin: users[0].username,
       
      };
      console.log(req.session.admin);

      return res.status(200).json({
        message: "Login successful",
        admin: req.session.admin
      });
    }
    
   

  }
  catch(err){
     console.error(err);
    res.status(401).json({ error: err.message });
    
  }
});


// for admin, delete user
app.delete("/admin/user", async(req,res) =>{

  try{
    const{username} = req.body;
    
    if(!username){  
      return res.status(406).json({ error: "Missing username" });
    }
    const result = await deleteUser(username);

    if (result.affectedRows === 0) {
        return res.status(403).json({ error: "username not found" });
    }

    res.status(200).json({ message: "user deleted successfully" });
  
  
  }
  catch (err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }

});

//band 
app.post("/bandLogin", async(req,res)=> {
  console.log("banda login");
  const {username, password} = req.body;
  
  try{
    
    
    const users = await getBandByCredentials(username, password);

    if (users.length > 0) {
          req.session.band = {
        band_id: users[0].band_id,
        username: users[0].username,
        band_name: users[0].band_name
      };
      console.log(req.session.band);

      return res.status(200).json({
        message: "Login successful",
        band: req.session.band
      });
    }
    else {
      res.status(401).json({ error: 'Invalid username or password' });
    }
  }
   catch (err) {
    res.status(500).json({ error: err.message });
    
    }

});

//get public events from database
app.get("/band/publicEvents", async(req,res)=>{
  try{

    const bandId = req.session.band.band_id;
    const events = await getPublicEventsByBand(bandId);
    res.status(200).json(events);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }

});

//add new public event
app.post("/band/publicEvents", async(req,res) => {
  try{
    console.log("pub event douelve");
    const bandId = req.session.band.band_id;
    const data = req.body;
    console.log(data);
    const event = {
      band_id: bandId,
      ...data
    };
    console.log(event);
    const result = await insertPublicEvent(event);
    res.status(200).json(event);
  }
  catch(err){
    res.status(500).json({error: err.message});

  }
});


app.delete("/band/publicEvent/:event_id", async(req, res) => {
  try{
    const {event_id} = req.params;
    const bandId = req.session.band.band_id;
    const result = await deletePublicEventFromDB(event_id);
    res.status(200).json(result);
  }
  catch(err){
    res.status(500).json({error: err.message});
  }


})


app.put("/band/publicEvent/:event_id", async(req, res) => {

  try{
    const {event_id} = req.params;
    const data = req.body;
    const result = await updatePublicEventFromDB(event_id, data);
    res.status(200).json(result);
  }
  catch(err){
    res.status(500).json({error: err.message});
  }

});


app.get("/bands/genres", async (req, res) => {
  try {
    const genres = await getAllBandGenresFromDB();

    
    res.status(200).json(
      genres.map(g => g.music_genres)
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/bands/cities", async (req, res) => {
  try {
    const cities = await getAllCitiesFromDB();

    res.status(200).json(
      cities.map(c => c.band_city)
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/bands/search", async(req, res) => {

    try{
      const {genre, city, founded_year} = req.query;
      const bands = await getBandsFiltered(genre, city, founded_year);
      res.status(200).json(bands);
    }
    catch(err){
      console.error(err);
      res.status(500).json({ error: err.message });

    }


});


app.get("/bands/:band_name/rating", async(req, res) =>{
  try{
    const band_name = req.params.band_name;
    const rating = await getAverageRatingFromDB(band_name);

    if(!rating || rating.totalReviews === 0){
      return res.json({ average: null, count: 0 });
    }

    res.json({
      average: Number(rating.avgRating).toFixed(1), //mesos oros
      count: rating.totalReviews
    });
  }
  catch(err){
    res.status(500).json({ error: err.message });

  }


});


app.get("/bands/:band_id/availability", async(req, res) =>{
  try{
    const band_id = req.params.band_id;
    const date = await getBandAvailabiltyFromDB(band_id);
    /*res.json(date.map(d => d.bookedDate));*/
    const fixedDates = date.map(d => {
      const dt = new Date(d.bookedDate);
      dt.setDate(dt.getDate() + 1); 
      return dt.toISOString().slice(0, 10); 
    });

    res.json(fixedDates);
  }
  catch(err){
    res.status(500).json({ error: err.message });


  }


})

app.post("/band/privateEvents", async(req, res) => {
  try{
    const event = req.body;
    const result = await insertPrivateEvent(event);
    res.status(200).json({message:"Private Event Added", event:event});
  }
  catch(err){
    console.error(err);
    res.status(500).json({ error: err.message });
  }

});

app.get("/band/privateEvents", async(req,res)=>{
    console.log("GET /band/privateEvents called", req.session.band);

  try{

    const bandId = req.session.band.band_id;
    const events = await getPrivateEventsFromDB(bandId);
    res.status(200).json(events);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }

});

//edit Private Event (status)
app.put("/band/privateEvents/:private_event_id", async(req, res)=>{
  try{
    const  { private_event_id } = req.params;
    const { status, band_decision } = req.body;
    const result = await updatePrivateEventStatusFromDB(private_event_id, status, band_decision);
    res.status(200).json({message: `Event status updated to ${status}`}); 
  }

  catch(err){
    res.status(500).json({ error: err.message });

  }


});

app.delete("/band/privateEvents/:private_event_id", async (req, res) => {
    try {
        const { private_event_id } = req.params;
        const result = await deletePrivateEventFromDB(private_event_id); 

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Private event not found" });
        }

        res.status(200).json({ message: "Private event deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});





//Public Events 
app.get("/publicEvents/genres", async (req, res) => {
  try {
    const genres = await getAllPublicEventsGenresFromDB();

    
    res.status(200).json(
      genres.map(g => g.event_type)
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/publicEvents/cities", async (req, res) => {
  try {
    const cities = await getAllPublicEventsCitiesFromDB();

    res.status(200).json(
      cities.map(c => c.event_city)
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/publicEvents/search", async(req, res) => {

    try{
      const {genre, city, date} = req.query;
      const events = await getPublicEventsFiltered(genre, city, date);
      res.status(200).json(events);
    }
    catch(err){
      console.error(err);
      res.status(500).json({ error: err.message });

    }


});


app.get("/user/privateEvents", async(req, res) => {
  try{
    const userId = req.session.user.id;
    const bookings = await getUserPrivateEventsFromDB(userId);
    res.status(200).json(bookings);
  }
  catch(err){
    res.status(500).json({ error: err.message });


  }


})

app.get("/bands/:band_id/events", async(req, res) => {
  try{
    const band_id = req.params.band_id;
    const publicEvents = await getPublicEventsByBand(band_id);
    const privateEvents = await getPrivateEventsFromDB(band_id);
    res.status(200).json({
      publicEvents,
      privateEvents
    });
  }catch(err){
    res.status(500).json({error:err.message});
  }

});


//geocode route to fetch
app.post('/geocode', async (req, res) => {
  const { address, city } = req.body;

  if (!address || !city) {
    return res.status(400).json({ error: 'Address and city required' });
  }

  const fullAddress = `${address} ${city} Greece`;
  const apikey = "YOUR API HERE";

  try {
    const response = await fetch(`https://forward-reverse-geocoding.p.rapidapi.com/v1/search?q=${encodeURIComponent(fullAddress)}&accept-language=en&polygon_threshold=0.0`, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "forward-reverse-geocoding.p.rapidapi.com",
        "x-rapidapi-key": apikey
      }
    });

    const data = await response.json();

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    const { lat, lon } = data[0];
    res.json({ lat: parseFloat(lat), lon: parseFloat(lon) });

  } catch (err) {
    console.error('Geocode error:', err.message);
    res.status(500).json({ error: 'Failed to get coordinates' });
  }
});

// ======= ftiaxno to CHAT me vasi ton kodika poy mas exei dothei chatApp file =======
io.on('connection', (socket) => {
  console.log('A user connected');

  
  socket.on('joinRoom', async ({ room, sender }) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);

    try {
    
      const roomHistory = await getMessagesByPrivateEvent(room);

      socket.emit('chat history', roomHistory);
    } catch (err) {
      console.error("Error loading chat history:", err);
    }
  });

  
  socket.on("chatMessage", async ({ room, private_event_id, message, sender, recipient }) => {
    
       const msgObj = {
        private_event_id,
        message,
        sender,
        recipient,
        date_time: new Date()
       };

    try{
      
      await insertMessage(msgObj);
        /*room,
        message,
        sender,
        sender === "band" ? "user" : "band" 
      );*/

      
      io.to(room).emit('message', {
        sender,
        text: message,
        timestamp: msgObj.date_time
      });

    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});



process.env.GROQ_API_KEY = "YOUR API HERE";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || prompt.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", 
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for a music events platform. Answer clearly and concisely."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });

    res.json({
      text: completion.choices[0].message.content
    });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

app.post("/QueryBands", async (req, res) => {
  const { prompt: userQuestion } = req.body;

  if (!userQuestion || userQuestion.trim() === "") {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    
    const llmPrompt = `
Database Schema:

Table: bands
- band_id (INT, PK)
- username (VARCHAR)
- email (VARCHAR)
- password (VARCHAR)
- band_name (VARCHAR)
- music_genres (VARCHAR)
- band_description (TEXT)
- members_number (INT)
- foundedYear (INT)
- band_city (VARCHAR)
- telephone (VARCHAR)
- webpage (VARCHAR)
- photo (VARCHAR)

Table: public_events
- public_event_id (INT, PK)
- band_id (INT, FK to bands)
- event_type (VARCHAR)
- event_datetime (DATETIME)
- event_description (TEXT)
- participants_price (DECIMAL)
- event_city (VARCHAR)
- event_address (VARCHAR)
- event_lat (DECIMAL)
- event_lon (DECIMAL)

Table: reviews
- review_id (INT, PK)
- band_name (VARCHAR)
- sender (VARCHAR)
- review (TEXT)
- rating (INT)
- status (VARCHAR)
- date_time (DATETIME)

Instructions:
- Only generate SQL SELECT queries.
- Do not include sensitive fields like passwords.
- Do not start your answer with any text like "To generate..." or explanations.
- NEVER include primary keys or id columns (e.g. id, event_id, public_event_id, band_id).
- Select ONLY user-facing columns (names, descriptions, dates, cities, genres, etc).
- If an ID column exists, EXCLUDE it.
- Use ONLY column names exactly as defined in the schema.
- Do NOT invent column names.
- If a column does not exist, do NOT guess.
- Always output city names in English as stored in the database.
- Output only valid JSON in this format:
{
  "table": "<table_name>",
  "columns": ["col1", "col2", ...],
  "conditions": {
    "column1": "value1",
    "column2": "value2"
  },
  "limit": <optional_number>
}

Please generate the SQL query based on the above database details to answer the question:
"${userQuestion}"
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are an AI that converts natural language questions to JSON describing SQL queries for a music events database."
        },
        {
          role: "user",
          content: llmPrompt
        }
      ],
      temperature: 0.7
    });

    
    const queryJSON = JSON.parse(completion.choices[0].message.content);

   
    console.log(queryJSON);
    const bands = await getBandsFilteredFromJSON(queryJSON);
    console.log('APOTELESMA');
    console.log(bands);

    res.json(bands);

  } catch (err) {
    console.error("NLP query error:", err);
    res.status(500).json({ error: err.message });
  }
});

//BONUS LLM 


app.post("/hateCheck", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim() === "") {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a content moderation system. Answer ONLY with JSON."
        },
        {
          role: "user",
          content: `
Check the following text for:
- hate speech
- harassment
- threats
- insults
- abusive language

If the content is even slightly offensive, return true

Return strictly JSON in this format:
{
  "isHate": true/false
}

Text:
"${text}"
          `
        }
      ],
      temperature: 0
    });

    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);

  } catch (err) {
    console.error("Hate check error:", err);
    res.status(500).json({ error: "Hate check failed" });
  }
});


app.get('/bands/:id/name', async (req, res) => {
    try {
        const bandId = req.params.id;

        const bandName = await getBandNameById(bandId);

        if (!bandName) {
            return res.json({ band_name: "Unknown band" });
        }

        res.json({ band_name: bandName });

    } catch (err) {
        console.error("Error fetching band name:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/band/profile", async (req, res) => {
  if (!req.session.band) return res.status(401).json({ error: "Not logged in" });

  const band_name = req.session.band.band_name;
  try {
      const rows = await getBandByName(band_name);

      if(rows.length === 0) return res.status(404).json({ error: "Band not found" });
      res.status(200).json(rows[0]);
  } catch(err) {
      res.status(500).json({ error: err.message });
  }
});

app.put("/band/profile", async (req, res) => {
    if (!req.session.band) return res.status(401).json({ error: "Not logged in" });

    const username = req.session.band.username;
    const updates = req.body;
    try {
        await updateBandFields(username, updates); 
        res.status(200).json({ message: "Band profile updated successfully" });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

//ADMIN
app.get("/admin/events", async(req, res)=> {
    try{
      const publicEvents = await getAllPublicEventsFromDB();
      const privateEvents = await getAllPrivateEventsFromDB();
      res.status(200).json({
        publicEvents,
        privateEvents
      });
  }catch(err){
    res.status(500).json({error:err.message});
  }

});

app.get("/admin/bandUsers", async(req, res)=>{
  try{
      const users = await getAllUsers();
      const bands = await getAllBands();
      res.status(200).json({
        users,
        bands
      });
  }catch(err){
    res.status(500).json({error:err.message});
  }


}
);


app.put("/user/privateEvents/:id/status", async(req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try{
    await updatePrivateEventStatusFromDBversion2(id, status);
    res.json({ message: "status updated"});
  }
  catch{
    res.status(500).json({ error: err.message });
  }

});


app.get("/admin/revenue", async (req, res) => {
    try {
        const total = await getTotalPrivateEventsRevenue();
        res.json({ total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


//BONUS
app.post("/band/:bandId/visit", async (req, res) => {
    const bandId = req.params.bandId;
    const userId = req.body.user_id || null;

    try {
        const result = await logBandProfileVisit(bandId, userId);
        res.status(200).json(result);
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/band/:bandId/visit', async (req, res) => {
    const bandId = req.params.bandId;

    try {
        const visits = await getBandVisits(bandId);
        res.status(200).json(visits);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
