# Fizika Admin Backend

A secure Node.js/Express backend for managing physics quiz questions and images for the Fizika website.

## Features

- 🔒 **JWT-based Authentication** - Secure admin access with token-based auth
- 📝 **Question Management** - Full CRUD operations for quiz questions
- 🖼️ **Image Management** - Upload, view, and delete image files
- 🛡️ **Security First** - Rate limiting, input validation, CORS protection
- 📊 **Public API** - Serves data to the frontend application
- 🐳 **Docker Ready** - Containerized with multi-stage build
- 🚀 **Production Ready** - Health checks, proper error handling, logging

## API Endpoints

### Public Endpoints
- `GET /api/fizika` - Get all questions (for frontend)
- `GET /api/images` - List all available images
- `GET /api/pics/:filename` - Serve image files

### Authentication
- `POST /api/auth/login` - Admin login (returns JWT token)

### Admin Endpoints (Require Authentication)
- `GET /api/admin/questions` - Get all questions
- `POST /api/admin/questions` - Create new question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `POST /api/admin/images/upload` - Upload image
- `DELETE /api/admin/images/:filename` - Delete image

## Quick Start

### Using Docker (Recommended)

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd fizika
   ```

2. **Set up environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Run with Docker Compose:**
   ```bash
   # Production mode
   docker-compose up -d

   # Development mode with hot reload
   docker-compose --profile dev up fizika-admin-dev
   ```

4. **Access the admin interface:**
   - Open http://localhost:3001/admin.html
   - Default password: `admin123` (change this!)

### Local Development

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

3. **Run the server:**
   ```bash
   npm run dev  # Development with nodemon
   npm start    # Production mode
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | *Required in production* |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of admin password | `admin123` |
| `FRONTEND_URL` | CORS origin for frontend | `http://localhost:8080` |

### Generating Password Hash

```bash
node -e "console.log(require('bcrypt').hashSync('your-password', 10))"
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes, 5 auth attempts per 15 minutes
- **Input Validation**: All inputs validated and sanitized
- **File Upload Security**: Image-only uploads with size limits (5MB)
- **JWT Authentication**: Secure token-based admin authentication
- **CORS Protection**: Configurable cross-origin request handling
- **Helmet.js**: Security headers and protection middleware

## Data Structure

### Question Object
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
  "image": "image.jpg"
}
```

### Question Types
- `md` - Dinamika (Dynamics)
- `me` - Mechanika (Mechanics) 
- `mf` - Folyadékok (Fluids)

## Docker Deployment

### Building the Image
```bash
docker build -t fizika-admin ./backend
```

### Running with Docker
```bash
docker run -d \
  -p 3001:3001 \
  -e JWT_SECRET=your-secret-key \
  -e ADMIN_PASSWORD_HASH='$2b$10$...' \
  -v $(pwd)/fizika.json:/usr/src/app/fizika.json:ro \
  -v $(pwd)/pics:/usr/src/app/pics \
  fizika-admin
```

### Docker Compose Production
```bash
# Set environment variables
export JWT_SECRET="your-super-secret-jwt-key"
export ADMIN_PASSWORD_HASH="$2b$10$your-bcrypt-hash"
export FRONTEND_URL="https://your-domain.com"

# Run
docker-compose up -d
```

## GitHub Actions

The project includes a GitHub Actions workflow that:
- Builds multi-architecture Docker images (AMD64, ARM64)
- Pushes to GitHub Container Registry
- Signs images with Cosign
- Performs security scanning with Trivy
- Runs on pushes to main branch and releases

## Admin Interface

Access the admin interface at `/admin.html`:
- **Questions Tab**: Add, edit, delete quiz questions
- **Images Tab**: Upload and manage image files
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Changes reflect immediately

## API Client Example

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ password: 'your-password' })
});
const { token } = await response.json();

// Create question
await fetch('/api/admin/questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    source: '2024/test/1',
    description: 'What is physics?',
    a: 'Science',
    b: 'Art', 
    c: 'Math',
    d: 'Biology',
    correct: 1,
    type: 'md'
  })
});
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `FRONTEND_URL` environment variable
2. **Authentication Fails**: Verify `JWT_SECRET` and `ADMIN_PASSWORD_HASH`
3. **File Upload Errors**: Check write permissions on pics directory
4. **Health Check Fails**: Ensure fizika.json exists and is readable

### Logs
```bash
# Docker logs
docker logs fizika-admin

# Docker Compose logs
docker-compose logs fizika-admin
```

## License

This project is part of the Fizika educational platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

For issues or questions, please open a GitHub issue.