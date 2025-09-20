require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {Pool} = require('pg');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ===== WEATHER =====
app.get('/api/weather/:lat/:lng', async (req,res)=>{
  const {lat,lng} = req.params;
  try {
    const r = await axios.get("https://api.openweathermap.org/data/2.5/weather", {
      params: { lat, lon: lng, appid: process.env.OPENWEATHER_KEY, units: 'metric' }
    });
    res.json(r.data);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// ===== KENDRAS =====
app.get('/api/kendras/:lat/:lng', async (req,res)=>{
  const {lat,lng} = req.params;
  try {
    const q = `SELECT id,name, ST_Distance(location, ST_MakePoint($1,$2)) as distance
               FROM krishi_kendras 
               WHERE ST_DWithin(location, ST_MakePoint($1,$2)::geography, 50000)`;
    const r = await pool.query(q,[lng,lat]);
    res.json(r.rows);
  } catch(e){ res.status(500).json({error:e.message}); }
});

// ===== MARKET =====
app.get('/api/market/:crop', async (req,res)=>{
  const crop = req.params.crop;
  const q = `SELECT * FROM market_prices WHERE crop_name=$1 ORDER BY updated_at DESC LIMIT 1`;
  try {
    const r = await pool.query(q,[crop]);
    res.json(r.rows[0] || {});
  } catch(e){ res.status(500).json({error:e.message}); }
});

// ===== ORDERS =====
app.post('/api/orders', async (req,res)=>{
  const {farmer_id, product, quantity, govt_price} = req.body;
  const q = `INSERT INTO orders(farmer_id, product, quantity, govt_price, status)
             VALUES($1,$2,$3,$4,'pending') RETURNING *`;
  const r = await pool.query(q,[farmer_id,product,quantity,govt_price]);
  res.json(r.rows[0]);
});

// ===== CHATBOT =====
app.post('/api/chat', async (req,res)=>{
  const {message, lang} = req.body;
  try {
    const r = await axios.post("https://api.openai.com/v1/chat/completions",
      { model: "gpt-3.5-turbo", messages:[{role:"user", content: message}] },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_KEY}` } }
    );
    const reply = r.data.choices[0].message.content;
    res.json({reply}); // Add translation step with Google Translate if needed
  } catch(e){ res.status(500).json({error:e.message}); }
});

app.listen(4000, ()=>console.log("✅ Backend running on port 4000"));
