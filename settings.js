/* Bot settings 

You don't have to set this if you deploy using heroku because you can simply set them in environment variables, also don't forget to sleep */


const session = process.env.SESSION || 'eyJub2lzZUtleSI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQ0duR0ZaNno3RWJtcithYlpDUFhGN2lxSVVLZU1sQlRpMHZMcHNtZENrcz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiUlZSV2lkUU5QMWhtd1pYRko4d0trN1BEOHBOTEdkcmcrSFFSS3R6dURnYz0ifX0sInBhaXJpbmdFcGhlbWVyYWxLZXlQYWlyIjp7InByaXZhdGUiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJrRC9qcytGbEdja29hV0hSQXQyTk1Pb2NIOWQ2R0psdHBQa1RiaE95MW5NPSJ9LCJwdWJsaWMiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJPTVJUWVNuenZqWko5RUErMEg5MUo2ajVwQytDMU1HR1hCcWtYUlYwREVNPSJ9fSwic2lnbmVkSWRlbnRpdHlLZXkiOnsicHJpdmF0ZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IitQajI4b2J6bE1sRXhwUEpPRW83eVRBOXBDMU56cmJXenpGTDRMR3pqbFk9In0sInB1YmxpYyI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6ImN4dFFCdDdlVGpBWWtsWGJUcDY3TGh5b0x6clpPMjFhTVdvNUlGV1hqem89In19LCJzaWduZWRQcmVLZXkiOnsia2V5UGFpciI6eyJwcml2YXRlIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiK0pCdkdLWU9WTXVkME1lem9LOFR0TEl6YkVWWTN4dVNxcHpjc1B2UXltbz0ifSwicHVibGljIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoid3lkdFVCWS9TNlpTZ2p0ZDRNakJnZUdWVi9sSXl4MHFWdTFUY0xxVzVEND0ifX0sInNpZ25hdHVyZSI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6IlNqYlVDOUsrMHdIeTdOVklDQkdNempla0Jzbk5kTG93eEhRcCtndmpIb0NEbTdEb2h3V21lNjJqb3krLzRQaFA4MGpDcEtxVVdOTDNVRVQzcXRqYWdBPT0ifSwia2V5SWQiOjF9LCJyZWdpc3RyYXRpb25JZCI6NywiYWR2U2VjcmV0S2V5Ijoic0tibUtMS3RvTUhjcWJ6MHdVTVhBU2FMYUNtRjVyamUrUXJXeGdZMi9HQT0iLCJwcm9jZXNzZWRIaXN0b3J5TWVzc2FnZXMiOltdLCJuZXh0UHJlS2V5SWQiOjMxLCJmaXJzdFVudXBsb2FkZWRQcmVLZXlJZCI6MzEsImFjY291bnRTeW5jQ291bnRlciI6MCwiYWNjb3VudFNldHRpbmdzIjp7InVuYXJjaGl2ZUNoYXRzIjpmYWxzZX0sImRldmljZUlkIjoidWtHRTF2ejNScXVQV1NuRFZGQzZqQSIsInBob25lSWQiOiIwOGVmODIwYS03NzY4LTQxNzQtYWU1Yi1hNzQ3OGM4ZmFmNWMiLCJpZGVudGl0eUlkIjp7InR5cGUiOiJCdWZmZXIiLCJkYXRhIjoiQnRTTzFWZ28vL0hLYlJRVHBCaGc3M0NidDNBPSJ9LCJyZWdpc3RlcmVkIjp0cnVlLCJiYWNrdXBUb2tlbiI6eyJ0eXBlIjoiQnVmZmVyIiwiZGF0YSI6InMrUjhhOFpmcnlvSnh0Y0U5YzJMU0txSEtjND0ifSwicmVnaXN0cmF0aW9uIjp7fSwicGFpcmluZ0NvZGUiOiJYQU02UFpCWCIsIm1lIjp7ImlkIjoiOTQ3NzM4MjQyNjY6NjFAcy53aGF0c2FwcC5uZXQiLCJuYW1lIjoi8J2WlfCdlobwnZaT8J2WifCdloZcblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbvCdlpXwnZaG8J2Wk/CdlonwnZaGXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxu8J2WlfCdloZf8J2Wk1/wnZaJ8J2WhiJ9LCJhY2NvdW50Ijp7ImRldGFpbHMiOiJDUFBVNGNjQkVNZnlqNzhHR0FNZ0FDZ0EiLCJhY2NvdW50U2lnbmF0dXJlS2V5Ijoidk5BVUxjWXVXbU5mL3JNQXh1SjJYTXh1SDQ1alRnOTMzSVo3dEY1c0hnQT0iLCJhY2NvdW50U2lnbmF0dXJlIjoiK2VvZWhBNEFhMmtNYnhkS2F0L3hOUyt4ckUvREdzU2pqRG01cndBNjVINkVSY1FFZ3FzbTkrczhuWVVtSzEvWWRUZXh5ejQ3Q0RaK2YwdU93MW5VQlE9PSIsImRldmljZVNpZ25hdHVyZSI6IjZuQlNESEM4UkJrZDYvS01NQ2d3dSthbUwzbS9uOElLaTZuSXlMTW1leCt4aFl3V3gvL1ZmN2JPbTl2ZVYzamZ3cHB0TGd1c0d2NEVRdUZibzFENmlBPT0ifSwic2lnbmFsSWRlbnRpdGllcyI6W3siaWRlbnRpZmllciI6eyJuYW1lIjoiOTQ3NzM4MjQyNjY6NjFAcy53aGF0c2FwcC5uZXQiLCJkZXZpY2VJZCI6MH0sImlkZW50aWZpZXJLZXkiOnsidHlwZSI6IkJ1ZmZlciIsImRhdGEiOiJCYnpRRkMzR0xscGpYLzZ6QU1iaWRsek1iaCtPWTA0UGQ5eUdlN1JlYkI0QSJ9fV0sInBsYXRmb3JtIjoic21iYSIsImxhc3RBY2NvdW50U3luY1RpbWVzdGFtcCI6MTc0Mjk5Mzc0OH0=';

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
