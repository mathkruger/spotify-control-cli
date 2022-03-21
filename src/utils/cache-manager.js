import fs from 'fs'

const CACHE_PATH = process.env.CACHE_PATH
const FILE_NAME = 'cache.json'

function saveCache(cache) {
    try {
        fs.writeFileSync(`${CACHE_PATH}${FILE_NAME}`, JSON.stringify(cache),'utf8')
        return true
    } catch (error) {
        throw new Error(error)
    }
}

function readCache() {
    try {
        const file = fs.readFileSync(`${CACHE_PATH}${FILE_NAME}`, 'utf8')
        return JSON.parse(file)
    } catch (error) {
        return null
    }
}

export {
    saveCache,
    readCache
}