import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { Import } from './Import';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.MockedFunction<any>;

// Mock zustand store
const mockGetSocket = jest.fn();
const mockDisconnectSocket = jest.fn();
const mockSetStatus = jest.fn();

jest.mock('../../store', () => ({
  useStore: jest.fn((selector: any) =>
    selector({
      importJobQueue: {
        status: 'drained',
        successfulJobCount: 0,
        failedJobCount: 0,
        mostRecentImport: '',
        setStatus: mockSetStatus,
      },
      getSocket: mockGetSocket,
      disconnectSocket: mockDisconnectSocket,
    })
  ),
}));

// Mock socket.io-client
const mockSocket = {
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

mockGetSocket.mockReturnValue(mockSocket);

// Helper function to create a wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Import Component - Numerical Indices', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should display numerical indices in the Past Imports table', async () => {
    // Mock API response with 3 import sessions
    const mockData = [
      {
        sessionId: 'session-1',
        earliestTimestamp: '2024-01-01T10:00:00Z',
        completedJobs: 5,
        failedJobs: 0
      },
      {
        sessionId: 'session-2',
        earliestTimestamp: '2024-01-02T10:00:00Z',
        completedJobs: 3,
        failedJobs: 1
      },
      {
        sessionId: 'session-3',
        earliestTimestamp: '2024-01-03T10:00:00Z',
        completedJobs: 8,
        failedJobs: 2
      },
    ];

    (axios as any).mockResolvedValue({ data: mockData });
    (axios.request as jest.Mock) = jest.fn().mockResolvedValue({ data: {} });

    render(<Import path="/test" />, { wrapper: createWrapper() });

    // Wait for the "Past Imports" heading to appear
    await waitFor(() => {
      expect(screen.getByText('Past Imports')).toBeInTheDocument();
    });

    // Verify that the "#" column header exists
    expect(screen.getByText('#')).toBeInTheDocument();

    // Verify that numerical indices (1, 2, 3) are displayed in the first column of each row
    const rows = screen.getAllByRole('row');
    // Skip header row (index 0), check data rows
    expect(rows[1].querySelectorAll('td')[0]).toHaveTextContent('1');
    expect(rows[2].querySelectorAll('td')[0]).toHaveTextContent('2');
    expect(rows[3].querySelectorAll('td')[0]).toHaveTextContent('3');
  });

  test('should display correct indices for larger datasets', async () => {
    // Mock API response with 10 import sessions
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      sessionId: `session-${i + 1}`,
      earliestTimestamp: `2024-01-${String(i + 1).padStart(2, '0')}T10:00:00Z`,
      completedJobs: i + 1,
      failedJobs: 0,
    }));

    (axios as any).mockResolvedValue({ data: mockData });
    (axios.request as jest.Mock) = jest.fn().mockResolvedValue({ data: {} });

    render(<Import path="/test" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Past Imports')).toBeInTheDocument();
    });

    // Verify indices 1 through 10 are present in the first column
    const rows = screen.getAllByRole('row');
    // Skip header row (index 0)
    for (let i = 1; i <= 10; i++) {
      const row = rows[i];
      const cells = row.querySelectorAll('td');
      expect(cells[0]).toHaveTextContent(i.toString());
    }
  });
});

describe('Import Component - Button Visibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axios as any).mockResolvedValue({ data: [] });
    (axios.request as jest.Mock) = jest.fn().mockResolvedValue({ data: {} });
  });

  test('should show Start Import button when queue status is drained', async () => {
    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: 'drained',
          successfulJobCount: 0,
          failedJobCount: 0,
          mostRecentImport: '',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Start Import')).toBeInTheDocument();
    });

    // Verify Pause and Resume buttons are NOT visible
    expect(screen.queryByText('Pause')).not.toBeInTheDocument();
    expect(screen.queryByText('Resume')).not.toBeInTheDocument();
  });

  test('should show Start Import button when queue status is undefined', async () => {
    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: undefined,
          successfulJobCount: 0,
          failedJobCount: 0,
          mostRecentImport: '',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Start Import')).toBeInTheDocument();
    });
  });

  test('should hide Start Import button and show Pause button when queue is running', async () => {
    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: 'running',
          successfulJobCount: 5,
          failedJobCount: 1,
          mostRecentImport: 'Comic #123',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText('Start Import')).not.toBeInTheDocument();
      expect(screen.getByText('Pause')).toBeInTheDocument();
    });

    // Verify Import Activity section is visible
    expect(screen.getByText('Import Activity')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // successful count
    expect(screen.getByText('1')).toBeInTheDocument(); // failed count
  });

  test('should hide Start Import button and show Resume button when queue is paused', async () => {
    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: 'paused',
          successfulJobCount: 3,
          failedJobCount: 0,
          mostRecentImport: 'Comic #456',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.queryByText('Start Import')).not.toBeInTheDocument();
      expect(screen.getByText('Resume')).toBeInTheDocument();
    });
  });
});

describe('Import Component - SessionId and Socket Reconnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    localStorage.clear();
    (axios as any).mockResolvedValue({ data: [] });
    (axios.request as jest.Mock) = jest.fn().mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should clear sessionId and reconnect socket when starting import after queue is drained', async () => {
    // Setup: Set old sessionId in localStorage
    localStorage.setItem('sessionId', 'old-session-id');

    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: 'drained',
          successfulJobCount: 0,
          failedJobCount: 0,
          mostRecentImport: '',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    // Click the "Start Import" button
    const startButton = await screen.findByText('Start Import');
    fireEvent.click(startButton);

    // Verify sessionId is cleared immediately
    expect(localStorage.getItem('sessionId')).toBeNull();

    // Verify disconnectSocket is called
    expect(mockDisconnectSocket).toHaveBeenCalledWith('/');

    // Fast-forward 100ms
    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    // Verify getSocket is called after 100ms
    await waitFor(() => {
      expect(mockGetSocket).toHaveBeenCalledWith('/');
    });

    // Fast-forward another 500ms
    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Verify initiateImport is called and status is set to running
    await waitFor(() => {
      expect(axios.request).toHaveBeenCalledWith({
        url: 'http://localhost:3000/api/library/newImport',
        method: 'POST',
        data: { sessionId: null },
      });
      expect(mockSetStatus).toHaveBeenCalledWith('running');
    });
  });

  test('should NOT clear sessionId when starting import with undefined status', async () => {
    // Setup: Set existing sessionId in localStorage
    localStorage.setItem('sessionId', 'existing-session-id');

    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: undefined,
          successfulJobCount: 0,
          failedJobCount: 0,
          mostRecentImport: '',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    // Click the "Start Import" button
    const startButton = await screen.findByText('Start Import');
    fireEvent.click(startButton);

    // Verify sessionId is NOT cleared
    expect(localStorage.getItem('sessionId')).toBe('existing-session-id');

    // Verify disconnectSocket is NOT called
    expect(mockDisconnectSocket).not.toHaveBeenCalled();

    // Verify status is set to running immediately
    expect(mockSetStatus).toHaveBeenCalledWith('running');

    // Verify initiateImport is called immediately (no delay)
    await waitFor(() => {
      expect(axios.request).toHaveBeenCalledWith({
        url: 'http://localhost:3000/api/library/newImport',
        method: 'POST',
        data: { sessionId: 'existing-session-id' },
      });
    });
  });
});

describe('Import Component - Real-time Updates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (axios as any).mockResolvedValue({ data: [] });
    (axios.request as jest.Mock) = jest.fn().mockResolvedValue({ data: {} });
  });

  test('should refetch table data when LS_COVER_EXTRACTED event is received', async () => {
    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: 'running',
          successfulJobCount: 0,
          failedJobCount: 0,
          mostRecentImport: '',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    // Wait for component to mount and socket listeners to be attached
    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('LS_COVER_EXTRACTED', expect.any(Function));
    });

    // Get the event handler that was registered
    const coverExtractedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'LS_COVER_EXTRACTED'
    )?.[1];

    // Clear previous axios calls
    (axios as any).mockClear();

    // Simulate the socket event
    if (coverExtractedHandler) {
      coverExtractedHandler();
    }

    // Verify that the API is called again (refetch)
    await waitFor(() => {
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'http://localhost:3000/api/jobqueue/getJobResultStatistics',
        })
      );
    });
  });

  test('should refetch table data when LS_IMPORT_QUEUE_DRAINED event is received', async () => {
    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: 'running',
          successfulJobCount: 0,
          failedJobCount: 0,
          mostRecentImport: '',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    render(<Import path="/test" />, { wrapper: createWrapper() });

    // Wait for component to mount and socket listeners to be attached
    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalledWith('LS_IMPORT_QUEUE_DRAINED', expect.any(Function));
    });

    // Get the event handler that was registered
    const queueDrainedHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === 'LS_IMPORT_QUEUE_DRAINED'
    )?.[1];

    // Clear previous axios calls
    (axios as any).mockClear();

    // Simulate the socket event
    if (queueDrainedHandler) {
      queueDrainedHandler();
    }

    // Verify that the API is called again (refetch)
    await waitFor(() => {
      expect(axios).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: 'http://localhost:3000/api/jobqueue/getJobResultStatistics',
        })
      );
    });
  });

  test('should cleanup socket listeners on unmount', async () => {
    const { useStore } = require('../../store');
    useStore.mockImplementation((selector: any) =>
      selector({
        importJobQueue: {
          status: 'drained',
          successfulJobCount: 0,
          failedJobCount: 0,
          mostRecentImport: '',
          setStatus: mockSetStatus,
        },
        getSocket: mockGetSocket,
        disconnectSocket: mockDisconnectSocket,
      })
    );

    const { unmount } = render(<Import path="/test" />, { wrapper: createWrapper() });

    // Wait for socket listeners to be attached
    await waitFor(() => {
      expect(mockSocket.on).toHaveBeenCalled();
    });

    // Unmount the component
    unmount();

    // Verify that socket listeners are removed
    expect(mockSocket.off).toHaveBeenCalledWith('LS_COVER_EXTRACTED', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('LS_IMPORT_QUEUE_DRAINED', expect.any(Function));
  });
});

export {};
