# Metron Integration - Backend Implementation Tasks

Extracted from [`metron-integration-plan.md`](metron-integration-plan.md).

---

## Phase 1: threetwo-metadata-service

### 1.1 Update Metron Service Configuration

**File:** `/services/metron.service.ts`

- [ ] Move hardcoded credentials to environment variables
- [ ] Add proper error handling
- [ ] Implement rate limiting for Metron API

```bash
# Environment variables needed:
METRON_USERNAME=your_username
METRON_PASSWORD=your_password
```

---

### 1.2 Implement volumeBasedSearch Action

**File:** `/services/metron.service.ts`

Main search endpoint mirroring ComicVine's volumeBasedSearch:

- [ ] Accept same payload structure as ComicVine
- [ ] Search series by name
- [ ] Rank series matches
- [ ] Search issues within matched series
- [ ] Score and return matches

---

### 1.3 Implement Supporting Actions

**File:** `/services/metron.service.ts`

| Action | Purpose | Status |
|--------|---------|--------|
| `searchSeries` | Search Metron series endpoint | [ ] |
| `getSeriesById` | Get series details | [ ] |
| `searchIssues` | Search issues with filters | [ ] |
| `getIssueById` | Get issue details | [ ] |
| `getMetronMatchScores` | Score matches using adapted algorithm | [ ] |

---

### 1.4 Create Metron-Specific Scoring Utilities

**File:** `/utils/metron-scorer.utils.ts` [NEW]

- [ ] Adapt `rankVolumes` for Metron series structure
- [ ] Adapt `matchScorer` for Metron issue structure
- [ ] Handle Metron-specific field mappings:
  - `series.year_began` → CV `start_year`
  - `issue.number` format differences
  - `issue.cover_date` format

---

### 1.5 Add Socket Events for Progress

**File:** `/services/metron.service.ts`

Broadcast `METRON_SCRAPING_STATUS` with stages:

- [ ] `fetching_series`
- [ ] `ranking_series`
- [ ] `searching_issues`
- [ ] `fetching_details`
- [ ] `scoring_matches`
- [ ] `complete`
- [ ] `error`

---

## Phase 2: Library Service Updates

### 2.1 Add applyMetronMetadata Action

**Location:** Library service in threetwo-core-service or threetwo-metadata-service

```typescript
// POST /api/library/applyMetronMetadata
{
  match: MetronIssueMatch,
  comicObjectId: string
}
```

Update MongoDB document with:

```typescript
sourcedMetadata: {
  metron: {
    issue: { ... },
    seriesInformation: { ... },
    lastUpdated: Date
  }
}
```

---

## Metron API Endpoints to Consume

Based on https://metron.cloud/wiki/api/api-documentation/

| Endpoint | Purpose | Parameters |
|----------|---------|------------|
| `GET /series/` | Search for series | `name`, `page` |
| `GET /series/{id}/` | Get series detail | - |
| `GET /issue/` | Search for issues | `series_id`, `number`, `cover_year` |
| `GET /issue/{id}/` | Get issue detail | - |
| `GET /publisher/` | Get publisher info | - |

---

## Data Structure Mapping

### Metron to ComicVine Field Mapping

| Metron Field | ComicVine Equivalent | Notes |
|--------------|---------------------|-------|
| `series.name` | `volume.name` | Direct |
| `series.year_began` | `volume.start_year` | Parse year |
| `series.issue_count` | `volume.count_of_issues` | Direct |
| `series.publisher.name` | `volume.publisher.name` | Nested |
| `issue.number` | `issue.issue_number` | May need parsing |
| `issue.cover_date` | `issue.cover_date` | Format may differ |
| `issue.image` | `issue.image.thumb_url` | Structure differs |

---

## Metron Response Structures

```typescript
interface MetronSeries {
  id: number;
  name: string;
  sort_name: string;
  volume: number;
  year_began: number;
  year_end: number | null;
  issue_count: number;
  publisher: {
    id: number;
    name: string;
  };
  image: string;
  resource_url: string;
}

interface MetronIssue {
  id: number;
  number: string;
  cover_date: string;
  store_date: string | null;
  image: string;
  cover_hash: string;
  series: {
    id: number;
    name: string;
  };
  resource_url: string;
}
```

---

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Metron API rate limiting | Implement request throttling, cache results |
| Different data structure than CV | Create adapter layer in scoring utils |
| Credentials security | Use environment variables, never commit |
| API unavailability | Add timeout handling, user-friendly errors |
| Image URL differences | Normalize image URLs in adapter |
