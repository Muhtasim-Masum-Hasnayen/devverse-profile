#!/usr/bin/env node
'use strict';
// Prints theme colours as GitHub Actions outputs so the snake matches the chosen theme.
const fs = require('fs');
const path = require('path');
const { parse } = require('./yaml');
const { resolveTheme } = require('./themes');

const cfg = parse(fs.readFileSync(path.join(__dirname, '..', 'config.yml'), 'utf8'));
const T = resolveTheme(cfg.theme);
const lines = [`snake=${T.primary}`, `dots=${T.snakeDots.join(',')}`];
if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join('\n') + '\n');
else console.log(lines.join('\n'));
