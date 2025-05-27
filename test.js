import express, { json } from 'express';
import jwt from 'jsonwebtoken'; // ✅ CommonJS import fix
const { sign, verify } = jwt;

const app = express();
const PORT = 3000;

const SECRET_KEY = "Abcd@1234";

const users = [{ username: "testuser", password: "12345" }];

app.use(json()); 

// Login route
app.post('/login', (req, res) => {
  console.log(req.body); 
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});


// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Protected route
app.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: `Hello, ${req.user.username}. This is protected data.` });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
