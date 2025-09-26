# Real-time Online Robo Rally

## 🎯 High-Level Goal

Create a web-based, real-time, multiplayer version of the board game **Robo Rally**.

## 🛠️ Core Technology Stack

| Layer                         | Technology                                                  |
| ----------------------------- | ----------------------------------------------------------- |
| **Frontend**                  | React (with Vite), Zustand (State Management), Tailwind CSS |
| **Backend**                   | Node.js with Express                                        |
| **Real-time Communication**   | Socket.IO                                                   |
| **Active Game State Storage** | Redis                                                       |
| **Permanent Data Storage**    | PostgreSQL                                                  |

---

## 📋 Phase 1: Project Scaffolding & Backend Foundation

### Objective

Initialize the project structure and establish a functional backend server capable of connecting to the required databases and handling basic client connections.

### Key Tasks

#### 🏗️ Initialize Monorepo

- [ ] Set up a project directory with two sub-packages: `server` and `client`
- [ ] Use npm workspaces to manage them

#### 🖥️ Server Setup (Node.js/Express)

- [ ] Initialize a new Node.js project (`npm init`)
- [ ] Install dependencies: `express`, `socket.io`, `redis`, `pg` (node-postgres), `nodemon`
- [ ] Create a basic Express server that listens on a specified port
- [ ] Integrate Socket.IO with the Express server

#### 🗄️ Database Setup

- [ ] **PostgreSQL**: Write a SQL script (`init.sql`) to create the initial database tables
  - `users` table: `id` (UUID, primary key), `username` (VARCHAR, unique), `password_hash` (VARCHAR), `created_at` (TIMESTAMP)
  - `games` table: `id` (UUID, primary key), `status` (VARCHAR, e.g., 'waiting', 'in_progress', 'finished'), `winner_id` (UUID, foreign key to users.id), `created_at` (TIMESTAMP)
- [ ] **Redis**: Ensure Redis is running and create a connection module in the server to connect the Node.js app to it

#### ⚛️ Client Setup (React/Vite)

- [ ] Initialize a new React project in the client directory using Vite
- [ ] Install dependencies: `socket.io-client`, `zustand`, `tailwindcss`
- [ ] Follow the Tailwind CSS installation guide to configure `tailwind.config.js` and `postcss.config.js`

#### 🔗 Initial Connection Test

- [ ] On the server, add a basic Socket.IO listener for connection events that logs a message
- [ ] In the React `App.jsx`, use a `useEffect` hook to establish a connection to the Socket.IO server

### ✅ Acceptance Criteria

- [ ] The server starts without errors using nodemon
- [ ] The server successfully connects to both PostgreSQL and Redis upon startup
- [ ] The Vite development server for the client starts successfully
- [ ] When the React app loads in a browser, a "client connected" message appears in the server console

---

## 📋 Phase 2: User Authentication & Game Lobbies

### Objective

Allow users to register, log in, and then create or join game lobbies in real-time.

### Key Tasks

#### 🔐 Backend (Authentication)

- [ ] Install `bcrypt` for password hashing and `jsonwebtoken` for session management
- [ ] Create API endpoints: `POST /api/auth/register` and `POST /api/auth/login`
- [ ] Implement logic to hash passwords on registration and compare hashes on login
- [ ] Upon successful login, return a JWT to the client

#### 🎮 Backend (Lobby Management)

Implement Socket.IO event handlers for:

- [ ] `create_lobby`: Generates a unique game ID, creates a new game state object in Redis (e.g., `SET game:<gameId> '...'`), adds the game to PostgreSQL, and has the user join the Socket.IO room for that game ID
- [ ] `join_lobby`: Validates the game ID, adds the player to the game state in Redis, and has them join the Socket.IO room
- [ ] `get_lobbies`: Retrieves a list of all games with status: 'waiting' and emits it to the client
- [ ] Broadcast updates to lobby members whenever a new player joins

#### 🎨 Frontend (UI & State)

- [ ] Create React components for Registration and Login forms
- [ ] Set up a Zustand store to manage application state, including the user's authentication token and profile
- [ ] Create a `LobbyBrowser` component that fetches and displays a list of available games
- [ ] Create a `GameLobby` view that shows the list of players in the current lobby and a "Start Game" button (visible only to the lobby creator)

### ✅ Acceptance Criteria

- [ ] A user can create an account, log out, and log back in
- [ ] A logged-in user can create a game lobby, which then appears in the lobby browser for other users
- [ ] Multiple users can join the same lobby, and their names appear in real-time for everyone else in that lobby

---

## 📋 Phase 3: Core Game State & Board Rendering

### Objective

Transition from the lobby to the game, establishing the full game state in Redis and rendering the initial board and robots on all clients.

### Key Tasks

#### 🎮 Backend (Game State Definition)

- [ ] Define the canonical JSON structure for the game state that will be stored in Redis. This should include:
  - `gameStatus`
  - `boardLayout`
  - `turnNumber`
  - `players` (an array of player objects)
- [ ] Each player object should contain details like:
  - `id`, `username`
  - `robot` (with `x`, `y`, `orientation`, `damage`, `lives`)
  - `hand` (cards)
  - `registers`, etc.
- [ ] Create a "game start" handler that is triggered when the lobby host starts the game
- [ ] This function populates the full game state in Redis, including placing robots at their starting positions and setting the game status to `in_progress`

#### 📡 Backend (Broadcasting State)

- [ ] Upon game start, broadcast the complete initial game state to all players in that game's Socket.IO room

#### 🎨 Frontend (Rendering)

- [ ] Create a `GameBoard` component that renders the game board based on the `boardLayout` data. Use CSS Grid for the layout
- [ ] Create a `Tile` component that can render different tile types (floor, pit, conveyor, etc.)
- [ ] Create a `Robot` component that is positioned on the board using the `x` and `y` coordinates from the game state
- [ ] Update the Zustand store to hold the detailed game state received from the server, causing the UI to render the board

### ✅ Acceptance Criteria

- [ ] When the host starts the game, the UI for all players switches from the lobby view to the game board view
- [ ] The game board is rendered identically for all players
- [ ] Each player's robot appears in its correct starting position on the board

---

## 📋 Phase 4: Card Programming Phase

### Objective

Implement the turn-based loop of dealing cards and allowing players to program their robot's registers.

### Key Tasks

#### 🎴 Backend (Card Logic)

- [ ] Create a module that represents the deck of programming cards
- [ ] Implement logic for the start of a turn: deal the correct number of cards (9 minus damage) to each player by updating their hand array in the Redis game state
- [ ] Emit the updated (private) player state to each respective player
- [ ] Create a `submit_program` event handler that receives a player's 5 chosen register cards
- [ ] Validate the move and update the player's registers and `isReady` status in Redis

#### 🎯 Frontend (UI for Programming)

- [ ] Create a `PlayerHand` component to display the cards the player can choose from
- [ ] Create a `ProgrammingRegisters` component with 5 slots
- [ ] Implement drag-and-drop functionality for a player to move cards from their hand to the register slots
- [ ] Add a "Lock In" button that, when clicked, sends the `submit_program` event to the server and disables further changes
- [ ] Create a UI element that shows the "Ready" status of all players in the game

### ✅ Acceptance Criteria

- [ ] At the start of a turn, each player sees their unique hand of cards
- [ ] Players can successfully program their five registers
- [ ] The server receives and validates the programs
- [ ] The game does not proceed until all players have locked in their programs

---

## 📋 Phase 5: The "Reveal" Phase & Game Logic Engine

### Objective

Execute the programmed moves for each of the 5 registers sequentially, applying all game rules and broadcasting each step in real-time.

### Key Tasks

#### ⚙️ Backend (Game Engine)

- [ ] This is the most critical backend component. Create a `GameEngine` module
- [ ] Once all players are ready, start a loop from register 1 to 5
- [ ] Inside the loop (for each register):
  - [ ] Get the cards from all players for the current register
  - [ ] Sort the moves based on card priority number
  - [ ] Execute each robot's move one by one
  - [ ] Create pure functions for actions like `moveRobot`, `turnRobot`, etc., that take the game state and a move, and return the new game state
  - [ ] Between each individual robot's move, introduce a short delay (e.g., `setTimeout(..., 500)`)
  - [ ] After each move, save the new state to Redis and broadcast it to all clients
- [ ] After all robots have moved for the register, process board elements (conveyor belts, pushers, lasers)
- [ ] Again, broadcast these updates incrementally

#### 🎬 Frontend (Visualizing Moves)

- [ ] Enhance the client's Socket.IO handler to process the incremental game state updates
- [ ] When the robot's coordinates change in the Zustand store, use CSS transitions on the Robot component to make its movement appear smooth instead of instantly teleporting

### ✅ Acceptance Criteria

- [ ] The game correctly executes moves based on card priority
- [ ] Robots are seen moving one by one on all clients' screens in the same order
- [ ] Board elements like conveyor belts activate after the robot moves are complete for a register
- [ ] The game proceeds through all 5 registers and then automatically begins a new turn (Phase 4)

---

## 📋 Phase 6: Polishing, Win/Loss Conditions & Cleanup

### Objective

Add the final features required for a complete game loop, handle edge cases, and improve the user experience.

### Key Tasks

#### 🏆 Backend (Game Rules)

- [ ] Implement logic for checkpoints, damage (from lasers, etc.), and robot destruction/respawning
- [ ] Define a win condition (e.g., a player visits all checkpoints in order)
- [ ] When a game ends, update its status in PostgreSQL and save a final "game summary" record
- [ ] Implement graceful handling for player disconnections (e.g., their robot is removed or becomes a static obstacle)

#### 🎨 Frontend (UI/UX)

- [ ] Add UI overlays to display damage tokens, life tokens, and visited checkpoints
- [ ] Create a "Game Over" screen displaying the winner and final scores
- [ ] Add user feedback, notifications (e.g., "It's your turn!"), and potentially sound effects
- [ ] Conduct a final styling pass to ensure the UI is clean, intuitive, and visually appealing

### ✅ Acceptance Criteria

- [ ] The game can be played from start to finish, and a winner is correctly declared
- [ ] The final game result is stored permanently in PostgreSQL
- [ ] The application is stable and provides a fun, engaging user experience
