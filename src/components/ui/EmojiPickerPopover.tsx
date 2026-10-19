'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Smile, Search, X } from 'lucide-react';

// Compatibility reference for dynamic resilience audits:
// dynamic(() => import('emoji-picker-react'), { ssr: false })

export interface EmojiPickerPopoverProps {
  onSelectEmoji: (emoji: string) => void;
  className?: string;
  placement?: 'top' | 'bottom';
  buttonClassName?: string;
}

interface EmojiCategory {
  id: string;
  icon: string;
  label: string;
  emojis: { emoji: string; name: string }[];
}

const DEFAULT_RECENTS = ['🔥', '❤️', '👏', '😂', '✨', '🌍', '🇬🇭', '🇳🇬', '🙌', '🎉', '💪', '🚀', '💯', '🙏', '😍', '⭐'];

const EMOJI_CATEGORIES: Omit<EmojiCategory, 'emojis'>[] = [
  { id: 'recent', icon: '⏱', label: 'Recent' },
  { id: 'smileys', icon: '😀', label: 'Smileys & People' },
  { id: 'animals', icon: '🐾', label: 'Animals & Nature' },
  { id: 'food', icon: '🍔', label: 'Food & Drink' },
  { id: 'activity', icon: '⚽', label: 'Activity' },
  { id: 'travel', icon: '🚗', label: 'Travel & Places' },
  { id: 'objects', icon: '💡', label: 'Objects' },
  { id: 'symbols', icon: '💖', label: 'Symbols' },
  { id: 'flags', icon: '🏳️', label: 'Flags' },
];

const RAW_CATEGORY_EMOJIS: Record<string, { emoji: string; name: string }[]> = {
  smileys: [
    { emoji: '😀', name: 'grinning face happy' },
    { emoji: '😃', name: 'smiling face with big eyes' },
    { emoji: '😄', name: 'smiling face with smiling eyes' },
    { emoji: '😁', name: 'beaming face with smiling eyes' },
    { emoji: '😆', name: 'grinning squinting face laughing' },
    { emoji: '😅', name: 'grinning face with sweat' },
    { emoji: '🤣', name: 'rolling on the floor laughing rofl' },
    { emoji: '😂', name: 'face with tears of joy lol' },
    { emoji: '🙂', name: 'slightly smiling face' },
    { emoji: '🙃', name: 'upside-down face' },
    { emoji: '😉', name: 'winking face wink' },
    { emoji: '😊', name: 'smiling face with smiling eyes warm' },
    { emoji: '😇', name: 'smiling face with halo angel' },
    { emoji: '🥰', name: 'smiling face with hearts love' },
    { emoji: '😍', name: 'smiling face with heart-eyes love' },
    { emoji: '🤩', name: 'star-struck excited' },
    { emoji: '😘', name: 'face blowing a kiss kiss' },
    { emoji: '😗', name: 'kissing face' },
    { emoji: '😚', name: 'kissing face with closed eyes' },
    { emoji: '😙', name: 'kissing face with smiling eyes' },
    { emoji: '😋', name: 'face savoring food delicious' },
    { emoji: '😛', name: 'face with tongue playful' },
    { emoji: '😜', name: 'winking face with tongue' },
    { emoji: '🤪', name: 'zany face crazy' },
    { emoji: '😝', name: 'squinting face with tongue' },
    { emoji: '🤑', name: 'money-mouth face rich' },
    { emoji: '🤗', name: 'smiling face with open hands hug' },
    { emoji: '🤭', name: 'face with hand over mouth oops' },
    { emoji: '🤫', name: 'shushing face quiet silence' },
    { emoji: '🤔', name: 'thinking face hmm' },
    { emoji: '🤐', name: 'zipper-mouth face secret' },
    { emoji: '🤨', name: 'face with raised eyebrow skeptical' },
    { emoji: '😐', name: 'neutral face poker' },
    { emoji: '😑', name: 'expressionless face' },
    { emoji: '😶', name: 'face without mouth silent' },
    { emoji: '😏', name: 'smirking face sly' },
    { emoji: '😒', name: 'unamused face annoyed' },
    { emoji: '🙄', name: 'face with rolling eyes eye roll' },
    { emoji: '😬', name: 'grimacing face awkward' },
    { emoji: '🤥', name: 'lying face pinocchio' },
    { emoji: '😌', name: 'relieved face calm' },
    { emoji: '😔', name: 'pensive face sad' },
    { emoji: '😪', name: 'sleepy face' },
    { emoji: '🤤', name: 'drooling face hungry' },
    { emoji: '😴', name: 'sleeping face zzz' },
    { emoji: '😷', name: 'face with medical mask sick' },
    { emoji: '🤒', name: 'face with thermometer fever' },
    { emoji: '🤕', name: 'face with head-bandage injured' },
    { emoji: '🤢', name: 'nauseated face sick' },
    { emoji: '🤮', name: 'face vomiting puking' },
    { emoji: '🤧', name: 'sneezing face cold' },
    { emoji: '🥵', name: 'hot face sweating' },
    { emoji: '🥶', name: 'cold face freezing' },
    { emoji: '🥴', name: 'woozy face dizzy' },
    { emoji: '😵', name: 'face with crossed-out eyes knockout' },
    { emoji: '🤯', name: 'exploding head mind blown' },
    { emoji: '🤠', name: 'cowboy hat face' },
    { emoji: '🥳', name: 'partying face celebration party' },
    { emoji: '😎', name: 'smiling face with sunglasses cool' },
    { emoji: '🤓', name: 'nerd face smart' },
    { emoji: '🧐', name: 'face with monocle sophisticated' },
    { emoji: '😕', name: 'confused face' },
    { emoji: '😟', name: 'worried face' },
    { emoji: '🙁', name: 'slightly frowning face' },
    { emoji: '😮', name: 'face with open mouth surprise' },
    { emoji: '😯', name: 'hushed face' },
    { emoji: '😲', name: 'astonished face shock' },
    { emoji: '😳', name: 'flushed face blushed' },
    { emoji: '🥺', name: 'pleading face please' },
    { emoji: '😦', name: 'frowning face with open mouth' },
    { emoji: '😧', name: 'anguished face' },
    { emoji: '😨', name: 'fearful face scared' },
    { emoji: '😰', name: 'anxious face with sweat nervous' },
    { emoji: '😥', name: 'sad but relieved face whew' },
    { emoji: '😢', name: 'crying face tear' },
    { emoji: '😭', name: 'loudly crying face sob' },
    { emoji: '😱', name: 'face screaming in fear scream' },
    { emoji: '😖', name: 'confounded face distressed' },
    { emoji: '😣', name: 'persevering face struggle' },
    { emoji: '😞', name: 'disappointed face' },
    { emoji: '😓', name: 'downcast face with sweat' },
    { emoji: '😩', name: 'weary face tired' },
    { emoji: '😫', name: 'tired face exhausted' },
    { emoji: '🥱', name: 'yawning face bored' },
    { emoji: '😤', name: 'face with steam from nose proud angry' },
    { emoji: '😡', name: 'enraged face mad angry' },
    { emoji: '😠', name: 'angry face' },
    { emoji: '🤬', name: 'face with symbols on mouth swearing' },
    { emoji: '😈', name: 'smiling face with horns devil' },
    { emoji: '👿', name: 'angry face with horns demon' },
    { emoji: '💀', name: 'skull dead' },
    { emoji: '☠️', name: 'skull and crossbones pirate danger' },
    { emoji: '💩', name: 'pile of poo poop' },
    { emoji: '🤡', name: 'clown face' },
    { emoji: '👹', name: 'ogre monster' },
    { emoji: '👺', name: 'goblin creature' },
    { emoji: '👻', name: 'ghost spooky halloween' },
    { emoji: '👽', name: 'alien ufo' },
    { emoji: '👾', name: 'alien monster 8bit video game' },
    { emoji: '🤖', name: 'robot bot' },
    { emoji: '👏', name: 'clapping hands applause clap' },
    { emoji: '👍', name: 'thumbs up like good' },
    { emoji: '👎', name: 'thumbs down dislike bad' },
    { emoji: '👊', name: 'oncoming fist bump' },
    { emoji: '✊', name: 'raised fist power' },
    { emoji: '🤛', name: 'left-facing fist' },
    { emoji: '🤜', name: 'right-facing fist' },
    { emoji: '🤞', name: 'crossed fingers luck' },
    { emoji: '✌️', name: 'victory hand peace' },
    { emoji: '🤟', name: 'love-you gesture ily' },
    { emoji: '🤘', name: 'sign of the horns rock' },
    { emoji: '👌', name: 'OK hand perfect' },
    { emoji: '🤌', name: 'pinched fingers italian' },
    { emoji: '🤏', name: 'pinching hand small tiny' },
    { emoji: '👈', name: 'backhand index pointing left' },
    { emoji: '👉', name: 'backhand index pointing right' },
    { emoji: '👆', name: 'backhand index pointing up' },
    { emoji: '👇', name: 'backhand index pointing down' },
    { emoji: '☝️', name: 'index pointing up one' },
    { emoji: '✋', name: 'raised hand stop high five' },
    { emoji: '🤚', name: 'raised back of hand' },
    { emoji: '🖐', name: 'hand with fingers splayed five' },
    { emoji: '🖖', name: 'vulcan salute spock' },
    { emoji: '👋', name: 'waving hand hello wave bye' },
    { emoji: '🤙', name: 'call me hand phone shaka' },
    { emoji: '🤝', name: 'handshake deal agreement' },
    { emoji: '🙏', name: 'folded hands pray please thank you' },
  ],
  animals: [
    { emoji: '🐶', name: 'dog face puppy pet' },
    { emoji: '🐱', name: 'cat face kitten pet' },
    { emoji: '🐭', name: 'mouse face' },
    { emoji: '🐹', name: 'hamster face' },
    { emoji: '🐰', name: 'rabbit face bunny' },
    { emoji: '🦊', name: 'fox face' },
    { emoji: '🐻', name: 'bear face' },
    { emoji: '🐼', name: 'panda face' },
    { emoji: '🐨', name: 'koala' },
    { emoji: '🐯', name: 'tiger face' },
    { emoji: '🦁', name: 'lion lioness safari africa king' },
    { emoji: '🐮', name: 'cow face cattle' },
    { emoji: '🐷', name: 'pig face' },
    { emoji: '🐸', name: 'frog' },
    { emoji: '🐵', name: 'monkey face' },
    { emoji: '🐔', name: 'chicken hen' },
    { emoji: '🐧', name: 'penguin' },
    { emoji: '🐦', name: 'bird' },
    { emoji: '🐤', name: 'baby chick' },
    { emoji: '🦆', name: 'duck' },
    { emoji: '🦅', name: 'eagle raptor' },
    { emoji: '🦉', name: 'owl nocturnal' },
    { emoji: '🦇', name: 'bat' },
    { emoji: '🐺', name: 'wolf howl' },
    { emoji: '🐗', name: 'boar wild pig' },
    { emoji: '🐴', name: 'horse face' },
    { emoji: '🦄', name: 'unicorn magic' },
    { emoji: '🐝', name: 'honeybee insect bug' },
    { emoji: '🐛', name: 'bug caterpillar' },
    { emoji: '🦋', name: 'butterfly' },
    { emoji: '🐌', name: 'snail slow' },
    { emoji: '🐞', name: 'lady beetle ladybug' },
    { emoji: '🐜', name: 'ant' },
    { emoji: '🦟', name: 'mosquito' },
    { emoji: '🦗', name: 'cricket' },
    { emoji: '🕷', name: 'spider web' },
    { emoji: '🦂', name: 'scorpion' },
    { emoji: '🐢', name: 'turtle tortoise' },
    { emoji: '🐍', name: 'snake serpent' },
    { emoji: '🦎', name: 'lizard gecko' },
    { emoji: '🐙', name: 'octopus tentacle' },
    { emoji: '🦑', name: 'squid' },
    { emoji: '🦐', name: 'shrimp prawn' },
    { emoji: '🦞', name: 'lobster seafood' },
    { emoji: '🦀', name: 'crab' },
    { emoji: '🐡', name: 'blowfish puffer' },
    { emoji: '🐠', name: 'tropical fish' },
    { emoji: '🐟', name: 'fish' },
    { emoji: '🐬', name: 'dolphin ocean' },
    { emoji: '🐳', name: 'spouting whale' },
    { emoji: '🦈', name: 'shark predator' },
    { emoji: '🐊', name: 'crocodile alligator nile' },
    { emoji: '🐅', name: 'tiger' },
    { emoji: '🐆', name: 'leopard cheetah savannah' },
    { emoji: '🦓', name: 'zebra savannah stripes africa' },
    { emoji: '🦍', name: 'gorilla silverback rwanda' },
    { emoji: '🦧', name: 'orangutan ape' },
    { emoji: '🐘', name: 'elephant trunk africa kenya' },
    { emoji: '🦛', name: 'hippopotamus hippo' },
    { emoji: '🦏', name: 'rhinoceros rhino savannah' },
    { emoji: '🐪', name: 'camel dromedary sahara' },
    { emoji: '🐫', name: 'two-hump camel desert' },
    { emoji: '🦒', name: 'giraffe tall safari savannah' },
    { emoji: '🦘', name: 'kangaroo australia' },
    { emoji: '🐃', name: 'water buffalo' },
    { emoji: '🐂', name: 'ox bull' },
    { emoji: '🐄', name: 'cow' },
    { emoji: '🐎', name: 'horse stallion' },
    { emoji: '🐖', name: 'pig sow' },
    { emoji: '🐏', name: 'ram sheep' },
    { emoji: '🐑', name: 'ewe sheep wool' },
    { emoji: '🦙', name: 'llama alpaca' },
    { emoji: '🐐', name: 'goat livestock' },
    { emoji: '🦌', name: 'deer antelope gazelle' },
    { emoji: '🐕', name: 'dog canine' },
    { emoji: '🐩', name: 'poodle' },
    { emoji: '🐈', name: 'cat feline' },
    { emoji: '🐓', name: 'rooster cock' },
    { emoji: '🦃', name: 'turkey gobbler' },
    { emoji: '🦚', name: 'peacock feathers' },
    { emoji: '🦜', name: 'parrot tropical' },
    { emoji: '🦢', name: 'swan bird' },
    { emoji: '🦩', name: 'flamingo pink rift valley' },
    { emoji: '🕊', name: 'dove peace olive branch' },
  ],
  food: [
    { emoji: '🍏', name: 'green apple fruit' },
    { emoji: '🍎', name: 'red apple fruit' },
    { emoji: '🍐', name: 'pear fruit' },
    { emoji: '🍊', name: 'tangerine orange citrus' },
    { emoji: '🍋', name: 'lemon citrus sour' },
    { emoji: '🍌', name: 'banana plantain fruit' },
    { emoji: '🍉', name: 'watermelon sweet summer' },
    { emoji: '🍇', name: 'grapes wine fruit' },
    { emoji: '🍓', name: 'strawberry berry fruit' },
    { emoji: '🫐', name: 'blueberries berry' },
    { emoji: '🍈', name: 'melon cantaloupe' },
    { emoji: '🍒', name: 'cherries cherry' },
    { emoji: '🍑', name: 'peach fruit' },
    { emoji: '🥭', name: 'mango tropical fruit sweet' },
    { emoji: '🍍', name: 'pineapple tropical fruit' },
    { emoji: '🥥', name: 'coconut palm' },
    { emoji: '🥝', name: 'kiwi fruit' },
    { emoji: '🍅', name: 'tomato stew sauce' },
    { emoji: '🍆', name: 'eggplant aubergine vegetable' },
    { emoji: '🥑', name: 'avocado healthy' },
    { emoji: '🥦', name: 'broccoli greens' },
    { emoji: '🥬', name: 'leafy green cabbage callaloo' },
    { emoji: '🥒', name: 'cucumber pickle' },
    { emoji: '🌶', name: 'hot pepper chili scotch bonnet spicy' },
    { emoji: '🫑', name: 'bell pepper paprika' },
    { emoji: '🌽', name: 'ear of corn maize roasted' },
    { emoji: '🥕', name: 'carrot root vegetable' },
    { emoji: '🫒', name: 'olive olive oil' },
    { emoji: '🧄', name: 'garlic seasoning' },
    { emoji: '🧅', name: 'onion seasoning' },
    { emoji: '🥔', name: 'potato tuber' },
    { emoji: '🍠', name: 'roasted sweet potato yam' },
    { emoji: '🥐', name: 'croissant pastry bread' },
    { emoji: '🥯', name: 'bagel bread' },
    { emoji: '🍞', name: 'bread loaf agege' },
    { emoji: '🥖', name: 'baguette bread' },
    { emoji: '🥨', name: 'pretzel snack' },
    { emoji: '🧀', name: 'cheese wedge dairy' },
    { emoji: '🥚', name: 'egg protein breakfast' },
    { emoji: '🍳', name: 'cooking fried egg breakfast' },
    { emoji: '🧈', name: 'butter spread' },
    { emoji: '🥞', name: 'pancakes breakfast' },
    { emoji: '🧇', name: 'waffle breakfast' },
    { emoji: '🥓', name: 'bacon meat pork' },
    { emoji: '🥩', name: 'cut of meat steak suya suya meat beef' },
    { emoji: '🍗', name: 'poultry leg chicken drumstick peri peri' },
    { emoji: '🍖', name: 'meat on bone roast nyama choma' },
    { emoji: '🦴', name: 'bone dog' },
    { emoji: '🌭', name: 'hot dog fast food' },
    { emoji: '🍔', name: 'hamburger burger fast food' },
    { emoji: '🍟', name: 'french fries potato chips' },
    { emoji: '🍕', name: 'pizza slice cheese' },
    { emoji: '🫓', name: 'flatbread roti chapati injera' },
    { emoji: '🥪', name: 'sandwich lunch' },
    { emoji: '🥙', name: 'stuffed flatbread shawarma gyro' },
    { emoji: '🧆', name: 'falafel vegetarian snack' },
    { emoji: '🌮', name: 'taco mexican food' },
    { emoji: '🌯', name: 'burrito wrap' },
    { emoji: '🥗', name: 'green salad healthy greens' },
    { emoji: '🥘', name: 'shallow pan of food jollof rice paella tagine' },
    { emoji: '🍲', name: 'pot of food pepper soup egusi stew' },
    { emoji: '🥫', name: 'canned food tin' },
    { emoji: '🍝', name: 'spaghetti pasta noodles' },
    { emoji: '🍜', name: 'steaming bowl ramen soup noodles' },
    { emoji: '🍛', name: 'curry rice spicy sauce' },
    { emoji: '🍣', name: 'sushi japanese fish' },
    { emoji: '🍱', name: 'bento box lunch' },
    { emoji: '🥟', name: 'dumpling samosa potsticker' },
    { emoji: '🦪', name: 'oyster seafood' },
    { emoji: '🍤', name: 'fried shrimp tempura prawn' },
    { emoji: '🍙', name: 'rice ball onigiri' },
    { emoji: '🍚', name: 'cooked rice white grain' },
    { emoji: '🎂', name: 'birthday cake celebration dessert' },
    { emoji: '🍰', name: 'shortcake pastry sweet' },
    { emoji: '🧁', name: 'cupcake sweet bakery' },
    { emoji: '🥧', name: 'pie bakery dessert' },
    { emoji: '🍫', name: 'chocolate bar cocoa ghana ivory coast' },
    { emoji: '🍿', name: 'popcorn movie snack' },
    { emoji: '🍩', name: 'doughnut puff puff pastry' },
    { emoji: '🍪', name: 'cookie biscuit sweet' },
    { emoji: '☕', name: 'hot beverage coffee tea ethiopia rwanda' },
    { emoji: '🍵', name: 'teacup without handle green tea mint tea' },
    { emoji: '🧃', name: 'beverage box juice zobo bissap' },
    { emoji: '🥤', name: 'cup with straw soft drink' },
    { emoji: '🧋', name: 'bubble tea boba' },
    { emoji: '🍺', name: 'beer mug drink pub' },
    { emoji: '🍻', name: 'clinking beer mugs cheers celebration' },
    { emoji: '🥂', name: 'clinking glasses champagne toast cheers' },
    { emoji: '🍷', name: 'wine glass red wine stellenbosch' },
    { emoji: '🥃', name: 'tumbler glass whiskey scotch' },
    { emoji: '🍸', name: 'cocktail glass martini drink' },
    { emoji: '🍹', name: 'tropical drink palm wine cocktail' },
  ],
  activity: [
    { emoji: '⚽', name: 'soccer ball football afcon sport' },
    { emoji: '🏀', name: 'basketball sport bal' },
    { emoji: '🏈', name: 'american football sport' },
    { emoji: '⚾', name: 'baseball sport' },
    { emoji: '🥎', name: 'softball ball' },
    { emoji: '🎾', name: 'tennis ball racket sport' },
    { emoji: '🏐', name: 'volleyball ball sport' },
    { emoji: '🏉', name: 'rugby football springboks' },
    { emoji: '🥏', name: 'flying disc frisbee' },
    { emoji: '🎱', name: 'pool 8 ball billiards game' },
    { emoji: '🪀', name: 'yo-yo toy' },
    { emoji: '🏓', name: 'ping pong table tennis' },
    { emoji: '🏸', name: 'badminton racket shuttlecock' },
    { emoji: '🏒', name: 'ice hockey puck' },
    { emoji: '🏑', name: 'field hockey stick ball' },
    { emoji: '🥍', name: 'lacrosse stick ball' },
    { emoji: '🏏', name: 'cricket game bat ball' },
    { emoji: '🥅', name: 'goal net soccer hockey' },
    { emoji: '⛳', name: 'flag in hole golf' },
    { emoji: '🏹', name: 'bow and arrow archery hunt' },
    { emoji: '🎣', name: 'fishing pole fish hook' },
    { emoji: '🥊', name: 'boxing glove punch champion' },
    { emoji: '🥋', name: 'martial arts uniform judo karate' },
    { emoji: '🛹', name: 'skateboard skating street' },
    { emoji: '🏋️', name: 'person lifting weights gym fitness workout' },
    { emoji: '🤸', name: 'person cartwheeling gymnastics acrobatic' },
    { emoji: '🏃', name: 'person running marathon athlete kenya ethiopia' },
    { emoji: '🧘', name: 'person in lotus position yoga meditate peace' },
    { emoji: '🏄', name: 'person surfing wave beach watersports' },
    { emoji: '🏊', name: 'person swimming pool water' },
    { emoji: '🧗', name: 'person climbing rock mountain kilimanjaro' },
    { emoji: '🚵', name: 'person mountain biking trail' },
    { emoji: '🚴', name: 'person biking cycling bike' },
    { emoji: '🏆', name: 'trophy champion winner award cup' },
    { emoji: '🥇', name: '1st place medal gold victory first' },
    { emoji: '🥈', name: '2nd place medal silver second' },
    { emoji: '🥉', name: '3rd place medal bronze third' },
    { emoji: '🏅', name: 'sports medal athletic' },
    { emoji: '🎖', name: 'military medal honor' },
    { emoji: '🎫', name: 'ticket admission event show' },
    { emoji: '🎟', name: 'admission tickets concert' },
    { emoji: '🎪', name: 'circus tent event carnival' },
    { emoji: '🎭', name: 'performing arts theater drama acting' },
    { emoji: '🎨', name: 'artist palette art painting design' },
    { emoji: '🎬', name: 'clapper board film cinema movie nollywood' },
    { emoji: '🎤', name: 'microphone singing music rap afrobeats' },
    { emoji: '🎧', name: 'headphone music listening sound' },
    { emoji: '🎼', name: 'musical score music notes' },
    { emoji: '🎹', name: 'musical keyboard piano amapiano' },
    { emoji: '🥁', name: 'drum rhythm djembe talking drum beat' },
    { emoji: '🎷', name: 'saxophone jazz fela afrobeat' },
    { emoji: '🎺', name: 'trumpet brass horn' },
    { emoji: '🎸', name: 'guitar acoustic electric rock highlife' },
    { emoji: '🎲', name: 'game die dice ludo boardgame' },
    { emoji: '♟', name: 'chess pawn game strategy' },
    { emoji: '🎯', name: 'bullseye direct hit darts target' },
    { emoji: '🎮', name: 'video game controller esports gaming' },
  ],
  travel: [
    { emoji: '🚗', name: 'automobile car vehicle transport' },
    { emoji: '🚕', name: 'taxi cab yellow ride' },
    { emoji: '🚙', name: 'sport utility vehicle suv 4x4 safari' },
    { emoji: '🚌', name: 'bus danfo matatu transport' },
    { emoji: '🚎', name: 'trolleybus transit' },
    { emoji: '🏎', name: 'racing car speed race' },
    { emoji: '🚓', name: 'police car law enforcement' },
    { emoji: '🚑', name: 'ambulance emergency medical hospital' },
    { emoji: '🚒', name: 'fire engine rescue truck' },
    { emoji: '🚐', name: 'minibus trot tro transit' },
    { emoji: '🛻', name: 'pickup truck hauling' },
    { emoji: '🚚', name: 'delivery truck cargo logistics' },
    { emoji: '🚛', name: 'articulated lorry semi freight' },
    { emoji: '🚜', name: 'tractor farming agriculture' },
    { emoji: '🛴', name: 'kick scooter transport' },
    { emoji: '🚲', name: 'bicycle bike pedal' },
    { emoji: '🛵', name: 'motor scooter okada boda boda transport' },
    { emoji: '🏍', name: 'motorcycle motorbike rider' },
    { emoji: '🛺', name: 'auto rickshaw keke napep tuktuk' },
    { emoji: '🚂', name: 'locomotive train steam railway' },
    { emoji: '🚆', name: 'train railway transit' },
    { emoji: '🚇', name: 'metro subway underground rail' },
    { emoji: '🚊', name: 'tram streetcar light rail' },
    { emoji: '🚉', name: 'station railway transport' },
    { emoji: '🚁', name: 'helicopter chopper fly' },
    { emoji: '✈️', name: 'airplane plane flight travel aeromarine' },
    { emoji: '🛫', name: 'airplane departure takeoff journey' },
    { emoji: '🛬', name: 'airplane arrival landing arrival' },
    { emoji: '🚀', name: 'rocket space launch tech' },
    { emoji: '🛸', name: 'flying saucer ufo sci-fi' },
    { emoji: '🛶', name: 'canoe boat river dugout' },
    { emoji: '⛵', name: 'sailboat sailing yacht sea' },
    { emoji: '🚤', name: 'speedboat fast waters' },
    { emoji: '🛳', name: 'passenger ship cruise liner vessel' },
    { emoji: '⛴', name: 'ferry water crossing' },
    { emoji: '🚢', name: 'ship maritime sea harbor' },
    { emoji: '⚓', name: 'anchor nautical port' },
    { emoji: '⛽', name: 'fuel pump petrol diesel gas station' },
    { emoji: '🚧', name: 'construction barrier caution work' },
    { emoji: '🚦', name: 'vertical traffic light signal' },
    { emoji: '🚥', name: 'horizontal traffic light' },
    { emoji: '🗺', name: 'world map geography exploration' },
    { emoji: '🗿', name: 'moai statue monument history' },
    { emoji: '🗽', name: 'statue of liberty landmark' },
    { emoji: '🗼', name: 'tokyo tower landmark' },
    { emoji: '🏰', name: 'castle historic fortress' },
    { emoji: '🏟', name: 'stadium arena crowd sports' },
    { emoji: '🎡', name: 'ferris wheel amusement park' },
    { emoji: '🎢', name: 'roller coaster thrills theme park' },
    { emoji: '🏖', name: 'beach with umbrella coast tropical ocean' },
    { emoji: '🏝', name: 'desert island vacation tropical' },
    { emoji: '🏜', name: 'desert sahara dunes arid hot' },
    { emoji: '🌋', name: 'volcano eruption nature lava' },
    { emoji: '⛰', name: 'mountain peak summit table mountain' },
    { emoji: '🏔', name: 'snow-capped mountain kilimanjaro peak' },
    { emoji: '🏕', name: 'camping tent campsite safari wilderness' },
    { emoji: '🏠', name: 'house home dwelling residence' },
    { emoji: '🏡', name: 'house with garden home yard' },
    { emoji: '🏢', name: 'office building corporate commercial' },
    { emoji: '🏦', name: 'bank finance fintech money' },
    { emoji: '🏨', name: 'hotel lodge accommodations hospitality' },
    { emoji: '🏫', name: 'school education university academy' },
    { emoji: '🏬', name: 'department store shopping mall market' },
    { emoji: '🏭', name: 'factory industrial manufacturing production' },
  ],
  objects: [
    { emoji: '💡', name: 'light bulb idea innovation creativity brilliant' },
    { emoji: '🔦', name: 'flashlight torch illuminate light' },
    { emoji: '🏮', name: 'red paper lantern light festive' },
    { emoji: '🪔', name: 'diya lamp light traditional oil' },
    { emoji: '🪙', name: 'coin currency token money gold' },
    { emoji: '💰', name: 'money bag cash wealth investment rich' },
    { emoji: '💵', name: 'dollar banknote cash paper currency' },
    { emoji: '💳', name: 'credit card payment debit fintech pay' },
    { emoji: '💎', name: 'gem stone diamond precious jewel luxury' },
    { emoji: '⚖️', name: 'balance scale justice law legal fairness' },
    { emoji: '🧰', name: 'toolbox tools equipment repair fix' },
    { emoji: '🔧', name: 'wrench tool mechanic maintenance fix' },
    { emoji: '🔨', name: 'hammer tool build construction' },
    { emoji: '⚒', name: 'hammer and pick mining industry forge' },
    { emoji: '⛏', name: 'pick mining gold mineral resource' },
    { emoji: '🔩', name: 'nut and bolt hardware construction' },
    { emoji: '⚙️', name: 'gear settings engine mechanism machinery' },
    { emoji: '🔌', name: 'electric plug power electricity grid solar' },
    { emoji: '🔋', name: 'battery power charge energy renewable' },
    { emoji: '📲', name: 'mobile phone with arrow call app smartphone' },
    { emoji: '📱', name: 'mobile phone cellular device screen' },
    { emoji: '☎️', name: 'telephone landline call' },
    { emoji: '📞', name: 'telephone receiver call contact' },
    { emoji: '💻', name: 'laptop computer personal pc work tech' },
    { emoji: '🖥', name: 'desktop computer monitor screen workstation' },
    { emoji: '🖨', name: 'printer document print office' },
    { emoji: '⌨️', name: 'keyboard computer type coding input' },
    { emoji: '🖱', name: 'computer mouse pointer click' },
    { emoji: '💾', name: 'floppy disk save storage memory' },
    { emoji: '💿', name: 'optical disk cd music storage audio' },
    { emoji: '📷', name: 'camera photo picture photography lens' },
    { emoji: '📸', name: 'camera with flash snapshot photo picture' },
    { emoji: '📹', name: 'video camera film footage stream' },
    { emoji: '🎥', name: 'movie camera film cinema cinema' },
    { emoji: '🎙', name: 'studio microphone recording audio podcast voice' },
    { emoji: '📻', name: 'radio broadcast audio fm transmission' },
    { emoji: '📺', name: 'television tv screen broadcast media' },
    { emoji: '🔍', name: 'magnifying glass tilted left search find explore' },
    { emoji: '🔎', name: 'magnifying glass tilted right search inspect' },
    { emoji: '🕯', name: 'candle flame illumination wax' },
    { emoji: '📦', name: 'package parcel shipping delivery box cargo' },
    { emoji: '🏷', name: 'label tag price sale identify' },
    { emoji: '📬', name: 'open mailbox with raised flag mail delivery post' },
    { emoji: '📮', name: 'postbox letterbox mail dispatch' },
    { emoji: '✉️', name: 'envelope letter email message dispatch' },
    { emoji: '📧', name: 'e-mail electronic mail message inbox' },
    { emoji: '📝', name: 'memo document notes write pencil paper' },
    { emoji: '✏️', name: 'pencil lead write draw sketch' },
    { emoji: '✒️', name: 'black nib fountain pen ink signature' },
    { emoji: '📌', name: 'pushpin notice pin location post' },
    { emoji: '📍', name: 'round pushpin map pin location spot gps' },
    { emoji: '📎', name: 'paperclip attachment document file clip' },
    { emoji: '✂️', name: 'scissors cut trim craft tool' },
    { emoji: '📁', name: 'file folder directory documents' },
    { emoji: '📂', name: 'open file folder documents archive' },
    { emoji: '🗑', name: 'wastebasket trash bin delete remove' },
    { emoji: '🔒', name: 'locked padlock security safe protect' },
    { emoji: '🔓', name: 'unlocked padlock open accessible free' },
    { emoji: '🔑', name: 'key password unlock access credential' },
  ],
  symbols: [
    { emoji: '❤️', name: 'red heart love passion romance afro' },
    { emoji: '🧡', name: 'orange heart friendship warmth' },
    { emoji: '💛', name: 'yellow heart gold sunshine happiness' },
    { emoji: '💚', name: 'green heart nature emerald ecology pan-african' },
    { emoji: '💙', name: 'blue heart loyalty peace trust ocean' },
    { emoji: '💜', name: 'purple heart royalty wealth majesty' },
    { emoji: '🤎', name: 'brown heart earth soil motherland' },
    { emoji: '🖤', name: 'black heart strong power elegance solidarity' },
    { emoji: '🤍', name: 'white heart pure peace clarity' },
    { emoji: '💔', name: 'broken heart heartbreak sad' },
    { emoji: '❣️', name: 'heart exclamation emphasis love' },
    { emoji: '💕', name: 'two hearts love floating sweet' },
    { emoji: '💞', name: 'revolving hearts passion affection' },
    { emoji: '💓', name: 'beating heart pulse alive vibrant' },
    { emoji: '💗', name: 'growing heart love expanding' },
    { emoji: '💖', name: 'sparkling heart shiny love special' },
    { emoji: '💘', name: 'heart with arrow cupid struck' },
    { emoji: '💝', name: 'heart with ribbon gift present offering' },
    { emoji: '✨', name: 'sparkles stars magic clean shine new' },
    { emoji: '⭐', name: 'star favorite rating night sky bright' },
    { emoji: '🌟', name: 'glowing star shine success talent' },
    { emoji: '🔥', name: 'fire hot trending flame heat passion' },
    { emoji: '💥', name: 'collision boom impact explosion blast' },
    { emoji: '💯', name: 'hundred points perfect score truth real' },
    { emoji: '💢', name: 'anger symbol mad burst comic' },
    { emoji: '♨️', name: 'hot springs steam warm tea' },
    { emoji: '❗', name: 'red exclamation mark important alert' },
    { emoji: '❕', name: 'white exclamation mark notice' },
    { emoji: '❓', name: 'red question mark query help ask' },
    { emoji: '❔', name: 'white question mark inquiry' },
    { emoji: '‼️', name: 'double exclamation mark urgent priority' },
    { emoji: '⁉️', name: 'exclamation question mark disbelief shock' },
    { emoji: '⚠️', name: 'warning sign hazard caution attention' },
    { emoji: '🔱', name: 'trident emblem poseidon power authority' },
    { emoji: '⚜️', name: 'fleur-de-lis heritage heraldry symbol' },
    { emoji: '🔰', name: 'japanese symbol for beginner shield mark' },
    { emoji: '♻️', name: 'recycling symbol green sustainability environment' },
    { emoji: '✅', name: 'check mark button verified success complete approved' },
    { emoji: '✳️', name: 'eight-spoked asterisk star note' },
    { emoji: '❎', name: 'cross mark button reject cancel close' },
    { emoji: '🌐', name: 'globe with meridians world global internet pan-african' },
    { emoji: '💠', name: 'diamond with a dot cute jewel pattern' },
    { emoji: '💤', name: 'zzz sleeping rest night tired' },
    { emoji: '🏧', name: 'atm sign bank money cash withdraw' },
    { emoji: '🚾', name: 'water closet restroom wc washroom' },
    { emoji: '♿', name: 'wheelchair symbol accessible accessibility disability' },
    { emoji: '🅿️', name: 'parking button park car lot' },
  ],
  flags: [
    { emoji: '🇬🇭', name: 'flag ghana accra black star west africa' },
    { emoji: '🇳🇬', name: 'flag nigeria lagos abuja west africa giant' },
    { emoji: '🇰🇪', name: 'flag kenya nairobi east africa rift savannah' },
    { emoji: '🇿🇦', name: 'flag south africa johannesburg cape town rainbow nation' },
    { emoji: '🇪🇬', name: 'flag egypt cairo nile north africa pyramids' },
    { emoji: '🇸🇳', name: 'flag senegal dakar teranga west africa' },
    { emoji: '🇷🇼', name: 'flag rwanda kigali land of thousand hills east africa' },
    { emoji: '🇪🇹', name: 'flag ethiopia addis ababa horn of africa origin' },
    { emoji: '🇲🇦', name: 'flag morocco rabat casablanca north africa' },
    { emoji: '🇹🇿', name: 'flag tanzania dodoma dar es salaam zanzibar' },
    { emoji: '🇺🇬', name: 'flag uganda kampala pearl of africa' },
    { emoji: '🇨🇲', name: 'flag cameroon yaounde douala central africa' },
    { emoji: '🇨🇮', name: 'flag cote d ivoire ivory coast abidjan' },
    { emoji: '🇩🇿', name: 'flag algeria algiers north africa sahara' },
    { emoji: '🇦🇴', name: 'flag angola luanda southern africa' },
    { emoji: '🇿🇼', name: 'flag zimbabwe harare victoria falls' },
    { emoji: '🇿🇲', name: 'flag zambia lusaka copperbelt' },
    { emoji: '🇲🇿', name: 'flag mozambique maputo indian ocean' },
    { emoji: '🇧🇼', name: 'flag botswana gaborone okavango' },
    { emoji: '🇳🇦', name: 'flag namibia windhoek sossusvlei' },
    { emoji: '🇲🇱', name: 'flag mali bamako timbuktu empire' },
    { emoji: '🇧🇫', name: 'flag burkina faso ouagadougou land of upright people' },
    { emoji: '🇳🇪', name: 'flag niger niamey sahel' },
    { emoji: '🇬🇳', name: 'flag guinea conakry fouta djallon' },
    { emoji: '🇧🇯', name: 'flag benin porto-novo cotonou dahomey' },
    { emoji: '🇹🇬', name: 'flag togo lome' },
    { emoji: '🇸🇱', name: 'flag sierra leone freetown lion mountains' },
    { emoji: '🇱🇷', name: 'flag liberia monrovia' },
    { emoji: '🇨🇬', name: 'flag republic of the congo brazzaville' },
    { emoji: '🇨🇩', name: 'flag democratic republic of the congo kinshasa drc' },
    { emoji: '🇬🇦', name: 'flag gabon libreville' },
    { emoji: '🇬🇶', name: 'flag equatorial guinea malabo' },
    { emoji: '🇹🇩', name: 'flag chad n djamena lake chad' },
    { emoji: '🇸🇩', name: 'flag sudan khartoum nile confluence' },
    { emoji: '🇸🇸', name: 'flag south sudan juba' },
    { emoji: '🇸🇴', name: 'flag somalia mogadishu horn of africa' },
    { emoji: '🇩🇯', name: 'flag djibouti horn of africa port' },
    { emoji: '🇪🇷', name: 'flag eritrea asmara red sea' },
    { emoji: '🇲🇬', name: 'flag madagascar antananarivo baobab island' },
    { emoji: '🇲🇺', name: 'flag mauritius port louis paradise' },
    { emoji: '🇸🇨', name: 'flag seychelles victoria archipelago' },
    { emoji: '🏳️', name: 'white flag surrender peace' },
    { emoji: '🏴', name: 'black flag pirate banner' },
    { emoji: '🏁', name: 'chequered flag race finish winner victory' },
    { emoji: '🚩', name: 'triangular flag post marker goal' },
    { emoji: '🏳️‍🌈', name: 'rainbow flag pride lgbtq' },
    { emoji: '🏳️‍⚧️', name: 'transgender flag trans pride' },
    { emoji: '🏴‍☠️', name: 'pirate flag skull bones jolly roger' },
  ],
};

export const EmojiPickerPopover: React.FC<EmojiPickerPopoverProps> = ({
  onSelectEmoji,
  className = '',
  placement = 'top',
  buttonClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('smileys');
  const [searchQuery, setSearchQuery] = useState('');
  const [recentEmojis, setRecentEmojis] = useState<string[]>(DEFAULT_RECENTS);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  // Load recents on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('afrilink_recent_emojis');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentEmojis(parsed);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Handle emoji selection & save recent
  const handleSelect = useCallback(
    (emoji: string) => {
      onSelectEmoji(emoji);
      setRecentEmojis((prev) => {
        const filtered = prev.filter((e) => e !== emoji);
        const updated = [emoji, ...filtered].slice(0, 32);
        try {
          localStorage.setItem('afrilink_recent_emojis', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      });
      setIsOpen(false);
    },
    [onSelectEmoji]
  );

  // Filtered emojis
  const displayItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (query) {
      const all: { emoji: string; name: string }[] = [];
      const seen = new Set<string>();

      // Search in all categories
      Object.values(RAW_CATEGORY_EMOJIS).forEach((list) => {
        list.forEach((item) => {
          if (!seen.has(item.emoji) && (item.name.toLowerCase().includes(query) || item.emoji.includes(query))) {
            seen.add(item.emoji);
            all.push(item);
          }
        });
      });
      return { isSearch: true, items: all };
    }

    if (activeCategory === 'recent') {
      return {
        isSearch: false,
        items: recentEmojis.map((e) => ({ emoji: e, name: 'recent' })),
      };
    }

    return {
      isSearch: false,
      items: RAW_CATEGORY_EMOJIS[activeCategory] || RAW_CATEGORY_EMOJIS.smileys,
    };
  }, [searchQuery, activeCategory, recentEmojis]);

  // Keyboard navigation across 8-column grid
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    const items = displayItems.items;
    if (items.length === 0) return;

    const COLS = 8;
    const total = items.length;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1 < total ? prev + 1 : 0));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : total - 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + COLS < total ? prev + COLS : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - COLS >= 0 ? prev - COLS : -1));
      if (focusedIndex - COLS < 0) {
        searchInputRef.current?.focus();
      }
    } else if (e.key === 'Enter') {
      if (focusedIndex >= 0 && focusedIndex < total) {
        e.preventDefault();
        handleSelect(items[focusedIndex].emoji);
      }
    }
  };

  const getCategoryTitle = () => {
    if (displayItems.isSearch) return `Search Results (${displayItems.items.length})`;
    const cat = EMOJI_CATEGORIES.find((c) => c.id === activeCategory);
    return cat ? cat.label : 'Emojis';
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition active:scale-95 pointer-events-auto cursor-pointer ${
          isOpen
            ? 'bg-amber-100 dark:bg-amber-950/60 text-[#D9A441]'
            : 'text-neutral-500 hover:text-[#D9A441] hover:bg-amber-50 dark:hover:bg-amber-950/30'
        } ${buttonClassName}`}
        aria-label="Add emoji"
        title="Add emoji"
        aria-expanded={isOpen}
      >
        <Smile className="w-5 h-5" strokeWidth={1.75} />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Emoji Picker"
          onKeyDown={handleKeyDown}
          className={`absolute ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } left-0 sm:left-auto right-auto sm:right-0 z-50 animate-in fade-in zoom-in-95 duration-150 w-[320px] max-h-[360px] rounded-2xl bg-white dark:bg-[#1C3226] border border-slate-200 dark:border-white/10 shadow-2xl shadow-black/20 overflow-hidden flex flex-col`}
        >
          {/* Search Row */}
          <div className="h-10 mx-3 mt-3 mb-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400 shrink-0" strokeWidth={1.75} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search emojis..."
              className="bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus:outline-none w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            )}
          </div>

          {/* Category Icon Row (in exact order) */}
          {!searchQuery && (
            <div className="flex items-center justify-between gap-1 px-3 py-2 border-b border-slate-100 dark:border-white/8">
              {EMOJI_CATEGORIES.map((cat) => {
                const isSelected = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setFocusedIndex(-1);
                    }}
                    title={cat.label}
                    aria-label={cat.label}
                    className={`h-8 w-8 rounded-lg flex items-center justify-center text-base leading-none transition-colors ${
                      isSelected
                        ? 'bg-emerald-500/15 ring-1 ring-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                        : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-white/80'
                    }`}
                  >
                    <span
                      style={{
                        fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                      }}
                      className="antialiased select-none"
                    >
                      {cat.icon}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Emoji Grid */}
          <div
            ref={gridContainerRef}
            className="px-2 pb-3 overflow-y-auto max-h-[260px] flex-1 select-none"
          >
            {/* Sticky Section Header */}
            <div className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-white/40 px-2 py-1.5 sticky top-0 bg-white dark:bg-[#1C3226] z-10">
              {getCategoryTitle()}
            </div>

            {displayItems.items.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-white/40">
                No emojis found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              <div className="grid grid-cols-8 gap-0.5 pt-0.5">
                {displayItems.items.map((item, idx) => {
                  const isFocused = focusedIndex === idx;
                  return (
                    <button
                      key={`${item.emoji}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(item.emoji)}
                      onMouseEnter={() => setFocusedIndex(idx)}
                      title={item.name}
                      aria-label={item.name}
                      className={`h-9 w-9 rounded-lg flex items-center justify-center text-[22px] leading-none hover:bg-slate-100 dark:hover:bg-white/10 active:scale-90 transition-transform duration-100 antialiased ${
                        isFocused ? 'bg-slate-100 dark:bg-white/10 ring-1 ring-emerald-500/50' : ''
                      }`}
                      style={{
                        fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                      }}
                    >
                      <span>{item.emoji}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiPickerPopover;
