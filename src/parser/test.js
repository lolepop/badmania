const fs = require("fs").promises;
const nearley = require("nearley");
const moo = require("moo");
const grammar = require("./osu.js");
const util = require('util');

(async () => {
	const map = await fs.readFile("map1.osu", "utf-8");
	// console.log(map);
	
	const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
	const startTime = Date.now();
	parser.feed(map);
	const endTime = Date.now();
	console.log(util.inspect(parser.results[0], false, null, true));
	
	console.log(`time elapsed ${(endTime - startTime) / 1000}`);
})();
