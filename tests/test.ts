import { TypeAsserter } from "../assert.ts";
import {
	assert,
	assertFalse,
} from "https://deno.land/std@0.157.0/testing/asserts.ts";

Deno.test({
	name: "basics",
	fn: async () => {
		const { isTypeError, cleanUp } = await TypeAsserter({
			currentModUrl: import.meta.url,
		});

		try {

			await isTypeError(`
				const x: number = "not a number";
			`).then(assert);

			await isTypeError(`
				import { fn } from "./dummy_fn.ts";
				fn("hello");
			`).then(assertFalse);

		} finally {

			await cleanUp();

		}
	},
	
});
