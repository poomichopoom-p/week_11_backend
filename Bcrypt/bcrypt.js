import bcrypt from "bcrypt";

async function hashPassword(string) {
  const hashedPassword = await bcrypt.hash(string, 12);
  return hashedPassword;
}
// const password = await hashPassword("john456");
// console.log(password)

console.log(await bcrypt.compare("john456", "$2b$12$EgrFuZbNO1O3V7gXq7BFX.XtE6ryCS2JicWY3O5.TX.jnlj1Og/ja"))
