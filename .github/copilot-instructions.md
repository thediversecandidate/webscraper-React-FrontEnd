# Webscraper React Frontend - AI Agent Instructions

## Project Overview
This is a React TypeScript frontend for a webscraping application that displays articles with word cloud visualizations and timeline views. The app searches articles from an external API and presents them in two modes: word clouds and timeline.

## Architecture & Data Flow

### Core Components Structure
- **App.tsx**: Main container managing search state, pagination (`first`), and API calls
- **SearchComponent**: Handles search input and sort ordering (asc/desc by publication date)  
- **ArticlesComponent**: Container with mode toggle (timeline vs word cloud) and pagination
- **WordCloudComponent**: Displays individual articles as interactive word clouds
- **TimelineComponent**: Shows articles chronologically with infinite scroll

### State Management Pattern
Uses React Context (`GeneralContext`) for shared state between components:
```typescript
// Context carries: articles, pagination (first), timeline mode toggle
const { articles, first, setFirst, isTimelineMode, setIsTimelineMode } = useGeneralContext();
```

### API Integration
- **Base URL**: `https://api.thediversecandidate.com`
- **Authentication**: Static token in headers (see `Api.ts`)
- **Pagination**: Uses `first`/`last` parameters (not page-based)
- **Search**: Minimum 1 character to trigger API calls
- **Mobile/Desktop**: Different page sizes via `MAX_ARTICLE_PER_PAGE_*` constants

## Key Development Patterns

### PrimeReact UI Framework
All components use PrimeFlex CSS classes for layout:
- `p-grid`, `p-col-*` for responsive grid
- `p-field`, `p-float-label` for form controls
- `p-ml-*`, `p-mt-*` for spacing utilities
- Components: `InputText`, `Button`, `Dropdown`, `Paginator`, `InputSwitch`

### TypeScript Interfaces
Global interfaces in `Model.d.ts` (no imports needed):
- `ArticleRow`: Core article data structure with wordcloud fields
- `WordCloud`: For word cloud visualization data
- Response types: `GetArticlesResponse`, `GetArticlesCountResponse`

### Mobile-First Responsive Design  
Uses `react-device-detect` for mobile/desktop differentiation:
```typescript
import { isMobile } from 'react-device-detect';
// Different pagination limits and layouts based on isMobile
```

### Word Cloud Data Processing
Articles contain pre-processed word cloud data:
- `wordcloud_words`: Space-separated words  
- `wordcloud_scores`: Space-separated numeric scores
- WordCloudComponent normalizes scores to 0-1 range for visualization

## Development Workflows

### Setup & Running
```bash
yarn install          # Install dependencies
yarn start            # Development server (localhost:3000)
yarn build            # Production build
yarn test             # Run tests
```

### Component Development
- Components are in `src/Components/[ComponentName]/` folders
- Each has its own `.tsx` and `.css` file
- Use functional components with hooks (no class components)
- Import PrimeReact components as needed

### API Development  
- All API calls go through `Services/Api.ts`
- Returns full AxiosResponse objects (access data via `.data`)
- Error handling with try/catch and console logging
- Search requires count + articles calls for pagination

### Context Usage
- Import: `import { useGeneralContext } from '../../Context/Context'`
- Provides: articles array, pagination state, timeline mode toggle
- Use for component communication instead of prop drilling

## Critical Implementation Details

### Pagination Logic
- Uses `first` index (not page numbers) for API calls
- Timeline mode: Appends to existing articles for infinite scroll
- Word cloud mode: Replaces articles for standard pagination
- Reset `first` to 0 when changing search terms

### Search Behavior
- Triggers on Enter key or Search button click
- Clears timeline mode when new search initiated
- Simultaneous calls: articles + count for proper pagination setup
- Minimum 1 character validation before API calls

### Timeline Infinite Scroll
Uses `react-chrono` with scroll-end detection:
- Loads more articles by updating `first` state
- Maintains accumulated articles across loads
- Custom height calculation: `size.height - 140`

### Constants Management
Mobile/desktop differences handled via constants in `Models/Constants.ts`:
- `MAX_ARTICLE_PER_PAGE_MOBILE = 5`  
- `MAX_ARTICLE_PER_PAGE_DESKTOP = 20`
- `MAX_BODY_TEXT_CHARS = 300` for article truncation