import { useQuery, useInfiniteQuery, useMutation, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData, UseMutationOptions } from '@tanstack/react-query';
import { fetcher } from './fetcher';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  JSON: { input: any; output: any; }
  PredicateInput: { input: any; output: any; }
};

export type AcquisitionInput = {
  directconnect?: InputMaybe<DirectConnectInput>;
  source?: InputMaybe<AcquisitionSourceInput>;
};

export type AcquisitionSourceInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  wanted?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AddTorrentInput = {
  comicObjectId: Scalars['ID']['input'];
  torrentToDownload: Scalars['String']['input'];
};

export type AddTorrentResult = {
  __typename?: 'AddTorrentResult';
  result?: Maybe<Scalars['JSON']['output']>;
};

export type AppSettings = {
  __typename?: 'AppSettings';
  bittorrent?: Maybe<BittorrentSettings>;
  directConnect?: Maybe<DirectConnectSettings>;
  prowlarr?: Maybe<ProwlarrSettings>;
};

export type Archive = {
  __typename?: 'Archive';
  expandedPath?: Maybe<Scalars['String']['output']>;
  uncompressed?: Maybe<Scalars['Boolean']['output']>;
};

export type ArchiveInput = {
  expandedPath?: InputMaybe<Scalars['String']['input']>;
  uncompressed?: InputMaybe<Scalars['Boolean']['input']>;
};

export type AutoMergeSettings = {
  __typename?: 'AutoMergeSettings';
  enabled: Scalars['Boolean']['output'];
  onImport: Scalars['Boolean']['output'];
  onMetadataUpdate: Scalars['Boolean']['output'];
};

export type AutoMergeSettingsInput = {
  enabled?: InputMaybe<Scalars['Boolean']['input']>;
  onImport?: InputMaybe<Scalars['Boolean']['input']>;
  onMetadataUpdate?: InputMaybe<Scalars['Boolean']['input']>;
};

export type BittorrentClient = {
  __typename?: 'BittorrentClient';
  host?: Maybe<HostConfig>;
  name?: Maybe<Scalars['String']['output']>;
};

export type BittorrentSettings = {
  __typename?: 'BittorrentSettings';
  client?: Maybe<BittorrentClient>;
};

export type Bundle = {
  __typename?: 'Bundle';
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  size?: Maybe<Scalars['String']['output']>;
  speed?: Maybe<Scalars['String']['output']>;
  status?: Maybe<Scalars['String']['output']>;
};

export type CanonicalMetadata = {
  __typename?: 'CanonicalMetadata';
  ageRating?: Maybe<MetadataField>;
  characters?: Maybe<Array<MetadataField>>;
  communityRating?: Maybe<MetadataField>;
  coverDate?: Maybe<MetadataField>;
  coverImage?: Maybe<MetadataField>;
  creators?: Maybe<Array<Creator>>;
  description?: Maybe<MetadataField>;
  format?: Maybe<MetadataField>;
  genres?: Maybe<Array<MetadataField>>;
  issueNumber?: Maybe<MetadataField>;
  locations?: Maybe<Array<MetadataField>>;
  pageCount?: Maybe<MetadataField>;
  publicationDate?: Maybe<MetadataField>;
  publisher?: Maybe<MetadataField>;
  series?: Maybe<MetadataField>;
  storyArcs?: Maybe<Array<MetadataField>>;
  tags?: Maybe<Array<MetadataField>>;
  teams?: Maybe<Array<MetadataField>>;
  title?: Maybe<MetadataField>;
  volume?: Maybe<MetadataField>;
};

export type CharacterCredit = {
  __typename?: 'CharacterCredit';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
};

export type Comic = {
  __typename?: 'Comic';
  canonicalMetadata?: Maybe<CanonicalMetadata>;
  createdAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  importStatus?: Maybe<ImportStatus>;
  inferredMetadata?: Maybe<InferredMetadata>;
  rawFileDetails?: Maybe<RawFileDetails>;
  sourcedMetadata?: Maybe<SourcedMetadata>;
  updatedAt?: Maybe<Scalars['String']['output']>;
};

export type ComicBookGroup = {
  __typename?: 'ComicBookGroup';
  id: Scalars['ID']['output'];
  volumes?: Maybe<VolumeInfo>;
};

export type ComicBooksResult = {
  __typename?: 'ComicBooksResult';
  docs: Array<Comic>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPrevPage: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  nextPage?: Maybe<Scalars['Int']['output']>;
  page?: Maybe<Scalars['Int']['output']>;
  pagingCounter: Scalars['Int']['output'];
  prevPage?: Maybe<Scalars['Int']['output']>;
  totalDocs: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type ComicConnection = {
  __typename?: 'ComicConnection';
  comics: Array<Comic>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type ComicVineMatchInput = {
  volume: ComicVineVolumeRefInput;
  volumeInformation?: InputMaybe<Scalars['JSON']['input']>;
};

export type ComicVineResourceResponse = {
  __typename?: 'ComicVineResourceResponse';
  error: Scalars['String']['output'];
  limit: Scalars['Int']['output'];
  number_of_page_results: Scalars['Int']['output'];
  number_of_total_results: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  results: Array<SearchResultItem>;
  status_code: Scalars['Int']['output'];
};

export type ComicVineSearchResult = {
  __typename?: 'ComicVineSearchResult';
  error: Scalars['String']['output'];
  limit: Scalars['Int']['output'];
  number_of_page_results: Scalars['Int']['output'];
  number_of_total_results: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  results: Array<SearchResultItem>;
  status_code: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type ComicVineVolume = {
  __typename?: 'ComicVineVolume';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  count_of_issues?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<VolumeImage>;
  name?: Maybe<Scalars['String']['output']>;
  publisher?: Maybe<Publisher>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
  start_year?: Maybe<Scalars['String']['output']>;
};

export type ComicVineVolumeRefInput = {
  api_detail_url: Scalars['String']['input'];
};

export enum ConflictResolutionStrategy {
  Confidence = 'CONFIDENCE',
  Hybrid = 'HYBRID',
  Manual = 'MANUAL',
  Priority = 'PRIORITY',
  Recency = 'RECENCY'
}

export type Cover = {
  __typename?: 'Cover';
  filePath?: Maybe<Scalars['String']['output']>;
  stats?: Maybe<Scalars['String']['output']>;
};

export type CoverInput = {
  filePath?: InputMaybe<Scalars['String']['input']>;
  stats?: InputMaybe<Scalars['String']['input']>;
};

export type Creator = {
  __typename?: 'Creator';
  name: Scalars['String']['output'];
  provenance: Provenance;
  role: Scalars['String']['output'];
};

export type DirectConnectBundleInput = {
  bundleId?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['String']['input']>;
};

export type DirectConnectClient = {
  __typename?: 'DirectConnectClient';
  airDCPPUserSettings?: Maybe<Scalars['JSON']['output']>;
  host?: Maybe<HostConfig>;
  hubs?: Maybe<Array<Maybe<Scalars['JSON']['output']>>>;
};

export type DirectConnectInput = {
  downloads?: InputMaybe<Array<DirectConnectBundleInput>>;
};

export type DirectConnectSettings = {
  __typename?: 'DirectConnectSettings';
  client?: Maybe<DirectConnectClient>;
};

export type DirectorySize = {
  __typename?: 'DirectorySize';
  fileCount: Scalars['Int']['output'];
  totalSize: Scalars['Float']['output'];
  totalSizeInGB: Scalars['Float']['output'];
  totalSizeInMB: Scalars['Float']['output'];
};

export type FieldOverride = {
  __typename?: 'FieldOverride';
  field: Scalars['String']['output'];
  priority: Scalars['Int']['output'];
};

export type FieldOverrideInput = {
  field: Scalars['String']['input'];
  priority: Scalars['Int']['input'];
};

export type FieldPreference = {
  __typename?: 'FieldPreference';
  field: Scalars['String']['output'];
  preferredSource: MetadataSource;
};

export type FieldPreferenceInput = {
  field: Scalars['String']['input'];
  preferredSource: MetadataSource;
};

export type FileTypeStats = {
  __typename?: 'FileTypeStats';
  data: Array<Scalars['ID']['output']>;
  id: Scalars['String']['output'];
};

export type ForceCompleteResult = {
  __typename?: 'ForceCompleteResult';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type GetResourceInput = {
  fieldList?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<Scalars['String']['input']>;
  resources: Scalars['String']['input'];
};

export type GetVolumesInput = {
  fieldList?: InputMaybe<Scalars['String']['input']>;
  volumeURI: Scalars['String']['input'];
};

export type HostConfig = {
  __typename?: 'HostConfig';
  hostname?: Maybe<Scalars['String']['output']>;
  password?: Maybe<Scalars['String']['output']>;
  port?: Maybe<Scalars['String']['output']>;
  protocol?: Maybe<Scalars['String']['output']>;
  username?: Maybe<Scalars['String']['output']>;
};

export type HostInput = {
  hostname: Scalars['String']['input'];
  password: Scalars['String']['input'];
  port: Scalars['String']['input'];
  protocol: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type Hub = {
  __typename?: 'Hub';
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  userCount?: Maybe<Scalars['Int']['output']>;
};

export type ImageAnalysisResult = {
  __typename?: 'ImageAnalysisResult';
  analyzedData?: Maybe<Scalars['JSON']['output']>;
  colorHistogramData?: Maybe<Scalars['JSON']['output']>;
};

export type ImageUrls = {
  __typename?: 'ImageUrls';
  icon_url?: Maybe<Scalars['String']['output']>;
  image_tags?: Maybe<Scalars['String']['output']>;
  medium_url?: Maybe<Scalars['String']['output']>;
  original_url?: Maybe<Scalars['String']['output']>;
  screen_large_url?: Maybe<Scalars['String']['output']>;
  screen_url?: Maybe<Scalars['String']['output']>;
  small_url?: Maybe<Scalars['String']['output']>;
  super_url?: Maybe<Scalars['String']['output']>;
  thumb_url?: Maybe<Scalars['String']['output']>;
  tiny_url?: Maybe<Scalars['String']['output']>;
};

export type ImportComicInput = {
  acquisition?: InputMaybe<AcquisitionInput>;
  filePath: Scalars['String']['input'];
  fileSize?: InputMaybe<Scalars['Int']['input']>;
  inferredMetadata?: InputMaybe<InferredMetadataInput>;
  rawFileDetails?: InputMaybe<RawFileDetailsInput>;
  sourcedMetadata?: InputMaybe<SourcedMetadataInput>;
  wanted?: InputMaybe<WantedInput>;
};

export type ImportComicResult = {
  __typename?: 'ImportComicResult';
  canonicalMetadataResolved: Scalars['Boolean']['output'];
  comic?: Maybe<Comic>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type ImportJobResult = {
  __typename?: 'ImportJobResult';
  jobsQueued: Scalars['Int']['output'];
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type ImportSession = {
  __typename?: 'ImportSession';
  completedAt?: Maybe<Scalars['String']['output']>;
  directoryPath?: Maybe<Scalars['String']['output']>;
  sessionId: Scalars['String']['output'];
  startedAt: Scalars['String']['output'];
  stats: ImportSessionStats;
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type ImportSessionStats = {
  __typename?: 'ImportSessionStats';
  filesFailed: Scalars['Int']['output'];
  filesProcessed: Scalars['Int']['output'];
  filesQueued: Scalars['Int']['output'];
  filesSucceeded: Scalars['Int']['output'];
  totalFiles: Scalars['Int']['output'];
};

export type ImportStatistics = {
  __typename?: 'ImportStatistics';
  directory: Scalars['String']['output'];
  stats: ImportStats;
  success: Scalars['Boolean']['output'];
};

export type ImportStats = {
  __typename?: 'ImportStats';
  alreadyImported: Scalars['Int']['output'];
  missingFiles: Scalars['Int']['output'];
  newFiles: Scalars['Int']['output'];
  percentageImported: Scalars['String']['output'];
  totalLocalFiles: Scalars['Int']['output'];
};

export type ImportStatus = {
  __typename?: 'ImportStatus';
  isImported?: Maybe<Scalars['Boolean']['output']>;
  isRawFileMissing?: Maybe<Scalars['Boolean']['output']>;
  matchedResult?: Maybe<MatchedResult>;
  tagged?: Maybe<Scalars['Boolean']['output']>;
};

export type IncrementalImportResult = {
  __typename?: 'IncrementalImportResult';
  message: Scalars['String']['output'];
  stats: IncrementalImportStats;
  success: Scalars['Boolean']['output'];
};

export type IncrementalImportStats = {
  __typename?: 'IncrementalImportStats';
  alreadyImported: Scalars['Int']['output'];
  newFiles: Scalars['Int']['output'];
  queued: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type InferredMetadata = {
  __typename?: 'InferredMetadata';
  issue?: Maybe<Issue>;
};

export type InferredMetadataInput = {
  issue?: InputMaybe<IssueInput>;
};

export type Issue = {
  __typename?: 'Issue';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  character_credits?: Maybe<Array<CharacterCredit>>;
  cover_date?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image?: Maybe<ImageUrls>;
  issue_number?: Maybe<Scalars['String']['output']>;
  location_credits?: Maybe<Array<LocationCredit>>;
  name?: Maybe<Scalars['String']['output']>;
  number?: Maybe<Scalars['Int']['output']>;
  person_credits?: Maybe<Array<PersonCredit>>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
  store_date?: Maybe<Scalars['String']['output']>;
  story_arc_credits?: Maybe<Array<StoryArcCredit>>;
  subtitle?: Maybe<Scalars['String']['output']>;
  team_credits?: Maybe<Array<TeamCredit>>;
  volume?: Maybe<Volume>;
  year?: Maybe<Scalars['String']['output']>;
};

export type IssueInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
};

export type IssueStats = {
  __typename?: 'IssueStats';
  data: Array<Scalars['ID']['output']>;
  id?: Maybe<VolumeInfo>;
};

export type IssuesForSeriesResponse = {
  __typename?: 'IssuesForSeriesResponse';
  error: Scalars['String']['output'];
  limit: Scalars['Int']['output'];
  number_of_page_results: Scalars['Int']['output'];
  number_of_total_results: Scalars['Int']['output'];
  offset: Scalars['Int']['output'];
  results: Array<Issue>;
  status_code: Scalars['Int']['output'];
};

export type JobResultStatistics = {
  __typename?: 'JobResultStatistics';
  completedJobs: Scalars['Int']['output'];
  earliestTimestamp: Scalars['String']['output'];
  failedJobs: Scalars['Int']['output'];
  sessionId: Scalars['String']['output'];
};

export type LocgMetadata = {
  __typename?: 'LOCGMetadata';
  cover?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  potw?: Maybe<Scalars['Int']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  publisher?: Maybe<Scalars['String']['output']>;
  pulls?: Maybe<Scalars['Int']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type LocgMetadataInput = {
  cover?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  potw?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['String']['input']>;
  publisher?: InputMaybe<Scalars['String']['input']>;
  pulls?: InputMaybe<Scalars['Int']['input']>;
  rating?: InputMaybe<Scalars['Float']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type LibraryStatistics = {
  __typename?: 'LibraryStatistics';
  comicDirectorySize: DirectorySize;
  statistics: Array<StatisticsFacet>;
  totalDocuments: Scalars['Int']['output'];
};

export type LocationCredit = {
  __typename?: 'LocationCredit';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
};

export type MatchedResult = {
  __typename?: 'MatchedResult';
  score?: Maybe<Scalars['String']['output']>;
};

export type MetadataArrayField = {
  __typename?: 'MetadataArrayField';
  provenance: Provenance;
  userOverride?: Maybe<Scalars['Boolean']['output']>;
  values: Array<Scalars['String']['output']>;
};

export type MetadataConflict = {
  __typename?: 'MetadataConflict';
  candidates: Array<MetadataField>;
  field: Scalars['String']['output'];
  resolutionReason: Scalars['String']['output'];
  resolved?: Maybe<MetadataField>;
};

export type MetadataField = {
  __typename?: 'MetadataField';
  provenance: Provenance;
  userOverride?: Maybe<Scalars['Boolean']['output']>;
  value?: Maybe<Scalars['String']['output']>;
};

export type MetadataPaginationMeta = {
  __typename?: 'MetadataPaginationMeta';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  pageSize: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export type MetadataPullListItem = {
  __typename?: 'MetadataPullListItem';
  cover?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  potw?: Maybe<Scalars['Int']['output']>;
  price?: Maybe<Scalars['String']['output']>;
  publicationDate?: Maybe<Scalars['String']['output']>;
  publisher?: Maybe<Scalars['String']['output']>;
  pulls?: Maybe<Scalars['Int']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type MetadataPullListResponse = {
  __typename?: 'MetadataPullListResponse';
  meta: MetadataPaginationMeta;
  result: Array<MetadataPullListItem>;
};

export enum MetadataSource {
  ComicinfoXml = 'COMICINFO_XML',
  Comicvine = 'COMICVINE',
  GrandComicsDatabase = 'GRAND_COMICS_DATABASE',
  Locg = 'LOCG',
  Manual = 'MANUAL',
  Metron = 'METRON'
}

export type MetronFetchInput = {
  method: Scalars['String']['input'];
  query?: InputMaybe<Scalars['String']['input']>;
  resource: Scalars['String']['input'];
};

export type MetronResponse = {
  __typename?: 'MetronResponse';
  data?: Maybe<Scalars['JSON']['output']>;
  status: Scalars['Int']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  /** Placeholder for future mutations */
  _empty?: Maybe<Scalars['String']['output']>;
  /** Add a torrent to qBittorrent */
  addTorrent?: Maybe<AddTorrentResult>;
  analyzeImage: ImageAnalysisResult;
  applyComicVineMatch: Comic;
  bulkResolveMetadata: Array<Comic>;
  forceCompleteSession: ForceCompleteResult;
  importComic: ImportComicResult;
  refreshMetadataFromSource: Comic;
  removeMetadataOverride: Comic;
  resolveMetadata: Comic;
  setMetadataField: Comic;
  startIncrementalImport: IncrementalImportResult;
  startNewImport: ImportJobResult;
  uncompressArchive?: Maybe<Scalars['Boolean']['output']>;
  updateSourcedMetadata: Comic;
  updateUserPreferences: UserPreferences;
};


export type MutationAddTorrentArgs = {
  input: AddTorrentInput;
};


export type MutationAnalyzeImageArgs = {
  imageFilePath: Scalars['String']['input'];
};


export type MutationApplyComicVineMatchArgs = {
  comicObjectId: Scalars['ID']['input'];
  match: ComicVineMatchInput;
};


export type MutationBulkResolveMetadataArgs = {
  comicIds: Array<Scalars['ID']['input']>;
};


export type MutationForceCompleteSessionArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationImportComicArgs = {
  input: ImportComicInput;
};


export type MutationRefreshMetadataFromSourceArgs = {
  comicId: Scalars['ID']['input'];
  source: MetadataSource;
};


export type MutationRemoveMetadataOverrideArgs = {
  comicId: Scalars['ID']['input'];
  field: Scalars['String']['input'];
};


export type MutationResolveMetadataArgs = {
  comicId: Scalars['ID']['input'];
};


export type MutationSetMetadataFieldArgs = {
  comicId: Scalars['ID']['input'];
  field: Scalars['String']['input'];
  value: Scalars['String']['input'];
};


export type MutationStartIncrementalImportArgs = {
  directoryPath?: InputMaybe<Scalars['String']['input']>;
  sessionId: Scalars['String']['input'];
};


export type MutationStartNewImportArgs = {
  sessionId: Scalars['String']['input'];
};


export type MutationUncompressArchiveArgs = {
  comicObjectId: Scalars['ID']['input'];
  filePath: Scalars['String']['input'];
  options?: InputMaybe<Scalars['JSON']['input']>;
};


export type MutationUpdateSourcedMetadataArgs = {
  comicId: Scalars['ID']['input'];
  metadata: Scalars['String']['input'];
  source: MetadataSource;
};


export type MutationUpdateUserPreferencesArgs = {
  preferences: UserPreferencesInput;
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  totalPages: Scalars['Int']['output'];
};

export type PaginationOptionsInput = {
  lean?: InputMaybe<Scalars['Boolean']['input']>;
  leanWithId?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pagination?: InputMaybe<Scalars['Boolean']['input']>;
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type PersonCredit = {
  __typename?: 'PersonCredit';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
};

export type Provenance = {
  __typename?: 'Provenance';
  confidence: Scalars['Float']['output'];
  fetchedAt: Scalars['String']['output'];
  source: MetadataSource;
  sourceId?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type ProwlarrClient = {
  __typename?: 'ProwlarrClient';
  apiKey?: Maybe<Scalars['String']['output']>;
  host?: Maybe<HostConfig>;
};

export type ProwlarrSettings = {
  __typename?: 'ProwlarrSettings';
  client?: Maybe<ProwlarrClient>;
};

export type Publisher = {
  __typename?: 'Publisher';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type PublisherStats = {
  __typename?: 'PublisherStats';
  count: Scalars['Int']['output'];
  id: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  _empty?: Maybe<Scalars['String']['output']>;
  analyzeMetadataConflicts: Array<MetadataConflict>;
  bundles: Array<Bundle>;
  comic?: Maybe<Comic>;
  comics: ComicConnection;
  /** Fetch resource from Metron API */
  fetchMetronResource: MetronResponse;
  getActiveImportSession?: Maybe<ImportSession>;
  getComicBookGroups: Array<ComicBookGroup>;
  getComicBooks: ComicBooksResult;
  /** Get generic ComicVine resource (issues, volumes, etc.) */
  getComicVineResource: ComicVineResourceResponse;
  getImportStatistics: ImportStatistics;
  /** Get all issues for a series by comic object ID */
  getIssuesForSeries: IssuesForSeriesResponse;
  getJobResultStatistics: Array<JobResultStatistics>;
  getLibraryStatistics: LibraryStatistics;
  /** Get story arcs for a volume */
  getStoryArcs: Array<StoryArc>;
  /** Get volume details by URI */
  getVolume: VolumeDetailResponse;
  /** Get weekly pull list from League of Comic Geeks */
  getWeeklyPullList: MetadataPullListResponse;
  hubs: Array<Hub>;
  previewCanonicalMetadata?: Maybe<CanonicalMetadata>;
  /** Search ComicVine for volumes, issues, characters, etc. */
  searchComicVine: ComicVineSearchResult;
  searchIssue: SearchIssueResult;
  searchTorrents: Array<TorrentSearchResult>;
  settings?: Maybe<AppSettings>;
  torrentJobs?: Maybe<TorrentJob>;
  userPreferences?: Maybe<UserPreferences>;
  /** Advanced volume-based search with scoring and filtering */
  volumeBasedSearch: VolumeBasedSearchResponse;
  walkFolders: Array<Scalars['String']['output']>;
};


export type QueryAnalyzeMetadataConflictsArgs = {
  comicId: Scalars['ID']['input'];
};


export type QueryBundlesArgs = {
  comicObjectId: Scalars['ID']['input'];
  config?: InputMaybe<Scalars['JSON']['input']>;
};


export type QueryComicArgs = {
  id: Scalars['ID']['input'];
};


export type QueryComicsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  publisher?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  series?: InputMaybe<Scalars['String']['input']>;
};


export type QueryFetchMetronResourceArgs = {
  input: MetronFetchInput;
};


export type QueryGetComicBooksArgs = {
  paginationOptions: PaginationOptionsInput;
  predicate?: InputMaybe<Scalars['PredicateInput']['input']>;
};


export type QueryGetComicVineResourceArgs = {
  input: GetResourceInput;
};


export type QueryGetImportStatisticsArgs = {
  directoryPath?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetIssuesForSeriesArgs = {
  comicObjectId: Scalars['ID']['input'];
};


export type QueryGetStoryArcsArgs = {
  volumeId: Scalars['Int']['input'];
};


export type QueryGetVolumeArgs = {
  input: GetVolumesInput;
};


export type QueryGetWeeklyPullListArgs = {
  input: WeeklyPullListInput;
};


export type QueryHubsArgs = {
  host: HostInput;
};


export type QueryPreviewCanonicalMetadataArgs = {
  comicId: Scalars['ID']['input'];
  preferences?: InputMaybe<UserPreferencesInput>;
};


export type QuerySearchComicVineArgs = {
  input: SearchInput;
};


export type QuerySearchIssueArgs = {
  pagination?: InputMaybe<SearchPaginationInput>;
  query?: InputMaybe<SearchIssueQueryInput>;
  type: SearchType;
};


export type QuerySearchTorrentsArgs = {
  query: Scalars['String']['input'];
};


export type QuerySettingsArgs = {
  settingsKey?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTorrentJobsArgs = {
  trigger: Scalars['String']['input'];
};


export type QueryUserPreferencesArgs = {
  userId?: InputMaybe<Scalars['String']['input']>;
};


export type QueryVolumeBasedSearchArgs = {
  input: VolumeSearchInput;
};


export type QueryWalkFoldersArgs = {
  basePathToWalk: Scalars['String']['input'];
  extensions?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type RawFileDetails = {
  __typename?: 'RawFileDetails';
  archive?: Maybe<Archive>;
  containedIn?: Maybe<Scalars['String']['output']>;
  cover?: Maybe<Cover>;
  extension?: Maybe<Scalars['String']['output']>;
  filePath?: Maybe<Scalars['String']['output']>;
  fileSize?: Maybe<Scalars['Int']['output']>;
  mimeType?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  pageCount?: Maybe<Scalars['Int']['output']>;
};

export type RawFileDetailsInput = {
  archive?: InputMaybe<ArchiveInput>;
  containedIn?: InputMaybe<Scalars['String']['input']>;
  cover?: InputMaybe<CoverInput>;
  extension?: InputMaybe<Scalars['String']['input']>;
  filePath: Scalars['String']['input'];
  fileSize?: InputMaybe<Scalars['Int']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  pageCount?: InputMaybe<Scalars['Int']['input']>;
};

export type ScorerConfigurationInput = {
  searchParams?: InputMaybe<SearchParamsInput>;
};

export type SearchHit = {
  __typename?: 'SearchHit';
  _id: Scalars['String']['output'];
  _index: Scalars['String']['output'];
  _score?: Maybe<Scalars['Float']['output']>;
  _source: Comic;
};

export type SearchHits = {
  __typename?: 'SearchHits';
  hits: Array<SearchHit>;
  max_score?: Maybe<Scalars['Float']['output']>;
  total: SearchTotal;
};

export type SearchInput = {
  field_list?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  resources: Scalars['String']['input'];
  sort?: InputMaybe<Scalars['String']['input']>;
};

export type SearchIssueQueryInput = {
  issueNumber?: InputMaybe<Scalars['String']['input']>;
  volumeName?: InputMaybe<Scalars['String']['input']>;
};

export type SearchIssueResult = {
  __typename?: 'SearchIssueResult';
  hits: SearchHits;
  timed_out?: Maybe<Scalars['Boolean']['output']>;
  took?: Maybe<Scalars['Int']['output']>;
};

export type SearchPaginationInput = {
  from?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};

export type SearchParamsInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  volume?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['String']['input']>;
};

export type SearchResultItem = {
  __typename?: 'SearchResultItem';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  count_of_issues?: Maybe<Scalars['Int']['output']>;
  cover_date?: Maybe<Scalars['String']['output']>;
  deck?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<ImageUrls>;
  issue_number?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  publisher?: Maybe<Publisher>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
  start_year?: Maybe<Scalars['String']['output']>;
  volume?: Maybe<Volume>;
};

export type SearchTotal = {
  __typename?: 'SearchTotal';
  relation: Scalars['String']['output'];
  value: Scalars['Int']['output'];
};

export enum SearchType {
  All = 'all',
  VolumeName = 'volumeName',
  Volumes = 'volumes',
  Wanted = 'wanted'
}

export type SourcePriority = {
  __typename?: 'SourcePriority';
  enabled: Scalars['Boolean']['output'];
  fieldOverrides?: Maybe<Array<FieldOverride>>;
  priority: Scalars['Int']['output'];
  source: MetadataSource;
};

export type SourcePriorityInput = {
  enabled: Scalars['Boolean']['input'];
  fieldOverrides?: InputMaybe<Array<FieldOverrideInput>>;
  priority: Scalars['Int']['input'];
  source: MetadataSource;
};

export type SourcedMetadata = {
  __typename?: 'SourcedMetadata';
  comicInfo?: Maybe<Scalars['String']['output']>;
  comicvine?: Maybe<Scalars['String']['output']>;
  gcd?: Maybe<Scalars['String']['output']>;
  locg?: Maybe<LocgMetadata>;
  metron?: Maybe<Scalars['String']['output']>;
};

export type SourcedMetadataInput = {
  comicInfo?: InputMaybe<Scalars['String']['input']>;
  comicvine?: InputMaybe<Scalars['String']['input']>;
  gcd?: InputMaybe<Scalars['String']['input']>;
  locg?: InputMaybe<LocgMetadataInput>;
  metron?: InputMaybe<Scalars['String']['input']>;
};

export type StatisticsFacet = {
  __typename?: 'StatisticsFacet';
  fileLessComics?: Maybe<Array<Comic>>;
  fileTypes?: Maybe<Array<FileTypeStats>>;
  issues?: Maybe<Array<IssueStats>>;
  issuesWithComicInfoXML?: Maybe<Array<Comic>>;
  publisherWithMostComicsInLibrary?: Maybe<Array<PublisherStats>>;
};

export type StoryArc = {
  __typename?: 'StoryArc';
  deck?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image?: Maybe<ImageUrls>;
  issues?: Maybe<Array<Issue>>;
  name: Scalars['String']['output'];
};

export type StoryArcCredit = {
  __typename?: 'StoryArcCredit';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  deck?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<ImageUrls>;
  name?: Maybe<Scalars['String']['output']>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
};

export type TeamCredit = {
  __typename?: 'TeamCredit';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
};

export type TorrentJob = {
  __typename?: 'TorrentJob';
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type TorrentSearchResult = {
  __typename?: 'TorrentSearchResult';
  downloadUrl?: Maybe<Scalars['String']['output']>;
  guid?: Maybe<Scalars['String']['output']>;
  indexer?: Maybe<Scalars['String']['output']>;
  leechers?: Maybe<Scalars['Int']['output']>;
  publishDate?: Maybe<Scalars['String']['output']>;
  seeders?: Maybe<Scalars['Int']['output']>;
  size?: Maybe<Scalars['Float']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

export type UserPreferences = {
  __typename?: 'UserPreferences';
  autoMerge: AutoMergeSettings;
  conflictResolution: ConflictResolutionStrategy;
  createdAt?: Maybe<Scalars['String']['output']>;
  fieldPreferences?: Maybe<Array<FieldPreference>>;
  id: Scalars['ID']['output'];
  minConfidenceThreshold: Scalars['Float']['output'];
  preferRecent: Scalars['Boolean']['output'];
  sourcePriorities: Array<SourcePriority>;
  updatedAt?: Maybe<Scalars['String']['output']>;
  userId: Scalars['String']['output'];
};

export type UserPreferencesInput = {
  autoMerge?: InputMaybe<AutoMergeSettingsInput>;
  conflictResolution?: InputMaybe<ConflictResolutionStrategy>;
  fieldPreferences?: InputMaybe<Array<FieldPreferenceInput>>;
  minConfidenceThreshold?: InputMaybe<Scalars['Float']['input']>;
  preferRecent?: InputMaybe<Scalars['Boolean']['input']>;
  sourcePriorities?: InputMaybe<Array<SourcePriorityInput>>;
};

export type Volume = {
  __typename?: 'Volume';
  api_detail_url?: Maybe<Scalars['String']['output']>;
  count_of_issues?: Maybe<Scalars['Int']['output']>;
  deck?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image?: Maybe<ImageUrls>;
  name: Scalars['String']['output'];
  publisher?: Maybe<Publisher>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
  start_year?: Maybe<Scalars['String']['output']>;
};

export type VolumeBasedSearchResponse = {
  __typename?: 'VolumeBasedSearchResponse';
  results: Array<VolumeSearchResult>;
  totalResults: Scalars['Int']['output'];
};

export type VolumeDetailResponse = {
  __typename?: 'VolumeDetailResponse';
  error: Scalars['String']['output'];
  results: Volume;
  status_code: Scalars['Int']['output'];
};

export type VolumeImage = {
  __typename?: 'VolumeImage';
  icon_url?: Maybe<Scalars['String']['output']>;
  image_tags?: Maybe<Scalars['String']['output']>;
  medium_url?: Maybe<Scalars['String']['output']>;
  original_url?: Maybe<Scalars['String']['output']>;
  screen_large_url?: Maybe<Scalars['String']['output']>;
  screen_url?: Maybe<Scalars['String']['output']>;
  small_url?: Maybe<Scalars['String']['output']>;
  super_url?: Maybe<Scalars['String']['output']>;
  thumb_url?: Maybe<Scalars['String']['output']>;
  tiny_url?: Maybe<Scalars['String']['output']>;
};

export type VolumeInfo = {
  __typename?: 'VolumeInfo';
  count_of_issues?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  image?: Maybe<VolumeImage>;
  name?: Maybe<Scalars['String']['output']>;
  publisher?: Maybe<Publisher>;
  site_detail_url?: Maybe<Scalars['String']['output']>;
  start_year?: Maybe<Scalars['String']['output']>;
};

export type VolumeSearchInput = {
  fieldList?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  rawFileDetails?: InputMaybe<Scalars['JSON']['input']>;
  resources: Scalars['String']['input'];
  scorerConfiguration?: InputMaybe<ScorerConfigurationInput>;
};

export type VolumeSearchResult = {
  __typename?: 'VolumeSearchResult';
  matchedIssues?: Maybe<Array<Issue>>;
  score?: Maybe<Scalars['Float']['output']>;
  volume: Volume;
};

export type WantedInput = {
  issues?: InputMaybe<Array<WantedIssueInput>>;
  markEntireVolumeWanted?: InputMaybe<Scalars['Boolean']['input']>;
  source?: InputMaybe<Scalars['String']['input']>;
  volume?: InputMaybe<WantedVolumeInput>;
};

export type WantedIssueInput = {
  coverDate?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  image?: InputMaybe<Array<Scalars['String']['input']>>;
  issueNumber?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type WantedVolumeInput = {
  id?: InputMaybe<Scalars['Int']['input']>;
  image?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type WeeklyPullListInput = {
  currentPage: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  startDate: Scalars['String']['input'];
};

export type GetComicByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetComicByIdQuery = { __typename?: 'Query', comic?: { __typename?: 'Comic', id: string, createdAt?: string | null, updatedAt?: string | null, inferredMetadata?: { __typename?: 'InferredMetadata', issue?: { __typename?: 'Issue', name?: string | null, number?: number | null, year?: string | null, subtitle?: string | null } | null } | null, canonicalMetadata?: { __typename?: 'CanonicalMetadata', title?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, series?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, volume?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, issueNumber?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, publisher?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, publicationDate?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, coverDate?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, description?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, creators?: Array<{ __typename?: 'Creator', name: string, role: string, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } }> | null, pageCount?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null, coverImage?: { __typename?: 'MetadataField', value?: string | null, userOverride?: boolean | null, provenance: { __typename?: 'Provenance', source: MetadataSource, sourceId?: string | null, confidence: number, fetchedAt: string, url?: string | null } } | null } | null, sourcedMetadata?: { __typename?: 'SourcedMetadata', comicInfo?: string | null, comicvine?: string | null, metron?: string | null, gcd?: string | null, locg?: { __typename?: 'LOCGMetadata', name?: string | null, publisher?: string | null, url?: string | null, cover?: string | null, description?: string | null, price?: string | null, rating?: number | null, pulls?: number | null, potw?: number | null } | null } | null, rawFileDetails?: { __typename?: 'RawFileDetails', name?: string | null, filePath?: string | null, fileSize?: number | null, extension?: string | null, mimeType?: string | null, containedIn?: string | null, pageCount?: number | null, archive?: { __typename?: 'Archive', uncompressed?: boolean | null, expandedPath?: string | null } | null, cover?: { __typename?: 'Cover', filePath?: string | null, stats?: string | null } | null } | null, importStatus?: { __typename?: 'ImportStatus', isImported?: boolean | null, tagged?: boolean | null, matchedResult?: { __typename?: 'MatchedResult', score?: string | null } | null } | null } | null };

export type GetComicsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  publisher?: InputMaybe<Scalars['String']['input']>;
  series?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetComicsQuery = { __typename?: 'Query', comics: { __typename?: 'ComicConnection', totalCount: number, comics: Array<{ __typename?: 'Comic', id: string, inferredMetadata?: { __typename?: 'InferredMetadata', issue?: { __typename?: 'Issue', name?: string | null, number?: number | null, year?: string | null, subtitle?: string | null } | null } | null, rawFileDetails?: { __typename?: 'RawFileDetails', name?: string | null, extension?: string | null, archive?: { __typename?: 'Archive', uncompressed?: boolean | null } | null } | null, sourcedMetadata?: { __typename?: 'SourcedMetadata', comicvine?: string | null, comicInfo?: string | null, locg?: { __typename?: 'LOCGMetadata', name?: string | null, publisher?: string | null, cover?: string | null } | null } | null, canonicalMetadata?: { __typename?: 'CanonicalMetadata', title?: { __typename?: 'MetadataField', value?: string | null } | null, series?: { __typename?: 'MetadataField', value?: string | null } | null, issueNumber?: { __typename?: 'MetadataField', value?: string | null } | null } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, currentPage: number, totalPages: number } } };

export type GetRecentComicsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetRecentComicsQuery = { __typename?: 'Query', comics: { __typename?: 'ComicConnection', totalCount: number, comics: Array<{ __typename?: 'Comic', id: string, createdAt?: string | null, updatedAt?: string | null, inferredMetadata?: { __typename?: 'InferredMetadata', issue?: { __typename?: 'Issue', name?: string | null, number?: number | null, year?: string | null, subtitle?: string | null } | null } | null, rawFileDetails?: { __typename?: 'RawFileDetails', name?: string | null, extension?: string | null, cover?: { __typename?: 'Cover', filePath?: string | null } | null, archive?: { __typename?: 'Archive', uncompressed?: boolean | null } | null } | null, sourcedMetadata?: { __typename?: 'SourcedMetadata', comicvine?: string | null, comicInfo?: string | null, locg?: { __typename?: 'LOCGMetadata', name?: string | null, publisher?: string | null, cover?: string | null } | null } | null, canonicalMetadata?: { __typename?: 'CanonicalMetadata', title?: { __typename?: 'MetadataField', value?: string | null } | null, series?: { __typename?: 'MetadataField', value?: string | null } | null, issueNumber?: { __typename?: 'MetadataField', value?: string | null } | null, publisher?: { __typename?: 'MetadataField', value?: string | null } | null } | null, importStatus?: { __typename?: 'ImportStatus', isRawFileMissing?: boolean | null } | null }> } };

export type GetWantedComicsQueryVariables = Exact<{
  paginationOptions: PaginationOptionsInput;
  predicate?: InputMaybe<Scalars['PredicateInput']['input']>;
}>;


export type GetWantedComicsQuery = { __typename?: 'Query', getComicBooks: { __typename?: 'ComicBooksResult', totalDocs: number, limit: number, page?: number | null, totalPages: number, hasNextPage: boolean, hasPrevPage: boolean, docs: Array<{ __typename?: 'Comic', id: string, createdAt?: string | null, updatedAt?: string | null, inferredMetadata?: { __typename?: 'InferredMetadata', issue?: { __typename?: 'Issue', name?: string | null, number?: number | null, year?: string | null, subtitle?: string | null } | null } | null, rawFileDetails?: { __typename?: 'RawFileDetails', name?: string | null, extension?: string | null, cover?: { __typename?: 'Cover', filePath?: string | null } | null, archive?: { __typename?: 'Archive', uncompressed?: boolean | null } | null } | null, sourcedMetadata?: { __typename?: 'SourcedMetadata', comicvine?: string | null, comicInfo?: string | null, locg?: { __typename?: 'LOCGMetadata', name?: string | null, publisher?: string | null, cover?: string | null } | null } | null, canonicalMetadata?: { __typename?: 'CanonicalMetadata', title?: { __typename?: 'MetadataField', value?: string | null } | null, series?: { __typename?: 'MetadataField', value?: string | null } | null, issueNumber?: { __typename?: 'MetadataField', value?: string | null } | null } | null }> } };

export type GetVolumeGroupsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetVolumeGroupsQuery = { __typename?: 'Query', getComicBookGroups: Array<{ __typename?: 'ComicBookGroup', id: string, volumes?: { __typename?: 'VolumeInfo', id?: number | null, name?: string | null, count_of_issues?: number | null, start_year?: string | null, publisher?: { __typename?: 'Publisher', id?: number | null, name?: string | null } | null, image?: { __typename?: 'VolumeImage', small_url?: string | null } | null } | null }> };

export type GetLibraryStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetLibraryStatisticsQuery = { __typename?: 'Query', getLibraryStatistics: { __typename?: 'LibraryStatistics', totalDocuments: number, comicDirectorySize: { __typename?: 'DirectorySize', fileCount: number }, statistics: Array<{ __typename?: 'StatisticsFacet', fileTypes?: Array<{ __typename?: 'FileTypeStats', id: string, data: Array<string> }> | null, issues?: Array<{ __typename?: 'IssueStats', data: Array<string>, id?: { __typename?: 'VolumeInfo', id?: number | null, name?: string | null } | null }> | null, fileLessComics?: Array<{ __typename?: 'Comic', id: string }> | null, issuesWithComicInfoXML?: Array<{ __typename?: 'Comic', id: string }> | null, publisherWithMostComicsInLibrary?: Array<{ __typename?: 'PublisherStats', id: string, count: number }> | null }> } };

export type GetWeeklyPullListQueryVariables = Exact<{
  input: WeeklyPullListInput;
}>;


export type GetWeeklyPullListQuery = { __typename?: 'Query', getWeeklyPullList: { __typename?: 'MetadataPullListResponse', result: Array<{ __typename?: 'MetadataPullListItem', name?: string | null, publisher?: string | null, cover?: string | null }> } };

export type GetImportStatisticsQueryVariables = Exact<{
  directoryPath?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetImportStatisticsQuery = { __typename?: 'Query', getImportStatistics: { __typename?: 'ImportStatistics', success: boolean, directory: string, stats: { __typename?: 'ImportStats', totalLocalFiles: number, alreadyImported: number, newFiles: number, missingFiles: number, percentageImported: string } } };

export type StartNewImportMutationVariables = Exact<{
  sessionId: Scalars['String']['input'];
}>;


export type StartNewImportMutation = { __typename?: 'Mutation', startNewImport: { __typename?: 'ImportJobResult', success: boolean, message: string, jobsQueued: number } };

export type StartIncrementalImportMutationVariables = Exact<{
  sessionId: Scalars['String']['input'];
  directoryPath?: InputMaybe<Scalars['String']['input']>;
}>;


export type StartIncrementalImportMutation = { __typename?: 'Mutation', startIncrementalImport: { __typename?: 'IncrementalImportResult', success: boolean, message: string, stats: { __typename?: 'IncrementalImportStats', total: number, alreadyImported: number, newFiles: number, queued: number } } };

export type GetJobResultStatisticsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetJobResultStatisticsQuery = { __typename?: 'Query', getJobResultStatistics: Array<{ __typename?: 'JobResultStatistics', sessionId: string, earliestTimestamp: string, completedJobs: number, failedJobs: number }> };

export type GetActiveImportSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetActiveImportSessionQuery = { __typename?: 'Query', getActiveImportSession?: { __typename?: 'ImportSession', sessionId: string, type: string, status: string, startedAt: string, completedAt?: string | null, directoryPath?: string | null, stats: { __typename?: 'ImportSessionStats', totalFiles: number, filesQueued: number, filesProcessed: number, filesSucceeded: number, filesFailed: number } } | null };

export type GetLibraryComicsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  series?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetLibraryComicsQuery = { __typename?: 'Query', comics: { __typename?: 'ComicConnection', totalCount: number, comics: Array<{ __typename?: 'Comic', id: string, createdAt?: string | null, updatedAt?: string | null, inferredMetadata?: { __typename?: 'InferredMetadata', issue?: { __typename?: 'Issue', name?: string | null, number?: number | null, year?: string | null, subtitle?: string | null } | null } | null, rawFileDetails?: { __typename?: 'RawFileDetails', name?: string | null, filePath?: string | null, fileSize?: number | null, extension?: string | null, mimeType?: string | null, pageCount?: number | null, archive?: { __typename?: 'Archive', uncompressed?: boolean | null } | null, cover?: { __typename?: 'Cover', filePath?: string | null } | null } | null, sourcedMetadata?: { __typename?: 'SourcedMetadata', comicvine?: string | null, comicInfo?: string | null, locg?: { __typename?: 'LOCGMetadata', name?: string | null, publisher?: string | null, cover?: string | null } | null } | null, canonicalMetadata?: { __typename?: 'CanonicalMetadata', title?: { __typename?: 'MetadataField', value?: string | null } | null, series?: { __typename?: 'MetadataField', value?: string | null } | null, issueNumber?: { __typename?: 'MetadataField', value?: string | null } | null, publisher?: { __typename?: 'MetadataField', value?: string | null } | null, pageCount?: { __typename?: 'MetadataField', value?: string | null } | null } | null, importStatus?: { __typename?: 'ImportStatus', isImported?: boolean | null, tagged?: boolean | null } | null }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, hasPreviousPage: boolean, currentPage: number, totalPages: number } } };



export const GetComicByIdDocument = `
    query GetComicById($id: ID!) {
  comic(id: $id) {
    id
    inferredMetadata {
      issue {
        name
        number
        year
        subtitle
      }
    }
    canonicalMetadata {
      title {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      series {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      volume {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      issueNumber {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      publisher {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      publicationDate {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      coverDate {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      description {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      creators {
        name
        role
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
      }
      pageCount {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
      coverImage {
        value
        provenance {
          source
          sourceId
          confidence
          fetchedAt
          url
        }
        userOverride
      }
    }
    sourcedMetadata {
      comicInfo
      comicvine
      metron
      gcd
      locg {
        name
        publisher
        url
        cover
        description
        price
        rating
        pulls
        potw
      }
    }
    rawFileDetails {
      name
      filePath
      fileSize
      extension
      mimeType
      containedIn
      pageCount
      archive {
        uncompressed
        expandedPath
      }
      cover {
        filePath
        stats
      }
    }
    importStatus {
      isImported
      tagged
      matchedResult {
        score
      }
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetComicByIdQuery = <
      TData = GetComicByIdQuery,
      TError = unknown
    >(
      variables: GetComicByIdQueryVariables,
      options?: Omit<UseQueryOptions<GetComicByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetComicByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetComicByIdQuery, TError, TData>(
      {
    queryKey: ['GetComicById', variables],
    queryFn: fetcher<GetComicByIdQuery, GetComicByIdQueryVariables>(GetComicByIdDocument, variables),
    ...options
  }
    )};

useGetComicByIdQuery.getKey = (variables: GetComicByIdQueryVariables) => ['GetComicById', variables];

export const useInfiniteGetComicByIdQuery = <
      TData = InfiniteData<GetComicByIdQuery>,
      TError = unknown
    >(
      variables: GetComicByIdQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetComicByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetComicByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetComicByIdQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetComicById.infinite', variables],
      queryFn: (metaData) => fetcher<GetComicByIdQuery, GetComicByIdQueryVariables>(GetComicByIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetComicByIdQuery.getKey = (variables: GetComicByIdQueryVariables) => ['GetComicById.infinite', variables];


useGetComicByIdQuery.fetcher = (variables: GetComicByIdQueryVariables, options?: RequestInit['headers']) => fetcher<GetComicByIdQuery, GetComicByIdQueryVariables>(GetComicByIdDocument, variables, options);

export const GetComicsDocument = `
    query GetComics($page: Int, $limit: Int, $search: String, $publisher: String, $series: String) {
  comics(
    page: $page
    limit: $limit
    search: $search
    publisher: $publisher
    series: $series
  ) {
    comics {
      id
      inferredMetadata {
        issue {
          name
          number
          year
          subtitle
        }
      }
      rawFileDetails {
        name
        extension
        archive {
          uncompressed
        }
      }
      sourcedMetadata {
        comicvine
        comicInfo
        locg {
          name
          publisher
          cover
        }
      }
      canonicalMetadata {
        title {
          value
        }
        series {
          value
        }
        issueNumber {
          value
        }
      }
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
}
    `;

export const useGetComicsQuery = <
      TData = GetComicsQuery,
      TError = unknown
    >(
      variables?: GetComicsQueryVariables,
      options?: Omit<UseQueryOptions<GetComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetComicsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetComics'] : ['GetComics', variables],
    queryFn: fetcher<GetComicsQuery, GetComicsQueryVariables>(GetComicsDocument, variables),
    ...options
  }
    )};

useGetComicsQuery.getKey = (variables?: GetComicsQueryVariables) => variables === undefined ? ['GetComics'] : ['GetComics', variables];

export const useInfiniteGetComicsQuery = <
      TData = InfiniteData<GetComicsQuery>,
      TError = unknown
    >(
      variables: GetComicsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetComicsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetComics.infinite'] : ['GetComics.infinite', variables],
      queryFn: (metaData) => fetcher<GetComicsQuery, GetComicsQueryVariables>(GetComicsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetComicsQuery.getKey = (variables?: GetComicsQueryVariables) => variables === undefined ? ['GetComics.infinite'] : ['GetComics.infinite', variables];


useGetComicsQuery.fetcher = (variables?: GetComicsQueryVariables, options?: RequestInit['headers']) => fetcher<GetComicsQuery, GetComicsQueryVariables>(GetComicsDocument, variables, options);

export const GetRecentComicsDocument = `
    query GetRecentComics($limit: Int) {
  comics(page: 1, limit: $limit) {
    comics {
      id
      inferredMetadata {
        issue {
          name
          number
          year
          subtitle
        }
      }
      rawFileDetails {
        name
        extension
        cover {
          filePath
        }
        archive {
          uncompressed
        }
      }
      sourcedMetadata {
        comicvine
        comicInfo
        locg {
          name
          publisher
          cover
        }
      }
      canonicalMetadata {
        title {
          value
        }
        series {
          value
        }
        issueNumber {
          value
        }
        publisher {
          value
        }
      }
      importStatus {
        isRawFileMissing
      }
      createdAt
      updatedAt
    }
    totalCount
  }
}
    `;

export const useGetRecentComicsQuery = <
      TData = GetRecentComicsQuery,
      TError = unknown
    >(
      variables?: GetRecentComicsQueryVariables,
      options?: Omit<UseQueryOptions<GetRecentComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetRecentComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetRecentComicsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetRecentComics'] : ['GetRecentComics', variables],
    queryFn: fetcher<GetRecentComicsQuery, GetRecentComicsQueryVariables>(GetRecentComicsDocument, variables),
    ...options
  }
    )};

useGetRecentComicsQuery.getKey = (variables?: GetRecentComicsQueryVariables) => variables === undefined ? ['GetRecentComics'] : ['GetRecentComics', variables];

export const useInfiniteGetRecentComicsQuery = <
      TData = InfiniteData<GetRecentComicsQuery>,
      TError = unknown
    >(
      variables: GetRecentComicsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetRecentComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetRecentComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetRecentComicsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetRecentComics.infinite'] : ['GetRecentComics.infinite', variables],
      queryFn: (metaData) => fetcher<GetRecentComicsQuery, GetRecentComicsQueryVariables>(GetRecentComicsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetRecentComicsQuery.getKey = (variables?: GetRecentComicsQueryVariables) => variables === undefined ? ['GetRecentComics.infinite'] : ['GetRecentComics.infinite', variables];


useGetRecentComicsQuery.fetcher = (variables?: GetRecentComicsQueryVariables, options?: RequestInit['headers']) => fetcher<GetRecentComicsQuery, GetRecentComicsQueryVariables>(GetRecentComicsDocument, variables, options);

export const GetWantedComicsDocument = `
    query GetWantedComics($paginationOptions: PaginationOptionsInput!, $predicate: PredicateInput) {
  getComicBooks(paginationOptions: $paginationOptions, predicate: $predicate) {
    docs {
      id
      inferredMetadata {
        issue {
          name
          number
          year
          subtitle
        }
      }
      rawFileDetails {
        name
        extension
        cover {
          filePath
        }
        archive {
          uncompressed
        }
      }
      sourcedMetadata {
        comicvine
        comicInfo
        locg {
          name
          publisher
          cover
        }
      }
      canonicalMetadata {
        title {
          value
        }
        series {
          value
        }
        issueNumber {
          value
        }
      }
      createdAt
      updatedAt
    }
    totalDocs
    limit
    page
    totalPages
    hasNextPage
    hasPrevPage
  }
}
    `;

export const useGetWantedComicsQuery = <
      TData = GetWantedComicsQuery,
      TError = unknown
    >(
      variables: GetWantedComicsQueryVariables,
      options?: Omit<UseQueryOptions<GetWantedComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetWantedComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetWantedComicsQuery, TError, TData>(
      {
    queryKey: ['GetWantedComics', variables],
    queryFn: fetcher<GetWantedComicsQuery, GetWantedComicsQueryVariables>(GetWantedComicsDocument, variables),
    ...options
  }
    )};

useGetWantedComicsQuery.getKey = (variables: GetWantedComicsQueryVariables) => ['GetWantedComics', variables];

export const useInfiniteGetWantedComicsQuery = <
      TData = InfiniteData<GetWantedComicsQuery>,
      TError = unknown
    >(
      variables: GetWantedComicsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetWantedComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetWantedComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetWantedComicsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetWantedComics.infinite', variables],
      queryFn: (metaData) => fetcher<GetWantedComicsQuery, GetWantedComicsQueryVariables>(GetWantedComicsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetWantedComicsQuery.getKey = (variables: GetWantedComicsQueryVariables) => ['GetWantedComics.infinite', variables];


useGetWantedComicsQuery.fetcher = (variables: GetWantedComicsQueryVariables, options?: RequestInit['headers']) => fetcher<GetWantedComicsQuery, GetWantedComicsQueryVariables>(GetWantedComicsDocument, variables, options);

export const GetVolumeGroupsDocument = `
    query GetVolumeGroups {
  getComicBookGroups {
    id
    volumes {
      id
      name
      count_of_issues
      publisher {
        id
        name
      }
      start_year
      image {
        small_url
      }
    }
  }
}
    `;

export const useGetVolumeGroupsQuery = <
      TData = GetVolumeGroupsQuery,
      TError = unknown
    >(
      variables?: GetVolumeGroupsQueryVariables,
      options?: Omit<UseQueryOptions<GetVolumeGroupsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetVolumeGroupsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetVolumeGroupsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetVolumeGroups'] : ['GetVolumeGroups', variables],
    queryFn: fetcher<GetVolumeGroupsQuery, GetVolumeGroupsQueryVariables>(GetVolumeGroupsDocument, variables),
    ...options
  }
    )};

useGetVolumeGroupsQuery.getKey = (variables?: GetVolumeGroupsQueryVariables) => variables === undefined ? ['GetVolumeGroups'] : ['GetVolumeGroups', variables];

export const useInfiniteGetVolumeGroupsQuery = <
      TData = InfiniteData<GetVolumeGroupsQuery>,
      TError = unknown
    >(
      variables: GetVolumeGroupsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetVolumeGroupsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetVolumeGroupsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetVolumeGroupsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetVolumeGroups.infinite'] : ['GetVolumeGroups.infinite', variables],
      queryFn: (metaData) => fetcher<GetVolumeGroupsQuery, GetVolumeGroupsQueryVariables>(GetVolumeGroupsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetVolumeGroupsQuery.getKey = (variables?: GetVolumeGroupsQueryVariables) => variables === undefined ? ['GetVolumeGroups.infinite'] : ['GetVolumeGroups.infinite', variables];


useGetVolumeGroupsQuery.fetcher = (variables?: GetVolumeGroupsQueryVariables, options?: RequestInit['headers']) => fetcher<GetVolumeGroupsQuery, GetVolumeGroupsQueryVariables>(GetVolumeGroupsDocument, variables, options);

export const GetLibraryStatisticsDocument = `
    query GetLibraryStatistics {
  getLibraryStatistics {
    totalDocuments
    comicDirectorySize {
      fileCount
    }
    statistics {
      fileTypes {
        id
        data
      }
      issues {
        id {
          id
          name
        }
        data
      }
      fileLessComics {
        id
      }
      issuesWithComicInfoXML {
        id
      }
      publisherWithMostComicsInLibrary {
        id
        count
      }
    }
  }
}
    `;

export const useGetLibraryStatisticsQuery = <
      TData = GetLibraryStatisticsQuery,
      TError = unknown
    >(
      variables?: GetLibraryStatisticsQueryVariables,
      options?: Omit<UseQueryOptions<GetLibraryStatisticsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetLibraryStatisticsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetLibraryStatisticsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetLibraryStatistics'] : ['GetLibraryStatistics', variables],
    queryFn: fetcher<GetLibraryStatisticsQuery, GetLibraryStatisticsQueryVariables>(GetLibraryStatisticsDocument, variables),
    ...options
  }
    )};

useGetLibraryStatisticsQuery.getKey = (variables?: GetLibraryStatisticsQueryVariables) => variables === undefined ? ['GetLibraryStatistics'] : ['GetLibraryStatistics', variables];

export const useInfiniteGetLibraryStatisticsQuery = <
      TData = InfiniteData<GetLibraryStatisticsQuery>,
      TError = unknown
    >(
      variables: GetLibraryStatisticsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetLibraryStatisticsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetLibraryStatisticsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetLibraryStatisticsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetLibraryStatistics.infinite'] : ['GetLibraryStatistics.infinite', variables],
      queryFn: (metaData) => fetcher<GetLibraryStatisticsQuery, GetLibraryStatisticsQueryVariables>(GetLibraryStatisticsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetLibraryStatisticsQuery.getKey = (variables?: GetLibraryStatisticsQueryVariables) => variables === undefined ? ['GetLibraryStatistics.infinite'] : ['GetLibraryStatistics.infinite', variables];


useGetLibraryStatisticsQuery.fetcher = (variables?: GetLibraryStatisticsQueryVariables, options?: RequestInit['headers']) => fetcher<GetLibraryStatisticsQuery, GetLibraryStatisticsQueryVariables>(GetLibraryStatisticsDocument, variables, options);

export const GetWeeklyPullListDocument = `
    query GetWeeklyPullList($input: WeeklyPullListInput!) {
  getWeeklyPullList(input: $input) {
    result {
      name
      publisher
      cover
    }
  }
}
    `;

export const useGetWeeklyPullListQuery = <
      TData = GetWeeklyPullListQuery,
      TError = unknown
    >(
      variables: GetWeeklyPullListQueryVariables,
      options?: Omit<UseQueryOptions<GetWeeklyPullListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetWeeklyPullListQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetWeeklyPullListQuery, TError, TData>(
      {
    queryKey: ['GetWeeklyPullList', variables],
    queryFn: fetcher<GetWeeklyPullListQuery, GetWeeklyPullListQueryVariables>(GetWeeklyPullListDocument, variables),
    ...options
  }
    )};

useGetWeeklyPullListQuery.getKey = (variables: GetWeeklyPullListQueryVariables) => ['GetWeeklyPullList', variables];

export const useInfiniteGetWeeklyPullListQuery = <
      TData = InfiniteData<GetWeeklyPullListQuery>,
      TError = unknown
    >(
      variables: GetWeeklyPullListQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetWeeklyPullListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetWeeklyPullListQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetWeeklyPullListQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetWeeklyPullList.infinite', variables],
      queryFn: (metaData) => fetcher<GetWeeklyPullListQuery, GetWeeklyPullListQueryVariables>(GetWeeklyPullListDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetWeeklyPullListQuery.getKey = (variables: GetWeeklyPullListQueryVariables) => ['GetWeeklyPullList.infinite', variables];


useGetWeeklyPullListQuery.fetcher = (variables: GetWeeklyPullListQueryVariables, options?: RequestInit['headers']) => fetcher<GetWeeklyPullListQuery, GetWeeklyPullListQueryVariables>(GetWeeklyPullListDocument, variables, options);

export const GetImportStatisticsDocument = `
    query GetImportStatistics($directoryPath: String) {
  getImportStatistics(directoryPath: $directoryPath) {
    success
    directory
    stats {
      totalLocalFiles
      alreadyImported
      newFiles
      missingFiles
      percentageImported
    }
  }
}
    `;

export const useGetImportStatisticsQuery = <
      TData = GetImportStatisticsQuery,
      TError = unknown
    >(
      variables?: GetImportStatisticsQueryVariables,
      options?: Omit<UseQueryOptions<GetImportStatisticsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetImportStatisticsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetImportStatisticsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetImportStatistics'] : ['GetImportStatistics', variables],
    queryFn: fetcher<GetImportStatisticsQuery, GetImportStatisticsQueryVariables>(GetImportStatisticsDocument, variables),
    ...options
  }
    )};

useGetImportStatisticsQuery.getKey = (variables?: GetImportStatisticsQueryVariables) => variables === undefined ? ['GetImportStatistics'] : ['GetImportStatistics', variables];

export const useInfiniteGetImportStatisticsQuery = <
      TData = InfiniteData<GetImportStatisticsQuery>,
      TError = unknown
    >(
      variables: GetImportStatisticsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetImportStatisticsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetImportStatisticsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetImportStatisticsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetImportStatistics.infinite'] : ['GetImportStatistics.infinite', variables],
      queryFn: (metaData) => fetcher<GetImportStatisticsQuery, GetImportStatisticsQueryVariables>(GetImportStatisticsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetImportStatisticsQuery.getKey = (variables?: GetImportStatisticsQueryVariables) => variables === undefined ? ['GetImportStatistics.infinite'] : ['GetImportStatistics.infinite', variables];


useGetImportStatisticsQuery.fetcher = (variables?: GetImportStatisticsQueryVariables, options?: RequestInit['headers']) => fetcher<GetImportStatisticsQuery, GetImportStatisticsQueryVariables>(GetImportStatisticsDocument, variables, options);

export const StartNewImportDocument = `
    mutation StartNewImport($sessionId: String!) {
  startNewImport(sessionId: $sessionId) {
    success
    message
    jobsQueued
  }
}
    `;

export const useStartNewImportMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<StartNewImportMutation, TError, StartNewImportMutationVariables, TContext>) => {
    
    return useMutation<StartNewImportMutation, TError, StartNewImportMutationVariables, TContext>(
      {
    mutationKey: ['StartNewImport'],
    mutationFn: (variables?: StartNewImportMutationVariables) => fetcher<StartNewImportMutation, StartNewImportMutationVariables>(StartNewImportDocument, variables)(),
    ...options
  }
    )};


useStartNewImportMutation.fetcher = (variables: StartNewImportMutationVariables, options?: RequestInit['headers']) => fetcher<StartNewImportMutation, StartNewImportMutationVariables>(StartNewImportDocument, variables, options);

export const StartIncrementalImportDocument = `
    mutation StartIncrementalImport($sessionId: String!, $directoryPath: String) {
  startIncrementalImport(sessionId: $sessionId, directoryPath: $directoryPath) {
    success
    message
    stats {
      total
      alreadyImported
      newFiles
      queued
    }
  }
}
    `;

export const useStartIncrementalImportMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<StartIncrementalImportMutation, TError, StartIncrementalImportMutationVariables, TContext>) => {
    
    return useMutation<StartIncrementalImportMutation, TError, StartIncrementalImportMutationVariables, TContext>(
      {
    mutationKey: ['StartIncrementalImport'],
    mutationFn: (variables?: StartIncrementalImportMutationVariables) => fetcher<StartIncrementalImportMutation, StartIncrementalImportMutationVariables>(StartIncrementalImportDocument, variables)(),
    ...options
  }
    )};


useStartIncrementalImportMutation.fetcher = (variables: StartIncrementalImportMutationVariables, options?: RequestInit['headers']) => fetcher<StartIncrementalImportMutation, StartIncrementalImportMutationVariables>(StartIncrementalImportDocument, variables, options);

export const GetJobResultStatisticsDocument = `
    query GetJobResultStatistics {
  getJobResultStatistics {
    sessionId
    earliestTimestamp
    completedJobs
    failedJobs
  }
}
    `;

export const useGetJobResultStatisticsQuery = <
      TData = GetJobResultStatisticsQuery,
      TError = unknown
    >(
      variables?: GetJobResultStatisticsQueryVariables,
      options?: Omit<UseQueryOptions<GetJobResultStatisticsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetJobResultStatisticsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetJobResultStatisticsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetJobResultStatistics'] : ['GetJobResultStatistics', variables],
    queryFn: fetcher<GetJobResultStatisticsQuery, GetJobResultStatisticsQueryVariables>(GetJobResultStatisticsDocument, variables),
    ...options
  }
    )};

useGetJobResultStatisticsQuery.getKey = (variables?: GetJobResultStatisticsQueryVariables) => variables === undefined ? ['GetJobResultStatistics'] : ['GetJobResultStatistics', variables];

export const useInfiniteGetJobResultStatisticsQuery = <
      TData = InfiniteData<GetJobResultStatisticsQuery>,
      TError = unknown
    >(
      variables: GetJobResultStatisticsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetJobResultStatisticsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetJobResultStatisticsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetJobResultStatisticsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetJobResultStatistics.infinite'] : ['GetJobResultStatistics.infinite', variables],
      queryFn: (metaData) => fetcher<GetJobResultStatisticsQuery, GetJobResultStatisticsQueryVariables>(GetJobResultStatisticsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetJobResultStatisticsQuery.getKey = (variables?: GetJobResultStatisticsQueryVariables) => variables === undefined ? ['GetJobResultStatistics.infinite'] : ['GetJobResultStatistics.infinite', variables];


useGetJobResultStatisticsQuery.fetcher = (variables?: GetJobResultStatisticsQueryVariables, options?: RequestInit['headers']) => fetcher<GetJobResultStatisticsQuery, GetJobResultStatisticsQueryVariables>(GetJobResultStatisticsDocument, variables, options);

export const GetActiveImportSessionDocument = `
    query GetActiveImportSession {
  getActiveImportSession {
    sessionId
    type
    status
    startedAt
    completedAt
    directoryPath
    stats {
      totalFiles
      filesQueued
      filesProcessed
      filesSucceeded
      filesFailed
    }
  }
}
    `;

export const useGetActiveImportSessionQuery = <
      TData = GetActiveImportSessionQuery,
      TError = unknown
    >(
      variables?: GetActiveImportSessionQueryVariables,
      options?: Omit<UseQueryOptions<GetActiveImportSessionQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetActiveImportSessionQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetActiveImportSessionQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetActiveImportSession'] : ['GetActiveImportSession', variables],
    queryFn: fetcher<GetActiveImportSessionQuery, GetActiveImportSessionQueryVariables>(GetActiveImportSessionDocument, variables),
    ...options
  }
    )};

useGetActiveImportSessionQuery.getKey = (variables?: GetActiveImportSessionQueryVariables) => variables === undefined ? ['GetActiveImportSession'] : ['GetActiveImportSession', variables];

export const useInfiniteGetActiveImportSessionQuery = <
      TData = InfiniteData<GetActiveImportSessionQuery>,
      TError = unknown
    >(
      variables: GetActiveImportSessionQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetActiveImportSessionQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetActiveImportSessionQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetActiveImportSessionQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetActiveImportSession.infinite'] : ['GetActiveImportSession.infinite', variables],
      queryFn: (metaData) => fetcher<GetActiveImportSessionQuery, GetActiveImportSessionQueryVariables>(GetActiveImportSessionDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetActiveImportSessionQuery.getKey = (variables?: GetActiveImportSessionQueryVariables) => variables === undefined ? ['GetActiveImportSession.infinite'] : ['GetActiveImportSession.infinite', variables];


useGetActiveImportSessionQuery.fetcher = (variables?: GetActiveImportSessionQueryVariables, options?: RequestInit['headers']) => fetcher<GetActiveImportSessionQuery, GetActiveImportSessionQueryVariables>(GetActiveImportSessionDocument, variables, options);

export const GetLibraryComicsDocument = `
    query GetLibraryComics($page: Int, $limit: Int, $search: String, $series: String) {
  comics(page: $page, limit: $limit, search: $search, series: $series) {
    comics {
      id
      inferredMetadata {
        issue {
          name
          number
          year
          subtitle
        }
      }
      rawFileDetails {
        name
        filePath
        fileSize
        extension
        mimeType
        pageCount
        archive {
          uncompressed
        }
        cover {
          filePath
        }
      }
      sourcedMetadata {
        comicvine
        comicInfo
        locg {
          name
          publisher
          cover
        }
      }
      canonicalMetadata {
        title {
          value
        }
        series {
          value
        }
        issueNumber {
          value
        }
        publisher {
          value
        }
        pageCount {
          value
        }
      }
      importStatus {
        isImported
        tagged
      }
      createdAt
      updatedAt
    }
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      currentPage
      totalPages
    }
  }
}
    `;

export const useGetLibraryComicsQuery = <
      TData = GetLibraryComicsQuery,
      TError = unknown
    >(
      variables?: GetLibraryComicsQueryVariables,
      options?: Omit<UseQueryOptions<GetLibraryComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GetLibraryComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GetLibraryComicsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetLibraryComics'] : ['GetLibraryComics', variables],
    queryFn: fetcher<GetLibraryComicsQuery, GetLibraryComicsQueryVariables>(GetLibraryComicsDocument, variables),
    ...options
  }
    )};

useGetLibraryComicsQuery.getKey = (variables?: GetLibraryComicsQueryVariables) => variables === undefined ? ['GetLibraryComics'] : ['GetLibraryComics', variables];

export const useInfiniteGetLibraryComicsQuery = <
      TData = InfiniteData<GetLibraryComicsQuery>,
      TError = unknown
    >(
      variables: GetLibraryComicsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GetLibraryComicsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GetLibraryComicsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GetLibraryComicsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetLibraryComics.infinite'] : ['GetLibraryComics.infinite', variables],
      queryFn: (metaData) => fetcher<GetLibraryComicsQuery, GetLibraryComicsQueryVariables>(GetLibraryComicsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetLibraryComicsQuery.getKey = (variables?: GetLibraryComicsQueryVariables) => variables === undefined ? ['GetLibraryComics.infinite'] : ['GetLibraryComics.infinite', variables];


useGetLibraryComicsQuery.fetcher = (variables?: GetLibraryComicsQueryVariables, options?: RequestInit['headers']) => fetcher<GetLibraryComicsQuery, GetLibraryComicsQueryVariables>(GetLibraryComicsDocument, variables, options);
