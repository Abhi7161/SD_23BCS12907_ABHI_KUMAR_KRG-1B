import dotenv from "dotenv";
const result = dotenv.config();
if (result.error) {
    throw result.error;
}
console.log("ENV Loaded Successfully");
//# sourceMappingURL=dotenv.js.map