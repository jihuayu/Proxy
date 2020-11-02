import got from "got";
import {writeFileSync} from "fs"

const meta_url = 'http://launchermeta.mojang.com/mc/game/version_manifest.json'
type Struct = {
    url: string
    size: number
    sha1: string
}
let ret = new Set<Struct>()

async function fetch() {
    const data = await got.get(meta_url);
    const meta = JSON.parse(data.body);
    for (let i of meta['versions']) {
        console.log(i.id)
        const version_meta = i.url;
        const data = await got.get(version_meta);
        const meta = JSON.parse(data.body);
        const libraries = meta['libraries'];
        const downloads = meta['downloads'];
        const assetIndex = meta['assetIndex'];
        for (let j of libraries) {
            const one = j['downloads']['artifact'];
            ret.add({
                url: one['url'],
                size: one['size'],
                sha1: one['sha1'],
            });
        }
        for (let j of downloads) {
            const one = i;
            ret.add({
                url: one['url'],
                size: one['size'],
                sha1: one['sha1'],
            });
        }
    }
    writeFileSync("./1.json", JSON.stringify(Array.from(ret), null, "\n"));
}
process.nextTick(async ()=>{
    await fetch()
})
