import { TypeAsserter } from "../assert.ts";
import {
	assert,
	assertFalse,
} from "https://deno.land/std@0.157.0/testing/asserts.ts";

Deno.test({
	name: "basics",
	fn: async () => {
		const { isTypeError, isNotTypeError, cleanUp } = await TypeAsserter({
			currentModUrl: import.meta.url,
		});

		await isTypeError(`
            const x: number = "not a number";
        `).then(assert);

		await isNotTypeError(`
            const x: number = "not a number";
        `).then(assertFalse);

		await isTypeError(`
            import { fn } from "./dummy_fn.ts";
            fn("hello");
        `).then(assert);

		await cleanUp();
	},
});
