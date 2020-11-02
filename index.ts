import {fetch} from "./src/meta-fetch";
import {transfer} from "./src/assets-transfer";
import {writeFileSync} from "fs"


process.nextTick(async () => {
    let ret = []
    const meta = await fetch();
    for (let i of meta) {
        try {
            ret.push(await transfer(i));
        } catch (e) {
            console.log(e)
        }
    }

    writeFileSync("./1.json", JSON.stringify(ret));
})
