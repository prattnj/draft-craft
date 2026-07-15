# DraftCraft

A Jackbox-style multiplayer drafting game for groups. One person hosts on a laptop (optionally cast to a TV) and everyone else joins on their phones via a room code — no shared WiFi required.

## How to Play

1. The **host** opens the app, picks a draftee bank and a category, configures settings, and creates a room.
2. **Players** join by entering the 4-letter room code (or scanning the QR code) on their own devices.
3. Once everyone is in, the host starts the draft. Players take turns picking from the shared bank and assigning draftees to positions in their category.
4. Draft order is randomized. With snake draft enabled (default), the order reverses each round.
5. When all positions are filled, results are saved and can be reviewed any time from the home screen.

## Features

- **Up to 8 players**
- **Snake draft** with randomized order
- **Pre-draft queue** — queue picks for your next turn while others are picking; the app auto-prompts you to confirm when your turn arrives
- **Watchlist** — star draftees you're interested in without committing to a position
- **Position swaps** — optionally let players rearrange their own roster after picking
- **Optional pick timer** — set a countdown per pick
- **Past drafts** — completed drafts are saved to the host's browser and viewable from the home screen
- **Custom banks & categories** — create your own draftee lists and position sets, also saved locally

## Built-in Banks

Famous People · NBA Players · NFL Players · US Cities · Rock Bands · US Presidents · Bible Characters · Movie Characters · Countries

## Built-in Categories

Football Team · Basketball Team · Baseball Team · Medieval Court · Wild West Town · Pirate Ship · Superhero Team · Heist Crew · Space Crew · None (ordered list)

## Tech Stack

- **Frontend** — React, TypeScript, Vite, Tailwind CSS
- **Backend** — Node.js WebSocket server (`ws`)
- **State** — Zustand (client), in-memory rooms (server)
- **Storage** — `localStorage` for past drafts and custom banks/categories

## Running Locally

```bash
npm install
npm run dev
```

This starts both the WebSocket server (port 3001) and the Vite dev server (port 5173). Open the client URL in a browser to host, and share the room code with players on other devices or tabs.
