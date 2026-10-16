import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mediaService, MEDIA_LIMITS } from '../mediaService.ts';
import { apiClient, ApiError } from '../apiClient.ts';

describe('mediaService - Pre-signed S3 Media Pipeline & Validation', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    apiClient.clearTokens();
    apiClient.setBaseURL('http://localhost:4000/api/v1');
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('1. Pre-flight validation: rejects file exceeding avatar size limit (5MB)', () => {
    const oversizedFile = {
      name: 'large_avatar.png',
      type: 'image/png',
      size: 6 * 1024 * 1024, // 6MB
    };

    let thrownError: any = null;
    try {
      mediaService.validateFile(oversizedFile, 'avatar');
    } catch (err: any) {
      thrownError = err;
    }

    assert.ok(thrownError instanceof ApiError);
    assert.equal(thrownError.code, 'FILE_TOO_LARGE');
    assert.equal(thrownError.status, 400);
    assert.ok(thrownError.message.includes('exceeds maximum allowed limit'));
  });

  it('2. Pre-flight validation: rejects unsupported MIME types', () => {
    const invalidFiles = [
      { name: 'document.pdf', type: 'application/pdf', size: 1024 },
      { name: 'script.js', type: 'text/javascript', size: 500 },
      { name: 'malware.exe', type: 'application/x-msdownload', size: 2048 },
    ];

    for (const file of invalidFiles) {
      let thrownError: any = null;
      try {
        mediaService.validateFile(file, 'avatar');
      } catch (err: any) {
        thrownError = err;
      }

      assert.ok(thrownError instanceof ApiError);
      assert.equal(thrownError.code, 'INVALID_FILE_TYPE');
      assert.equal(thrownError.status, 400);
    }
  });

  it('3. Pre-flight validation: accepts valid image types within size bounds', () => {
    const validFiles = [
      { name: 'photo.jpg', type: 'image/jpeg', size: 2 * 1024 * 1024 },
      { name: 'avatar.png', type: 'image/png', size: 1.5 * 1024 * 1024 },
      { name: 'picture.webp', type: 'image/webp', size: 800 * 1024 },
    ];

    for (const file of validFiles) {
      assert.doesNotThrow(() => {
        mediaService.validateFile(file, 'avatar');
      });
    }
  });

  it('4. Pre-signed URL payload construction: correctly formats request to /media/upload-url', async () => {
    let capturedUrl = '';
    let capturedOptions: any = null;

    const mockResponseEnvelope = {
      data: {
        uploadUrl: 'https://s3.af-south-1.amazonaws.com/afrilink-media/avatars/user-123.jpg?X-Amz-Signature=xyz',
        fileUrl: 'https://cdn.afrilink.africa/avatars/user-123.jpg',
        assetId: 'asset-999',
      },
      meta: null,
      error: null,
    };

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      capturedUrl = url.toString();
      capturedOptions = options;
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponseEnvelope),
        clone: () => ({
          text: async () => JSON.stringify(mockResponseEnvelope),
        }),
      } as any;
    }) as any;

    const result = await mediaService.getPreSignedUploadUrl({
      fileName: 'kwame_avatar.jpg',
      fileType: 'image/jpeg',
      sizeBytes: 102400,
      purpose: 'avatar',
    });

    assert.equal(capturedUrl, 'http://localhost:4000/api/v1/media/upload-url');
    assert.equal(capturedOptions?.method, 'POST');

    const parsedBody = JSON.parse(capturedOptions?.body);
    assert.equal(parsedBody.fileName, 'kwame_avatar.jpg');
    assert.equal(parsedBody.fileType, 'image/jpeg');
    assert.equal(parsedBody.sizeBytes, 102400);
    assert.equal(parsedBody.purpose, 'avatar');

    assert.equal(result.uploadUrl, mockResponseEnvelope.data.uploadUrl);
    assert.equal(result.fileUrl, mockResponseEnvelope.data.fileUrl);
  });

  it('5. End-to-end avatar pipeline: validates, requests pre-signed URL, streams binary, and updates profile', async () => {
    const mockFileUrl = 'https://cdn.afrilink.africa/avatars/avatar-verified.webp';
    const mockPreSignedUrl = 'https://s3.amazonaws.com/bucket/avatar.webp?presigned';

    const progressRecords: number[] = [];

    global.fetch = (async (url: string | URL, options?: RequestInit) => {
      const urlStr = url.toString();

      // Step 1: Request pre-signed URL
      if (urlStr.includes('/media/upload-url')) {
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              data: { uploadUrl: mockPreSignedUrl, fileUrl: mockFileUrl },
              meta: null,
              error: null,
            }),
          clone: () => ({
            text: async () =>
              JSON.stringify({
                data: { uploadUrl: mockPreSignedUrl, fileUrl: mockFileUrl },
                meta: null,
                error: null,
              }),
          }),
        };
      }

      // Step 2: Binary S3 PUT
      if (urlStr.includes('presigned')) {
        assert.equal(options?.method, 'PUT');
        assert.equal((options?.headers as any)?.['Content-Type'], 'image/webp');
        return {
          ok: true,
          status: 200,
          text: async () => '',
        };
      }

      // Step 3: Register avatar on user profile
      if (urlStr.includes('/profiles/me/avatar')) {
        assert.equal(options?.method, 'PUT');
        const body = JSON.parse(options?.body as string);
        assert.equal(body.avatarUrl, mockFileUrl);
        return {
          ok: true,
          status: 200,
          text: async () =>
            JSON.stringify({
              data: { success: true },
              meta: null,
              error: null,
            }),
          clone: () => ({
            text: async () =>
              JSON.stringify({
                data: { success: true },
                meta: null,
                error: null,
              }),
          }),
        };
      }

      return {
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Not found' } }),
      };
    }) as any;

    const mockBlob = new Blob(['sample-image-binary-data'], { type: 'image/webp' });

    const finalUrl = await mediaService.uploadAvatar(mockBlob, 'test_avatar.webp', {
      onProgress: (percent) => progressRecords.push(percent),
    });

    assert.equal(finalUrl, mockFileUrl);
    assert.ok(progressRecords.length >= 2);
    assert.ok(progressRecords.includes(100));
  });
});
