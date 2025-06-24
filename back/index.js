require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');

const authRoutes     = require('./routes/auth');
const listingRoutes  = require('./routes/listing');
const messageRoutes  = require('./routes/message');
const { Server }     = require('socket.io');
const { authenticateJWT } = require('./middleware/authenticate');

const app    = express();
const server = http.createServer(app);


app.use(express.json());
app.use(cors());


app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);

const io = new Server(server, {
  cors: { origin: '*', methods: ['GET','POST'] },
  transports: ['websocket']
});

io.use(async (socket, next) => {

  const token = socket.handshake.auth.token;
  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.userId = payload.userId;
    next();
  } catch (err) {
    next(new Error('Unauthorized'));
  }
});

io.on('connection', socket => {
  socket.on('sendMessage', async msg => {
    try {
    
      const saved = await Message.create({
        exchangeId:      msg.exchangeId,
        from:            msg.from,
        to:              msg.to,
        content:         msg.content,
        sentAt:          msg.sentAt
      });

      io.to().emit('receiveMessage', saved);
    } catch(e) {
      console.error(e);
    }
  });

  socket.on('joinRoom', async ({ userA, userB }) => {
    const room = [userA, userB].sort().join('#');
    socket.join(room);

    const history = await Message.find({ exchangeId: room })
                                 .sort('sentAt');
    socket.emit('history', history);
  });


  socket.on('disconnect', () => {
    console.log(`Socket déconnecté: ${socket.id}`);
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    const PORT = process.env.PORT || 4242;
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  })
  .catch(err => console.error('MongoDB error', err));
