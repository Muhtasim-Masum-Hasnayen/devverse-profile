'use strict';
// Daily CSE / dev jokes. One is picked per day (deterministic by date) so the README refreshes with the workflow.
const JOKES = [
  'There are only 10 kinds of people: those who understand binary and those who do not.',
  'A SQL query walks into a bar, sees two tables and asks: "Can I join you?"',
  '"It works on my machine." -- then we ship your machine.',
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'To understand recursion, you must first understand recursion.',
  'I would tell you a UDP joke, but you might not get it.',
  'Real programmers count from 0.',
  'There is no place like 127.0.0.1.',
  'A programmer\'s wife says: "Buy a loaf of bread. If they have eggs, buy 12." He returns with 12 loaves.',
  'Debugging: being the detective in a crime movie where you are also the murderer.',
  '99 little bugs in the code. Fix one, compile again... 117 little bugs in the code.',
  'Why did the developer go broke? He used up all his cache.',
  'sudo make me a sandwich.',
  'Git commit -m "fixed bug". Git commit -m "fixed the fix". Git commit -m "please work".',
  'Roses are #FF0000, violets are #0000FF, I wrote a for-loop, and now my RAM is gone.',
  'Hackers do not die, they just go into an infinite loop.',
  'A good programmer looks both ways before crossing a one-way street.',
  'Algorithm: a word used by programmers when they do not want to explain what they did.',
  'Why was the JavaScript developer sad? He did not Node how to Express himself.',
  'The best thing about a boolean: even if you are wrong, you are only off by a bit.',
  'My password is the last 8 digits of pi. Nobody has ever guessed it.',
  'Without requirements or design, programming is the art of adding bugs to an empty text file.',
  'Cybersecurity tip: the weakest link is usually between the keyboard and the chair.',
  'Linux is only free if your time has no value.',
  'Why do Java developers wear glasses? Because they do not C#.',
  'Keep calm and clear your cache.',
  'A byte walks into a bar looking pale. The bartender asks: "What is wrong?" "Parity error." "Ah, I thought you looked a bit off."',
  'Why did the programmer quit his job? He did not get arrays.',
  'There are two hard things in CS: cache invalidation, naming things, and off-by-one errors.',
  'Never trust a computer you cannot throw out of a window.',
];

function jokeOfTheDay(date = new Date()) {
  const day = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000);
  return JOKES[day % JOKES.length];
}

function wrap(text, width) {
  const words = text.split(' ');
  const out = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > width) {
      out.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}

module.exports = { jokeOfTheDay, wrap, JOKES };
