import got from "got";

const crypto = require('crypto');
const FormData = require('form-data');
const fs = require('fs');
const split = require('split-buffer')
const upload_url = "https://kfupload.alibaba.com/mupload"

async function upload(path: string) {
    const buffer = await fs.readFileSync(path);
    const buffers = split(buffer, 4 * 1000 * 1000);
    console.log(buffers.length)
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
        const hash = crypto.createHash('md5');
        console.log(hash.update(i).digest('hex'));
        const ans = await got.post(upload_url, {
            body: form, headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36',
                "content-type": `multipart/form-data; boundary=${form.getBoundary()}`
            }
        })
        console.log(JSON.parse(ans.body).hash)
        console.log(JSON.parse(ans.body).url)
    }
}
upload("./yarn.lock")
