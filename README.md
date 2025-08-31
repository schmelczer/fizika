# Fizika - Physics Quiz Application

A comprehensive physics quiz application for Hungarian students preparing for their physics exams (érettségi). The application consists of a frontend quiz interface and an admin backend for content management.

## 🚀 Features

### Student Interface (Frontend)
- Interactive physics quiz questions
- Multiple choice questions with immediate feedback  
- Category-based filtering (dynamics, mechanics, fluids, etc.)
- Search functionality by year, month, and question number
- Responsive design for desktop and mobile
- Progress tracking and scoring
- Timer functionality

### Admin Interface (Backend)
- 📝 Full CRUD operations for quiz questions
- 🖼️ Image management (upload, view, delete)
- 📊 RESTful API for frontend integration
- 🛡️ Basic security features (input validation)
- 🐳 Docker containerization ready

## 📁 Project Structure

```
fizika/
├── index.html              # Main quiz interface
├── fizika.json             # Quiz questions database
├── pics/                   # Question images
├── js/                     # Frontend JavaScript
│   ├── fizika.js          # Main quiz logic
│   └── load.js            # Data loading (updated for API)
├── css/                    # Stylesheets
├── backend/                # Admin backend service
│   ├── server.js          # Express server
│   ├── public/admin.html  # Admin interface
│   ├── package.json       # Dependencies
│   ├── Dockerfile         # Container configuration
│   └── README.md          # Backend documentation
├── docker-compose.yml      # Multi-service setup
└── .github/workflows/      # CI/CD pipelines
```

## 🛠️ Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fizika
   ```

2. **Start the services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the applications:**
   - **Student Quiz**: http://localhost (or your domain)
   - **Admin Panel**: http://localhost:3001/

### Option 2: Local Development

1. **Frontend** (Static files):
   - Serve the root directory with any web server
   - Update `API_BASE` in `js/load.js` to point to your backend

2. **Backend** (Admin API):
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment
   npm run dev
   ```

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env` from the example:

```bash
# Server settings
PORT=3001
NODE_ENV=production

# Frontend integration
FRONTEND_URL=*

# File paths (relative to backend directory)
DATA_PATH=../fizika.json
PICS_PATH=../pics
```

## 🔌 API Integration

The frontend **prioritizes backend API** with local fallback:
- **Primary**: Auto-detects backend (`localhost:3001` for dev, same origin for production)
- **Fallback**: Local `fizika.json` and `pics/` directory when backend unavailable
- **Images**: Try backend API first, fallback to local `pics/` directory

**Graceful degradation** - Quiz works even when backend is down, using local files.

## 📊 API Endpoints

### Public (Used by Frontend)
- `GET /api/fizika` - Get all questions
- `GET /api/images` - List images
- `GET /api/pics/:filename` - Serve images

### Admin (Open Access)
- `GET|POST|PUT|DELETE /api/admin/questions` - Question management  
- `POST|DELETE /api/admin/images` - Image management

## 🐳 Docker Deployment

### Production with Docker Compose

```bash
# Deploy
docker-compose up -d

# With nginx reverse proxy  
docker-compose --profile nginx up -d
```

### Manual Docker Build

```bash
docker build -t fizika-admin ./backend
docker run -d -p 3001:3001 \
  -v $(pwd)/fizika.json:/usr/src/app/fizika.json:ro \
  -v $(pwd)/pics:/usr/src/app/pics \
  fizika-admin
```

## 🔄 CI/CD Pipeline

GitHub Actions automatically:
- Builds Docker images on pushes to main
- Publishes to GitHub Container Registry  
- Signs images with Cosign for security
- Performs vulnerability scanning
- Supports multi-architecture builds (AMD64, ARM64)

## 🧪 Data Structure

Questions in `fizika.json` follow this format:

```json
{
  "id": 1,
  "source": "2016/m1/1", 
  "description": "Question text...",
  "a": "Option A",
  "b": "Option B",
  "c": "Option C", 
  "d": "Option D",
  "correct": 2,
  "type": "md",
  "image": "optional-image.jpg"
}
```

### Question Types
- `md` - Dinamika (Dynamics)
- `me` - Mechanika (Mechanics)
- `mf` - Folyadékok (Fluids)

## 🛡️ Security Features

- Input validation and sanitization
- CORS protection with configurable origins
- Secure file upload with type/size restrictions
- Security headers via Helmet.js
- Container security with non-root user

## 🎯 Usage Scenarios

1. **Student Practice**: Access main site, select categories, take quizzes
2. **Content Management**: Login to admin panel, add/edit questions and images  
3. **Deployment**: Use Docker Compose for easy production deployment
4. **Development**: Use dev profile for hot-reload development

## 📚 Documentation

- **Backend API**: See `backend/README.md` for detailed API documentation
- **Frontend**: Static HTML/JS application with jQuery
- **Docker**: Multi-stage builds with security best practices
- **CI/CD**: Automated builds and deployments via GitHub Actions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Educational use for Hungarian physics students.

---

**Open Admin Access**
- No authentication required
- Direct access to admin panel
- ⚠️ **Secure admin access with reverse proxy in production!**
