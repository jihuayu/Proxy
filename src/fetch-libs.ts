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
        if (i.id == "1.12.2") {
            break;
        }
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
        for (let j in downloads) {
            const one = downloads[j];
            ret.add({
                url: one['url'],
                size: one['size'],
                sha1: one['sha1'],
            });
        }
        const asset_data = await got.get(assetIndex.url);
        const asset_meta = JSON.parse(asset_data.body);
        for (let j in asset_meta['objects']) {
            const one = asset_meta['objects'][j];
            ret.add({
                url: `https://resources.download.minecraft.net//${one['hash'].substr(0, 2)}/${one['hash']}`,
                size: one['size'],
                sha1: one['hash'],
            });
        }
    }
    writeFileSync("./1.json", JSON.stringify(Array.from(ret)));
}

process.nextTick(async () => {
    await fetch()
})
