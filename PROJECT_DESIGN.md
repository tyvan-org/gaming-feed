# Gaming News Feed — Project Design

## 1. Product Goal

Build a web interface for browsing gaming news articles that have already been collected and stored in PostgreSQL.

The application should focus on one clear job: list gaming news articles in a clean, fast, readable feed. Each feed item should show the article title, original link, cover image, source, summary, author, and publication time when available. When the user clicks an item, the original article should open in a new browser tab.

## 2. Core User Experience

The main page should behave like a modern gaming news feed.

Users should be able to:

- See the latest gaming news articles.
- Identify the source of each article, such as IGN or PC Gamer.
- Read the title and a short summary before opening the article.
- See a cover image for each article.
- Click an article card to open the original article in a new tab.
- Filter articles by source.
- Search articles by title or summary.
- Navigate through older articles using pagination.

The interface should be responsive and work well on desktop, tablet, and mobile.

## 3. Recommended Tech Stack

The recommended stack is:

```txt
Framework: Next.js
Language: TypeScript
Styling: Tailwind CSS
Database: PostgreSQL
ORM: Prisma
Validation: Zod
Date formatting: date-fns
Icons: lucide-react
Deployment: Vercel, Render, Railway, or Fly.io
```

### Why This Stack

Next.js is a good fit because the project needs both a user-facing web interface and backend data access. The application can render the feed server-side, query PostgreSQL directly, and later expose API routes if infinite scrolling or external clients are needed.

TypeScript helps keep the article data model safe and explicit. Tailwind CSS makes it fast to build a polished responsive UI. Prisma provides a clean database layer and makes migrations easier to manage.

## 4. Database Schema

The current data model includes:

- `source_id`: Feed identifier, such as `ign` or `pcgamer`.
- `external_id`: RSS GUID, Atom ID, or article URL fallback.
- `title`: Article title.
- `url`: Article link.
- `summary`: Feed-provided description or content.
- `author`: Feed-provided author.
- `published_at`: Original publication time, when available.
- `fetched_at`: Time the consumer fetched and saved the article.

Because the UI requires a cover image, the database should include an additional optional field:

- `image_url`: Cover image URL for the article.

### Recommended `articles` Table

```sql
CREATE TABLE articles (
  id BIGSERIAL PRIMARY KEY,

  source_id TEXT NOT NULL,
  external_id TEXT NOT NULL,

  title TEXT NOT NULL,
  url TEXT NOT NULL,
  summary TEXT,
  author TEXT,

  image_url TEXT,

  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (source_id, external_id)
);
```

### Recommended Indexes

```sql
CREATE INDEX idx_articles_published_at
ON articles (published_at DESC NULLS LAST);

CREATE INDEX idx_articles_fetched_at
ON articles (fetched_at DESC);

CREATE INDEX idx_articles_source_id
ON articles (source_id);

CREATE INDEX idx_articles_full_text_search
ON articles USING gin (
  to_tsvector('english', title || ' ' || coalesce(summary, ''))
);
```

The default feed ordering should be:

```sql
ORDER BY published_at DESC NULLS LAST, fetched_at DESC
```

This keeps originally newer articles first, while still handling articles that do not have a reliable `published_at` value.

## 5. Optional Sources Table

The MVP can work using only `source_id` from the articles table. However, if the interface should show nicer source names, logos, or source metadata, add a `sources` table.

```sql
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  homepage_url TEXT,
  logo_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true
);
```

Example records:

```txt
id: ign
name: IGN

id: pcgamer
name: PC Gamer
```

## 6. Prisma Schema

Recommended Prisma model:

```prisma
model Article {
  id          BigInt   @id @default(autoincrement())
  sourceId    String   @map("source_id")
  externalId  String   @map("external_id")

  title       String
  url         String
  summary     String?
  author      String?
  imageUrl    String?  @map("image_url")

  publishedAt DateTime? @map("published_at")
  fetchedAt   DateTime  @default(now()) @map("fetched_at")

  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@unique([sourceId, externalId])
  @@index([sourceId])
  @@index([publishedAt])
  @@index([fetchedAt])
  @@map("articles")
}
```

## 7. Proposed Project Structure

```txt
gaming-feed/
  app/
    page.tsx
    layout.tsx
    globals.css

    api/
      articles/
        route.ts
      sources/
        route.ts

  components/
    ArticleCard.tsx
    ArticleList.tsx
    FeedFilters.tsx
    SearchInput.tsx
    EmptyState.tsx
    LoadingSkeleton.tsx

  lib/
    db.ts
    articles.ts
    formatDate.ts
    sources.ts

  prisma/
    schema.prisma

  public/
    placeholder-cover.svg

  .env
  .env.example
  package.json
  tailwind.config.ts
  next.config.ts
  tsconfig.json
```

## 8. Data Loading Strategy

The first version should use server-side rendering through the Next.js App Router.

Recommended flow:

```txt
User opens /
  -> Next.js page reads searchParams
  -> Server queries PostgreSQL using Prisma
  -> Server renders the article feed
  -> Browser receives HTML with article data already loaded
```

This approach keeps the MVP simple, fast, and SEO-friendly.

API routes can still be added for future features such as infinite scroll, client-side refresh, or external clients.

## 9. API Design

### `GET /api/articles`

Returns paginated articles.

Supported query parameters:

```txt
page=1
limit=20
source=ign
q=zelda
sort=latest
```

Example response:

```json
{
  "items": [
    {
      "id": "123",
      "sourceId": "ign",
      "externalId": "https://example.com/article",
      "title": "New RPG Announced",
      "url": "https://original-site.com/article",
      "summary": "Short article summary...",
      "author": "Jane Doe",
      "imageUrl": "https://example.com/cover.jpg",
      "publishedAt": "2026-07-22T10:30:00.000Z",
      "fetchedAt": "2026-07-22T10:40:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 235,
    "totalPages": 12
  }
}
```

### `GET /api/sources`

Returns available sources.

Example response:

```json
{
  "items": [
    {
      "id": "ign",
      "label": "IGN",
      "count": 120
    },
    {
      "id": "pcgamer",
      "label": "PC Gamer",
      "count": 80
    }
  ]
}
```

## 10. Page Design

The MVP should use a simple flat list layout instead of a multi-column magazine grid. This makes the product easier to scan, easier to implement, and easier to extend later when YouTube gaming videos are added to the feed.

### Main Layout

```txt
Header
  - App name: Gaming Feed
  - Search input
  - Source filter

Main
  - Page title, for example: Top New Articles
  - Flat vertical article list
  - Pagination controls

Footer
  - Simple project footer
  - Optional latest fetched timestamp
```

### Flat List Direction

The article feed should look like a clean list of bordered cards. Each card is a horizontal row on larger screens, with text on the left and an optional cover image on the right.

Recommended card structure:

```txt
Article row
  Left content
    - Source/category badge
    - Title
    - Optional summary
    - Metadata row: author/source, published date, read time or content type

  Right media
    - Cover image, 16:9 or wide thumbnail
```

The first item can be slightly larger than the rest if desired, similar to a lead story:

```txt
First item
  - Taller row
  - Larger title
  - Larger right-side image

Other items
  - More compact row
  - Smaller image
```

This should be treated as an optional visual enhancement. The core rule is still one vertical flat list, not a masonry/grid layout.

### Desktop Layout

- Use a single-column centered content container.
- Recommended max width: `1120px` to `1200px`.
- Each article card should be a horizontal row.
- Text area should take roughly `55%` to `65%` of the row.
- Image area should take roughly `35%` to `45%` of the row.
- The first item may use a taller image and larger title.
- Search and filters should stay visible near the top.

### Tablet Layout

- Keep the single-column list.
- Reduce image width to around `32%` to `38%`.
- Reduce card padding.
- Clamp long titles to 2 lines.
- Filters can wrap into multiple rows.

### Mobile Layout

- Single-column list.
- Search input should be full-width.
- Source filters can become horizontal chips or a dropdown.
- Cards should stack vertically or use a compact row layout depending on available width.
- Recommended default mobile layout:
  - Image on top.
  - Badge, title, and metadata below.
  - Summary hidden or clamped to 2 lines.
- For very small screens, hide summary by default to keep the feed fast to scan.
- Card tap target should include the full card.

### Responsive Breakpoints

Suggested Tailwind breakpoints:

```txt
< 640px
  - Stacked card
  - Full-width image above text
  - Compact metadata

640px–1023px
  - Horizontal row card
  - Smaller right image
  - Medium title size

>= 1024px
  - Horizontal row card
  - Spacious padding
  - Larger title
  - Optional larger first item
```

## 11. Article Card Design

Each article card should include:

- Cover image.
- Source badge.
- Article title.
- Optional short summary.
- Author, if available.
- Publication date, falling back to fetched date.
- External link behavior.

The preferred visual style is a flat bordered list item:

```txt
┌──────────────────────────────────────────────────────────────┐
│ [Source badge]                                 [Cover image] │
│                                                              │
│ Article title                                                │
│ Optional summary                                             │
│                                                              │
│ Author/source | Date | Content metadata                      │
└──────────────────────────────────────────────────────────────┘
```

The entire card can be clickable:

```tsx
<a href={article.url} target="_blank" rel="noopener noreferrer">
  ...
</a>
```

The `target="_blank"` behavior opens the original article in a new tab. The `rel="noopener noreferrer"` attribute should always be included for security.

If `imageUrl` is missing, the card should display a local placeholder image.

### Card Sizing Rules

Desktop:

- Card padding: `20px` to `24px`.
- Border radius: `10px` to `14px`.
- Image width: `320px` to `520px`, depending on container width.
- Image aspect ratio: wide landscape, ideally `16:9`.
- Title size: `24px` to `36px` for the first item, `20px` to `24px` for normal items.

Mobile:

- Card padding: `14px` to `16px`.
- Image width: `100%`.
- Image should appear above the text.
- Title size: `18px` to `22px`.
- Metadata should wrap cleanly.

### Metadata Rules

The metadata row should be predictable and compact:

```txt
Source or author | Published date | Content type/read time
```

Examples:

```txt
IGN | Jul 22, 2026 | Article
PC Gamer | 2h ago | Article
YouTube Channel | 12 min ago | Video · 14:32
```

For the current article-only MVP, read time is optional. If it is not calculated, show the content type instead:

```txt
IGN | Jul 22, 2026 | Article
```

### Future YouTube Video Cards

The flat list should also support future YouTube gaming feed items without a major redesign.

Video items should reuse the same card layout:

```txt
Video row
  Left content
    - Video badge or channel badge
    - Video title
    - Optional description
    - Metadata: channel, published date, Video

  Right media
    - YouTube thumbnail
    - Duration overlay in the bottom-right corner
```

Additional video-only UI fields:

```ts
type VideoFields = {
  channelTitle?: string | null;
  durationSeconds?: number | null;
  viewCount?: number | null;
};
```

The UI should use a generic `FeedItemCard` concept internally, even if the first implementation only renders articles.

## 12. UI Style Direction

The visual style should feel like a gaming news product without becoming too noisy.

Recommended palette:

```txt
Background: #0B0F17
Surface: #121826
Border: #243044
Primary: #7C3AED
Accent: #22D3EE
Text: #F8FAFC
Muted: #94A3B8
```

Design principles:

- Prioritize readability.
- Prefer a clean, flat list UI.
- Use dark surfaces with clear contrast if using a dark theme.
- A light theme is also acceptable for the MVP if the list feels cleaner.
- Use accent colors sparingly.
- Keep cards simple and not overcrowded.
- Make the source badge easy to scan.
- Make article titles the strongest visual element after the image.
- Use subtle borders instead of heavy shadows.
- Keep vertical spacing consistent between list items.

### Flat List Visual Rules

- Use one article per row.
- Do not use a three-column grid for the MVP.
- Use soft borders and rounded corners.
- Keep the background calm and neutral.
- Use hover state on desktop:
  - Slight border color change.
  - Slight background change.
  - Optional image scale of `1.02`, but keep it subtle.
- Avoid aggressive neon effects, heavy gradients, and complex card decorations.

## 13. Search and Filter Behavior

Search should support article title and summary.

Initial implementation can use Prisma `contains` filters:

```ts
const articles = await prisma.article.findMany({
  where: {
    sourceId: source ? source : undefined,
    OR: q
      ? [
          { title: { contains: q, mode: "insensitive" } },
          { summary: { contains: q, mode: "insensitive" } },
        ]
      : undefined,
  },
  orderBy: [
    { publishedAt: "desc" },
    { fetchedAt: "desc" },
  ],
  skip: (page - 1) * limit,
  take: limit,
});
```

For larger datasets, replace this with PostgreSQL full-text search.

Filters should be reflected in the URL:

```txt
/?source=ign
/?q=elden
/?source=ign&q=elden&page=2
```

This makes filtered views shareable and browser-navigation friendly.

## 14. Loading, Empty, and Error States

### Loading State

Use skeleton article cards while data is loading.

### Empty State

Show a friendly message when there are no matching articles:

```txt
No articles found.
Try changing your search or source filter.
```

### Error State

Show a generic user-facing error:

```txt
Could not load articles.
Please try again later.
```

Detailed database or server errors should be logged server-side and not exposed to the user.

## 15. Environment Variables

Required `.env` value:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/gaming_feed"
```

Also provide `.env.example`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gaming_feed"
```

The real `.env` file should not be committed.

## 16. MVP Scope

The MVP should include:

- Next.js project setup.
- TypeScript configuration.
- Tailwind CSS styling.
- Prisma PostgreSQL connection.
- Article model.
- Main feed page.
- Flat article list.
- Article row cards with image, title, source, optional summary, author, and date.
- External article links opening in a new tab.
- Source filter.
- Search.
- Pagination.
- Placeholder image fallback.
- Responsive layout.

The MVP should not include yet:

- User accounts.
- Bookmarks.
- Likes.
- Comments.
- Admin dashboard.
- Recommendation engine.
- AI summaries.
- Push notifications.
- Infinite scroll.

## 17. Implementation Roadmap

### Phase 1 — Project Setup

- Initialize a Next.js app.
- Add TypeScript.
- Add Tailwind CSS.
- Add Prisma.
- Add Zod and date-fns.
- Configure `.env` and `.env.example`.

### Phase 2 — Database Layer

- Create `prisma/schema.prisma`.
- Define the `Article` model.
- Connect Prisma to PostgreSQL.
- Create `lib/db.ts`.
- Create article query helpers in `lib/articles.ts`.
- Create source query helpers in `lib/sources.ts`.

### Phase 3 — Feed UI

- Build the main layout.
- Build `ArticleCard`.
- Build `ArticleList`.
- Build `SearchInput`.
- Build `FeedFilters`.
- Build pagination controls.
- Implement responsive flat-list behavior for desktop, tablet, and mobile.

### Phase 4 — States and Polish

- Add loading skeletons.
- Add empty state.
- Add error handling.
- Refine responsive layouts.
- Add dark gaming visual style.
- Add basic page metadata.

### Phase 5 — Future Enhancements

- Infinite scrolling.
- Full-text search.
- Source logos.
- Featured top story.
- Latest fetched indicator.
- Feed health/admin page.
- Article bookmark support.
- AI-generated summaries.

## 18. Key Product Decisions

The most important early decision is whether the existing PostgreSQL data already contains a cover image field.

If it does not, the project should add `image_url` to the article model. A news feed without cover images will still function, but the user experience will feel significantly weaker, especially for gaming content.

The recommended initial architecture is server-rendered pagination, not infinite scroll. This keeps the first implementation simple, reliable, and easy to deploy. Infinite scroll can be added later once the core feed is working well.

The recommended initial UI is a responsive flat list, not a multi-column grid. This better matches the desired simple reference design, keeps the page easy to scan, and creates a clean path for adding YouTube gaming video items later.
