/* Bot settings 

You don't have to set this if you deploy using heroku because you can simply set them in environment variables, also don't forget to sleep */


const session = process.env.SESSION || 'eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQUhpUzlBMERNb00za0IrZ09PdFU0bXVYcUxIZzFIYlZDcDVFT0tRNkxYMD0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiNFU2YW9zVEQ0VnhLWFpNRGxhaTJqRjk4MEs3Ylo5dmNUczgxMFVNTUhGcz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJJRk5wQ25EQm5IMFoweXBXQmpZaWlUM2NwZTZaVjVtNmNQY2NNaVNRdjFjPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJzMUg2QktVdnRyRHQxcm1KWlhQdGJlSGV2dDYxUWluS3RCTEg2Wkx4N25vPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6Im1PVUZFdFM1K0pjK3ErUlpBWFJqejNCTk9kVC9FbTg3a0NhUWdXU0xDSDg9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InlGZFdGdVNKZWN6U0xDZ1FUQUlZZDltcDZSZXFXMXR2d2dqNUdCNzVFSEk9In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiWU8reEFpUTFnZUhXcWFUK25PWFl1UGl6N05nQjk1bUlIRlYwbVVIb3VYND0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQWJvUGdFM3N1WEpGV2lmRE84YU95L21oMlhkTzJBOXJneWtwUjQ3RUJHbz0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InFBZUYrSUpzZjVBYis3L1RveGJ5WDZUVHpHNkcwQkd4ajJmWmxLRzlXc2pLNDhQQkNNN2tDbjd4ZUdlUkRmc1QzMDFjWHpsQnRJU2cwOUpGS0d3YkJnPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6MjMyLCJhZHZTZWNyZXRLZXkiOiI4cmYxU3VBZmxzLytEVEtvRmQ5bzQ5Q1FTVHBEaXJsN082WUpxQkRzc3hzPSIsInByb2Nlc3NlZEhpc3RvcnlNZXNzYWdlcyI6W10sIm5leHRQcmVLZXlJZCI6MzEsImZpcnN0VW51cGxvYWRlZFByZUtleUlkIjozMSwiYWNjb3VudFN5bmNDb3VudGVyIjowLCJhY2NvdW50U2V0dGluZ3MiOnsidW5hcmNoaXZlQ2hhdHMiOmZhbHNlfSwiZGV2aWNlSWQiOiJLaXhCUWJpb1E0V3VaUE5kVHRIaEV3IiwicGhvbmVJZCI6IjlkMmU5ODRjLWU4ZTQtNGVkYi04ZTJjLTc1NmYyMWNmNGE3YyIsImlkZW50aXR5SWQiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiIzWjlRbFhRaFFPZHdVTFRUVER0MkRJMVR2UFU9In0sInJlZ2lzdGVyZWQiOnRydWUsImJhY2t1cFRva2VuIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiaWFVcDJmQzVKTlJCWGl5MXhvUC95S0R2c3RvPSJ9LCJyZWdpc3RyYXRpb24iOnt9LCJwYWlyaW5nQ29kZSI6IjZTNDRaWksxIiwibWUiOnsiaWQiOiIyNTQ3MzEyMTgxNjU6NTBAcy53aGF0c2FwcC5uZXQiLCJuYW1lIjoiYm90In0sImFjY291bnQiOnsiZGV0YWlscyI6IkNPR1F1NFlCRU1uQnJyOEdHQU1nQUNnQSIsImFjY291bnRTaWduYXR1cmVLZXkiOiJaMHB0a01VSmFkZkN2T3pKZVA3ZkZGaUlVQXZFSXhIMldxZWpMUGVHT0VjPSIsImFjY291bnRTaWduYXR1cmUiOiI4dHNXcU81a2ZYQkhPdGFRTkdSa1RxNERxL05DN2prdkhzY1NJRWcza0pzS3puUW91RXdPN2hiaHZYWG9oTlZUb2pZUzc0QkUvYThnWjlidXFGRDhBdz09IiwiZGV2aWNlU2lnbmF0dXJlIjoiRmVQL2paSXBudjU5SWhoTmN4V0RUbktPOTR4SjBvS3lINVNwQTFjdEpMOHpLbHVpYk00WFZUVGhGVnBhU1d2NjNMbnhBNlg1bEdENExQMWo5bndSRHc9PSJ9LCJzaWduYWxJZGVudGl0aWVzIjpbeyJpZGVudGlmaWVyIjp7Im5hbWUiOiIyNTQ3MzEyMTgxNjU6NTBAcy53aGF0c2FwcC5uZXQiLCJkZXZpY2VJZCI6MH0sImlkZW50aWZpZXJLZXkiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJCV2RLYlpERkNXblh3cnpzeVhqKzN4UllpRkFMeENNUjlscW5veXozaGpoSCJ9fV0sInBsYXRmb3JtIjoic21iYSIsImxhc3RBY2NvdW50U3luY1RpbWVzdGFtcCI6MTc0MzQ5NTM4MSwibXlBcHBTdGF0ZUtleUlkIjoiQUFBQUFQZXYifQ';

const prefix = process.env.PREFIX || '.';
const mycode = process.env.CODE || "254";
const author = process.env.STICKER_AUTHOR || 'Kanambo';
const packname = process.env.PACKNAME || 'Kanlia md2 🤖';
const dev = process.env.DEV || '254114148625';
const DevDreaded = dev.split(",");
const botname = process.env.BOTNAME || 'VOX-MD';
const mode = process.env.MODE || 'public';
const gcpresence = process.env.GC_PRESENCE || 'false';
const antionce = process.env.ANTIVIEWONCE || 'true';
const sessionName = "session";
const cookies = JSON.parse(process.env.COOKIE || '[{"domain":".youtube.com","expirationDate":1764463277.409877,"hostOnly":false,"httpOnly":false,"name":"__Secure-1PAPISID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"UoBcKfo0_FSAxQ5D/A5ZClpB2xVLQJQGUx","id":1},{"domain":".youtube.com","expirationDate":1764463277.412158,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSID","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"g.a000pghxevPjwTr5Un_D-PS1UxiaEdymANhc_5NWNQgaApthzLU0MOFGGamQ5yqi2vrAqKldbgACgYKASoSARUSFQHGX2MiB0PtUQYJy2_oQLkmMPXgfRoVAUF8yKpuqWya_M2xRHe_6e9o_6TK0076","id":2},{"domain":".youtube.com","expirationDate":1762941611.655441,"hostOnly":false,"httpOnly":true,"name":"__Secure-1PSIDCC","path":"/","sameSite":"unspecified","secure":true,"session":false,"storeId":"0","value":"AKEyXzWtrmvqerXnEweUSkGiFKAn57TBnvoAEBDi6B33Sg4gpMOANgVFwDBU_JtKQXLpisy_","id":3}]');
const presence = process.env.WA_PRESENCE || 'online';

const antitag = process.env.ANTITAG || 'true';
const antidelete = process.env.ANTIDELETE || 'true';
const autoview = process.env.AUTOVIEW_STATUS || 'true';
const autolike = process.env.AUTOLIKE_STATUS || 'true';
const autoread = process.env.AUTOREAD || 'false';
const autobio = process.env.AUTOBIO || 'false';

module.exports = {
  sessionName,
  presence,
  autoview,
  autoread,
  botname,
  cookies,
  autobio,
  mode,
autolike,
  prefix,
  mycode,
  author,
  packname,
  dev,
  DevDreaded,
  gcpresence,
  antionce,
session,
antitag,
antidelete
};
