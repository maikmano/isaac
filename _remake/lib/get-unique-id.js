import nanoidGenerate from "nanoid/generate";
const nanoidLength = 14;
const nanoidLongLength = 24;
const nanoidAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";


export function getUniqueId() {
  return nanoidGenerate(nanoidAlphabet, nanoidLength);
}

export function getLongUniqueId() {
  return nanoidGenerate(nanoidAlphabet, nanoidLongLength);
}
