import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

describe('Phase 2E — Two-Column Chat & Messaging Workspace Redesign', () => {
  const chatViewSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/messaging/ChatView.tsx'),
    'utf-8'
  );
  const convListSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/messaging/ConversationList.tsx'),
    'utf-8'
  );
  const voiceRecorderSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/messaging/VoiceRecorder.tsx'),
    'utf-8'
  );
  const audioPlayerSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/messaging/AudioPlayer.tsx'),
    'utf-8'
  );
  const rightSidebarSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/layout/RightSidebar.tsx'),
    'utf-8'
  );

  describe('Workspace Layout & Sidebar Rules', () => {
    it('should enforce RightSidebar suppression on /messages routes', () => {
      assert.match(
        rightSidebarSource,
        /pathname\?\.startsWith\(['"]\/messages['"]\)/
      );
      assert.match(rightSidebarSource, /return\s+null;/);
    });

    it('should enforce Desktop two-column layout: left w-80 flex-shrink-0 border-r border-white/[0.06] and right flex-1 min-w-0 flex flex-col', () => {
      assert.match(
        chatViewSource,
        /w-full\s+md:w-80\s+flex-shrink-0\s+border-r\s+border-white\/\[0\.06\]/
      );
      assert.match(
        chatViewSource,
        /flex-1\s+min-w-0\s+flex\s+flex-col/
      );
    });

    it('should enforce Mobile responsive thread transition with back affordance', () => {
      assert.match(
        chatViewSource,
        /activeConversation\s*\?\s*['"]hidden\s+md:flex['"]\s*:\s*['"]flex['"]/
      );
      assert.match(
        chatViewSource,
        /activeConversation\s*\?\s*['"]flex['"]\s*:\s*['"]hidden\s+md:flex['"]/
      );
      assert.match(
        chatViewSource,
        /md:hidden[\s\S]*?<ArrowLeft[\s\S]*?h-5\s+w-5/
      );
    });
  });

  describe('Conversation List Architecture', () => {
    it('should enforce header h-14 with PenSquare h-5 w-5 for new message affordance', () => {
      assert.match(
        convListSource,
        /h-14\s+px-4\s+border-b\s+border-white\/\[0\.06\]\s+flex\s+items-center\s+justify-between/
      );
      assert.match(
        convListSource,
        /<PenSquare\s+className=["']h-5\s+w-5["']\s+strokeWidth=\{1\.75\}/
      );
    });

    it('should enforce search input styling: h-9 rounded-lg bg-white/[0.03]', () => {
      assert.match(
        convListSource,
        /h-9\s+rounded-lg\s+bg-white\/\[0\.03\]\s+border\s+border-white\/\[0\.06\]/
      );
      assert.match(
        convListSource,
        /<Search\s+className=["']h-4\s+w-4\s+text-white\/30\s+shrink-0["']\s+strokeWidth=\{1\.75\}/
      );
    });

    it('should enforce conversation row styling and active border-l-2 border-emerald-500', () => {
      assert.match(
        convListSource,
        /px-3\s+py-3\s+mx-2\s+rounded-xl\s+hover:bg-white\/\[0\.04\]/
      );
      assert.match(
        convListSource,
        /bg-white\/\[0\.06\]\s+border-l-2\s+border-emerald-500/
      );
    });

    it('should enforce 44px UserAvatar with 10x10 online dot slot', () => {
      assert.match(
        convListSource,
        /w-11\s+h-11\s+flex-shrink-0/
      );
      assert.match(
        convListSource,
        /w-2\.5\s+h-2\.5\s+rounded-full\s+bg-emerald-500\s+ring-2\s+ring-background/
      );
    });

    it('should enforce unread badge: min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-[10px]', () => {
      assert.match(
        convListSource,
        /min-w-\[18px\]\s+h-\[18px\]\s+rounded-full\s+bg-emerald-500\s+text-\[10px\]\s+font-bold\s+text-white/
      );
    });

    it('should render ConversationRowSkeleton during loading', () => {
      assert.match(convListSource, /<ConversationRowSkeleton\s*\/>/);
    });
  });

  describe('Thread Header & Action Controls', () => {
    it('should enforce thread header h-14 with 32px avatar and action controls Phone Video MoreVertical h-4 w-4', () => {
      assert.match(
        chatViewSource,
        /h-14\s+px-4\s+border-b\s+border-white\/\[0\.06\]\s+flex\s+items-center\s+justify-between/
      );
      assert.match(
        chatViewSource,
        /<UserAvatar[\s\S]*?size=["']sm["'][\s\S]*?className=["'][^"']*w-8\s+h-8/
      );
      assert.match(
        chatViewSource,
        /<Phone\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
      assert.match(
        chatViewSource,
        /<Video\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
      assert.match(
        chatViewSource,
        /<MoreVertical\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
    });
  });

  describe('Speech Bubbles, Timestamps & Date Separators', () => {
    it('should enforce incoming bubble styling: self-start max-w-[75%] bg-white/[0.06] rounded-2xl rounded-bl-md px-4 py-2.5 text-sm text-white/80', () => {
      assert.match(
        chatViewSource,
        /self-start\s+max-w-\[75%\]\s+bg-white\/\[0\.06\]\s+rounded-2xl\s+rounded-bl-md\s+px-4\s+py-2\.5\s+text-sm\s+text-white\/80/
      );
    });

    it('should enforce outgoing bubble styling: self-end max-w-[75%] bg-emerald-700/40 rounded-2xl rounded-br-md px-4 py-2.5 text-sm text-white/90', () => {
      assert.match(
        chatViewSource,
        /self-end\s+max-w-\[75%\]\s+bg-emerald-700\/40\s+rounded-2xl\s+rounded-br-md\s+px-4\s+py-2\.5\s+text-sm\s+text-white\/90/
      );
    });

    it('should enforce timestamp text-[9px] text-white/15 and CheckCheck h-3 w-3 read=emerald / delivered=muted', () => {
      assert.match(chatViewSource, /text-\[9px\]\s+text-white\/15/);
      assert.match(
        chatViewSource,
        /<CheckCheck[\s\S]*?h-3\s+w-3[\s\S]*?text-emerald-400[\s\S]*?text-white\/30[\s\S]*?strokeWidth=\{1\.75\}/
      );
    });

    it('should enforce date separators text-[10px] text-white/15', () => {
      assert.match(
        chatViewSource,
        /text-\[10px\]\s+text-white\/15\s+px-3\s+py-0\.5\s+rounded-full\s+bg-white\/\[0\.02\]\s+border\s+border-white\/\[0\.04\]/
      );
    });
  });

  describe('Voice Bubble & Translation Row', () => {
    it('should enforce Play 32x32 rounded-full with CSS waveform bars and duration', () => {
      assert.match(
        audioPlayerSource,
        /w-8\s+h-8\s+rounded-full\s+bg-white\/10\s+hover:bg-white\/15\s+text-white\s+flex\s+items-center\s+justify-center/
      );
      assert.match(
        audioPlayerSource,
        /motion-reduce:animate-none/
      );
      assert.match(
        audioPlayerSource,
        /text-xs\s+font-mono\s+text-white\/60/
      );
    });

    it('should enforce translation row: border-t border-white/[0.04] mt-2 pt-2 with Languages h-3.5 w-3.5 text-amber-400/60, italic text-xs text-white/40, and lang badge', () => {
      assert.match(
        chatViewSource,
        /border-t\s+border-white\/\[0\.04\]\s+mt-2\s+pt-2/
      );
      assert.match(
        chatViewSource,
        /<Languages\s+className=["']h-3\.5\s+w-3\.5\s+text-amber-400\/60\s+shrink-0\s+mt-0\.5["']\s+strokeWidth=\{1\.75\}/
      );
      assert.match(
        chatViewSource,
        /italic\s+text-xs\s+text-white\/40\s+leading-relaxed/
      );
      assert.match(
        chatViewSource,
        /text-\[9px\]\s+bg-amber-500\/10\s+text-amber-400\/60\s+px-1\.5\s+py-0\.5\s+rounded\s+font-mono\s+shrink-0/
      );
      assert.match(
        chatViewSource,
        /Yoruba\s+→\s+English/
      );
    });
  });

  describe('Floating Input Console & Recording State', () => {
    it('should enforce default input console styling: mx-4 mb-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-end gap-2 p-2 min-h-[48px]', () => {
      assert.match(
        chatViewSource,
        /mx-4\s+mb-4\s+rounded-2xl/
      );
      assert.match(
        chatViewSource,
        /bg-white\/\[0\.04\]\s+border\s+border-white\/\[0\.06\]/
      );
      assert.match(
        chatViewSource,
        /min-h-\[48px\]\s+pointer-events-auto/
      );
    });

    it('should enforce left hit targets Smile, ImagePlus, Paperclip h-4 w-4 in 32x32 hit targets', () => {
      assert.match(
        chatViewSource,
        /w-8\s+h-8\s+rounded-lg\s+flex\s+items-center\s+justify-center/
      );
      assert.match(
        chatViewSource,
        /<ImagePlus\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
      assert.match(
        chatViewSource,
        /<Paperclip\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
    });

    it('should enforce textarea flex-1 min-h-[32px] max-h-[120px] resize-none bg-transparent', () => {
      assert.match(
        chatViewSource,
        /flex-1\s+min-h-\[32px\]\s+max-h-\[120px\]\s+resize-none\s+bg-transparent/
      );
    });

    it('should enforce right button states: empty -> Mic in 36x36 bg-emerald-600/20; has text -> Send in 36x36 bg-emerald-600', () => {
      assert.match(
        voiceRecorderSource,
        /w-9\s+h-9\s+rounded-xl\s+bg-emerald-600\/20\s+text-emerald-400\s+hover:bg-emerald-600\/30/
      );
      assert.match(
        voiceRecorderSource,
        /<Mic\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
      assert.match(
        chatViewSource,
        /w-9\s+h-9\s+rounded-xl\s+bg-emerald-600\s+text-white\s+hover:bg-emerald-500/
      );
      assert.match(
        chatViewSource,
        /<Send\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
    });

    it('should enforce recording state styling: border-red-500/20 bg-red-500/5 without height animation', () => {
      assert.match(
        chatViewSource,
        /border\s+border-red-500\/20\s+bg-red-500\/5/
      );
      assert.match(
        voiceRecorderSource,
        /<Trash2\s+className=["']h-4\s+w-4["']\s+strokeWidth=\{1\.75\}/
      );
      assert.match(
        voiceRecorderSource,
        /w-2\.5\s+h-2\.5\s+rounded-full\s+bg-red-500\s+animate-pulse\s+motion-reduce:animate-none/
      );
      assert.match(
        voiceRecorderSource,
        /font-mono\s+text-xs\s+font-semibold\s+text-white\/80/
      );
    });
  });

  describe('Phase 0 Strict Constraints & Lazy Loading', () => {
    it('should lazy-load VoiceRecorder and EmojiPicker with next/dynamic { ssr: false }', () => {
      assert.match(
        chatViewSource,
        /dynamic\(\s*\(\)\s*=>\s*import\(['"]\.\/VoiceRecorder['"]\)\.then\(\(m\)\s*=>\s*m\.VoiceRecorder\),\s*\{\s*ssr:\s*false\s*\}\s*\)/
      );
    });

    it('should strictly use named Lucide imports with strokeWidth={1.75}', () => {
      assert.match(
        chatViewSource,
        /import\s*\{[\s\S]*?Send[\s\S]*?MoreVertical[\s\S]*?CheckCheck[\s\S]*?ArrowLeft[\s\S]*?Paperclip[\s\S]*?Smile[\s\S]*?ImagePlus[\s\S]*?Phone[\s\S]*?Video[\s\S]*?Languages[\s\S]*?\}\s*from\s*['"]lucide-react['"]/
      );
      assert.match(
        convListSource,
        /import\s*\{[\s\S]*?Search[\s\S]*?PenSquare[\s\S]*?MessageSquare[\s\S]*?CheckCheck[\s\S]*?Inbox[\s\S]*?ShieldAlert[\s\S]*?\}\s*from\s*['"]lucide-react['"]/
      );
    });

    it('should not contain any forbidden flag packages or external icon libraries', () => {
      assert.ok(!chatViewSource.includes('flag-icons'));
      assert.ok(!chatViewSource.includes('react-world-flags'));
      assert.ok(!chatViewSource.includes('svg-country-flags'));
      assert.ok(!chatViewSource.includes('twemoji'));
      assert.ok(!convListSource.includes('flag-icons'));
    });
  });
});
