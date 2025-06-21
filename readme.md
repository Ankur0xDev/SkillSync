# SkillSync

SkillSync is a full-stack web application for developers to connect, collaborate, and build projects together. It features user profiles, project sharing, team management, real-time chat, and a community hub.

---

## Features

- **User Authentication**: Register, login, and secure sessions.
- **Profile Management**: Add skills, experience, and personal info.
- **Project Sharing**: Create, edit, and showcase coding projects.
- **Team Collaboration**: Request to join teams, manage team members, and handle team requests.
- **Real-Time Chat**: Direct messaging and community chat.
- **Community Hub**: Discussions, posts, and Q&A.
- **Search & Matchmaking**: Find developers by skills and interests.
- **Responsive UI**: Built with React, Tailwind CSS, and Framer Motion.

---

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Framer Motion, React Router, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.IO
- **Other**: JWT Auth, bcrypt, nodemailer, multer, cloudinary

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Clone the Repository

```sh
git clone hhttps://github.com/Ankur0xDev/SkillSync.git
cd skillsync
```

### Setup Environment Variables

Create `.env` files in both `client/` and `server/` directories.

#### Example for `server/.env`:
```
MONGODB_URI=your_mongodb_connection_string
PORT=YOUR_PORT
JWT_SECRET=your_jwt_secret
EMAIL=your_email@example.com
EMAIL_PASSWORD=your_email_password
CLOUDINARY_CLOUD_NAMEL=your_cloudinary_CLOUD_NAME
CLOUDINARY_API_KEY=your_cloudinary_API_KEY
CLOUDINARY_API_SECRET=your_cloudinary_API_SECRET


```

#### Example for `client/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Install Dependencies

#### Client

```sh
cd client
npm install
```

#### Server

```sh
cd ../server
npm install
```

### Run the Application

#### Start the Server

```sh
cd server
npm run dev
```

#### Start the Client

```sh
cd ../client
npm run dev
```

- Client: [http://localhost:5173](http://localhost:5173)
- Server: [http://localhost:5000](http://localhost:5000)

---

## Project Structure

```
client/
  src/
    components/
    pages/
    Contexts/
    hooks/
    types/
    utils/
  public/
  index.html
  package.json
  ...
server/
  models/
  Routes/
  controller/
  middleware/
  uploads/
  server.js
  package.json
  ...
```

---

## Scripts

### Client

- `npm run dev` – Start Vite dev server
- `npm run build` – Build for production
- `npm run lint` – Lint code

### Server

- `npm run dev` – Start server with nodemon
- `npm start` – Start server

---

## License

MIT

---

## Credits

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express](https://expressjs.com/)
-