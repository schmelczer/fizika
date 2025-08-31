# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Running the Application
```bash
npm run dev    # Development mode with nodemon hot reload
npm start      # Production mode
```

### Docker Commands
```bash
# Production deployment
docker-compose up -d

# Development with hot reload
docker-compose --profile dev up fizika-admin-dev

# Build image manually
docker build -t fizika-admin ./backend
```

### Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Architecture Overview

This is a single-file Node.js/Express backend (`server.js`) that serves as both:
1. **API Server**: Provides REST endpoints for question and image management
2. **Static File Server**: Serves the admin interface from `/public/` directory

### Key Components

**Data Storage**: 
- Questions stored in JSON file at `../frontend/fizika.json` (configurable via `DATA_PATH`)
- Images stored in `../frontend/pics/` directory (configurable via `PICS_PATH`)

**Admin Interface**:
- Built-in web UI served from `/public/index.html`
- JavaScript client in `/public/admin.js`
- No authentication required (simplified for admin use)

**API Structure**:
- Public endpoints: `/api/fizika`, `/api/images`, `/api/pics/:filename`
- Admin endpoints: `/api/admin/questions`, `/api/admin/images`
- No JWT authentication implemented despite README documentation

### Question Data Format
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

### Complete Question Types (17 Categories)

**IMPORTANT**: The README only mentions 3 types, but the frontend supports all 17:

**Mechanics (Mechanika)**:
- `mec` - Mechanika (general mechanics)
- `mk` - Kinematika (kinematics)
- `md` - Dinamika (dynamics)
- `me` - Munka és energia (work and energy)
- `mf` - Folyadékok és gázok mechanikája (fluid mechanics)
- `mr` - Rezgések és hullámok (oscillations and waves)

**Thermodynamics**:
- `h` - Hőtan (thermodynamics)

**Electricity**:
- `ele` - Elektromosság (general electricity)
- `es` - Elektrosztatika (electrostatics)
- `ee` - Egyenáram (direct current)
- `ev` - Váltakozó áram (alternating current)

**Other Physics**:
- `m` - Mágnesesség (magnetism)
- `o` - Fénytan (optics)
- `atm` - Atomfizika (general atomic physics)
- `ah` - Atomhéj (electron shells)
- `am` - Atommag (atomic nucleus)
- `cs` - Égi mechanika, csillagászat (celestial mechanics, astronomy)
- `v` - Vegyes (mixed/various)

### Security Considerations
- Helmet.js for security headers
- CORS configuration via `FRONTEND_URL` environment variable
- File upload restricted to images only (5MB limit)
- Input validation minimal - add validation when modifying endpoints

## File Structure
```
backend/
├── server.js           # Main application file
├── public/
│   ├── index.html     # Admin interface HTML
│   └── admin.js       # Admin interface JavaScript
├── package.json
├── Dockerfile
├── docker-compose.yml
└── .env.example
```

## Important Notes

- **Single File Architecture**: All server logic is in `server.js` - no separate route files or modules
- **File-based Data**: Uses JSON file for persistence, not a database
- **No Authentication**: Despite README documentation mentioning JWT, no auth is implemented
- **Path Dependencies**: Assumes frontend directory structure (`../frontend/fizika.json`, `../frontend/pics/`)
- **Admin UI Included**: Built-in web interface accessible at root path `/`
- **Question Types**: Support all 17 physics categories listed above, not just the 3 in README

## Making Changes

When modifying the API:
1. All changes go in `server.js`
2. Test both API endpoints and admin UI functionality
3. Ensure question type validation supports all 17 categories if adding validation
4. Consider impact on file paths and data format
5. Update environment variables in `.env.example` if needed