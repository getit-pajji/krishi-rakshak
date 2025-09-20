import { useState, useEffect } from 'react';

export default function Home(){
  const [lang,setLang] = useState('');
  const [weather,setWeather] = useState(null);
  const [msg,setMsg] = useState('');
  const [chat,setChat] = useState('');

  const [lat,lng] = [28.6,77.2]; // sample coords (Delhi)

  useEffect(()=>{
    if(lang){
      fetch(`http://localhost:4000/api/weather/${lat}/${lng}`)
        .then(r=>r.json()).then(setWeather);
    }
  },[lang]);

  async function sendMessage(){
    const r = await fetch("http://localhost:4000/api/chat",{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({message:msg, lang})
    });
    const d = await r.json();
    setChat(d.reply);
  }

  if(!lang) return (
    <div>
      <h1>Select Language</h1>
      <select onChange={e=>setLang(e.target.value)}>
        <option value="">--Choose--</option>
        <option value="hi">Hindi</option>
        <option value="ta">Tamil</option>
        <option value="te">Telugu</option>
      </select>
    </div>
  );

  return (
    <div>
      <h2>🌾 Farmer Dashboard ({lang})</h2>
      {weather && <p>Weather: {weather.main.temp}°C, {weather.weather[0].description}</p>}
      <p>📞 Helpline: 1800-180-1551</p>

      <h3>🤖 Chatbot</h3>
      <input value={msg} onChange={e=>setMsg(e.target.value)} />
      <button onClick={sendMessage}>Send</button>
      {chat && <p>Bot: {chat}</p>}

      <button onClick={()=>alert("Nearby Krishi Kendras listed here")}>🏪 Krishi Kendras</button>
      <button onClick={()=>alert("Market Prices would show")}>💹 Market Prices</button>
      <button onClick={()=>alert("Sustainability Techniques corner")}>🌱 Sustainability</button>
    </div>
  );
}
