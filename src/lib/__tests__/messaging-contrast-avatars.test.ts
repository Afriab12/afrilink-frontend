import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_USERS, INITIAL_COMMUNITIES } from '../../services/mockBackend.ts';

describe('Prompt 18 — Messaging Light Mode Contrast & Real Avatar Image Pipeline', () => {
  const chatViewSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/messaging/ChatView.tsx'),
    'utf-8'
  );
  const convListSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/messaging/ConversationList.tsx'),
    'utf-8'
  );
  const communityCardSource = fs.readFileSync(
    path.resolve(process.cwd(), 'src/features/communities/CommunityCard.tsx'),
    'utf-8'
  );
  const nextConfigSource = fs.readFileSync(
    path.resolve(process.cwd(), 'next.config.mjs'),
    'utf-8'
  );

  describe('Next.js Image Optimization Configuration', () => {
    it('should configure images.unsplash.com in remotePatterns', () => {
      assert.match(nextConfigSource, /images:\s*\{/);
      assert.match(nextConfigSource, /hostname:\s*['"]images\.unsplash\.com['"]/);
    });
  });

  describe('Real African Avatar Photo Pipeline & Mock Datasets', () => {
    it('should configure Kwame Mensah avatar to high-res African portrait', () => {
      const kwame = INITIAL_USERS.find((u) => u.username === 'kwame_mensah');
      assert.ok(kwame, 'Kwame Mensah must exist in initial users');
      assert.strictEqual(
        kwame.avatarUrl,
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      );
    });

    it('should configure Amina Bello avatar to high-res African portrait', () => {
      const amina = INITIAL_USERS.find((u) => u.username === 'amina_bello');
      assert.ok(amina, 'Amina Bello must exist in initial users');
      assert.strictEqual(
        amina.avatarUrl,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      );
    });

    it('should configure Samuel Kamau avatar to high-res African portrait', () => {
      const samuel = INITIAL_USERS.find((u) => u.username === 'sam_nairobi');
      assert.ok(samuel, 'Samuel Kamau must exist in initial users');
      assert.strictEqual(
        samuel.avatarUrl,
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      );
    });

    it('should configure Tendai Moyo avatar to high-res African portrait', () => {
      const tendai = INITIAL_USERS.find((u) => u.username === 'tendai_moyo');
      assert.ok(tendai, 'Tendai Moyo must exist in initial users');
      assert.strictEqual(
        tendai.avatarUrl,
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      );
    });

    it('should configure AfroTech Innovators community banner and avatar URLs', () => {
      const afrotech = INITIAL_COMMUNITIES.find((c) => c.slug === 'afrotech-innovators');
      assert.ok(afrotech, 'AfroTech Innovators community must exist');
      assert.strictEqual(
        afrotech.bannerUrl,
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'
      );
      assert.strictEqual(
        afrotech.avatarUrl,
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=150&auto=format&fit=crop&q=80'
      );
    });

    it('should configure Amapiano & Afrobeats Global banner and avatar URLs', () => {
      const amapiano = INITIAL_COMMUNITIES.find((c) => c.slug === 'amapiano-afrobeats-global');
      assert.ok(amapiano, 'Amapiano community must exist');
      assert.strictEqual(
        amapiano.bannerUrl,
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'
      );
      assert.strictEqual(
        amapiano.avatarUrl,
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&auto=format&fit=crop&q=80'
      );
    });

    it('should wire bannerUrl and avatarUrl fallbacks in CommunityCard.tsx', () => {
      assert.match(
        communityCardSource,
        /src=\{community\.bannerUrl\s*\|\|\s*community\.coverImage\}/
      );
      assert.match(
        communityCardSource,
        /src=\{community\.avatarUrl\s*\|\|\s*community\.profileImage\}/
      );
    });
  });

  describe('Messaging Light Mode Contrast: ConversationList.tsx', () => {
    it('should enforce container styling: bg-white dark:bg-[#0F1A13] border-r border-slate-200 dark:border-white/10', () => {
      assert.match(
        convListSource,
        /bg-white\s+dark:bg-\[#0F1A13\]\s+border-r\s+border-slate-200\s+dark:border-white\/10/
      );
    });

    it('should enforce header and tab button text contrast: text-slate-900 dark:text-white', () => {
      assert.match(convListSource, /text-slate-900\s+dark:text-white\s+font-sora/);
      assert.match(
        convListSource,
        /text-slate-600\s+dark:text-white\/40\s+hover:text-slate-900\s+dark:hover:text-white\/70/
      );
    });

    it('should enforce search input styling: bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10', () => {
      assert.match(
        convListSource,
        /bg-slate-100\s+dark:bg-white\/5\s+border\s+border-slate-200\s+dark:border-white\/10/
      );
      assert.match(
        convListSource,
        /text-slate-900\s+dark:text-white\s+placeholder:text-slate-400\s+dark:placeholder:text-white\/40/
      );
    });

    it('should enforce row name, preview and timestamp contrast', () => {
      assert.match(convListSource, /text-sm\s+font-semibold\s+text-slate-900\s+dark:text-white\s+truncate/);
      assert.match(convListSource, /text-xs\s+text-slate-500\s+dark:text-white\/40\s+truncate/);
      assert.match(convListSource, /text-\[10px\]\s+text-slate-400\s+dark:text-white\/30\s+shrink-0/);
    });
  });

  describe('Messaging Light Mode Contrast: ChatView.tsx', () => {
    it('should enforce thread container & header: bg-white dark:bg-[#0B130E] border-b border-slate-200 dark:border-white/10', () => {
      assert.match(
        chatViewSource,
        /bg-white\s+dark:bg-\[#0B130E\]\s+backdrop-blur-sm/
      );
      assert.match(
        chatViewSource,
        /border-b\s+border-slate-200\s+dark:border-white\/10/
      );
    });

    it('should enforce recipient name and status text contrast', () => {
      assert.match(
        chatViewSource,
        /text-sm\s+font-semibold\s+text-slate-900\s+dark:text-white\s+hover:text-emerald-600\s+dark:hover:text-emerald-400/
      );
      assert.match(
        chatViewSource,
        /text-\[11px\]\s+text-emerald-600\s+dark:text-emerald-400\s+flex\s+items-center/
      );
    });

    it('should enforce incoming bubble styling: bg-slate-100 text-slate-900 dark:bg-white/[0.06] dark:text-white/90 border border-slate-200 dark:border-white/5', () => {
      assert.match(
        chatViewSource,
        /bg-slate-100\s+text-slate-900\s+dark:bg-white\/\[0\.06\]\s+dark:text-white\/90\s+border\s+border-slate-200\s+dark:border-white\/5/
      );
    });

    it('should enforce outgoing bubble styling: bg-emerald-600 text-white dark:bg-emerald-700/60 dark:text-white', () => {
      assert.match(
        chatViewSource,
        /bg-emerald-600\s+text-white\s+dark:bg-emerald-700\/60\s+dark:text-white/
      );
    });

    it('should enforce timestamps and translation row styling in dual-mode', () => {
      assert.match(chatViewSource, /text-\[10px\]\s+text-slate-500\s+dark:text-white\/40/);
      assert.match(
        chatViewSource,
        /border-t\s+border-slate-200\s+dark:border-white\/10\s+mt-2\s+pt-2\s+flex\s+items-start\s+gap-2\s+text-slate-600\s+dark:text-white\/60/
      );
    });

    it('should enforce floating input console dual-mode contrast styling', () => {
      assert.match(
        chatViewSource,
        /bg-slate-100\s+dark:bg-white\/\[0\.04\]\s+border\s+border-slate-200\s+dark:border-white\/10/
      );
      assert.match(
        chatViewSource,
        /text-slate-900\s+dark:text-white\s+placeholder:text-slate-400\s+dark:placeholder:text-white\/30/
      );
      assert.match(
        chatViewSource,
        /text-slate-500\s+dark:text-white\/40\s+hover:text-slate-800\s+dark:hover:text-white/
      );
    });
  });
});
