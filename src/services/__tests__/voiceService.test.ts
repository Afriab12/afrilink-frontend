import { describe, it } from 'node:test';
import assert from 'node:assert';
import { voiceService, MAX_AUDIO_SIZE_BYTES, SUPPORTED_AUDIO_MIME_TYPES } from '../voiceService.ts';
import { ApiError } from '../apiClient.ts';

describe('VoiceService — Voice Recording, Upload Pipeline & Text-to-Speech', () => {
  describe('validateAudioBlob', () => {
    it('should throw VALIDATION_ERROR (400) if blob is null or undefined', () => {
      assert.throws(
        () => {
          voiceService.validateAudioBlob(null as any);
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.strictEqual(err.status, 400);
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if audio blob is empty (0 bytes)', () => {
      const emptyBlob = new Blob([], { type: 'audio/webm' });
      assert.throws(
        () => {
          voiceService.validateAudioBlob(emptyBlob);
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.ok(err.message.includes('empty'));
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if audio blob exceeds 5MB size limit', () => {
      // Mock oversized blob
      const oversizedBlob = {
        size: MAX_AUDIO_SIZE_BYTES + 1024,
        type: 'audio/webm',
      } as unknown as Blob;

      assert.throws(
        () => {
          voiceService.validateAudioBlob(oversizedBlob);
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.ok(err.message.includes('5MB size limit'));
          return true;
        }
      );
    });

    it('should throw VALIDATION_ERROR (400) if audio MIME type is unsupported', () => {
      const unsupportedBlob = new Blob(['sample data'], { type: 'application/pdf' });
      assert.throws(
        () => {
          voiceService.validateAudioBlob(unsupportedBlob);
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.ok(err.message.includes('Unsupported audio format'));
          return true;
        }
      );
    });

    it('should accept valid African voice audio MIME types', () => {
      const validWebm = new Blob(['audio sample data'], { type: 'audio/webm;codecs=opus' });
      assert.doesNotThrow(() => {
        voiceService.validateAudioBlob(validWebm);
      });

      const validMp4 = new Blob(['audio sample data'], { type: 'audio/mp4' });
      assert.doesNotThrow(() => {
        voiceService.validateAudioBlob(validMp4);
      });

      const validOgg = new Blob(['audio sample data'], { type: 'audio/ogg' });
      assert.doesNotThrow(() => {
        voiceService.validateAudioBlob(validOgg);
      });

      const validWav = new Blob(['audio sample data'], { type: 'audio/wav' });
      assert.doesNotThrow(() => {
        voiceService.validateAudioBlob(validWav);
      });
    });
  });

  describe('uploadVoiceMessage', () => {
    it('should throw VALIDATION_ERROR (400) if conversation ID is missing', async () => {
      const blob = new Blob(['audio sample'], { type: 'audio/webm' });
      await assert.rejects(
        async () => {
          await voiceService.uploadVoiceMessage({
            audioBlob: blob,
            conversationId: '',
          });
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          assert.ok(err.message.includes('Conversation ID'));
          return true;
        }
      );
    });

    it('should construct upload payload and return voice message response', async () => {
      const blob = new Blob(['audio binary data'], { type: 'audio/webm' });
      const result = await voiceService.uploadVoiceMessage({
        audioBlob: blob,
        conversationId: 'conv-test-123',
        sourceLanguage: 'yo',
        durationSeconds: 12,
      });

      assert.ok(result);
      assert.ok(result.messageId);
      assert.ok(result.audioUrl);
      assert.strictEqual(result.detectedLanguage, 'yo');
      assert.strictEqual(result.durationSeconds, 12);
    });
  });

  describe('getMessageAudio & Web Speech Synthesis', () => {
    it('should throw VALIDATION_ERROR (400) if messageId is empty', async () => {
      await assert.rejects(
        async () => {
          await voiceService.getMessageAudio('');
        },
        (err: ApiError) => {
          assert.strictEqual(err.code, 'VALIDATION_ERROR');
          return true;
        }
      );
    });

    it('should retrieve audio stream metadata for a valid messageId', async () => {
      const audioInfo = await voiceService.getMessageAudio('msg-audio-456');
      assert.ok(audioInfo);
      assert.ok(typeof audioInfo.durationSeconds === 'number');
      assert.strictEqual(audioInfo.mimeType, 'audio/webm');
    });

    it('should safely report recording and synthesis capability without throwing in Node environment', async () => {
      const supported = voiceService.isRecordingSupported();
      assert.strictEqual(typeof supported, 'boolean');

      const spoke = await voiceService.speakText('Test text', 'en');
      assert.strictEqual(typeof spoke, 'boolean');

      assert.doesNotThrow(() => {
        voiceService.stopSpeaking();
      });
    });
  });
});
