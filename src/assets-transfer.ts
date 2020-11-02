import got from "got";

const crypto = require('crypto');
const split = require('split-buffer')
const FormData = require('form-data');
const upload_url = "https://kfupload.alibaba.com/mupload"

type Struct = {
    url: string
    size: number
    sha1: string
}

export async function transfer(struct: Struct) {
    let ret = [];
    const data = await got.get(struct.url);
    if (data.rawBody.length != struct.size) {
        return null;
    }
    const hash = crypto.createHash('sha1').update(data.rawBody).digest('hex');
    if (hash != struct.sha1) {
        return null;
    }
    const buffers = split(data.rawBody, 4 * 1000 * 1000);
    console.log(`dl ${struct.url} succeed!`)
    let index = 0;
    for (let i of buffers) {
        const name = `${Date.now()}`
        const form = new FormData();
        form.append('file', i, {
            filename: `${name}.jpg`,
            filepath: `${name}.jpg`,
            contentType: 'image/jpeg',
            knownLength: i.length
        })
        form.append('scene', 'aeMessageCenterImageRule')
        form.append('name', `${name}.jpg`)
        const ans = await got.post(upload_url, {
            body: form, headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
                "content-type": `multipart/form-data; boundary=${form.getBoundary()}`
            }
        })
        const meta = JSON.parse(ans.body);
        ret.push({
            url: meta.url,
            hash: meta.hash,
            index: index++,
            size: meta.size
        })
    }
    console.log(`up ${struct.url} succeed!`)
    return ret;
}
