import { NeedsPermission } from "./deps.ts";

export type AssertTypeErrorConfig = {
    currentModUrl: string;
}

const mkImportMap = async (currentModUrl: string) => {
    const map = `{
        "imports": {
          "./": "${currentModUrl.split("/").slice(0, -1).join("/") + "/"}"
        }
    }`;
    return await mkFile(map);
}

const mkFile = async (contents: string) => {
    const file = await Deno.makeTempFile({suffix: ".ts"});
    await Deno.writeTextFile(file, contents);
    return file;
}

export type TypeAsserter = {
    isTypeError: (code: string, errorCode?: number) => Promise<boolean>;
    isNotTypeError: (code: string, errorCode?: number) => Promise<boolean>;
    cleanUp: () => Promise<void>;
}

export const TypeAsserter = async ({currentModUrl}: AssertTypeErrorConfig) => {
    const importMap = await mkImportMap(currentModUrl);
    const mkCmd = (filename: string) => `deno check --import-map ${importMap} ${filename}`;

    const mkCheckingFile = async (code: string) => {
        const fileToCheck = await mkFile(code);
        const cmd = mkCmd(fileToCheck);
        const proc = Deno.run({cmd: cmd.split(" "), stdout: "piped", stderr: "piped", stdin: "null"});
        return {proc, fileToCheck};
    }

    const isTypeError = async (code: string, errorCode?: number) => {
        const {proc, fileToCheck} = await mkCheckingFile(code);
        const output = await proc.stderrOutput().then(buff => new TextDecoder().decode(buff));
        //console.log(output);
        await Deno.remove(fileToCheck);
        return output.includes(`[ERROR]`) && ( errorCode ? output.includes("TS" + errorCode) : true);
    }

    return {
        isTypeError,
        isNotTypeError: (code: string, errorCode?: number) => isTypeError(code, errorCode).then(b => !b),
        cleanUp: async () => {
            await Deno.remove(importMap);
        }
    } as NeedsPermission<TypeAsserter, ["allow-run", "allow-write"]>
}
