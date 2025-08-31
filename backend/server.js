const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [
        "'self'",
        "https://stats.schmelczer.dev",
        "'unsafe-inline'",
      ],
      scriptSrc: [
        "'self'",
        "https://stats.schmelczer.dev",
        "'unsafe-inline'",
      ],
    },
  },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.static('public'));

// File paths
const DATA_PATH = process.env.DATA_PATH || path.join(__dirname, '../frontend/fizika.json');
const PICS_PATH = process.env.PICS_PATH || path.join(__dirname, '../frontend/pics');

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PICS_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// Utility functions
const readData = async () => {
  const data = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(data);
};

const writeData = async (data) => {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
};



// Public routes
app.get('/api/fizika', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.get('/api/images', async (req, res) => {
  try {
    const files = await fs.readdir(PICS_PATH);
    const images = files.filter(f => /\.(jpg|jpeg|png|gif|bmp)$/i.test(f));
    res.json(images);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read images' });
  }
});

app.use('/api/pics', express.static(PICS_PATH));

// Admin routes (no auth required)
app.get('/api/admin/questions', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read questions' });
  }
});

app.post('/api/admin/questions', async (req, res) => {
  try {
    const data = await readData();
    const maxId = Math.max(...data.map(q => q.id), 0);

    const newQuestion = { id: maxId + 1, ...req.body };
    data.push(newQuestion);
    await writeData(data);

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.put('/api/admin/questions/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(q => q.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }

    data[index] = { ...data[index], ...req.body };
    await writeData(data);

    res.json(data[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update question' });
  }
});

app.delete('/api/admin/questions/:id', async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex(q => q.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ error: 'Question not found' });
    }

    data.splice(index, 1);
    await writeData(data);

    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

app.post('/api/admin/images/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image provided' });
  }

  res.json({
    filename: req.file.filename,
    path: `/api/pics/${req.file.filename}`
  });
});

app.delete('/api/admin/images/:filename', async (req, res) => {
  try {
    await fs.unlink(path.join(PICS_PATH, req.params.filename));
    res.json({ message: 'Image deleted' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'Image not found' });
    }
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Error:', error.message);
  res.status(500).json({ error: 'Server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Fizika Admin Backend running on port ${PORT}`);
});