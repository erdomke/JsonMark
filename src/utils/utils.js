/**
 * @param {string} uri 
 * @returns {boolean}
 */
const isUri = (uri) => uri && /^(https?|ftp|file):\//.test(uri);

export { isUri };