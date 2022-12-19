const express = require("express");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const path = require("path");

const app = express();
app.use(express.json());

module.exports = app;

let db = null;
const dbPath = path.join(__dirname, "cricketTeam.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT * FROM cricket_team ORDER BY player_id;
    `;
  const playersArray = await db.all(getPlayersQuery);
  const newArray = [];
  for (let obj of playersArray) {
    newArray.push({
      playerId: obj.player_id,
      playerName: obj.player_name,
      jerseyNumber: obj.jersey_number,
      role: obj.role,
    });
  }
  response.send(newArray);
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
          INSERT INTO
              cricket_team (player_name,jersey_number,role)
          VALUES (
              '${playerName}',
              ${jerseyNumber},
              '${role}')
      `;
  await db.run(createPlayerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
        SELECT * FROM cricket_team WHERE player_id = ${playerId};
    `;
  const obj = await db.get(getPlayersQuery);
  const result = {
    playerId: obj.player_id,
    playerName: obj.player_name,
    jerseyNumber: obj.jersey_number,
    role: obj.role,
  };
  response.send(result);
});

app.put("/players/:Id/", async (request, response) => {
  const { Id } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const createPlayerQuery = `
          UPDATE
              cricket_team 
          SET
              player_name = '${playerName}',
              jersey_number = ${jerseyNumber},
              role = '${role}'
          WHERE player_id = ${Id}
      `;
  await db.run(createPlayerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:Id/", async (request, response) => {
  const { Id } = request.params;
  const getPlayersQuery = `
        DELETE FROM cricket_team WHERE player_id = ${Id};
    `;
  const obj = await db.run(getPlayersQuery);
  response.send("Player Removed");
});
