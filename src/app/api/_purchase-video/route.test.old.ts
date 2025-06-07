import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock the entire prisma module
vi.mock('@/lib/prisma', () => {
  return {
    default: {
      user: {
        findFirst: vi.fn()
      },
      video: {
        findFirst: vi.fn()
      },
      purchasedVideo: {
        findUnique: vi.fn(),
        create: vi.fn()
      }
    }
  };
});

vi.mock('next/server', async (importOriginal) => {
  const mod = await importOriginal<typeof import('next/server')>();
  return {
    ...mod,
    NextResponse: {
      ...mod.NextResponse,
      json: vi.fn((body, options) => ({
        // Mock the json static method
        json: async () => body,
        status: options?.status || 200,
        headers: new Headers(options?.headers),
        ok: (options?.status || 200) >= 200 && (options?.status || 200) < 300
      }))
    }
  };
});

const prismaImport = await import('@/lib/prisma');
const mockPrisma = prismaImport.default as unknown as {
  user: { findFirst: ReturnType<typeof vi.fn> };
  video: { findFirst: ReturnType<typeof vi.fn> };
  purchasedVideo: {
    findUnique: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
};

// Helper to create a mock Request object
const createMockRequest = (body: Record<string, unknown>): Request => {
  const request = new Request('http://localhost/api/purchase', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  // Mock the json() method for the Request object
  request.json = async () => body;
  return request;
};

describe('POST /api/purchase', () => {
  const clerkId = 'user_clerk_123';
  const videoId = 'vid_yt_456';
  const price = 9.99;
  const userId = 'db_user_abc';
  const dbVideoId = 'db_video_xyz';

  // Reset mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should successfully create a purchase record (201 Created)', async () => {
    const mockRequestBody = { clerkId, videoId, price };
    const mockRequest = createMockRequest(mockRequestBody);
    const expectedPurchase = {
      id: 'purchase_123',
      video: { videoId: videoId }
    };

    mockPrisma.user.findFirst.mockResolvedValue({ id: userId });
    mockPrisma.video.findFirst.mockResolvedValue({ id: dbVideoId });
    mockPrisma.purchasedVideo.findUnique.mockResolvedValue(null);
    mockPrisma.purchasedVideo.create.mockResolvedValue(expectedPurchase);

    await POST(mockRequest);

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { clerkId },
      select: { id: true }
    });
    expect(mockPrisma.video.findFirst).toHaveBeenCalledWith({
      where: { videoId },
      select: { id: true }
    });
    expect(mockPrisma.purchasedVideo.findUnique).toHaveBeenCalledWith({
      where: { userId_videoId: { userId, videoId: dbVideoId } }
    });
    expect(mockPrisma.purchasedVideo.create).toHaveBeenCalledWith({
      data: { userId, videoId: dbVideoId, price },
      select: { id: true, video: { select: { videoId: true } } }
    });
    expect(NextResponse.json).toHaveBeenCalledWith(expectedPurchase, {
      status: 201
    });
  });

  it('should return 400 if a required field (e.g., clerkId) is missing', async () => {
    const mockRequestBody = { videoId, price }; // Missing clerkId
    const mockRequest = createMockRequest(mockRequestBody);

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Missing required fields' },
      { status: 400 }
    );
    expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
  });

  it('should return 404 if the user is not found', async () => {
    const mockRequestBody = { clerkId, videoId, price };
    const mockRequest = createMockRequest(mockRequestBody);

    mockPrisma.user.findFirst.mockResolvedValue(null); // User not found

    await POST(mockRequest);

    expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
      where: { clerkId },
      select: { id: true }
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'User not found' },
      { status: 404 }
    );
    expect(mockPrisma.video.findFirst).not.toHaveBeenCalled();
  });

  it('should return 409 if the video has already been purchased by the user', async () => {
    const mockRequestBody = { clerkId, videoId, price };
    const mockRequest = createMockRequest(mockRequestBody);
    const existingPurchase = {
      id: 'existing_p_id',
      userId,
      videoId: dbVideoId,
      purchasedAt: new Date(),
      price
    };

    mockPrisma.user.findFirst.mockResolvedValue({ id: userId });
    mockPrisma.video.findFirst.mockResolvedValue({ id: dbVideoId });
    mockPrisma.purchasedVideo.findUnique.mockResolvedValue(existingPurchase); // Purchase exists

    await POST(mockRequest);

    expect(mockPrisma.purchasedVideo.findUnique).toHaveBeenCalledWith({
      where: { userId_videoId: { userId, videoId: dbVideoId } }
    });
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Video already purchased' },
      { status: 409 }
    );
    expect(mockPrisma.purchasedVideo.create).not.toHaveBeenCalled();
  });

  it('should return 500 if the database create operation fails', async () => {
    const mockRequestBody = { clerkId, videoId, price };
    const mockRequest = createMockRequest(mockRequestBody);
    const dbError = new Error('Failed to insert record');

    mockPrisma.user.findFirst.mockResolvedValue({ id: userId });
    mockPrisma.video.findFirst.mockResolvedValue({ id: dbVideoId });
    mockPrisma.purchasedVideo.findUnique.mockResolvedValue(null); // Not already purchased
    mockPrisma.purchasedVideo.create.mockRejectedValue(dbError); // Simulate DB error on create

    await POST(mockRequest);

    expect(mockPrisma.purchasedVideo.create).toHaveBeenCalled(); // Attempted to create
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: `Purchase failed: ${dbError.message}` },
      { status: 500 }
    );
  });
});
